import random
import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.agents.base import BaseAgent
from app.models.domain import Supplier, SupplierMetric, Event

class SupplierIntelligenceAgent(BaseAgent):
    def __init__(self):
        super().__init__("Supplier Intelligence Agent", "Profile Analysis & Anomaly Detection")

    def execute(self, db: Session, input_data: Dict[str, Any]) -> Dict[str, Any]:
        supplier_id = input_data.get("supplier_id")
        sup = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not sup:
            return {"score": 0.0, "evidence": ["Supplier record not found"], "flags": []}

        flags = []
        if sup.contract_value > 20_000_000:
            flags.append("High Financial Exposure (> $20M Contract Value)")
        if sup.dependency_pct > 70.0:
            flags.append(f"Critical Single-Source Reliance ({sup.dependency_pct}% Volume Bottleneck)")

        evidence = [
            f"Tier {sup.tier} {sup.category} supplier based in {sup.country} ({sup.city}).",
            f"Contract Value: ${sup.contract_value:,.2f} USD.",
            f"Critical Component Reliance Ratio: {sup.dependency_pct}%."
        ]
        
        return {
            "action": f"Profile Analysis for {sup.name}",
            "score": round(sup.dependency_pct * 0.8, 1),
            "evidence": evidence,
            "flags": flags,
            "confidence": 0.96,
            "reasoning": f"Identified {len(flags)} structural risk flags across supplier operational profile."
        }

class FinancialRiskAgent(BaseAgent):
    def __init__(self):
        super().__init__("Financial Risk Agent", "Revenue, Debt & Insolvency Evaluation")

    def execute(self, db: Session, input_data: Dict[str, Any]) -> Dict[str, Any]:
        supplier_id = input_data.get("supplier_id")
        metric = db.query(SupplierMetric).filter(SupplierMetric.supplier_id == supplier_id).order_by(SupplierMetric.recorded_at.desc()).first()
        if not metric:
            return {"score": 50.0, "evidence": ["No financial metrics recorded"], "confidence": 0.5}

        # Calculate Altman Z-Score interpretation
        altman_status = "Safe Zone (>2.99)" if metric.altman_z_score > 2.99 else ("Grey Zone (1.81-2.99)" if metric.altman_z_score >= 1.8 else "Distress Zone (<1.81)")
        
        # Calculate financial risk score (0-100)
        debt_risk = min(100.0, metric.debt_to_equity * 25.0)
        dso_risk = min(100.0, (metric.days_sales_outstanding / 90.0) * 100.0)
        growth_risk = max(0.0, -metric.revenue_growth_pct * 2.0)
        z_risk = max(0.0, (3.5 - metric.altman_z_score) * 25.0)
        
        score = min(100.0, round((debt_risk * 0.3) + (dso_risk * 0.2) + (growth_risk * 0.2) + (z_risk * 0.3), 1))
        
        evidence = [
            f"Altman Z-Score: {metric.altman_z_score:.2f} ({altman_status}).",
            f"Debt-to-Equity Ratio: {metric.debt_to_equity:.2f}.",
            f"Days Sales Outstanding (DSO): {metric.days_sales_outstanding:.1f} days.",
            f"YoY Revenue Growth: {metric.revenue_growth_pct:+.1f}%."
        ]
        
        return {
            "action": f"Evaluated Balance Sheet & Insolvency Risk",
            "score": score,
            "evidence": evidence,
            "confidence": 0.94,
            "reasoning": f"Altman Z-Score is {metric.altman_z_score:.2f} ({altman_status}) with DSO of {metric.days_sales_outstanding} days."
        }

class OperationalPerformanceAgent(BaseAgent):
    def __init__(self):
        super().__init__("Operational Performance Agent", "Delivery Delays, Defects & Capacity")

    def execute(self, db: Session, input_data: Dict[str, Any]) -> Dict[str, Any]:
        supplier_id = input_data.get("supplier_id")
        metric = db.query(SupplierMetric).filter(SupplierMetric.supplier_id == supplier_id).order_by(SupplierMetric.recorded_at.desc()).first()
        if not metric:
            return {"score": 50.0, "evidence": ["No operational metrics recorded"]}

        on_time_risk = max(0.0, (100.0 - metric.on_time_delivery_pct) * 2.0)
        lead_time_risk = min(100.0, (metric.avg_lead_time_days / 60.0) * 100.0)
        defect_risk = min(100.0, (metric.defect_rate_ppm / 1000.0) * 100.0)
        
        score = min(100.0, round((on_time_risk * 0.4) + (lead_time_risk * 0.4) + (defect_risk * 0.2), 1))
        
        evidence = [
            f"On-Time Delivery Rate: {metric.on_time_delivery_pct:.1f}% (Industry SLA: >95%).",
            f"Average Fulfillment Lead Time: {metric.avg_lead_time_days:.1f} days.",
            f"Manufacturing Defect Rate: {metric.defect_rate_ppm:.0f} PPM.",
            f"Order Cancellation Rate: {metric.order_cancellation_pct:.1f}%."
        ]
        
        return {
            "action": "Calculated Operational Friction & SLA Compliance",
            "score": score,
            "evidence": evidence,
            "confidence": 0.95,
            "reasoning": f"On-time delivery is {metric.on_time_delivery_pct}% with average lead time of {metric.avg_lead_time_days} days."
        }

