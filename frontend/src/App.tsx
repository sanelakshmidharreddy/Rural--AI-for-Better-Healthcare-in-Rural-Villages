import { useState, useEffect } from 'react';
import { api } from './services/api';
import type { OverviewData, ZoneSummary, ZoneDetail, ScoreBreakdown, RecommendationData, DistrictItem } from './services/api';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { DistrictSelection } from './components/DistrictSelection';
import { DistrictOverview } from './components/DistrictOverview';
import { RiskMapAndRanking } from './components/RiskMapAndRanking';
import { ZoneDetailView } from './components/ZoneDetailView';
import { ResourcePrioritizationView } from './components/ResourcePrioritizationView';
import { InterventionRequestsView } from './components/InterventionRequestsView';
import { InterventionRequestForm } from './components/InterventionRequestForm';
import { OnboardingTutorial } from './components/OnboardingTutorial';
import { MethodologyModal } from './components/MethodologyModal';
import { DataQualityModal } from './components/DataQualityModal';
import { LayoutDashboard, MapPin, Building2, Truck, FileText, Plus, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Main Navigation View: 'landing' | 'district-select' | 'dashboard'
  const [appView, setAppView] = useState<'landing' | 'district-select' | 'dashboard'>('landing');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Tirunelveli');
  const [districts, setDistricts] = useState<DistrictItem[]>([]);

  // Dashboard Tab: 'overview' | 'ranking' | 'detail' | 'prioritization' | 'requests' | 'new-request'
  const [activeTab, setActiveTab] = useState<'overview' | 'ranking' | 'detail' | 'prioritization' | 'requests' | 'new-request'>('overview');

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

  // Modals & Popups
  const [isDataQualityOpen, setIsDataQualityOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load Districts and Dashboard data
  const loadInitialData = async () => {
    setLoadingOverview(true);
    setError(null);
    try {
      const [ovRes, zoneRes, distRes] = await Promise.all([
        api.getOverview(),
        api.getZones(),
        api.getDistricts()
      ]);
      setOverview(ovRes.data);
      setZones(zoneRes.data.zones);
      setDistricts(distRes.data.districts);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Nellai HealthGrid API server');
    } finally {
      setLoadingOverview(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Show tutorial on first visit to dashboard if not completed
  const handleOpenDashboard = (districtId: string = 'tirunelveli') => {
    setSelectedDistrict(districtId === 'tirunelveli' ? 'Tirunelveli' : districtId);
    setAppView('dashboard');
    setActiveTab('overview');

    const completed = localStorage.getItem('nhg_tutorial_completed');
    if (!completed) {
      setIsTutorialOpen(true);
    }
  };

  // Handle Zone Selection
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

  // Handle Request Submission Toast Confirmation
  const handleRequestCreated = (requestId: string) => {
    setToastMessage(`Intervention Request ${requestId} successfully submitted for administrative review!`);
    setActiveTab('requests');
    setTimeout(() => setToastMessage(null), 6000);
  };

  return (
    <div className="app-container">
      {/* Header Bar */}
      <Header 
        currentView={appView}
        selectedDistrict={selectedDistrict}
        dataPeriod="Prototype scenario period"
        confidence="High (89%)"
        onOpenDataQuality={() => setIsDataQualityOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
        onChangeDistrict={() => setAppView('district-select')}
        onNavigateHome={() => setAppView('landing')}
      />

      {/* Toast Confirmation Message */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '1rem 1.25rem',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 3000,
          borderLeft: '4px solid #059669',
          maxWidth: '450px'
        }}>
          <CheckCircle2 size={22} color="#10b981" />
          <div style={{ fontSize: '0.875rem' }}>{toastMessage}</div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="main-wrapper">
        
        {/* VIEW 1: LANDING PAGE */}
        {appView === 'landing' && (
          <LandingPage 
            onGetStarted={() => setAppView('district-select')}
            onHowItWorks={() => setIsTutorialOpen(true)}
            onMethodology={() => setIsMethodologyOpen(true)}
          />
        )}

        {/* VIEW 2: TAMIL NADU DISTRICT SELECTION */}
        {appView === 'district-select' && (
          <DistrictSelection 
            districts={districts}
            onSelectDistrict={(id) => handleOpenDashboard(id)}
          />
        )}

        {/* VIEW 3: MAIN DASHBOARD */}
        {appView === 'dashboard' && (
          <>
            {/* Dashboard Tabs Bar */}
            <div className="tab-bar">
              <button 
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <LayoutDashboard size={18} /> Tirunelveli Overview
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

              <button 
                className={`tab-btn ${activeTab === 'requests' || activeTab === 'new-request' ? 'active' : ''}`}
                onClick={() => setActiveTab('requests')}
              >
                <FileText size={18} /> Intervention Requests
              </button>

              <button 
                className="btn-primary"
                onClick={() => setActiveTab('new-request')}
                style={{ marginLeft: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
              >
                <Plus size={14} /> Submit Request
              </button>
            </div>

            {/* Global Error Banner */}
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

            {/* Loading Spinner */}
            {loadingOverview && (
              <div className="section-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <RefreshCw size={32} color="#0d9488" className="animate-spin" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.1rem', color: '#0f172a' }}>Loading Tirunelveli HealthGrid Analytics...</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Evaluating facility infrastructure, workforce gaps, and service utilization.</p>
              </div>
            )}

            {/* Dashboard Tab Views */}
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

                {activeTab === 'requests' && (
                  <InterventionRequestsView 
                    onNewRequestClick={() => setActiveTab('new-request')}
                  />
                )}

                {activeTab === 'new-request' && (
                  <InterventionRequestForm 
                    zones={zones}
                    preselectedZoneId={selectedZoneId}
                    onSuccess={(reqId) => handleRequestCreated(reqId)}
                    onCancel={() => setActiveTab('requests')}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div>
          <strong>Nellai HealthGrid</strong> — AI-Powered Rural Healthcare Gap Detection and Resource Prioritization Platform for Tirunelveli District.
        </div>
        <div style={{ color: '#64748b', marginTop: '0.35rem', fontSize: '0.75rem' }}>
          Tirunelveli District Public Health Administration Pilot | Prototype Demonstration Data | Scenario Period: Prototype scenario period
        </div>
      </footer>

      {/* Modals */}
      <DataQualityModal 
        isOpen={isDataQualityOpen}
        onClose={() => setIsDataQualityOpen(false)}
      />

      <OnboardingTutorial 
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      <MethodologyModal 
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />
    </div>
  );
}
