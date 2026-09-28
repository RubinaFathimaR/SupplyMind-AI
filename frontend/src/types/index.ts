export interface Supplier {
  id: number;
  code: string;
  name: string;
  category: string;
  tier: number;
  country: string;
  region?: string;
  city?: string;
  contract_value: number;
  dependency_pct: number;
  status: string;
  overall_risk_score: number;
  risk_category: 'Low' | 'Medium' | 'High' | 'Critical';
  confidence_score: number;
  last_assessed?: string;
}

export interface SupplierMetrics {
  avg_lead_time_days: number;
  on_time_delivery_pct: number;
  defect_rate_ppm: number;
  order_cancellation_pct: number;
  debt_to_equity: number;
  altman_z_score: number;
  days_sales_outstanding: number;
  country_risk_index: number;
  esg_audit_score: number;
  cyber_security_score: number;
  historical_disruptions_cnt: number;
}

export interface SHAPDriver {
  feature: string;
  label: string;
  shap_value: number;
  pct_contribution: number;
  abs_pct: number;
  direction: string;
  impact_display: string;
  description: string;
}

export interface SupplierDetail extends Supplier {
  metrics: SupplierMetrics;
  radar_dimensions: {
    financial: number;
    operational: number;
    geopolitical: number;
    esg: number;
    cyber: number;
    news: number;
  };
  shap_drivers: SHAPDriver[];
  events: EventItem[];
  components: ComponentItem[];
  recommendations: RecommendationItem[];
}

export interface ComponentItem {
  id: number;
  code: string;
  name: string;
  unit_cost: number;
  inventory_buffer_days: number;
  is_critical_single_source: boolean;
}

export interface EventItem {
  id: number;
  supplier_id?: number;
  supplier_name?: string;
  title: string;
  summary: string;
  category: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  source: string;
  impact_score: number;
  created_at: string;
}

export interface DigitalTwinNode {
  id: string;
  label: string;
  type: 'supplier' | 'component' | 'product_line';
  risk_score: number;
  risk_category: string;
  details: Record<string, any>;
}

export interface DigitalTwinEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  weight: number;
}

export interface DigitalTwinData {
  nodes: DigitalTwinNode[];
  edges: DigitalTwinEdge[];
  critical_single_sources: Array<{
    component_code: string;
    component_name: string;
    supplier_name: string;
    buffer_days: number;
    risk_score: number;
  }>;
}

export interface SimulationResult {
  scenario_id: number;
  supplier_name: string;
  affected_products_count: number;
  units_at_risk: number;
  inventory_buffer_remaining_days: number;
  estimated_financial_impact_usd: number;
  alternate_coverage_pct: number;
  estimated_recovery_time_days: number;
  overall_severity_rating: string;
  details_json: Record<string, any>;
  recommendations: RecommendationItem[];
}

export interface RecommendationItem {
  id: number;
  supplier_id?: number;
  supplier_name?: string;
  title: string;
  action_type: string;
  description: string;
  cost_usd: number;
  estimated_risk_reduction_pct: number;
  feasibility_score: number;
  confidence: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at?: string;
}

export interface AuditLogItem {
  id: number;
  user_name: string;
  action_type: string;
  details: string;
  ip_address: string;
  timestamp: string;
}

export interface CopilotResponse {
  answer: string;
  reasoning_agent: string;
  sources: Array<{
    type: string;
    title: string;
    snippet: string;
  }>;
  suggested_followups: string[];
}

export interface AgentLogItem {
  id: number;
  agent_name: string;
  action: string;
  reasoning: string;
  input_data?: Record<string, any>;
  output_data?: Record<string, any>;
  execution_time_ms: number;
  timestamp: string;
}

export interface ModelEvalData {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  confusion_matrix: number[][];
  feature_importances: Array<{ feature: string; importance: number }>;
  dataset_summary: {
    total_records: number;
    training_records: number;
    testing_records: number;
    high_risk_ratio: number;
  };
  comparison_table: Array<{
    metric: string;
    without_ai: string;
    with_supplymind: string;
    improvement: string;
  }>;
}
