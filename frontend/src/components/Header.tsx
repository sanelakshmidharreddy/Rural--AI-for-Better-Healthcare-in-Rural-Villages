import React from 'react';
import { Activity, ShieldCheck, Database, Info, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  dataPeriod?: string;
  confidence?: string;
  onOpenDataQuality: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  dataPeriod = "Q3 2026",
  confidence = "High (89%)",
  onOpenDataQuality
}) => {
  return (
    <header className="top-nav">
      <div className="nav-content">
        <div className="brand-section">
          <div className="brand-icon">
            <Activity size={24} />
          </div>
          <div>
            <div className="brand-title">Nellai HealthGrid</div>
            <div className="brand-subtitle">
              AI-Powered Rural Healthcare Gap Detection and Resource Prioritization — Tirunelveli District
            </div>
          </div>
        </div>

        <div className="nav-badges">
          <span className="meta-badge prototype-tag">
            <AlertTriangle size={14} /> Prototype Demonstration Data
          </span>
          <span className="meta-badge">
            <Database size={14} /> Period: {dataPeriod}
          </span>
          <span className="meta-badge">
            <ShieldCheck size={14} /> Confidence: {confidence}
          </span>
          <button 
            onClick={onOpenDataQuality} 
            className="btn-outline"
            style={{ color: '#fff', borderColor: '#334155', padding: '0.35rem 0.75rem', fontSize: '0.775rem' }}
          >
            <Info size={14} /> Data Quality & Audit
          </button>
        </div>
      </div>
    </header>
  );
};
