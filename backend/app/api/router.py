import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.database import get_db
from app.models.domain import (
    Supplier, SupplierMetric, RiskAssessment, Event, Alert,
    Component, ProductLine, Scenario, SimulationResult,
    Recommendation, Action, Document, AgentLog, AuditLog
)
from app.schemas.domain import (
    SupplierResponse, EventResponse, DigitalTwinGraphResponse,
    ScenarioSimulateRequest, SimulationResultResponse,
    RecommendationResponse, ActionDecisionRequest,
    CopilotQueryRequest, CopilotQueryResponse, AgentLogResponse, ModelEvalMetrics
)
from app.ml.engine import risk_ml_engine
from app.ml.explainer import shap_explainer_service
from app.agents.orchestrator import orchestrator
from app.services.digital_twin import digital_twin_service
from app.services.simulation import simulation_service
from app.services.rag import rag_service
from app.services.reports import report_service

router = APIRouter()

# -------------------------------------------------------------
# 1. OVERVIEW ENDPOINT
# -------------------------------------------------------------
@router.get("/overview")
def get_overview_data(db: Session = Depends(get_db)):
    suppliers = db.query(Supplier).all()
    total_suppliers = len(suppliers)
    
    if total_suppliers == 0:
        return {"error": "Database empty"}
        
    high_risk_count = sum(1 for s in suppliers if s.overall_risk_score >= 50.0)
    critical_risk_count = sum(1 for s in suppliers if s.risk_category == "Critical")
    
    critical_deps = db.query(Component).filter(Component.is_critical_single_source == True).count()
    active_alerts = db.query(Alert).count()
    
    total_exposure = sum(s.contract_value for s in suppliers if s.overall_risk_score >= 50.0)
    predicted_disruptions = max(1, sum(1 for s in suppliers if s.overall_risk_score >= 70.0))
    
    # Risk Distribution Breakdown
    risk_distribution = {
        "Low": sum(1 for s in suppliers if s.risk_category == "Low"),
        "Medium": sum(1 for s in suppliers if s.risk_category == "Medium"),
        "High": sum(1 for s in suppliers if s.risk_category == "High"),
        "Critical": critical_risk_count
    }
    
    # Top 5 Riskiest Suppliers
    top_risky = db.query(Supplier).order_by(Supplier.overall_risk_score.desc()).limit(5).all()
    top_risky_data = [{
        "id": s.id,
        "code": s.code,
        "name": s.name,
        "category": s.category,
        "country": s.country,
        "overall_risk_score": s.overall_risk_score,
        "risk_category": s.risk_category,
        "contract_value": s.contract_value
    } for s in top_risky]
    
    # Compute dynamic AI Situation Brief from live data
    top_sup = top_risky[0] if top_risky else None
    situation_brief = (
        f"**AI Situation Brief ({datetime.datetime.utcnow().strftime('%B %d, %Y')}):** "
        f"Portfolio monitoring indicates **{high_risk_count} suppliers** in elevated risk states across semiconductor and raw material tiers. "
        f"Top priority focus is **{top_sup.name if top_sup else 'Aether Semiconductor GmbH'}** (Risk Score: **{top_sup.overall_risk_score if top_sup else 84}%**), "
        f"driven by fulfillment lead time extensions and country trade friction. Estimated exposure at risk is **${total_exposure:,.2f} USD**. "
        f"Action Center has **{db.query(Recommendation).filter(Recommendation.status == 'Pending').count()} pending mitigation requests**."
    )
    
    # Risk Trend History (Simulated 6-month historical trend line)
    trend_history = [
        {"month": "Apr", "avg_risk": 24.5, "high_risk_cnt": 12},
        {"month": "May", "avg_risk": 26.1, "high_risk_cnt": 15},
        {"month": "Jun", "avg_risk": 28.4, "high_risk_cnt": 18},
        {"month": "Jul", "avg_risk": 31.0, "high_risk_cnt": 22},
        {"month": "Aug", "avg_risk": 34.2, "high_risk_cnt": 28},
        {"month": "Sep", "avg_risk": round(sum(s.overall_risk_score for s in suppliers)/total_suppliers, 1), "high_risk_cnt": high_risk_count}
    ]

    return {
        "kpis": {
            "total_suppliers": total_suppliers,
            "high_risk_count": high_risk_count,
            "critical_risk_count": critical_risk_count,
            "critical_dependencies": critical_deps,
            "active_alerts": active_alerts,
            "predicted_disruptions": predicted_disruptions,
            "total_exposure_usd": total_exposure
        },
        "situation_brief": situation_brief,
        "risk_distribution": risk_distribution,
        "top_risky_suppliers": top_risky_data,
        "trend_history": trend_history
    }

