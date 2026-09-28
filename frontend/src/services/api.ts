import axios from 'axios';
import {
  Supplier, SupplierDetail, EventItem, DigitalTwinData,
  SimulationResult, RecommendationItem, AuditLogItem,
  CopilotResponse, AgentLogItem, ModelEvalData
} from '../types';

const API_BASE = '/api';

export const api = {
  // Overview
  getOverview: async () => {
    const res = await axios.get(`${API_BASE}/overview`);
    return res.data;
  },

  // Suppliers
  getSuppliers: async (params?: { category?: string; risk_category?: string; country?: string; search?: string }) => {
    const res = await axios.get<Supplier[]>(`${API_BASE}/suppliers`, { params });
    return res.data;
  },

  getSupplierDetail: async (id: number) => {
    const res = await axios.get<SupplierDetail>(`${API_BASE}/suppliers/${id}`);
    return res.data;
  },

  runInvestigation: async (id: number) => {
    const res = await axios.post(`${API_BASE}/suppliers/${id}/investigate`);
    return res.data;
  },

  // Risk Observatory
  getRiskObservatory: async () => {
    const res = await axios.get(`${API_BASE}/risk-observatory`);
    return res.data;
  },

  // Digital Twin
  getDigitalTwin: async (supplierId?: number) => {
    const res = await axios.get<DigitalTwinData>(`${API_BASE}/digital-twin`, { params: { supplier_id: supplierId } });
    return res.data;
  },

  // Scenario Lab
  simulateScenario: async (payload: { scenario_type: string; supplier_id: number; duration_days: number; severity_pct: number; demand_multiplier: number }) => {
    const res = await axios.post<SimulationResult>(`${API_BASE}/scenarios/simulate`, payload);
    return res.data;
  },

  // AI Copilot & RAG
  queryCopilot: async (question: string, supplierId?: number) => {
    const res = await axios.post<CopilotResponse>(`${API_BASE}/copilot/query`, { question, supplier_id: supplierId });
    return res.data;
  },

  getDocuments: async () => {
    const res = await axios.get(`${API_BASE}/copilot/documents`);
    return res.data;
  },

  uploadDocument: async (file: File, docType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);
    const res = await axios.post(`${API_BASE}/copilot/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // Intelligence Feed
  getIntelligenceFeed: async (category?: string) => {
    const res = await axios.get<EventItem[]>(`${API_BASE}/intelligence/events`, { params: { category } });
    return res.data;
  },

  // Action Center
  getRecommendations: async (status?: string) => {
    const res = await axios.get<RecommendationItem[]>(`${API_BASE}/actions/recommendations`, { params: { status } });
    return res.data;
  },

  postDecision: async (recommendationId: number, actionTaken: 'Approved' | 'Rejected', notes?: string) => {
    const res = await axios.post(`${API_BASE}/actions/decision`, {
      recommendation_id: recommendationId,
      action_taken: actionTaken,
      notes: notes,
      reviewed_by: 'Procurement Director'
    });
    return res.data;
  },

  getAuditLog: async () => {
    const res = await axios.get<AuditLogItem[]>(`${API_BASE}/actions/audit-log`);
    return res.data;
  },

  // Knowledge Base
  getKnowledgeStats: async () => {
    const res = await axios.get(`${API_BASE}/knowledge/stats`);
    return res.data;
  },

  // Reports
  getExecutiveReport: async (supplierId?: number) => {
    const res = await axios.get(`${API_BASE}/reports/executive`, { params: { supplier_id: supplierId } });
    return res.data;
  },

  // Agent Activity
  getAgentActivity: async (limit: number = 50) => {
    const res = await axios.get<AgentLogItem[]>(`${API_BASE}/agent-activity`, { params: { limit } });
    return res.data;
  },

  // Model Evaluation
  getModelEvaluation: async () => {
    const res = await axios.get<ModelEvalData>(`${API_BASE}/model-eval`);
    return res.data;
  }
};
