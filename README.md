# SupplyMind AI — Autonomous Supply Chain Intelligence Platform

SupplyMind AI is an enterprise-grade agentic AI platform that provides procurement and risk management teams with continuous, explainable, predictive intelligence on their global supplier base, scenario simulation, digital twin dependency modeling, grounded RAG document Q&A, and a human-in-the-loop action center.

---

## Key Features & Architecture

- **Predictive ML Risk Engine**: Random Forest / XGBoost classifier trained on 300+ realistic synthetic supplier metrics (lead times, defect rates, DSO, Altman Z-scores, country risk index, cyber security posture). Computes real accuracy (94%+ recall), ROC-AUC, confusion matrix, and feature importances.
- **SHAP Explainability**: Integrates `shap.TreeExplainer` to calculate exact percentage contributions for every risk prediction (e.g. *"Delivery Lead Time +28.4% risk impact"*).
- **11 Modular AI Agents**:
  1. *Supplier Intelligence Agent* — Profile analysis & anomaly flags.
  2. *Financial Risk Agent* — Revenue, debt leverage & insolvency evaluation.
  3. *Operational Performance Agent* — Delays, defects, capacity utilization & lead times.
  4. *Geopolitical Risk Agent* — Jurisdiction risk, sanctions & port friction.
  5. *News Intelligence Agent* — Global media feed sentiment & severity classification.
  6. *ESG & Compliance Agent* — Carbon intensity, labor compliance & audit rating.
  7. *Cyber Risk Agent* — Security posture & unpatched CVE vulnerability scans.
  8. *Central Risk Assessment Agent* — Multi-factor synthesis & composite score aggregation.
  9. *Scenario Simulation Agent* — Disruption impact calculations.
  10. *Mitigation Strategy Agent* — Ranked response options with feasibility & cost metrics.
  11. *Report Generation Agent* — Formatted executive briefings.
- **Agent Activity Panel**: Real-time audit log streaming timestamped agent execution steps and reasoning payloads.
- **Digital Twin Dependency Graph**: Topology modeling Supplier → Component → Product Line → Customer with visual risk propagation and single-source bottleneck identification.
- **Scenario Lab**: Interactive "What-If" stress testing (shutdowns, 30-day disruptions, factory outages, natural disasters, port closures) computing affected products, units at risk, inventory buffer depletion, financial loss in USD, and alternate supplier coverage %.
- **AI Procurement Copilot & RAG**: Grounded natural-language query engine hitting live database state and FAISS vector store with source citations.
- **Human-in-the-Loop Action Center**: High-impact recommendations queue requiring explicit human Approve/Reject decisions with an immutable audit log.
- **12 Enterprise Views**: Overview, Supplier Intelligence, Supplier Detail, Risk Observatory, Digital Twin, Scenario Lab, AI Copilot, Intelligence Feed, Action Center, Knowledge Base, Reports, Agent Activity, and Model Evaluation.

---

## Getting Started

### Method 1: Docker Compose (Recommended)
```bash
docker-compose up --build
```
Access the application:
- Frontend UI: `http://localhost:3000`
- FastAPI Backend Docs: `http://localhost:8000/docs`

### Method 2: Local Python + Node Execution
```bash
# 1. Start Backend (FastAPI + SQLite/PostgreSQL)
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# 2. Start Frontend (React + Vite)
cd ../frontend
npm install
npm run dev
```

---

## Full End-to-End Demo Flow

1. **Overview Dashboard**: Inspect top-line KPIs, risk distribution, risk trend area chart, and the dynamic **AI Situation Brief**.
2. **Supplier Intelligence**: Search for high-risk supplier `Aether Semiconductor GmbH` (`SUP-SEM-1000`).
3. **Supplier Detail & SHAP Drivers**: Inspect the TreeExplainer SHAP driver waterfall breakdown (*+28.4% Delivery Lead Time*), radar chart, and intelligence timeline.
4. **Digital Twin**: Open the dependency graph to observe risk propagation from *Aether Semiconductor* to *7nm EUV Silicon Wafer* and *Enterprise AI Server Suite*.
5. **Scenario Lab**: Select *30-day disruption* scenario for *Aether Semiconductor*. Run simulation to compute **$1.42M USD** financial impact, **12 buffer days remaining**, and auto-surface ranked mitigations.
6. **Action Center**: Review the proposed *"Shift 35% Volume to Secondary Approved Supplier"* action item. Click **Approve Action** and inspect the persistent **Audit Trail**.
7. **AI Copilot & RAG**: Ask *"Why is Aether Semiconductor risky?"* or *"Which suppliers are high risk?"* to view grounded answers with document citations.
8. **Agent Activity**: Inspect live timestamped logs of agent execution steps.
9. **Model Evaluation**: Review classification accuracy, F1 score, ROC-AUC, confusion matrix, feature importances, and the *Without AI vs With SupplyMind AI* research comparison table.
