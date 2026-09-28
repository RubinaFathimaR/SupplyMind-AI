from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
import datetime

# Supplier Schemas
class SupplierMetricBase(BaseModel):
    revenue_growth_pct: float
    debt_to_equity: float
    altman_z_score: float
    days_sales_outstanding: float
    avg_lead_time_days: float
    on_time_delivery_pct: float
    defect_rate_ppm: float
    order_cancellation_pct: float
    capacity_utilization_pct: float
    country_risk_index: float
    logistics_friction_score: float
    port_congestion_days: float
    carbon_intensity: float
    esg_audit_score: float
    labor_violation_flag: bool
    cyber_security_score: float
    unpatched_vulnerabilities: int
    historical_disruptions_cnt: int

class SupplierMetricResponse(SupplierMetricBase):
    id: int
    supplier_id: int
    recorded_at: datetime.datetime
    class Config:
        from_attributes = True

class RiskAssessmentResponse(BaseModel):
    id: int
    supplier_id: int
    overall_score: float
    financial_score: float
    operational_score: float
    geopolitical_score: float
    esg_score: float
    cyber_score: float
    news_sentiment_score: float
    shap_explainability: Optional[List[Dict[str, Any]]] = None
    trend: str
    assessed_at: datetime.datetime
    class Config:
        from_attributes = True

class SupplierBase(BaseModel):
    code: str
    name: str
    category: str
    tier: int
    country: str
    region: Optional[str] = None
    city: Optional[str] = None
    contract_value: float
    dependency_pct: float

class SupplierResponse(SupplierBase):
    id: int
    status: str
    overall_risk_score: float
    risk_category: str
    confidence_score: float
    last_assessed: datetime.datetime
    metrics: Optional[List[SupplierMetricResponse]] = []
    latest_assessment: Optional[RiskAssessmentResponse] = None
    class Config:
        from_attributes = True

# Event & Alert Schemas
class EventResponse(BaseModel):
    id: int
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    title: str
    summary: str
    category: str
    severity: str
    source: str
    impact_score: float
    created_at: datetime.datetime
    class Config:
        from_attributes = True

# Digital Twin Schemas
class GraphNodeData(BaseModel):
    id: str
    label: str
    type: str # supplier, component, product_line, customer
    risk_score: float
    risk_category: str
    details: Dict[str, Any]

class GraphEdgeData(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    weight: float

class DigitalTwinGraphResponse(BaseModel):
    nodes: List[GraphNodeData]
    edges: List[GraphEdgeData]
    critical_single_sources: List[Dict[str, Any]]

# Scenario Lab Schemas
class ScenarioSimulateRequest(BaseModel):
    scenario_type: str # shutdown, 30-day disruption, factory outage, natural disaster, cyberattack, port closure, geopolitical event, financial failure
    supplier_id: int
    duration_days: int = 30
    severity_pct: float = 80.0
    demand_multiplier: float = 1.0

class SimulationResultResponse(BaseModel):
    scenario_id: int
    supplier_name: str
    affected_products_count: int
    units_at_risk: int
    inventory_buffer_remaining_days: int
    estimated_financial_impact_usd: float
    alternate_coverage_pct: float
    estimated_recovery_time_days: int
    overall_severity_rating: str
    details_json: Dict[str, Any]
    recommendations: List[Dict[str, Any]]

# Recommendation & Action Schemas
class RecommendationResponse(BaseModel):
    id: int
    supplier_id: Optional[int] = None
    supplier_name: Optional[str] = None
    title: str
    action_type: str
    description: str
    cost_usd: float
    estimated_risk_reduction_pct: float
    feasibility_score: float
    confidence: float
    status: str
    created_at: datetime.datetime
    class Config:
        from_attributes = True

class ActionDecisionRequest(BaseModel):
    recommendation_id: int
    action_taken: str # Approved, Rejected, Reviewing
    notes: Optional[str] = None
    reviewed_by: str = "Procurement Director"

# Copilot / RAG Schemas
class CopilotQueryRequest(BaseModel):
    question: str
    supplier_id: Optional[int] = None
    include_documents: bool = True

class CopilotQueryResponse(BaseModel):
    answer: str
    reasoning_agent: str
    sources: List[Dict[str, Any]]
    suggested_followups: List[str]

# Agent Activity Log
class AgentLogResponse(BaseModel):
    id: int
    agent_name: str
    action: str
    reasoning: str
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None
    execution_time_ms: float
    timestamp: datetime.datetime
    class Config:
        from_attributes = True

# Model Evaluation Schemas
class ModelEvalMetrics(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    confusion_matrix: List[List[int]]
    feature_importances: List[Dict[str, Any]]
    dataset_summary: Dict[str, Any]
    comparison_table: List[Dict[str, Any]]