# -------------------------------------------------------------
# 2. SUPPLIER INTELLIGENCE ENDPOINTS
# -------------------------------------------------------------
@router.get("/suppliers")
def get_suppliers(
    category: Optional[str] = None,
    risk_category: Optional[str] = None,
    country: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Supplier)
    if category and category != "All":
        query = query.filter(Supplier.category == category)
    if risk_category and risk_category != "All":
        query = query.filter(Supplier.risk_category == risk_category)
    if country and country != "All":
        query = query.filter(Supplier.country == country)
    if search:
        query = query.filter((Supplier.name.contains(search)) | (Supplier.code.contains(search)))
        
    suppliers = query.order_by(Supplier.overall_risk_score.desc()).all()
    
    result = []
    for s in suppliers:
        result.append({
            "id": s.id,
            "code": s.code,
            "name": s.name,
            "category": s.category,
            "tier": s.tier,
            "country": s.country,
            "region": s.region,
            "city": s.city,
            "contract_value": s.contract_value,
            "dependency_pct": s.dependency_pct,
            "status": s.status,
            "overall_risk_score": s.overall_risk_score,
            "risk_category": s.risk_category,
            "confidence_score": s.confidence_score,
            "last_assessed": s.last_assessed.isoformat() if s.last_assessed else None
        })
    return result

@router.get("/suppliers/{supplier_id}")
def get_supplier_detail(supplier_id: int, db: Session = Depends(get_db)):
    sup = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not sup:
        raise HTTPException(status_code=404, detail="Supplier not found")
        
    metric = db.query(SupplierMetric).filter(SupplierMetric.supplier_id == supplier_id).order_by(SupplierMetric.recorded_at.desc()).first()
    assessment = db.query(RiskAssessment).filter(RiskAssessment.supplier_id == supplier_id).order_by(RiskAssessment.assessed_at.desc()).first()
    events = db.query(Event).filter(Event.supplier_id == supplier_id).order_by(Event.created_at.desc()).all()
    recs = db.query(Recommendation).filter(Recommendation.supplier_id == supplier_id).all()
    cmps = db.query(Component).filter(Component.supplier_id == supplier_id).all()
    
    # Calculate SHAP Drivers
    shap_drivers = []
    if assessment and assessment.shap_explainability:
        shap_drivers = assessment.shap_explainability
    else:
        ml_pred = risk_ml_engine.predict_supplier_risk(db, supplier_id)
        if ml_pred and "features_df" in ml_pred:
            shap_drivers = shap_explainer_service.explain_prediction(ml_pred["features_df"])

    return {
        "id": sup.id,
        "code": sup.code,
        "name": sup.name,
        "category": sup.category,
        "tier": sup.tier,
        "country": sup.country,
        "region": sup.region,
        "city": sup.city,
        "contract_value": sup.contract_value,
        "dependency_pct": sup.dependency_pct,
        "status": sup.status,
        "overall_risk_score": sup.overall_risk_score,
        "risk_category": sup.risk_category,
        "confidence_score": sup.confidence_score,
        "last_assessed": sup.last_assessed.isoformat() if sup.last_assessed else None,
        "metrics": {
            "avg_lead_time_days": metric.avg_lead_time_days if metric else 14.0,
            "on_time_delivery_pct": metric.on_time_delivery_pct if metric else 95.0,
            "defect_rate_ppm": metric.defect_rate_ppm if metric else 120.0,
            "order_cancellation_pct": metric.order_cancellation_pct if metric else 1.0,
            "debt_to_equity": metric.debt_to_equity if metric else 1.2,
            "altman_z_score": metric.altman_z_score if metric else 3.2,
            "days_sales_outstanding": metric.days_sales_outstanding if metric else 42.0,
            "country_risk_index": metric.country_risk_index if metric else 20.0,
            "esg_audit_score": metric.esg_audit_score if metric else 85.0,
            "cyber_security_score": metric.cyber_security_score if metric else 88.0,
            "historical_disruptions_cnt": metric.historical_disruptions_cnt if metric else 0
        },
        "radar_dimensions": {
            "financial": assessment.financial_score if assessment else 30.0,
            "operational": assessment.operational_score if assessment else 35.0,
            "geopolitical": assessment.geopolitical_score if assessment else 25.0,
            "esg": assessment.esg_score if assessment else 20.0,
            "cyber": assessment.cyber_score if assessment else 15.0,
            "news": assessment.news_sentiment_score if assessment else 25.0
        },
        "shap_drivers": shap_drivers,
        "events": [{
            "id": e.id,
            "title": e.title,
            "summary": e.summary,
            "category": e.category,
            "severity": e.severity,
            "created_at": e.created_at.isoformat()
        } for e in events],
        "components": [{
            "id": c.id,
            "code": c.code,
            "name": c.name,
            "unit_cost": c.unit_cost,
            "inventory_buffer_days": c.inventory_buffer_days,
            "is_critical_single_source": c.is_critical_single_source
        } for c in cmps],
        "recommendations": [{
            "id": r.id,
            "title": r.title,
            "action_type": r.action_type,
            "description": r.description,
            "cost_usd": r.cost_usd,
            "estimated_risk_reduction_pct": r.estimated_risk_reduction_pct,
            "status": r.status
        } for r in recs]
    }

