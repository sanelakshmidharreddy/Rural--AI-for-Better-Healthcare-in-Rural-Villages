import React, { useState } from 'react';
import { 
  ShieldCheck, Database, Info, AlertTriangle, 
  HelpCircle, ChevronRight, Home, MapPin, BookOpen, RotateCcw
} from 'lucide-react';

interface HeaderProps {
  currentView?: 'landing' | 'districts' | 'dashboard';
  selectedDistrict?: string;
  selectedZoneName?: string | null;
  dataPeriod?: string;
  confidence?: string;
  dataCompleteness?: string;
  dataMode?: string;
  geographicLevel?: string;
  sourceReference?: string;
  onNavigateHome?: () => void;
  onNavigateDistricts?: () => void;
  onOpenDataQuality: () => void;
  onOpenMethodology?: () => void;
  onOpenTutorial?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView = 'dashboard',
  selectedDistrict = 'Tirunelveli',
  selectedZoneName = null,
  dataPeriod = "Prototype scenario period",
  confidence = "High (88%)",
  dataCompleteness = "93.3%",
  dataMode = "Prototype Demonstration Mode",
  geographicLevel = "Tirunelveli District / PHC Catchment",
  sourceReference = "MoHFW RHS & HMIS",
  onNavigateHome,
  onNavigateDistricts,
  onOpenDataQuality,
  onOpenMethodology,
  onOpenTutorial
}) => {
  const [showHelpMenu, setShowHelpMenu] = useState<boolean>(false);

  return (
    <header className="top-nav">
      {/* Top Main Navigation Bar */}
      <div className="nav-content">
        <div className="brand-section">
          <div 
            className="brand-icon" 
            onClick={onNavigateHome}
            style={{ cursor: onNavigateHome ? 'pointer' : 'default' }}
            title="Return to Home"
          >
            <img src="/arc-logo.svg" alt="ARC logo" />
          </div>
          <div>
            <div 
              className="brand-title" 
              onClick={onNavigateHome}
              style={{ cursor: onNavigateHome ? 'pointer' : 'default' }}
            >
              ARC
            </div>
            <div className="brand-subtitle">
              Access. Risk. Care. — Rural healthcare gap detection and resource prioritization for {selectedDistrict} District
            </div>
          </div>
        </div>

        {/* Right Badges and Quick Actions */}
        <div className="nav-badges">
          <span className="meta-badge prototype-tag" title="Synthetic prototype calibrated to RHS/HMIS benchmarks">
            <AlertTriangle size={13} /> {dataMode}
          </span>
          <span className="meta-badge" title={`Geographic level: ${geographicLevel} | Source: ${sourceReference}`}>
            <MapPin size={13} /> {selectedDistrict} Pilot
          </span>
          <span className="meta-badge" title={`Reporting context: ${dataPeriod}`}>
            <Database size={13} /> {dataPeriod}
          </span>
          <span className="meta-badge" title={`Corroboration confidence: ${confidence}`}>
            <ShieldCheck size={13} /> Completeness: {dataCompleteness} ({confidence})
          </span>

          {onOpenMethodology && (
            <button 
              id="btn-header-methodology"
              onClick={onOpenMethodology} 
              className="btn-outline"
              style={{ color: '#fff', borderColor: '#334155', padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
              title="View Data Sources & Calculation Methodology"
            >
              <BookOpen size={14} /> Methodology
            </button>
          )}

          <button 
            id="btn-header-data-quality"
            onClick={onOpenDataQuality} 
            className="btn-outline"
            style={{ color: '#fff', borderColor: '#334155', padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
            title="Inspect Data Granularity and Audit Ratings"
          >
            <Info size={14} /> Audit
          </button>

          {/* Help & Tutorial Menu */}
          <div style={{ position: 'relative' }}>
            <button 
              id="btn-header-help"
              onClick={() => setShowHelpMenu(!showHelpMenu)}
              className="btn-outline"
              style={{ color: '#fff', borderColor: '#334155', padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
              title="Help & Onboarding Tutorial"
            >
              <HelpCircle size={14} /> Help
            </button>

            {showHelpMenu && (
              <div 
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '0.4rem',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.4)',
                  minWidth: '190px',
                  zIndex: 200,
                  padding: '0.4rem'
                }}
              >
                <button 
                  id="btn-restart-tutorial"
                  onClick={() => {
                    setShowHelpMenu(false);
                    if (onOpenTutorial) onOpenTutorial();
                  }}
                  className="dropdown-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: '#f1f5f9',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    textAlign: 'left'
                  }}
                >
                  <RotateCcw size={14} color="#0d9488" /> Restart tutorial
                </button>

                {onOpenMethodology && (
                  <button 
                    onClick={() => {
                      setShowHelpMenu(false);
                      onOpenMethodology();
                    }}
                    className="dropdown-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      color: '#f1f5f9',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      textAlign: 'left'
                    }}
                  >
                    <BookOpen size={14} color="#0d9488" /> Data and methodology
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-bar with Breadcrumb Navigation & District Switcher */}
      {currentView !== 'landing' && (
        <div className="sub-nav-bar">
          <div className="sub-nav-content">
            {/* Breadcrumb Navigation */}
            <nav className="breadcrumb-nav" aria-label="Breadcrumb">
              <button 
                id="breadcrumb-home"
                onClick={onNavigateHome}
                className="breadcrumb-item"
              >
                <Home size={14} /> Home
              </button>
              
              <ChevronRight size={13} color="#94a3b8" />
              
              <button 
                id="breadcrumb-districts"
                onClick={onNavigateDistricts}
                className={`breadcrumb-item ${currentView === 'districts' ? 'current' : ''}`}
              >
                Tamil Nadu (38 Districts)
              </button>

              {currentView === 'dashboard' && (
                <>
                  <ChevronRight size={13} color="#94a3b8" />
                  <span className="breadcrumb-item current">
                    {selectedDistrict} District
                  </span>
                </>
              )}

              {selectedZoneName && currentView === 'dashboard' && (
                <>
                  <ChevronRight size={13} color="#94a3b8" />
                  <span className="breadcrumb-item current" style={{ fontWeight: 700, color: '#0d9488' }}>
                    {selectedZoneName}
                  </span>
                </>
              )}
            </nav>

            {/* District Switcher Dropdown */}
            <div className="district-switcher-box">
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>District:</span>
              <select 
                id="select-district-switcher"
                value={selectedDistrict.toLowerCase()}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val !== 'tirunelveli') {
                    alert(`${val.charAt(0).toUpperCase() + val.slice(1)} District data integration is planned. Currently only Tirunelveli has an active rural pilot.`);
                  }
                }}
                className="district-switcher-select"
              >
                <option value="tirunelveli">Tirunelveli (Active Pilot)</option>
                <option value="madurai">Madurai (Coming soon)</option>
                <option value="thoothukudi">Thoothukudi (Coming soon)</option>
                <option value="tenkasi">Tenkasi (Coming soon)</option>
                <option value="kanyakumari">Kanyakumari (Coming soon)</option>
                <option value="virudhunagar">Virudhunagar (Coming soon)</option>
                <option value="coimbatore">Coimbatore (Coming soon)</option>
                <option value="salem">Salem (Coming soon)</option>
                <option value="tiruchirappalli">Tiruchirappalli (Coming soon)</option>
                <option value="chennai">Chennai (Coming soon)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
