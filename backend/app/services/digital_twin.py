from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.domain import Supplier, Component, ProductLine, Dependency

class DigitalTwinService:
    def get_topology(self, db: Session, filter_supplier_id: int = None) -> Dict[str, Any]:
        """
        Constructs React Flow graph nodes and edges representing the supply chain topology:
        Supplier -> Component -> Product Line -> Customer Tier
        Includes dynamic risk propagation calculation across graph edges.
        """
        nodes = []
        edges = []
        critical_sources = []

        suppliers = db.query(Supplier).all()
        components = db.query(Component).all()
        product_lines = db.query(ProductLine).all()
        dependencies = db.query(Dependency).all()

        # Build supplier lookup dictionary
        sup_dict = {s.id: s for s in suppliers}

        # 1. Supplier Nodes
        for s in suppliers:
            nodes.append({
                "id": f"sup-{s.id}",
                "label": s.name,
                "type": "supplier",
                "risk_score": s.overall_risk_score,
                "risk_category": s.risk_category,
                "details": {
                    "category": s.category,
                    "country": s.country,
                    "contract_value": s.contract_value,
                    "tier": s.tier
                }
            })

        # 2. Component Nodes
        for c in components:
            sup = sup_dict.get(c.supplier_id)
            sup_risk = sup.overall_risk_score if sup else 0.0
            
            # Risk propagation: component risk is derived from supplier risk + critical status
            comp_risk = round(min(100.0, sup_risk * (1.2 if c.is_critical_single_source else 1.0)), 1)
            comp_category = "Critical" if comp_risk >= 75.0 else ("High" if comp_risk >= 50.0 else ("Medium" if comp_risk >= 30.0 else "Low"))

            nodes.append({
                "id": f"cmp-{c.id}",
                "label": f"{c.code}: {c.name}",
                "type": "component",
                "risk_score": comp_risk,
                "risk_category": comp_category,
                "details": {
                    "unit_cost": c.unit_cost,
                    "inventory_buffer_days": c.inventory_buffer_days,
                    "is_critical_single_source": c.is_critical_single_source,
                    "supplier_name": sup.name if sup else "Unknown"
                }
            })

            # Edge: Supplier -> Component
            edges.append({
                "id": f"e-sup{c.supplier_id}-cmp{c.id}",
                "source": f"sup-{c.supplier_id}",
                "target": f"cmp-{c.id}",
                "label": "Supplies",
                "weight": 1.0
            })

            if c.is_critical_single_source:
                critical_sources.append({
                    "component_code": c.code,
                    "component_name": c.name,
                    "supplier_name": sup.name if sup else "Unknown",
                    "buffer_days": c.inventory_buffer_days,
                    "risk_score": comp_risk
                })

        # 3. Product Line Nodes
        pl_dict = {p.id: p for p in product_lines}
        for pl in product_lines:
            nodes.append({
                "id": f"pl-{pl.id}",
                "label": pl.name,
                "type": "product_line",
                "risk_score": 25.0, # Will update with propagated max risk
                "risk_category": "Low",
                "details": {
                    "code": pl.code,
                    "annual_revenue_impact": pl.annual_revenue_impact,
                    "margin_pct": pl.margin_pct
                }
            })

        # 4. Dependency Edges (Component -> Product Line -> Customer)
        pl_max_risk = {}
        for dep in dependencies:
            cmp_node_id = f"cmp-{dep.component_id}"
            pl_node_id = f"pl-{dep.product_line_id}"

            edges.append({
                "id": f"e-cmp{dep.component_id}-pl{dep.product_line_id}",
                "source": cmp_node_id,
                "target": pl_node_id,
                "label": f"Weight: {dep.bottleneck_weight}x",
                "weight": dep.bottleneck_weight
            })

            # Calculate downstream risk propagation to Product Line
            cmp_obj = next((n for n in nodes if n["id"] == cmp_node_id), None)
            if cmp_obj:
                c_risk = cmp_obj["risk_score"] * dep.bottleneck_weight
                pl_max_risk[pl_node_id] = max(pl_max_risk.get(pl_node_id, 0.0), c_risk)

        # Update product line node propagated risks
        for n in nodes:
            if n["type"] == "product_line" and n["id"] in pl_max_risk:
                p_risk = min(100.0, round(pl_max_risk[n["id"]], 1))
                n["risk_score"] = p_risk
                n["risk_category"] = "Critical" if p_risk >= 75.0 else ("High" if p_risk >= 50.0 else ("Medium" if p_risk >= 30.0 else "Low"))

        return {
            "nodes": nodes,
            "edges": edges,
            "critical_single_sources": critical_sources
        }

digital_twin_service = DigitalTwinService()