class GeopoliticalRiskAgent(BaseAgent):
    def __init__(self):
        super().__init__("Geopolitical Risk Agent", "Country Risk, Sanctions & Port Friction")

    def execute(self, db: Session, input_data: Dict[str, Any]) -> Dict[str, Any]:
        supplier_id = input_data.get("supplier_id")
        sup = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        metric = db.query(SupplierMetric).filter(SupplierMetric.supplier_id == supplier_id).order_by(SupplierMetric.recorded_at.desc()).first()
        
        country_idx = metric.country_risk_index if metric else 25.0
        logistics = metric.logistics_friction_score if metric else 20.0
        
        score = min(100.0, round(country_idx * 0.7 + logistics * 0.3, 1))
        
        evidence = [
            f"Jurisdiction Country Risk Rating ({sup.country if sup else 'Global'}): {country_idx:.1f}/100.",
            f"Regional Logistics Friction Score: {logistics:.1f}/100.",
            f"Port Congestion Delay Impact: {metric.port_congestion_days if metric else 1.0:.1f} days extra shipping buffer required."
        ]
        
        return {
            "action": "Assessed Trade Route & Geopolitical Exposure",
            "score": score,
            "evidence": evidence,
            "confidence": 0.91,
            "reasoning": f"Country risk index for {sup.country if sup else 'origin'} is {country_idx:.1f} with shipping port delays."
        }

class NewsIntelligenceAgent(BaseAgent):
    def __init__(self):
        super().__init__("News Intelligence Agent", "Media Feed Sentiment & Event Detection")

    def execute(self, db: Session, input_data: Dict[str, Any]) -> Dict[str, Any]:
        supplier_id = input_data.get("supplier_id")
        events = db.query(Event).filter((Event.supplier_id == supplier_id) | (Event.supplier_id == None)).order_by(Event.created_at.desc()).limit(5).all()
        
        event_list = []
        max_impact = 10.0
        for ev in events:
            event_list.append({
                "title": ev.title,
                "category": ev.category,
                "severity": ev.severity,
                "source": ev.source,
                "impact": ev.impact_score
            })
            if ev.impact_score > max_impact:
                max_impact = ev.impact_score
                
        return {
            "action": "Scanned Global Logistics News & Media Wire",
            "score": round(max_impact, 1),
            "evidence": [f"Detected {len(events)} relevant news/macro events impacting supplier category."],
            "events": event_list,
            "confidence": 0.89,
            "reasoning": f"Highest news event impact score detected: {max_impact:.1f}/100."
        }

class ESGComplianceAgent(BaseAgent):
    def __init__(self):
        super().__init__("ESG & Compliance Agent", "Carbon Intensity, Labor & Audit Score")

    def execute(self, db: Session, input_data: Dict[str, Any]) -> Dict[str, Any]:
        supplier_id = input_data.get("supplier_id")
        metric = db.query(SupplierMetric).filter(SupplierMetric.supplier_id == supplier_id).order_by(SupplierMetric.recorded_at.desc()).first()
        
        esg_score = metric.esg_audit_score if metric else 80.0
        labor_flag = metric.labor_violation_flag if metric else False
        
        risk_score = min(100.0, round((100.0 - esg_score) * 1.2 + (30.0 if labor_flag else 0.0), 1))
        
        evidence = [
            f"ESG Audit Rating: {esg_score:.1f}/100.",
            f"Scope 1 & 2 Carbon Intensity: {metric.carbon_intensity if metric else 35.0:.1f} kg CO2e/unit.",
            f"Labor Compliance Violation Flag: {'ACTIVE DISCOVERY' if labor_flag else 'Clean Record'}."
        ]
        
        return {
            "action": "Evaluated Environmental & Labor Regulatory Compliance",
            "score": risk_score,
            "evidence": evidence,
            "confidence": 0.93,
            "reasoning": f"Audit score is {esg_score}/100 with labor violation status: {labor_flag}."
        }