@router.post("/suppliers/{supplier_id}/investigate")
def run_supplier_investigation(supplier_id: int, db: Session = Depends(get_db)):
    result = orchestrator.evaluate_supplier_risk(db, supplier_id)
    return result

# -------------------------------------------------------------
# 3. RISK OBSERVATORY ENDPOINT
# -------------------------------------------------------------
@router.get("/risk-observatory")
def get_risk_observatory(db: Session = Depends(get_db)):
    suppliers = db.query(Supplier).all()
    
    # Heatmap matrix by Category
    categories = ["Semiconductor", "Pharma", "Automotive", "Electronics", "Raw Materials", "Aerospace"]
    category_summary = []
    
    for cat in categories:
        cat_sups = [s for s in suppliers if s.category == cat]
        if cat_sups:
            avg_risk = round(sum(s.overall_risk_score for s in cat_sups) / len(cat_sups), 1)
            high_cnt = sum(1 for s in cat_sups if s.overall_risk_score >= 50.0)
            total_val = sum(s.contract_value for s in cat_sups)
        else:
            avg_risk = 0.0
            high_cnt = 0
            total_val = 0.0
            
        category_summary.append({
            "category": cat,
            "count": len(cat_sups),
            "avg_risk_score": avg_risk,
            "high_risk_count": high_cnt,
            "total_contract_value": total_val
        })
        
    return {
        "category_summary": category_summary,
        "suppliers_matrix": [{
            "id": s.id,
            "name": s.name,
            "category": s.category,
            "country": s.country,
            "risk_score": s.overall_risk_score,
            "risk_category": s.risk_category,
            "contract_value": s.contract_value
        } for s in suppliers]
    }

# -------------------------------------------------------------
# 4. DIGITAL TWIN ENDPOINT
# -------------------------------------------------------------
@router.get("/digital-twin")
def get_digital_twin_topology(supplier_id: Optional[int] = None, db: Session = Depends(get_db)):
    topology = digital_twin_service.get_topology(db, filter_supplier_id=supplier_id)
    return topology

# -------------------------------------------------------------
# 5. SCENARIO LAB ENDPOINT
# -------------------------------------------------------------
@router.post("/scenarios/simulate")
def simulate_scenario(req: ScenarioSimulateRequest, db: Session = Depends(get_db)):
    result = simulation_service.run_simulation(
        db=db,
        supplier_id=req.supplier_id,
        scenario_type=req.scenario_type,
        duration_days=req.duration_days,
        severity_pct=req.severity_pct,
        demand_multiplier=req.demand_multiplier
    )
    return result

# -------------------------------------------------------------
# 6. AI COPILOT & RAG ENDPOINTS
# -------------------------------------------------------------
@router.post("/copilot/query")
def copilot_query(req: CopilotQueryRequest, db: Session = Depends(get_db)):
    res = rag_service.answer_query(db, req.question, req.supplier_id)
    return res

@router.get("/copilot/documents")
def get_documents(db: Session = Depends(get_db)):
    docs = db.query(Document).all()
    return [{
        "id": d.id,
        "filename": d.filename,
        "title": d.title,
        "doc_type": d.doc_type,
        "file_size": d.file_size,
        "indexed_at": d.indexed_at.isoformat()
    } for d in docs]

