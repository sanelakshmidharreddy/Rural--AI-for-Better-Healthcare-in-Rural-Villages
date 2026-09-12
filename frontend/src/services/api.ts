/**
 * API Client for Nellai HealthGrid Backend
 */

export interface SummaryMetrics {
  ruralZonesAnalysed: number;
  criticalRiskZones: number;
  highRiskZones: number;
  moderateRiskZones: number;
  lowRiskZones: number;
  totalPopulation: number;
  totalHealthcareFacilities: number;
  totalBeds: number;
  facilitiesWithStaffGaps: number;
  facilitiesWithMedicineGaps: number;
  activeMobileUnits: number;
}

export interface RiskDistributionItem {
  category: string;
  count: number;
  color: string;
  range: string;
}

export interface OverviewData {
  districtName: string;
  subtitle: string;
  summaryMetrics: SummaryMetrics;
  riskDistribution: RiskDistributionItem[];
  topPriorityZones: Array<{
    id: string;
    name: string;
    block: string;
    population: number;
    riskScore: number;
    riskCategory: string;
    riskColor: string;
    mainGap: string;
    recommendedIntervention: string;
    dataConfidence: string;
  }>;
  districtMainGaps: Array<{
    gapName: string;
    affectedZones: number;
    severity: string;
  }>;
  districtTrends: {
    overallImmunization: string;
    maternalCare: string;
    essentialMedicineStock: string;
  };
}

export interface ZoneSummary {
  id: string;
  name: string;
  block: string;
  district: string;
  population: number;
  facilityCount: number;
  facilityTypes: string;
  bedCount: number;
  riskScore: number;
  riskCategory: string;
  riskColor: string;
  mainGap: string;
  recommendedIntervention: string;
  nearestFacilityDistance: number;
  dataConfidence: string;
  doctorAvailability: number;
  medicineAvailability: number;
}

export interface ZoneDetail {
  id: string;
  name: string;
  block: string;
  district: string;
  population: number;
  facilityCount: number;
  facilityTypes: string;
  bedCount: number;
  doctorAvailability: number;
  nurseAvailability: number;
  medicineAvailability: number;
  infrastructureAvailability: number;
  immunizationCoverage: number;
  maternalCareCoverage: number;
  serviceUtilization: number;
  nearestFacilityDistance: number;
  mobileUnitCoverage: number;
  dataPeriod: string;
  dataConfidence: string;
  isPrototypeData: boolean;
  historicalIndicators: Record<string, string>;
}

export interface ScoreBreakdown {
  overallScore: number;
  riskCategory: string;
  riskColor: string;
  scoreName: string;
  contributions: {
    infrastructureGap: number;
    workforceGap: number;
    serviceUtilizationGap: number;
    medicineEquipmentGap: number;
    accessibilityGap: number;
  };
  weightedContributions: {
    infrastructure: number;
    workforce: number;
    serviceUtilization: number;
    medicineEquipment: number;
    accessibility: number;
  };
  topFactors: Array<{
    name: string;
    score: number;
    weight: number;
    impact: number;
    detail: string;
  }>;
  dataCompleteness: number;
  confidenceLevel: string;
}

export interface RecommendationData {
  recommendedIntervention: string;
  priority: string;
  primaryReason: string;
  supportingIndicators: string[];
  responsibleAgency: string;
  expectedBenefit: string;
  alternativeIntervention: string;
  confidenceScore: string;
  aiExplanation: string;
}

export interface PrioritizationResult {
  allocationSummary: {
    totalAllocatedResources: number;
    remainingUnassignedResources: Record<string, number>;
    zonesBenefiting: number;
    districtRiskReductionPct: number;
  };
  prioritizedAllocations: Array<{
    zoneId: string;
    zoneName: string;
    block: string;
    population: number;
    initialGapScore: number;
    riskCategory: string;
    assignedResources: string[];
    projectedPostAllocationScore: number;
    projectedScoreReduction: number;
    allocationPriorityRank: number;
    reason: string;
    expectedBenefit: string;
  }>;
}

export interface DistrictItem {
  id: string;
  name: string;
  region: string;
  hasPilot: boolean;
  status: string;
}

