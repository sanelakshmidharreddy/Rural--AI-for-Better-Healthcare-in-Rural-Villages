import { useState, useEffect } from 'react';
import { api } from './services/api';
import type { OverviewData, ZoneSummary, ZoneDetail, ScoreBreakdown, RecommendationData } from './services/api';
import { Header } from './components/Header';
import { DistrictOverview } from './components/DistrictOverview';
import { RiskMapAndRanking } from './components/RiskMapAndRanking';
import { ZoneDetailView } from './components/ZoneDetailView';
import { ResourcePrioritizationView } from './components/ResourcePrioritizationView';
import { DataQualityModal } from './components/DataQualityModal';
import { LayoutDashboard, MapPin, Building2, Truck, RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'ranking' | 'detail' | 'prioritization'>('overview');
  
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [zones, setZones] = useState<ZoneSummary[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [zoneDetailData, setZoneDetailData] = useState<{
    zone: ZoneDetail;
    scoreBreakdown: ScoreBreakdown;
    recommendation: RecommendationData;
  } | null>(null);

  const [loadingOverview, setLoadingOverview] = useState<boolean>(true);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isDataQualityOpen, setIsDataQualityOpen] = useState<boolean>(false);

  const loadInitialData = async () => {
    setLoadingOverview(true);
    setError(null);
    try {
      const [ovRes, zoneRes] = await Promise.all([
        api.getOverview(),
        api.getZones()
      ]);
      setOverview(ovRes.data);
      setZones(zoneRes.data.zones);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Nellai HealthGrid API server');
    } finally {
      setLoadingOverview(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSelectZone = async (zoneId: string) => {
    setSelectedZoneId(zoneId);
    setActiveTab('detail');
    setLoadingDetail(true);
    try {
      const detailRes = await api.getZoneDetail(zoneId);
      setZoneDetailData(detailRes.data);
    } catch (err: any) {
      setError(`Failed to load details for zone ${zoneId}`);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="app-container">
      <Header 
        dataPeriod="Q3 2026"
        confidence="High (89%)"
        onOpenDataQuality={() => setIsDataQualityOpen(true)}
      />

      <main className="main-wrapper">
        <div className="tab-bar">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} /> Tirunelveli District Overview
          </button>
          
          <button 
            className={`tab-btn ${activeTab === 'ranking' ? 'active' : ''}`}
            onClick={() => setActiveTab('ranking')}
          >
            <MapPin size={18} /> Risk Map & Priority Ranking
          </button>

          {selectedZoneId && (
            <button 
              className={`tab-btn ${activeTab === 'detail' ? 'active' : ''}`}
              onClick={() => setActiveTab('detail')}
            >
              <Building2 size={18} /> Zone Detail & Gap Analysis
            </button>
          )}

          <button 
            className={`tab-btn ${activeTab === 'prioritization' ? 'active' : ''}`}
            onClick={() => setActiveTab('prioritization')}
          >
            <Truck size={18} /> Resource Prioritization & What-If
          </button>
        </div>

        {error && (
          <div className="section-card" style={{ borderLeft: '4px solid #dc2626', backgroundColor: '#fef2f2' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#991b1b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={20} />
                <strong>System Communication Warning:</strong> {error}
              </div>
              <button onClick={loadInitialData} className="btn-primary" style={{ backgroundColor: '#dc2626' }}>
                <RefreshCw size={14} /> Retry Connection
              </button>
            </div>
          </div>
        )}

        {loadingOverview && (
          <div className="section-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <RefreshCw size={32} color="#0d9488" className="animate-spin" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>Loading Tirunelveli HealthGrid Analytics...</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Evaluating facility infrastructure, workforce gaps, and service utilization.</p>
          </div>
        )}

        {!loadingOverview && !error && (
          <>
            {activeTab === 'overview' && overview && (
              <DistrictOverview 
                overview={overview} 
                onSelectZone={handleSelectZone}
                onNavigateTab={(tab) => setActiveTab(tab as any)}
              />
            )}

            {activeTab === 'ranking' && (
              <RiskMapAndRanking 
                zones={zones}
                onSelectZone={handleSelectZone}
              />
            )}

            {activeTab === 'detail' && (
              loadingDetail ? (
                <div className="section-card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <RefreshCw size={28} color="#0d9488" className="animate-spin" style={{ margin: '0 auto 1rem' }} />
                  <p>Loading zone gap analysis metrics...</p>
                </div>
              ) : zoneDetailData ? (
                <ZoneDetailView 
                  data={zoneDetailData}
                  onBack={() => setActiveTab('ranking')}
                  onNavigateToPrioritization={() => setActiveTab('prioritization')}
                />
              ) : (
                <div className="section-card">
                  <p>Please select a health zone from the Overview or Priority Ranking list to inspect details.</p>
                </div>
              )
            )}

            {activeTab === 'prioritization' && (
              <ResourcePrioritizationView />
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <div>
          <strong>Nellai HealthGrid</strong> — AI-Powered Rural Healthcare Gap Detection and Resource Prioritization Platform for Tirunelveli District.
        </div>
        <div style={{ color: '#64748b', marginTop: '0.35rem', fontSize: '0.75rem' }}>
          Tirunelveli District Public Health Administration Pilot | Prototype Demonstration Data | Data Period: Q3 2026
        </div>
      </footer>

      <DataQualityModal 
        isOpen={isDataQualityOpen}
        onClose={() => setIsDataQualityOpen(false)}
      />
    </div>
  );
}
