import React from 'react';
import { X, FileText, ShieldCheck, Database, Calculator } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1.5rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        maxWidth: '850px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '2rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
        >
          <X size={22} />
        </button>

        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <FileText color="#0d9488" size={26} /> Data Sources, Formula & Methodology
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
          Complete transparent documentation of data registry, scoring equations, and simulation rules.
        </p>

        {/* 1. Datasets */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Database size={18} color="#0d9488" /> 1. Dataset Families & Sources
          </h4>
          <ul style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6, paddingLeft: '1.25rem' }}>
            <li><strong>Rural Health Statistics (RHS) / Health Dynamics of India</strong> (MoHFW): Sub-center, PHC, and CHC bed capacities and clinician staffing.</li>
            <li><strong>Health Management Information System (HMIS)</strong> (NHM): Antenatal care (ANC) registrations, full child immunization %, outpatient consultation rates.</li>
            <li><strong>National Family Health Survey (NFHS-5) & DLHS</strong> (IIPS): Household medical distance indices and demographic health baselines.</li>
            <li><strong>Anganwadi / Poshan Tracker</strong> (MoWCD): Child nutritional status and supplementary nutrition delivery.</li>
            <li><strong>Tamil Nadu Health Portal</strong> (TN Health): District health wellness center operational status and 108 ambulance dispatch benchmarks.</li>
          </ul>
        </div>

        {/* 2. Formula */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calculator size={18} color="#0d9488" /> 2. Prototype Healthcare Gap Score Formula
          </h4>
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px', fontSize: '0.875rem', fontFamily: 'monospace', color: '#0f172a', marginBottom: '0.75rem' }}>
            Gap Score = 25% Infrastructure + 25% Workforce + 20% Service Util. + 15% Medicine Stock + 15% Accessibility
          </div>
          <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
            Sub-indicators are normalized to a 0–100 gap scale (100 = maximum gap/risk). Risk Tiers: <strong>Critical (76-100)</strong>, <strong>High (51-75)</strong>, <strong>Moderate (26-50)</strong>, <strong>Low (0-25)</strong>.
          </p>
        </div>

        {/* 3. Simulation & Requests */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={18} color="#0d9488" /> 3. Resource Simulation & Request Workflow Rules
          </h4>
          <ul style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6, paddingLeft: '1.25rem' }}>
            <li><strong>Simulation Only:</strong> What-If resource allocation models projected score reduction based on resource-gap compatibility. It is explicitly labeled: <em>"Simulation only — not an actual deployment decision."</em></li>
            <li><strong>Non-Zero Bounds:</strong> Sub-gap scores maintain realistic lower bounds to reflect baseline operational demands.</li>
            <li><strong>Intervention Requests:</strong> Submitting a request creates a review record with a generated ID (e.g. <code>NHG-2026-0001</code>) for administrative tracking. It does not automatically dispatch physical government units.</li>
          </ul>
        </div>

        {/* Governance Disclaimer */}
        <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '1rem', borderRadius: '8px', fontSize: '0.825rem', color: '#92400e', lineHeight: 1.5 }}>
          <strong>Public-Health Governance Disclaimer:</strong> This platform supports public-health planning and resource prioritization. It does not diagnose patients, replace healthcare professionals, or automatically make final healthcare decisions. Intervention requests require review and authorization by responsible officials.
        </div>

      </div>
    </div>
  );
};