export interface InterventionRequestItem {
  id: string;
  zoneId: string;
  zoneName: string;
  block: string;
  interventionType: string;
  resourceType: string;
  quantity: number;
  requestedDate: string;
  priority: string;
  justification: string;
  notes?: string;
  requestingOrg: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  status: string; // Draft, Submitted, Under review, Approved, Scheduled, Completed, Rejected
  createdAt?: string;
  updatedAt?: string;
  disclaimer: string;
}

export interface InterventionRequestCreateInput {
  zoneId: string;
  zoneName: string;
  block: string;
  interventionType: string;
  resourceType: string;
  quantity: number;
  requestedDate: string;
  priority: string;
  justification: string;
  notes?: string;
  requestingOrg: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    dataPeriod: string;
    dataLevel: string;
    confidence: string;
    isPrototypeData: boolean;
    disclaimer: string;
  };
  error: { code: string; message: string } | null;
}

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Network request error' }));
    throw new Error(errorData.detail || errorData.error?.message || `API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  async getOverview(): Promise<ApiResponse<OverviewData>> {
    return fetchJson<OverviewData>(`${API_BASE}/overview`);
  },

  async getZones(params?: { risk_level?: string; block?: string; main_gap?: string }): Promise<ApiResponse<{ total: number; zones: ZoneSummary[] }>> {
    const query = new URLSearchParams();
    if (params?.risk_level) query.append('risk_level', params.risk_level);
    if (params?.block) query.append('block', params.block);
    if (params?.main_gap) query.append('main_gap', params.main_gap);
    
    const url = `${API_BASE}/zones${query.toString() ? `?${query.toString()}` : ''}`;
    return fetchJson<{ total: number; zones: ZoneSummary[] }>(url);
  },

  async getZoneDetail(zoneId: string): Promise<ApiResponse<{ zone: ZoneDetail; scoreBreakdown: ScoreBreakdown; recommendation: RecommendationData }>> {
    return fetchJson<{ zone: ZoneDetail; scoreBreakdown: ScoreBreakdown; recommendation: RecommendationData }>(`${API_BASE}/zones/${zoneId}`);
  },

  async getRiskBreakdown(zoneId: string): Promise<ApiResponse<ScoreBreakdown>> {
    return fetchJson<ScoreBreakdown>(`${API_BASE}/zones/${zoneId}/risk-breakdown`);
  },

  async getRecommendations(zoneId: string): Promise<ApiResponse<RecommendationData>> {
    return fetchJson<RecommendationData>(`${API_BASE}/zones/${zoneId}/recommendations`);
  },

  async runResourcePrioritization(resources: {
    mobileUnits: number;
    outreachTeams: number;
    medicineKits: number;
    telemedicineNodes: number;
    temporaryStaff: number;
    ambulances: number;
  }): Promise<ApiResponse<PrioritizationResult>> {
    return fetchJson<PrioritizationResult>(`${API_BASE}/resource-prioritization`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resources),
    });
  },

  async getDataQuality(): Promise<ApiResponse<any>> {
    return fetchJson<any>(`${API_BASE}/data-quality`);
  },

  async getDistricts(): Promise<ApiResponse<{ state: string; totalDistricts: number; activePilotDistrict: string; districts: DistrictItem[] }>> {
    return fetchJson<{ state: string; totalDistricts: number; activePilotDistrict: string; districts: DistrictItem[] }>(`${API_BASE}/districts`);
  },

  async getDistrictDetail(districtId: string): Promise<ApiResponse<DistrictItem>> {
    return fetchJson<DistrictItem>(`${API_BASE}/districts/${districtId}`);
  },

  async createInterventionRequest(payload: InterventionRequestCreateInput): Promise<ApiResponse<InterventionRequestItem>> {
    return fetchJson<InterventionRequestItem>(`${API_BASE}/intervention-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async getInterventionRequests(statusFilter?: string): Promise<ApiResponse<{ total: number; requests: InterventionRequestItem[] }>> {
    const url = statusFilter ? `${API_BASE}/intervention-requests?status=${encodeURIComponent(statusFilter)}` : `${API_BASE}/intervention-requests`;
    return fetchJson<{ total: number; requests: InterventionRequestItem[] }>(url);
  },

  async updateInterventionRequestStatus(id: string, status: string): Promise<ApiResponse<InterventionRequestItem>> {
    return fetchJson<InterventionRequestItem>(`${API_BASE}/intervention-requests/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  }
};

