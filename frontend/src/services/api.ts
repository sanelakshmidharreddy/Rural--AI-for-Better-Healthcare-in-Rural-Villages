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
    throw new Error(`API error: ${res.status} ${res.statusText}`);
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

  async getDistricts(): Promise<ApiResponse<{ totalDistricts: number; activePilotDistricts: number; districts: DistrictItem[] }>> {
    return fetchJson<{ totalDistricts: number; activePilotDistricts: number; districts: DistrictItem[] }>(`${API_BASE}/districts`);
  },

  async getDistrict(id: string): Promise<ApiResponse<{ district: any }>> {
    return fetchJson<{ district: any }>(`${API_BASE}/districts/${id}`);
  },

  async getInterventionRequests(params?: { status?: string; zone_id?: string; priority?: string }): Promise<ApiResponse<{ total: number; requests: InterventionRequest[]; notice: string }>> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.zone_id) query.append('zone_id', params.zone_id);
    if (params?.priority) query.append('priority', params.priority);
    const url = `${API_BASE}/intervention-requests${query.toString() ? `?${query.toString()}` : ''}`;
    return fetchJson<{ total: number; requests: InterventionRequest[]; notice: string }>(url);
  },

  async getInterventionRequest(id: string): Promise<ApiResponse<{ request: InterventionRequest; notice: string }>> {
    return fetchJson<{ request: InterventionRequest; notice: string }>(`${API_BASE}/intervention-requests/${id}`);
  },

  async createInterventionRequest(payload: InterventionRequestInput): Promise<ApiResponse<{ request: InterventionRequest; message: string; notice: string }>> {
    return fetchJson<{ request: InterventionRequest; message: string; notice: string }>(`${API_BASE}/intervention-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async updateInterventionRequestStatus(id: string, status: string, notes?: string): Promise<ApiResponse<{ request: InterventionRequest; message: string; notice: string }>> {
    return fetchJson<{ request: InterventionRequest; message: string; notice: string }>(`${API_BASE}/intervention-requests/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
  }
};

export interface DistrictItem {
  id: string;
  name: string;
  hq: string;
  hasActivePilot: boolean;
  pilotStatus: string;
  dataAvailabilityStatus: string;
  blocksCount?: number | null;
  openDashboardAvailable: boolean;
}

export interface InterventionRequest {
  id: string;
  zoneId: string;
  zoneName: string;
  block: string;
  district: string;
  interventionType: string;
  resourceType: string;
  quantity: number;
  requestedDate: string;
  priority: string;
  justification: string;
  notes?: string | null;
  requestingOrganization: string;
  contactPerson: string;
  contactPhone?: string | null;
  contactEmail?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterventionRequestInput {
  zoneId: string;
  zoneName?: string;
  block?: string;
  district?: string;
  interventionType: string;
  resourceType: string;
  quantity: number;
  requestedDate: string;
  priority: string;
  justification: string;
  notes?: string;
  requestingOrganization: string;
  contactPerson: string;
  contactPhone?: string;
  contactEmail?: string;
  confirmed?: boolean;
}