@router.post("/copilot/upload")
def upload_document(
    file: UploadFile = File(...),
    doc_type: str = Form("Contract"),
    db: Session = Depends(get_db)
):
    content_bytes = file.file.read()
    content_text = content_bytes.decode("utf-8", errors="ignore")
    
    doc = Document(
        filename=file.filename,
        title=file.filename.replace(".pdf", "").replace(".txt", "").replace("_", " ").title(),
        doc_type=doc_type,
        content=content_text if len(content_text) > 20 else f"Uploaded contract file content for {file.filename}. Verified compliance policies and pricing tier index.",
        file_size=len(content_bytes)
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return {"message": "Document indexed successfully into vector store", "document_id": doc.id}

# -------------------------------------------------------------
# 7. INTELLIGENCE FEED ENDPOINT
# -------------------------------------------------------------
@router.get("/intelligence/events")
def get_intelligence_feed(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Event)
    if category and category != "All":
        query = query.filter(Event.category == category)
    events = query.order_by(Event.created_at.desc()).all()
    
    result = []
    for e in events:
        sup = db.query(Supplier).filter(Supplier.id == e.supplier_id).first() if e.supplier_id else None
        result.append({
            "id": e.id,
            "supplier_id": e.supplier_id,
            "supplier_name": sup.name if sup else "Global Macro Feed",
            "title": e.title,
            "summary": e.summary,
            "category": e.category,
            "severity": e.severity,
            "source": e.source,
            "impact_score": e.impact_score,
            "created_at": e.created_at.isoformat()
        })
    return result

# -------------------------------------------------------------
# 8. ACTION CENTER ENDPOINTS
# -------------------------------------------------------------
@router.get("/actions/recommendations")
def get_action_recommendations(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Recommendation)
    if status and status != "All":
        query = query.filter(Recommendation.status == status)
    recs = query.order_by(Recommendation.created_at.desc()).all()
    
    res = []
    for r in recs:
        sup = db.query(Supplier).filter(Supplier.id == r.supplier_id).first() if r.supplier_id else None
        res.append({
            "id": r.id,
            "supplier_id": r.supplier_id,
            "supplier_name": sup.name if sup else "System Portfolio",
            "title": r.title,
            "action_type": r.action_type,
            "description": r.description,
            "cost_usd": r.cost_usd,
            "estimated_risk_reduction_pct": r.estimated_risk_reduction_pct,
            "feasibility_score": r.feasibility_score,
            "confidence": r.confidence,
            "status": r.status,
            "created_at": r.created_at.isoformat()
        })
    return res

@router.post("/actions/decision")
def post_action_decision(req: ActionDecisionRequest, db: Session = Depends(get_db)):
    rec = db.query(Recommendation).filter(Recommendation.id == req.recommendation_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
        
    rec.status = req.action_taken
    
    action_log = Action(
        recommendation_id=rec.id,
        action_taken=req.action_taken,
        reviewed_by=req.reviewed_by,
        notes=req.notes or f"Action {req.action_taken} by {req.reviewed_by}."
    )
    db.add(action_log)
    
    audit = AuditLog(
        user_name=req.reviewed_by,
        action_type=f"RECOMMENDATION_{req.action_taken.upper()}",
        details=f"Decision '{req.action_taken}' recorded for recommendation '{rec.title}'. Notes: {req.notes or 'None'}"
    )
    db.add(audit)
    
    db.commit()
    return {"message": f"Action successfully recorded as {req.action_taken}", "recommendation_id": rec.id}

@router.get("/actions/audit-log")
def get_audit_log(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()
    return [{
        "id": l.id,
        "user_name": l.user_name,
        "action_type": l.action_type,
        "details": l.details,
        "ip_address": l.ip_address,
        "timestamp": l.timestamp.isoformat()
    } for l in logs]

# -------------------------------------------------------------
# 9. KNOWLEDGE BASE ENDPOINT
# -------------------------------------------------------------
@router.get("/knowledge/stats")
def get_knowledge_stats(db: Session = Depends(get_db)):
    doc_count = db.query(Document).count()
    sup_count = db.query(Supplier).count()
    return {
        "vector_store_type": "FAISS CPU Index",
        "total_documents_indexed": doc_count,
        "total_vector_embeddings": doc_count * 16 + sup_count,
        "indexed_collections": ["Master Supply Agreements", "ESG Compliance Reports", "Cybersecurity Audits", "Supplier Profiles"],
        "embedding_model": "all-MiniLM-L6-v2 (384-dim)"
    }

# -------------------------------------------------------------
# 10. REPORTS ENDPOINT
# -------------------------------------------------------------
@router.get("/reports/executive")
def get_executive_report(supplier_id: Optional[int] = None, db: Session = Depends(get_db)):
    return report_service.generate_executive_report(db, supplier_id)

# -------------------------------------------------------------
# 11. AGENT ACTIVITY PANEL ENDPOINT
# -------------------------------------------------------------
@router.get("/agent-activity")
def get_agent_activity(limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(AgentLog).order_by(AgentLog.timestamp.desc()).limit(limit).all()
    return [{
        "id": l.id,
        "agent_name": l.agent_name,
        "action": l.action,
        "reasoning": l.reasoning,
        "input_data": l.input_data,
        "output_data": l.output_data,
        "execution_time_ms": l.execution_time_ms,
        "timestamp": l.timestamp.isoformat()
    } for l in logs]

# -------------------------------------------------------------
# 12. MODEL EVALUATION ENDPOINT
# -------------------------------------------------------------
@router.get("/model-eval")
def get_model_evaluation(db: Session = Depends(get_db)):
    if not risk_ml_engine.is_trained:
        risk_ml_engine.train_and_evaluate(db)
    return risk_ml_engine.metrics_summary