class CyberRiskAgent(BaseAgent):
    def __init__(self):
        super().__init__("Cyber Risk Agent", "Security Posture & Vulnerability Scan")

    def execute(self, db: Session, input_data: Dict[str, Any]) -> Dict[str, Any]:
        supplier_id = input_data.get("supplier_id")
        metric = db.query(SupplierMetric).filter(SupplierMetric.supplier_id == supplier_id).order_by(SupplierMetric.recorded_at.desc()).first()
        
        sec_score = metric.cyber_security_score if metric else 85.0
        vulns = metric.unpatched_vulnerabilities if metric else 0
        
        cyber_risk_score = min(100.0, round((100.0 - sec_score) * 1.2 + (vulns * 5.0), 1))
        
        evidence = [
            f"Third-Party Cyber Rating: {sec_score:.1f}/100.",
            f"Unpatched Critical CVE Vulnerabilities: {vulns} items.",
            f"Historical Ransomware/Data Breach Incidents: {metric.historical_disruptions_cnt if metric else 0} events."
        ]
        
        return {
            "action": "Scanned Perimeter Security & Vulnerability Registry",
            "score": cyber_risk_score,
            "evidence": evidence,
            "confidence": 0.92,
            "reasoning": f"Cyber posture score is {sec_score}/100 with {vulns} unpatched CVE vulnerabilities."
        }

class CentralRiskAssessmentAgent(BaseAgent):
    def __init__(self):
        super().__init__("Risk Assessment Agent", "Multi-Factor Synthesis & Classification")

    def execute(self, db: Session, input_data: Dict[str, Any]) -> Dict[str, Any]:
        sub_results = input_data.get("sub_agent_results", {})
        
        fin = sub_results.get("financial", {}).get("score", 30.0)
        op = sub_results.get("operational", {}).get("score", 30.0)
        geo = sub_results.get("geopolitical", {}).get("score", 20.0)
        esg = sub_results.get("esg", {}).get("score", 20.0)
        cyber = sub_results.get("cyber", {}).get("score", 20.0)
        news = sub_results.get("news", {}).get("score", 20.0)
        
        # Weighted aggregate score
        overall = round(fin * 0.25 + op * 0.30 + geo * 0.15 + esg * 0.10 + cyber * 0.10 + news * 0.10, 1)
        
        if overall >= 75.0:
            category = "Critical"
            trend = "Deteriorating"
        elif overall >= 50.0:
            category = "High"
            trend = "Deteriorating"
        elif overall >= 30.0:
            category = "Medium"
            trend = "Stable"
        else:
            category = "Low"
            trend = "Improving"
            
        top_factors = sorted([
            ("Operational Delays", op),
            ("Financial Balance Sheet", fin),
            ("Geopolitical Location", geo),
            ("Cyber Exposure", cyber),
            ("ESG Compliance", esg),
            ("News Sentiment", news)
        ], key=lambda x: x[1], reverse=True)[:3]
        
        return {
            "action": f"Aggregated 6 Dimension Assessments into Composite Score ({overall}%)",
            "overall_risk_score": overall,
            "risk_category": category,
            "trend": trend,
            "top_contributing_factors": [{"factor": f[0], "score": f[1]} for f in top_factors],
            "confidence": 0.94,
            "reasoning": f"Composite risk rated {overall}% ({category}). Top driver: {top_factors[0][0]} ({top_factors[0][1]}%)."
        }

class ScenarioSimulationAgent(BaseAgent):
    def __init__(self):
        super().__init__("Scenario Simulation Agent", "Digital Twin Disruption Impact Modeling")

    def execute(self, db: Session, input_data: Dict[str, Any]) -> Dict[str, Any]:
        supplier_id = input_data.get("supplier_id")
        duration = input_data.get("duration_days", 30)
        severity = input_data.get("severity_pct", 80.0)
        
        sup = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        contract_val = sup.contract_value if sup else 5_000_000.0
        
        # Financial impact calculation: (Contract Value * 0.05 * Duration / 30) * (Severity / 100)
        financial_impact = round((contract_val * 0.08 * (duration / 30.0)) * (severity / 100.0), 2)
        units_at_risk = int((duration * 450) * (severity / 100.0))
        buffer_remaining = max(0, 25 - int(duration * (severity / 100.0)))
        alternate_cov = round(max(15.0, 100.0 - (sup.dependency_pct * 0.8)), 1) if sup else 45.0
        recovery_days = int(duration * 1.3)
        
        return {
            "action": f"Simulated {duration}-day Disruption Scenario ({severity}% Severity)",
            "affected_products_count": random.randint(2, 6),
            "units_at_risk": units_at_risk,
            "inventory_buffer_remaining_days": buffer_remaining,
            "estimated_financial_impact_usd": financial_impact,
            "alternate_coverage_pct": alternate_cov,
            "estimated_recovery_time_days": recovery_days,
            "overall_severity_rating": "Critical" if financial_impact > 1_000_000 else "High",
            "reasoning": f"Calculated ${financial_impact:,.2f} USD revenue at risk over {duration} days with {buffer_remaining} buffer days remaining."
        }

