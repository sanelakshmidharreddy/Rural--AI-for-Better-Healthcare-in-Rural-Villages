import React from 'react';
import { Activity, ShieldCheck, Database, HelpCircle, FileText, MapPin, ChevronRight } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  selectedDistrict: string;
  dataPeriod?: string;
  confidence?: string;
  onOpenDataQuality: () => void;
  onOpenTutorial: () => void;
  onOpenMethodology: () => void;
  onChangeDistrict: () => void;
  onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  selectedDistrict,
  dataPeriod = "Prototype scenario period",
  confidence = "High (89%)",
  onOpenDataQuality,
  onOpenTutorial,
  onOpenMethodology,
  onChangeDistrict,
  onNavigateHome
}) => {
  return (
    <header className="top-nav">
      <div className="nav-content">
        
        {/* Brand & Breadcrumb */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div className="brand-section">
            <div className="brand-icon" onClick={onNavigateHome} style={{ cursor: 'pointer' }}>
              <Activity size={24} />
            </div>
            <div>
              <div className="brand-title" onClick={onNavigateHome} style={{ cursor: 'pointer' }}>
                Nellai HealthGrid
              </div>
              <div className="brand-subtitle">
                AI-Powered Rural Healthcare Gap Detection and Resource Prioritization
              </div>
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            <span onClick={onNavigateHome} style={{ cursor: 'pointer', color: '#cbd5e1' }}>Home</span>
            <ChevronRight size={12} />
            <span onClick={onChangeDistrict} style={{ cursor: 'pointer', color: '#cbd5e1' }}>Tamil Nadu</span>
            {currentView !== 'landing' && currentView !== 'district-select' && (
              <>
                <ChevronRight size={12} />
                <span style={{ color: '#0d9488', fontWeight: 600 }}>{selectedDistrict} District</span>
              </>
            )}
          </div>
        </div>

        {/* Badges & Actions */}
        <div className="nav-badges">
          {currentView !== 'landing' && currentView !== 'district-select' && (
            <button 
              onClick={onChangeDistrict}
              className="meta-badge"
              style={{ cursor: 'pointer', backgroundColor: '#1e293b', borderColor: '#0d9488', color: '#5eead4' }}
            >
              <MapPin size={14} /> District: {selectedDistrict} (Change)
            </button>
          )}

          <span className="meta-badge prototype-tag">
            Prototype demonstration data
          </span>

          <span className="meta-badge">
            <Database size={13} /> {dataPeriod}
          </span>

          <button 
            onClick={onOpenTutorial} 
            className="btn-outline"
            style={{ color: '#fff', borderColor: '#334155', padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
          >
            <HelpCircle size={14} /> Tutorial
          </button>

          <button 
            onClick={onOpenMethodology} 
            className="btn-outline"
            style={{ color: '#fff', borderColor: '#334155', padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
          >
            <FileText size={14} /> Methodology
          </button>
        </div>

      </div>
    </header>
  );
};
