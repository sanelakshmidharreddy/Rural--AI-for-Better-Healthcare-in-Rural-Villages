import React from 'react';
import { X, BookOpen, AlertTriangle, ShieldCheck, Database, Layers } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" id="methodology-modal">
      <div className="modal-container" style={{ maxWidth: '840px', maxHeight: '88vh' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <BookOpen size={22} color="#0d9488" /> Data & Methodology Architecture
            </h3>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
              Scientific principles, mathematical formulas, data families, and governance boundaries.
            </div>
          </div>
          <button onClick={onClose} className="btn-close" id="btn-close-methodology-modal">
            <X size={20} />
          </button>
        </div>

        {/* Mandatory Governance Disclaimer */}
        <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '1rem', margin: '1.25rem 1.5rem 0', fontSize: '0.85rem', color: '#92400e', display: 'flex', gap: '0.6rem' }}>
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Mandatory Public Health Disclaimer:</strong> This platform supports public-health planning and resource prioritization. It does not diagnose patients, replace healthcare professionals, or automatically make final healthcare decisions. Intervention requests require review and authorization by responsible officials.
          </div>
        </div>

        <div style={{ padding: '1.25rem 1.5rem 1.5rem', overflowY: 'auto', maxHeight: '65vh' }}>
          {/* 1. Dataset Families */}
          <section style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Database size={18} color="#0d9488" /> 1. Dataset Families & Provenance
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
              <div className="methodology-card">
                <strong>MoHFW Rural Health Statistics (RHS)</strong>
                <p>Provides facility benchmarks for Sub-Centres, PHCs, and CHCs; doctor, nurse, and lab tech staffing norms per 10k population.</p>
                <span className="meta-badge" style={{ fontSize: '0.7rem' }}>Official National Benchmark</span>
              </div>

              <div className="methodology-card">
                <strong>Health Management Info System (HMIS)</strong>
                <p>Provides primary maternal and child health indicators, including antenatal care checkups (ANC) and child full immunization coverage (UIP).</p>
                <span className="meta-badge" style={{ fontSize: '0.7rem' }}>Official Operational Registry</span>
              </div>

              <div className="methodology-card">
                <strong>NFHS-5 Tirunelveli District Factsheet</strong>
                <p>Establishes population baseline health metrics, institutional deliveries, and nutrition outcomes for Tirunelveli district.</p>
                <span className="meta-badge" style={{ fontSize: '0.7rem' }}>Official National Survey</span>
              </div>

              <div className="methodology-card">
                <strong>Poshan Tracker & TNMSC Drug Logistics</strong>
                <p>Informs Anganwadi supplemental outreach benchmarks and state essential drug list (EDL) pharmacy fulfillment criteria.</p>
                <span className="meta-badge" style={{ fontSize: '0.7rem' }}>State & Mission Monitoring</span>
              </div>
            </div>
          </section>

          {/* 2. Official vs Derived vs Prototype */}
          <section style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} color="#0d9488" /> 2. Official vs. Derived vs. Prototype Data
            </h4>
            <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5, background: '#f8fafc', padding: '0.9rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <p style={{ marginBottom: '0.5rem' }}>
                • <strong>Official Data:</strong> State & national health indicators published by MoHFW, IIPS, and Government of Tamil Nadu.
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                • <strong>Derived Data:</strong> Ratios normalized to standard population benchmarks (e.g. 2.5 doctors / 10k population; 1.2 beds / 1,000 population).
              </p>
              <p style={{ margin: 0 }}>
                • <strong>Prototype Demonstration Data:</strong> Specific village-level catchment metrics in the pilot are synthetically calibrated baseline scenarios for decision-support testing. The system does not claim live real-time clinical telemetry or official census status.
              </p>
            </div>
          </section>

          {/* 3. Healthcare Gap Formula */}
          <section style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={18} color="#0d9488" /> 3. Healthcare Gap Scoring Formula
            </h4>
            <div style={{ background: '#0f172a', color: '#f8fafc', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
              Healthcare Gap Score = 0.25 × Infrastructure Gap + 0.25 × Workforce Gap + 0.20 × Service Gap + 0.15 × Medicine Gap + 0.15 × Accessibility Gap
            </div>
            <div style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.5 }}>
              All 5 sub-indicators are normalized to a 0–100 scale (100 = maximum gap/risk):
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.35rem' }}>
                <li><strong>Infrastructure (25%):</strong> Inpatient bed deficit relative to 1.2 beds/1k standard + facility readiness.</li>
                <li><strong>Workforce (25%):</strong> Shortfall from 2.5 doctors/10k and 4.0 nurses/10k population benchmarks.</li>
                <li><strong>Service Utilization (20%):</strong> Deficit in immunization coverage (&lt;95%) and antenatal care (&lt;90%).</li>
                <li><strong>Medicine Stock (15%):</strong> Pharmacy stockout percentage below 90% essential medicine target.</li>
                <li><strong>Accessibility (15%):</strong> Secondary referral travel distance relative to 18 km threshold and mobile unit coverage.</li>
              </ul>
            </div>
          </section>

          {/* 4. What-If Simulation & Recommendation Rules */}
          <section style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              4. Resource Simulation & Recommendation Rules
            </h4>
            <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
              <p style={{ marginBottom: '0.5rem' }}>
                • <strong>Transparent Optimization:</strong> Limited resource packages (MMUs, outreach teams, drug kits) are dynamically assigned to zones based on overall gap severity and targeted gap compatibility.
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                • <strong>Realistic Bounds:</strong> Estimated post-allocation score reductions reflect achievable relief for the targeted dimension; residual infrastructure and geographic frictions prevent unrealistic zero-risk outcomes.
              </p>
              <p style={{ margin: 0 }}>
                • <strong>Rule-Based Actions:</strong> Recommendations stem from deterministic public health protocols (e.g., referral distance &gt;12 km triggers Mobile Medical Units).
              </p>
            </div>
          </section>

          {/* 5. Completeness & Limitations */}
          <section>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              5. Data Completeness & Limitations
            </h4>
            <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
              Data completeness measures the percentage of baseline input variables populated without omissions (e.g. 95% across 9 blocks; 78% in Kadayam due to missing historical outpatient trend logs). It does not signify statistical prediction confidence.
            </div>
          </section>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', padding: '0.75rem 1.5rem', textAlign: 'right' }}>
          <button onClick={onClose} className="btn-primary" style={{ padding: '0.45rem 1.25rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
