import React from 'react';
import { 
  Activity, ArrowRight, ShieldCheck, Truck, 
  HelpCircle, BookOpen, AlertTriangle
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onHowItWorks: () => void;
  onOpenMethodology: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onHowItWorks,
  onOpenMethodology
}) => {
  return (
    <div className="landing-container">
      {/* Top Banner Notice */}
      <div className="landing-top-notice">
        <span className="meta-badge prototype-tag" style={{ background: '#fffbeb', color: '#92400e', borderColor: '#fde68a' }}>
          <AlertTriangle size={14} /> Prototype Demonstration Platform
        </span>
        <span>
          Supporting public-health planning and resource prioritization across rural Tamil Nadu.
        </span>
      </div>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Activity size={16} /> Decision Support for Public Health Administrators
          </div>
          <h1 className="hero-title">
            Better healthcare decisions for rural Tamil Nadu
          </h1>
          <p className="hero-subtitle">
            Identify underserved areas, understand the causes, and prioritize the right healthcare intervention.
          </p>

          <div className="hero-actions">
            <button 
              id="btn-landing-get-started"
              onClick={onGetStarted} 
              className="btn-primary hero-btn-main"
            >
              Get started <ArrowRight size={18} />
            </button>
            <button 
              id="btn-landing-how-it-works"
              onClick={onHowItWorks} 
              className="btn-outline hero-btn-secondary"
            >
              <HelpCircle size={18} /> How it works
            </button>
            <button 
              id="btn-landing-methodology"
              onClick={onOpenMethodology} 
              className="btn-outline hero-btn-secondary"
            >
              <BookOpen size={18} /> Data and methodology
            </button>
          </div>
        </div>
      </section>

      {/* Three Core Feature Pillars */}
      <section className="landing-features">
        <div className="landing-section-header">
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            A Deterministic Framework for Rural Health Equity
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '680px', margin: '0.5rem auto 0' }}>
            Bridging the divide between physical primary facility availability and effective, accessible healthcare delivery.
          </p>
        </div>

        <div className="features-grid">
          {/* Pillar 1: Identify healthcare gaps */}
          <div className="feature-card">
            <div className="feature-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <ShieldCheck size={28} />
            </div>
            <h3 className="feature-title">Identify healthcare gaps</h3>
            <p className="feature-desc">
              Evaluate real-world facility constraints across 5 critical dimensions: physical bed shortfall, doctor and nurse workforce vacancies, pharmacy stockouts, service utilization, and referral distance barriers.
            </p>
            <ul className="feature-list">
              <li>Deterministic 0–100 Healthcare Gap Scoring</li>
              <li>Calibrated against MoHFW RHS & HMIS benchmarks</li>
              <li>Visible risk tiers: Low, Moderate, High, and Critical</li>
            </ul>
          </div>

          {/* Pillar 2: Understand explainable risk */}
          <div className="feature-card">
            <div className="feature-icon-box" style={{ background: '#fef2f2', color: '#dc2626' }}>
              <Activity size={28} />
            </div>
            <h3 className="feature-title">Understand explainable risk</h3>
            <p className="feature-desc">
              No black-box predictions. Every zone’s gap score is backed by an explicit breakdown of its top contributing drivers and early-warning trend signals, explaining exactly why an area is at elevated risk.
            </p>
            <ul className="feature-list">
              <li>"Why This Score?" factor rationale for each zone</li>
              <li>Sub-gap contribution charts (Infra, Workforce, Access)</li>
              <li>Track declining maternal care and immunization trends</li>
            </ul>
          </div>

          {/* Pillar 3: Prioritize interventions and resources */}
          <div className="feature-card">
            <div className="feature-icon-box" style={{ background: '#f0fdfa', color: '#0d9488' }}>
              <Truck size={28} />
            </div>
            <h3 className="feature-title">Prioritize interventions and resources</h3>
            <p className="feature-desc">
              Run interactive "what-if" resource simulations to allocate limited Mobile Medical Units, outreach camps, and medicine kits to where they reduce the greatest district gap, and record administrative intervention requests.
            </p>
            <ul className="feature-list">
              <li>Transparent multi-criteria resource optimization</li>
              <li>Realistic post-allocation score reduction estimates</li>
              <li>Administrative intervention request submission workflow</li>
            </ul>
          </div>
        </div>
      </section>

      {/* District Pilot Status Callout */}
      <section className="landing-pilot-strip">
        <div className="pilot-strip-content">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="meta-badge" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>
                Pilot Available
              </span>
              <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>Tirunelveli District Rural Health Pilot</strong>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0 }}>
              Complete block-level catchment analytics across 10 rural health blocks (Manur, Nanguneri, Radhapuram, etc.) are currently live for testing. All other 37 districts have data ingestion planned.
            </p>
          </div>
          <button 
            id="btn-landing-open-tirunelveli"
            onClick={onGetStarted} 
            className="btn-primary"
            style={{ whiteSpace: 'nowrap', padding: '0.65rem 1.25rem' }}
          >
            Select District <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
};
