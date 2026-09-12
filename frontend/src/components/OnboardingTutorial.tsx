import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle2, HelpCircle } from 'lucide-react';

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
}

const TUTORIAL_STEPS = [
  {
    title: "1. District Overview",
    content: "The District Overview provides executive summary metrics across rural health zones, bed capacity, staffing shortages, pharmacy depletions, and district-wide risk distribution.",
    tip: "Use overview summary cards to immediately assess public health pressure in Tirunelveli."
  },
  {
    title: "2. Risk Map & Priority Grid",
    content: "Color-coded risk levels highlight health zone risk status: Red (Critical Risk, score 76-100), Orange (High Risk, 51-75), Yellow (Moderate Risk, 26-50), and Green (Low Risk, 0-25).",
    tip: "Click on any block card in the visual grid to inspect zone details."
  },
  {
    title: "3. Priority Ranking Table",
    content: "Health zones are ranked descending by Healthcare Gap Score, helping district health officers prioritize underserved areas where intervention is needed most urgently.",
    tip: "Use the Risk Tier filter to isolate Critical and High risk catchments."
  },
  {
    title: "4. Zone Details & Metrics",
    content: "Zone profiles display population size, doctor/nurse density per 10k population, essential drug stock %, immunization coverage %, travel distance, and historical trends.",
    tip: "Compare indicators against standard NHM/WHO benchmarks."
  },
  {
    title: "5. Explainable Risk Factors",
    content: "The 'Why This Zone is at Risk' section details the exact formula sub-score drivers across Infrastructure (25%), Workforce (25%), Service Utilization (20%), Medicine (15%), and Accessibility (15%).",
    tip: "All scores are calculated deterministically without black-box inference."
  },
  {
    title: "6. Intervention Recommendation",
    content: "Rule-based decision logic maps zone gap profiles to target interventions (e.g. Mobile Medical Units for high travel distance, Outreach Camps for low immunization).",
    tip: "Review the expected benefit and suggested responsible agency for each recommendation."
  },
  {
    title: "7. Resource Simulation (What-If)",
    content: "The interactive What-If scenario simulator allows you to input available resource quantities (Mobile Units, Outreach Teams, Medicine Kits) and project post-allocation gap score reductions.",
    tip: "Resource simulations model potential impact but are explicitly labeled as simulation decisions."
  },
  {
    title: "8. Intervention Requests Workflow",
    content: "Authorized users can submit formal intervention requests with target dates and justifications. The system generates a tracking ID (e.g. NHG-2026-0001) for administrative review.",
    tip: "Notice: Submitting a request records a record for review; it does not automatically dispatch physical government units."
  }
];

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  isOpen,
  onClose,
  onNavigateToTab
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('nhg_tutorial_completed', 'true');
    onClose();
  };

  const step = TUTORIAL_STEPS[currentStep];

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
        maxWidth: '620px',
        width: '100%',
        padding: '2rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0d9488', fontWeight: 700, fontSize: '0.9rem' }}>
            <HelpCircle size={20} /> Guided Onboarding Tutorial
          </div>
          <button 
            onClick={handleFinish}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Progress Dots */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem' }}>
          {TUTORIAL_STEPS.map((_, idx) => (
            <div 
              key={idx}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                backgroundColor: idx <= currentStep ? '#0d9488' : '#e2e8f0',
                transition: 'background-color 0.2s ease'
              }}
            />
          ))}
        </div>

        {/* Content Card */}
        <div style={{ marginBottom: '1.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Step {currentStep + 1} of {TUTORIAL_STEPS.length}
          </span>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0 0.75rem' }}>
            {step.title}
          </h3>
          <p style={{ fontSize: '0.925rem', color: '#334155', lineHeight: 1.6, marginBottom: '1rem' }}>
            {step.content}
          </p>

          <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.825rem', color: '#0f766e' }}>
            <strong>Administrator Tip:</strong> {step.tip}
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            onClick={handleFinish} 
            className="btn-outline"
            style={{ fontSize: '0.825rem', color: '#64748b', borderColor: 'transparent' }}
          >
            Skip tutorial
          </button>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            {currentStep > 0 && (
              <button onClick={handleBack} className="btn-outline" style={{ padding: '0.5rem 1rem' }}>
                <ArrowLeft size={16} /> Back
              </button>
            )}

            {currentStep < TUTORIAL_STEPS.length - 1 ? (
              <button onClick={handleNext} className="btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={handleFinish} className="btn-primary" style={{ padding: '0.5rem 1.25rem', backgroundColor: '#059669' }}>
                <CheckCircle2 size={16} /> Finish Tutorial
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
