import { useState, useEffect } from 'react';
import { api } from './services/api';
import type { 
  OverviewData, ZoneSummary, ZoneDetail, ScoreBreakdown, 
  RecommendationData, InterventionRequest 
} from './services/api';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { DistrictSelector } from './components/DistrictSelector';
import { DistrictOverview } from './components/DistrictOverview';
import { RiskMapAndRanking } from './components/RiskMapAndRanking';
import { ZoneDetailView } from './components/ZoneDetailView';
import { ResourcePrioritizationView } from './components/ResourcePrioritizationView';
import { InterventionRequestsView } from './components/InterventionRequestsView';
import { InterventionRequestModal } from './components/InterventionRequestModal';
import { MethodologyModal } from './components/MethodologyModal';
import { DataQualityModal } from './components/DataQualityModal';
import { TutorialGuide } from './components/TutorialGuide';
import { 
  LayoutDashboard, MapPin, Building2, Truck, RefreshCw, 
  AlertCircle, ClipboardList, CheckCircle2 
} from 'lucide-react';

export default function App() {
  // App views: 'landing' | 'districts' | 'dashboard'
  const [appView, setAppView] = useState<'landing' | 'districts' | 'dashboard'>('landing');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Tirunelveli');

  // Dashboard tabs: 'overview' | 'ranking' | 'detail' | 'prioritization' | 'requests'
  const [activeTab, setActiveTab] = useState<'overview' | 'ranking' | 'detail' | 'prioritization' | 'requests'>('overview');
  
  // Data states
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [zones, setZones] = useState<ZoneSummary[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [zoneDetailData, setZoneDetailData] = useState<{
    zone: ZoneDetail;
    scoreBreakdown: ScoreBreakdown;
    recommendation: RecommendationData;
  } | null>(null);

  const [loadingOverview, setLoadingOverview] = useState<boolean>(false);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modals & Overlays
  const [isDataQualityOpen, setIsDataQualityOpen] = useState<boolean>(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);
  const [requestModalParams, setRequestModalParams] = useState<{
    zoneId?: string;
    resourceType?: string;
    interventionType?: string;
  }>({});

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      setError(err.message || 'Failed to connect to the ARC API server');
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

  const handleSelectDistrictFromDirectory = (districtId: string) => {
    if (districtId.toLowerCase() === 'tirunelveli') {
      setSelectedDistrict('Tirunelveli');
      setAppView('dashboard');
      setActiveTab('overview');

      // Check first-time tutorial trigger on entering dashboard
      try {
        const completed = localStorage.getItem('nhg_tutorial_completed');
        if (!completed) {
          setIsTutorialOpen(true);
        }
      } catch {
        // ignore
      }
    }
  };

  const handleOpenInterventionRequest = (zoneId?: string, resourceType?: string, interventionType?: string) => {
    setRequestModalParams({ zoneId, resourceType, interventionType });
    setIsRequestModalOpen(true);
  };

  const handleRequestSubmitted = (newRequest: InterventionRequest) => {
    setToastMessage(`Intervention request ${newRequest.id} submitted for authorized review.`);
    setActiveTab('requests');
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const selectedZoneSummary = zones.find(z => z.id === selectedZoneId);

  return (
    <div className="app-container">
      {/* Universal Top Header */}
      <Header 
        currentView={appView}
        selectedDistrict={selectedDistrict}
        selectedZoneName={selectedZoneSummary ? selectedZoneSummary.name : null}
        dataPeriod="Prototype scenario period (Calibrated 2024-2025 RHS/HMIS Benchmarks)"
        confidence="High (88%)"
        dataCompleteness="93.3%"
        dataMode="Prototype Demonstration Mode"
        geographicLevel="Tirunelveli District Pilot / PHC Catchment"
        sourceReference="MoHFW RHS & HMIS"
        onNavigateHome={() => setAppView('landing')}
        onNavigateDistricts={() => setAppView('districts')}
        onOpenDataQuality={() => setIsDataQualityOpen(true)}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="toast-notification" id="toast-success-message">
          <CheckCircle2 size={18} color="#059669" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* VIEW 1: LANDING PAGE */}
      {appView === 'landing' && (
        <main className="main-wrapper">
          <LandingPage 
            onGetStarted={() => setAppView('districts')}
            onHowItWorks={() => {
              setAppView('dashboard');
              setIsTutorialOpen(true);
            }}
            onOpenMethodology={() => setIsMethodologyOpen(true)}
          />
        </main>
      )}

      {/* VIEW 2: DISTRICT SELECTOR (38 DISTRICTS) */}
      {appView === 'districts' && (
        <main className="main-wrapper">
          <DistrictSelector 
            onSelectDistrict={handleSelectDistrictFromDirectory}
            onBackToLanding={() => setAppView('landing')}
          />
        </main>
      )}

      {/* VIEW 3: TIRUNELVELI DASHBOARD */}
      {appView === 'dashboard' && (
        <main className="main-wrapper">
          {/* Dashboard Tab Bar */}
          <div className="tab-bar">
            <button 
              id="tab-overview"
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <LayoutDashboard size={18} /> Tirunelveli District Overview
            </button>
            
            <button 
              id="tab-ranking"
              className={`tab-btn ${activeTab === 'ranking' ? 'active' : ''}`}
              onClick={() => setActiveTab('ranking')}
            >
              <MapPin size={18} /> Risk Map & Priority Ranking
            </button>

            {selectedZoneId && (
              <button 
                id="tab-detail"
                className={`tab-btn ${activeTab === 'detail' ? 'active' : ''}`}
                onClick={() => setActiveTab('detail')}
              >
                <Building2 size={18} /> Zone Detail & Gap Analysis
              </button>
            )}

            <button 
              id="tab-prioritization"
              className={`tab-btn ${activeTab === 'prioritization' ? 'active' : ''}`}
              onClick={() => setActiveTab('prioritization')}
            >
              <Truck size={18} /> Resource Prioritization & What-If
            </button>

            <button 
              id="tab-requests"
              className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              <ClipboardList size={18} /> Intervention Requests
            </button>
          </div>

          {/* System error banner */}
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

          {/* Loading spinner */}
          {loadingOverview && (
            <div className="section-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <RefreshCw size={32} color="#0d9488" className="animate-spin" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>Loading Tirunelveli ARC analytics...</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Evaluating facility infrastructure, workforce gaps, and service utilization.</p>
            </div>
          )}

          {/* Dashboard Tab Content */}
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
                    onRequestIntervention={handleOpenInterventionRequest}
                  />
                ) : (
                  <div className="section-card">
                    <p>Please select a health zone from the Overview or Priority Ranking list to inspect details.</p>
                  </div>
                )
              )}

              {activeTab === 'prioritization' && (
                <ResourcePrioritizationView 
                  onRequestIntervention={handleOpenInterventionRequest}
                />
              )}

              {activeTab === 'requests' && (
                <InterventionRequestsView 
                  onOpenNewRequest={() => handleOpenInterventionRequest()}
                />
              )}
            </>
          )}
        </main>
      )}

      {/* Global Footer */}
      <footer className="app-footer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', maxWidth: '1400px', margin: '0 auto' }}>
          <div>
            <strong>ARC</strong> — Access, Risk, and Care for rural healthcare gap detection and resource prioritization.
            <div style={{ color: '#64748b', marginTop: '0.2rem', fontSize: '0.75rem' }}>
              Tirunelveli District Public Health Administration Pilot | Prototype Demonstration Data | Data Period: Prototype scenario period (Calibrated 2024-2025 RHS/HMIS Benchmarks)
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
            <button 
              onClick={() => setIsMethodologyOpen(true)} 
              style={{ background: 'none', border: 'none', color: '#0d9488', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Data and methodology
            </button>
            <button 
              onClick={() => setIsDataQualityOpen(true)} 
              style={{ background: 'none', border: 'none', color: '#0d9488', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Data quality audit
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <DataQualityModal 
        isOpen={isDataQualityOpen}
        onClose={() => setIsDataQualityOpen(false)}
      />

      <MethodologyModal 
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />

      <TutorialGuide 
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        onNavigateTab={(tab) => {
          setAppView('dashboard');
          setActiveTab(tab as any);
        }}
      />

      <InterventionRequestModal 
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        zones={zones}
        preselectedZoneId={requestModalParams.zoneId}
        preselectedResourceType={requestModalParams.resourceType}
        preselectedInterventionType={requestModalParams.interventionType}
        onRequestSubmitted={handleRequestSubmitted}
      />
    </div>
  );
}
