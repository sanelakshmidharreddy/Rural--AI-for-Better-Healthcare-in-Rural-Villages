import React from 'react';
import { Search, ShieldCheck, ArrowRight, HelpCircle, FileText } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onHowItWorks: () => void;
  onMethodology: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onHowItWorks,
  onMethodology
}) => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      
      {/* Hero Section */}
      <div style={{ 
        textAlign: 'center', 
        padding: '3rem 1.5rem', 
        backgroundColor: '#ffffff', 
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        marginBottom: '2.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div className="meta-badge prototype-tag" style={{ display: 'inline-flex', marginBottom: '1.25rem', padding: '0.4rem 0.85rem' }}>
          Tirunelveli District Public Health Pilot
        </div>
        
        <h1 style={{ 
          fontSize: '2.4rem', 
          fontWeight: 800, 
          color: '#0f172a', 
          marginBottom: '1rem',
          lineHeight: 1.25,
          letterSpacing: '-0.02em'
        }}>
          Better healthcare decisions for rural Tamil Nadu
        </h1>

        <p style={{ 
          fontSize: '1.1rem', 
          color: '#475569', 
          maxWidth: '750px', 
          margin: '0 auto 2rem',
          lineHeight: 1.6 
        }}>
          Identify underserved areas, understand the causes, and prioritize the right healthcare intervention.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            onClick={onGetStarted} 
            className="btn-primary" 
            style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}
          >
            Get started <ArrowRight size={18} />
          </button>
          
          <button 
            onClick={onHowItWorks} 
            className="btn-outline" 
            style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
          >
            <HelpCircle size={18} /> How it works
          </button>

          <button 
            onClick={onMethodology} 
            className="btn-outline" 
            style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
          >
            <FileText size={18} /> Data & Methodology
          </button>
        </div>
      </div>

      {/* 3 Core Feature Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        <div className="section-card" style={{ margin: 0 }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '10px', 
            backgroundColor: '#f0fdfa', 
            color: '#0d9488',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <Search size={24} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            1. Identify healthcare gaps
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.55 }}>
            Detect rural health zones where facilities physically exist but effective healthcare delivery is compromised due to doctor shortages, pharmacy stockouts, long referral travel distances, or low service utilization.
          </p>
        </div>

        <div className="section-card" style={{ margin: 0 }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '10px', 
            backgroundColor: '#fff7ed', 
            color: '#ea580c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <ShieldCheck size={24} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            2. Understand explainable risk
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.55 }}>
            Examine transparent factor breakdowns powered by the 5-factor Prototype Healthcare Gap Score formula (Infrastructure 25%, Workforce 25%, Service Utilization 20%, Medicine 15%, Accessibility 15%).
          </p>
        </div>

        <div className="section-card" style={{ margin: 0 }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '10px', 
            backgroundColor: '#ecfdf5', 
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <ArrowRight size={24} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            3. Prioritize interventions & resources
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.55 }}>
            Run interactive "What-If" resource allocation simulations and submit administrative intervention requests for authorized review and scheduling.
          </p>
        </div>

      </div>

      {/* Institutional Footer Disclaimer */}
      <div style={{ 
        backgroundColor: '#f8fafc', 
        border: '1px solid #e2e8f0', 
        borderRadius: '10px', 
        padding: '1.25rem', 
        fontSize: '0.825rem', 
        color: '#64748b',
        lineHeight: 1.5
      }}>
        <strong>Public-Health Governance Notice:</strong> Nellai HealthGrid is a decision-support platform designed for public-health planning and resource prioritization. It does not diagnose patients, replace healthcare professionals, or automatically dispatch real-world government resources.
      </div>

    </div>
  );
};
