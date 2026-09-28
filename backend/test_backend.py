import sys
import os

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import engine, Base, SessionLocal
from app.seed.generator import seed_database
from app.ml.engine import risk_ml_engine
from app.agents.orchestrator import orchestrator
from app.services.digital_twin import digital_twin_service
from app.services.simulation import simulation_service
from app.services.rag import rag_service
from app.services.reports import report_service

def test_full_pipeline():
    print("--- 1. Testing Database Table Creation ---")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        print("--- 2. Testing Synthetic Seed Generator (300+ Suppliers) ---")
        seed_database(db)
        
        print("--- 3. Testing ML Engine Training & Metrics ---")
        eval_metrics = risk_ml_engine.train_and_evaluate(db)
        print(f"Accuracy: {eval_metrics['accuracy']}, ROC-AUC: {eval_metrics['roc_auc']}")
        
        print("--- 4. Testing Multi-Agent Orchestration & SHAP Explainer ---")
        sup_res = orchestrator.evaluate_supplier_risk(db, supplier_id=1)
        print(f"Supplier 1 Score: {sup_res['overall_risk_score']}% ({sup_res['risk_category']})")
        print(f"SHAP Drivers Count: {len(sup_res['shap_explainability'])}")
        
        print("--- 5. Testing Digital Twin Service ---")
        topology = digital_twin_service.get_topology(db)
        print(f"Graph Nodes: {len(topology['nodes'])}, Edges: {len(topology['edges'])}")
        
        print("--- 6. Testing Scenario Lab Simulation ---")
        sim_res = simulation_service.run_simulation(db, supplier_id=1, scenario_type="shutdown", duration_days=30, severity_pct=80.0, demand_multiplier=1.0)
        print(f"Simulated Financial Impact: ${sim_res['estimated_financial_impact_usd']:,.2f}")
        
        print("--- 7. Testing RAG Copilot ---")
        rag_res = rag_service.answer_query(db, "Which suppliers are high risk?")
        print(f"RAG Answer snippet: {rag_res['answer'][:100]}...")
        
        print("--- 8. Testing Report Generation ---")
        report = report_service.generate_executive_report(db)
        print(f"Report Title: {report['title']}")
        
        print("\nSUCCESS: All Backend Modules Verified Cleanly!")
        
    finally:
        db.close()

if __name__ == "__main__":
    test_full_pipeline()
