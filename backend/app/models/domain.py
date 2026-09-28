import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="Procurement Manager") # Administrator, Procurement Manager, Risk Analyst, Executive
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False, index=True)
    category = Column(String, index=True) # Semiconductor, Automotive, Pharma, Raw Materials, Electronics
    tier = Column(Integer, default=1) # Tier 1, Tier 2, Tier 3
    country = Column(String, nullable=False, index=True)
    region = Column(String)
    city = Column(String)
    contract_value = Column(Float, default=0.0) # in USD
    dependency_pct = Column(Float, default=0.0) # % of critical component reliance
    status = Column(String, default="Active") # Active, Under Review, Escalated, Paused
    overall_risk_score = Column(Float, default=0.0) # 0 to 100
    risk_category = Column(String, default="Low") # Low, Medium, High, Critical
    confidence_score = Column(Float, default=0.92)
    last_assessed = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    metrics = relationship("SupplierMetric", back_populates="supplier", cascade="all, delete-orphan")
    assessments = relationship("RiskAssessment", back_populates="supplier", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="supplier", cascade="all, delete-orphan")
    components = relationship("Component", back_populates="supplier", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="supplier", cascade="all, delete-orphan")

class SupplierMetric(Base):
    __tablename__ = "supplier_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    
    # Financial indicators
    revenue_growth_pct = Column(Float, default=0.0)
    debt_to_equity = Column(Float, default=1.0)
    altman_z_score = Column(Float, default=3.0)
    days_sales_outstanding = Column(Float, default=45.0)
    
    # Operational metrics
    avg_lead_time_days = Column(Float, default=14.0)
    on_time_delivery_pct = Column(Float, default=95.0)
    defect_rate_ppm = Column(Float, default=120.0) # parts per million
    order_cancellation_pct = Column(Float, default=1.5)
    capacity_utilization_pct = Column(Float, default=82.0)
    
    # Geopolitical & Logistics
    country_risk_index = Column(Float, default=20.0) # 0 to 100
    logistics_friction_score = Column(Float, default=15.0)
    port_congestion_days = Column(Float, default=1.2)
    
    # ESG & Compliance
    carbon_intensity = Column(Float, default=40.0)
    esg_audit_score = Column(Float, default=85.0) # 0 to 100
    labor_violation_flag = Column(Boolean, default=False)
    
    # Cyber risk
    cyber_security_score = Column(Float, default=88.0) # 0 to 100
    unpatched_vulnerabilities = Column(Integer, default=0)
    historical_disruptions_cnt = Column(Integer, default=0)
    
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    supplier = relationship("Supplier", back_populates="metrics")

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    overall_score = Column(Float, nullable=False)
    financial_score = Column(Float, nullable=False)
    operational_score = Column(Float, nullable=False)
    geopolitical_score = Column(Float, nullable=False)
    esg_score = Column(Float, nullable=False)
    cyber_score = Column(Float, nullable=False)
    news_sentiment_score = Column(Float, nullable=False)
    
    shap_explainability = Column(JSON, nullable=True) # JSON list of SHAP key factors & % impacts
    trend = Column(String, default="Stable") # Improving, Stable, Deteriorating
    assessed_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    supplier = relationship("Supplier", back_populates="assessments")

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    category = Column(String) # Financial, Geopolitical, Weather, Cyber, Operational, ESG
    severity = Column(String, default="Medium") # Low, Medium, High, Critical
    source = Column(String, default="Global Logistics Wire")
    impact_score = Column(Float, default=50.0)
    url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    supplier = relationship("Supplier", back_populates="events")

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String, default="Warning") # Info, Warning, Critical
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Component(Base):
    __tablename__ = "components"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    category = Column(String)
    unit_cost = Column(Float, default=100.0)
    inventory_buffer_days = Column(Integer, default=15)
    is_critical_single_source = Column(Boolean, default=False)
    
    supplier = relationship("Supplier", back_populates="components")
    dependencies = relationship("Dependency", back_populates="component", cascade="all, delete-orphan")

class ProductLine(Base):
    __tablename__ = "product_lines"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    annual_revenue_impact = Column(Float, default=1000000.0) # in USD
    margin_pct = Column(Float, default=35.0)
    
    dependencies = relationship("Dependency", back_populates="product_line", cascade="all, delete-orphan")

class Dependency(Base):
    __tablename__ = "dependencies"
    
    id = Column(Integer, primary_key=True, index=True)
    component_id = Column(Integer, ForeignKey("components.id"), nullable=False)
    product_line_id = Column(Integer, ForeignKey("product_lines.id"), nullable=False)
    customer_tier = Column(String, default="Enterprise")
    bottleneck_weight = Column(Float, default=1.0)
    
    component = relationship("Component", back_populates="dependencies")
    product_line = relationship("ProductLine", back_populates="dependencies")

class Scenario(Base):
    __tablename__ = "scenarios"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    scenario_type = Column(String, nullable=False) # shutdown, 30-day disruption, factory outage, natural disaster, cyberattack, port closure, geopolitical event, financial failure
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    duration_days = Column(Integer, default=30)
    severity_pct = Column(Float, default=80.0)
    demand_multiplier = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    simulation_results = relationship("SimulationResult", back_populates="scenario", cascade="all, delete-orphan")

class SimulationResult(Base):
    __tablename__ = "simulation_results"
    
    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey("scenarios.id"), nullable=False)
    affected_products_count = Column(Integer, default=0)
    units_at_risk = Column(Integer, default=0)
    inventory_buffer_remaining_days = Column(Integer, default=0)
    estimated_financial_impact_usd = Column(Float, default=0.0)
    alternate_coverage_pct = Column(Float, default=0.0)
    estimated_recovery_time_days = Column(Integer, default=0)
    overall_severity_rating = Column(String, default="High")
    details_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    scenario = relationship("Scenario", back_populates="simulation_results")

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    title = Column(String, nullable=False)
    action_type = Column(String, nullable=False) # Shift Volume, Activate Secondary, Dual Source, Pause Supplier, Expedite Shipping
    description = Column(Text, nullable=False)
    cost_usd = Column(Float, default=50000.0)
    estimated_risk_reduction_pct = Column(Float, default=35.0)
    feasibility_score = Column(Float, default=85.0)
    confidence = Column(Float, default=0.90)
    status = Column(String, default="Pending") # Pending, Approved, Rejected, Implemented
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    supplier = relationship("Supplier", back_populates="recommendations")
    actions = relationship("Action", back_populates="recommendation", cascade="all, delete-orphan")

class Action(Base):
    __tablename__ = "actions"
    
    id = Column(Integer, primary_key=True, index=True)
    recommendation_id = Column(Integer, ForeignKey("recommendations.id"), nullable=False)
    action_taken = Column(String, nullable=False) # Approved, Rejected, Under Review
    reviewed_by = Column(String, default="Procurement Lead")
    notes = Column(Text, nullable=True)
    executed_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    recommendation = relationship("Recommendation", back_populates="actions")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    title = Column(String, nullable=False)
    doc_type = Column(String, default="Contract") # Contract, ESG Policy, Compliance, Audit Report
    content = Column(Text, nullable=False)
    file_size = Column(Integer, default=0)
    indexed_at = Column(DateTime, default=datetime.datetime.utcnow)

class AgentLog(Base):
    __tablename__ = "agent_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    agent_name = Column(String, nullable=False, index=True)
    action = Column(String, nullable=False)
    reasoning = Column(Text, nullable=False)
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    execution_time_ms = Column(Float, default=120.0)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String, default="System")
    action_type = Column(String, nullable=False)
    details = Column(Text, nullable=False)
    ip_address = Column(String, default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
