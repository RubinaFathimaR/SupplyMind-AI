from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.agents.modules import (
    supplier_intel_agent, financial_risk_agent, operational_agent,
    geopolitical_agent, news_agent, esg_agent, cyber_agent,
    central_risk_agent, scenario_agent, mitigation_agent, report_agent
)
from app.models.domain import Supplier, RiskAssessment, Recommendation, AgentLog
from app.ml.explainer import shap_explainer_service
from app.ml.engine import risk_ml_engine

class AgentOrchestrator:
    def evaluate_supplier_risk(self, db: Session, supplier_id: int) -> Dict[str, Any]:
        """
        Full multi-agent investigation workflow for a supplier:
        1. Runs domain agents (Intel, Financial, Operational, Geopolitical, News, ESG, Cyber).
        2. Aggregates results via Central Risk Assessment Agent.
        3. Computes ML Risk prediction + SHAP explainability drivers.
        4. Triggers Mitigation Strategy Agent if risk is High/Critical.
        5. Persists RiskAssessment in DB and logs every agent step in AgentLog.
        """
        sup = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not sup:
            return {"error": "Supplier not found"}

        input_data = {"supplier_id": supplier_id, "supplier_name": sup.name}

        # Step 1: Execute specialized domain sub-agents
        intel_res = supplier_intel_agent.run(db, input_data)
        fin_res = financial_risk_agent.run(db, input_data)
        op_res = operational_agent.run(db, input_data)
        geo_res = geopolitical_agent.run(db, input_data)
        news_res = news_agent.run(db, input_data)
        esg_res = esg_agent.run(db, input_data)
        cyber_res = cyber_agent.run(db, input_data)

        sub_agent_results = {
            "intel": intel_res,
            "financial": fin_res,
            "operational": op_res,
            "geopolitical": geo_res,
            "news": news_res,
            "esg": esg_res,
            "cyber": cyber_res
        }

        # Step 2: Execute Central Risk Aggregator Agent
        central_input = {
            "supplier_id": supplier_id,
            "supplier_name": sup.name,
            "sub_agent_results": sub_agent_results
        }
        central_res = central_risk_agent.run(db, central_input)

        # Step 3: Run ML Engine & SHAP Explainer
        ml_prediction = risk_ml_engine.predict_supplier_risk(db, supplier_id)
        shap_drivers = []
        if ml_prediction and "features_df" in ml_prediction:
            shap_drivers = shap_explainer_service.explain_prediction(ml_prediction["features_df"])

        final_score = ml_prediction["overall_score"] if ml_prediction else central_res["overall_risk_score"]
        final_category = ml_prediction["risk_category"] if ml_prediction else central_res["risk_category"]

        # Update Supplier record
        sup.overall_risk_score = final_score
        sup.risk_category = final_category
        sup.last_assessed = db.query(Supplier).filter(Supplier.id == supplier_id).first().last_assessed

        # Persist RiskAssessment record
        risk_record = RiskAssessment(
            supplier_id=supplier_id,
            overall_score=final_score,
            financial_score=fin_res["score"],
            operational_score=op_res["score"],
            geopolitical_score=geo_res["score"],
            esg_score=esg_res["score"],
            cyber_score=cyber_res["score"],
            news_sentiment_score=news_res["score"],
            shap_explainability=shap_drivers,
            trend=central_res.get("trend", "Stable")
        )
        db.add(risk_record)

        # Step 4: If High or Critical risk, generate Mitigation Recommendations automatically
        recommendations = []
        if final_score >= 50.0:
            mit_input = {
                "supplier_id": supplier_id,
                "supplier_name": sup.name,
                "estimated_financial_impact_usd": sup.contract_value * 0.15
            }
            mit_res = mitigation_agent.run(db, mit_input)
            for opt in mit_res.get("options", []):
                # Check if recommendation already exists to prevent duplicate creation
                existing = db.query(Recommendation).filter(
                    Recommendation.supplier_id == supplier_id,
                    Recommendation.title == opt["title"]
                ).first()
                if not existing:
                    rec = Recommendation(
                        supplier_id=supplier_id,
                        title=opt["title"],
                        action_type=opt["action_type"],
                        description=opt["description"],
                        cost_usd=opt["cost_usd"],
                        estimated_risk_reduction_pct=opt["estimated_risk_reduction_pct"],
                        feasibility_score=opt["feasibility_score"],
                        confidence=opt["confidence"],
                        status="Pending"
                    )
                    db.add(rec)
                    recommendations.append(opt)

        db.commit()

        return {
            "supplier_id": supplier_id,
            "supplier_name": sup.name,
            "overall_risk_score": final_score,
            "risk_category": final_category,
            "sub_agent_results": sub_agent_results,
            "central_assessment": central_res,
            "shap_explainability": shap_drivers,
            "recommendations": recommendations
        }

orchestrator = AgentOrchestrator()
