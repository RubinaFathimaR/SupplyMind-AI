import datetime
import random
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.domain import Supplier, Component, Scenario, SimulationResult, Recommendation
from app.agents.modules import mitigation_agent

class SimulationService:
    def run_simulation(self, db: Session, supplier_id: int, scenario_type: str, duration_days: int, severity_pct: float, demand_multiplier: float) -> Dict[str, Any]:
        sup = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not sup:
            raise ValueError(f"Supplier ID {supplier_id} not found")

        components = db.query(Component).filter(Component.supplier_id == supplier_id).all()
        affected_cmps_cnt = max(1, len(components))
        
        # Calculate dynamic mathematical impact model
        contract_val = sup.contract_value
        dep_pct = sup.dependency_pct
        
        # Financial impact = (Daily contract revenue * duration) * (severity / 100) * demand_multiplier * bottleneck factor
        daily_val = contract_val / 365.0
        base_loss = daily_val * duration_days * (severity_pct / 100.0) * demand_multiplier
        
        # Multiplier based on scenario type severity
        type_multipliers = {
            "shutdown": 1.4,
            "30-day disruption": 1.2,
            "factory outage": 1.3,
            "natural disaster": 1.5,
            "cyberattack": 1.1,
            "port closure": 1.25,
            "geopolitical event": 1.35,
            "financial failure": 1.6
        }
        mult = type_multipliers.get(scenario_type.lower(), 1.2)
        total_fin_impact = round(base_loss * mult, 2)
        
        units_at_risk = int((duration_days * 320 * (severity_pct / 100.0)) * demand_multiplier)
        
        # Minimum inventory buffer across components
        min_buffer = min([c.inventory_buffer_days for c in components]) if components else 15
        remaining_buffer = max(0, min_buffer - int(duration_days * (severity_pct / 100.0)))
        
        # Alternate coverage inversely related to single-source reliance
        alternate_cov = round(max(10.0, 100.0 - (dep_pct * 0.85)), 1)
        recovery_days = int(duration_days * 1.25 + (10 if severity_pct > 75 else 0))
        
        severity_rating = "Critical" if total_fin_impact >= 2_000_000 else ("High" if total_fin_impact >= 500_000 else "Medium")
        
        # Persist Scenario and SimulationResult
        scenario = Scenario(
            title=f"{scenario_type.title()} Simulation — {sup.name} ({duration_days} Days)",
            scenario_type=scenario_type,
            supplier_id=supplier_id,
            duration_days=duration_days,
            severity_pct=severity_pct,
            demand_multiplier=demand_multiplier
        )
        db.add(scenario)
        db.flush()

        details = {
            "scenario_type": scenario_type,
            "duration_days": duration_days,
            "severity_pct": severity_pct,
            "demand_multiplier": demand_multiplier,
            "affected_component_codes": [c.code for c in components],
            "primary_bottleneck_country": sup.country
        }

        result = SimulationResult(
            scenario_id=scenario.id,
            affected_products_count=affected_cmps_cnt + 1,
            units_at_risk=units_at_risk,
            inventory_buffer_remaining_days=remaining_buffer,
            estimated_financial_impact_usd=total_fin_impact,
            alternate_coverage_pct=alternate_cov,
            estimated_recovery_time_days=recovery_days,
            overall_severity_rating=severity_rating,
            details_json=details
        )
        db.add(result)
        db.flush()

        # Generate automated mitigation recommendations for this scenario
        mit_input = {
            "supplier_id": supplier_id,
            "supplier_name": sup.name,
            "estimated_financial_impact_usd": total_fin_impact
        }
        mit_output = mitigation_agent.run(db, mit_input)
        recs = mit_output.get("options", [])

        db.commit()

        return {
            "scenario_id": scenario.id,
            "supplier_name": sup.name,
            "affected_products_count": affected_cmps_cnt + 1,
            "units_at_risk": units_at_risk,
            "inventory_buffer_remaining_days": remaining_buffer,
            "estimated_financial_impact_usd": total_fin_impact,
            "alternate_coverage_pct": alternate_cov,
            "estimated_recovery_time_days": recovery_days,
            "overall_severity_rating": severity_rating,
            "details_json": details,
            "recommendations": recs
        }

simulation_service = SimulationService()