class MitigationStrategyAgent(BaseAgent):
    def __init__(self):
        super().__init__("Mitigation Strategy Agent", "Ranked Response Options Generation")

    def execute(self, db: Session, input_data: Dict[str, Any]) -> Dict[str, Any]:
        sup_name = input_data.get("supplier_name", "Flagged Supplier")
        fin_impact = input_data.get("estimated_financial_impact_usd", 500_000.0)
        
        options = [
            {
                "title": f"Shift 35% Production Volume to Secondary Approved Supplier",
                "action_type": "Shift Volume",
                "description": f"Re-route immediate orders for high-risk components to secondary pre-qualified suppliers.",
                "cost_usd": round(fin_impact * 0.08, 2),
                "estimated_risk_reduction_pct": 45.0,
                "feasibility_score": 88.0,
                "confidence": 0.94
            },
            {
                "title": "Expedite Air Freight Safety Stock Buffer Creation",
                "action_type": "Expedite Shipping",
                "description": "Charter direct emergency air transit for 30-day component buffer in regional hub.",
                "cost_usd": round(fin_impact * 0.04, 2),
                "estimated_risk_reduction_pct": 30.0,
                "feasibility_score": 94.0,
                "confidence": 0.91
            },
            {
                "title": "Issue Mandatory Supplier Quality & Capital Restructuring Audit",
                "action_type": "Dual Source",
                "description": f"Engage third-party audit firm to inspect plant operations and verify liquidity commitments.",
                "cost_usd": 25000.0,
                "estimated_risk_reduction_pct": 20.0,
                "feasibility_score": 95.0,
                "confidence": 0.88
            }
        ]
        
        return {
            "action": f"Generated {len(options)} Ranked Mitigation Strategies",
            "options": options,
            "reasoning": f"Top recommendation provides 45% risk reduction at estimated cost of ${options[0]['cost_usd']:,.2f} USD."
        }

class ReportGenerationAgent(BaseAgent):
    def __init__(self):
        super().__init__("Report Generation Agent", "Executive Brief & Risk Documentation")

    def execute(self, db: Session, input_data: Dict[str, Any]) -> Dict[str, Any]:
        sup_name = input_data.get("supplier_name", "Supplier Base")
        overall_risk = input_data.get("overall_risk_score", 75.0)
        
        report_text = f"""# EXECUTIVE RISK ASSESSMENT REPORT
**Target Subject:** {sup_name}
**Assessed Risk Score:** {overall_risk}% ({input_data.get('risk_category', 'High')})
**Date:** {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}

## Executive Summary
{sup_name} exhibits elevated operational and financial risk indicators requiring immediate procurement review. 

## Key Risk Drivers
- **Operational Lead Times:** Fulfillment lead times extended by {input_data.get('lead_time', '24')} days.
- **Financial Solvency:** Balance sheet indicators signal heightened DSO and debt obligations.
- **Geopolitical & Freight Exposure:** Regional transit bottlenecks adding risk.

## Recommended Action Plan
1. Approve volume shift recommendation in Action Center.
2. Monitor daily news intelligence stream for shipping recovery.
"""
        return {
            "action": f"Generated Executive Risk Assessment Report for {sup_name}",
            "report_md": report_text,
            "reasoning": f"Synthesized multi-dimensional findings into formal executive summary."
        }

# Instantiate agent singletons
supplier_intel_agent = SupplierIntelligenceAgent()
financial_risk_agent = FinancialRiskAgent()
operational_agent = OperationalPerformanceAgent()
geopolitical_agent = GeopoliticalRiskAgent()
news_agent = NewsIntelligenceAgent()
esg_agent = ESGComplianceAgent()
cyber_agent = CyberRiskAgent()
central_risk_agent = CentralRiskAssessmentAgent()
scenario_agent = ScenarioSimulationAgent()
mitigation_agent = MitigationStrategyAgent()
report_agent = ReportGenerationAgent()
