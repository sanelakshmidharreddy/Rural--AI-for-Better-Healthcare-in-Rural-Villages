import React, { useState } from 'react';
import { 
  X, ChevronRight, ChevronLeft, Check, Compass, 
  Building2, MapPin, ArrowUpDown, BarChart3, HelpCircle, 
  Truck, ClipboardCheck, AlertTriangle 
} from 'lucide-react';

interface TutorialGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

interface StepContent {
  title: string;
  icon: React.ReactNode;
  tag: string;
  description: string;
  details: string[];
  suggestedTab?: string;
}

export const TUTORIAL_STEPS: StepContent[] = [
  {
    title: '1. District Overview',
    icon: <Building2 size={24} color="#0d9488" />,
    tag: 'Executive Dashboard',
    description: 'Summary metrics provide a macro-level diagnostic of the district health system.',
    details: [
      'Track total rural health zones analysed (10 block catchments in Tirunelveli).',
      'Identify critical-risk and high-risk zones needing immediate management focus.',
      'Monitor total bed capacity, staff shortages, pharmacy stockouts, and active outreach vehicles.'
    ],
    suggestedTab: 'overview'
  },
  {
    title: '2. Risk Map & Priority Grid',
    icon: <MapPin size={24} color="#dc2626" />,
    tag: 'Visual Health Risk Tiers',
    description: 'The block risk grid visualizes rural catchment zones categorized into 4 calibrated risk tiers.',
    details: [
      '🔴 Critical Risk (76–100): Severe compounding shortages requiring urgent intervention.',
      '🟠 High Risk (51–75): Elevated gap profile warranting priority resource allocation.',
      '🟡 Moderate Risk (26–50): Routine gaps addressable through planned maintenance.',
      '🟢 Low Risk (0–25): Stable primary care delivery meeting operational benchmarks.'
    ],
    suggestedTab: 'ranking'
  },
  {
    title: '3. Priority Ranking',
    icon: <ArrowUpDown size={24} color="#2563eb" />,
    tag: 'Actionable Prioritization',
    description: 'Sort and filter health zones to identify which areas demand administrative intervention first.',
    details: [
      'Rank zones dynamically by deterministic Healthcare Gap Score.',
      'Filter by risk severity tier or specific block names.',
      'Quickly inspect primary contributing gaps such as workforce deficits or referral travel barriers.'
    ],
    suggestedTab: 'ranking'
  },
  {
    title: '4. Zone Details',
    icon: <BarChart3 size={24} color="#0d9488" />,
    tag: 'Deep-Dive Indicators',
    description: 'Inspect facility infrastructure, workforce density, and utilization metrics for any catchment area.',
    details: [
      'Review doctor and nurse densities benchmarked per 10,000 population.',
      'Verify essential medicine inventory percentages against the state 90% target.',
      'Evaluate child immunization and maternal antenatal care (ANC) completion rates.'
    ],
    suggestedTab: 'detail'
  },
  {
    title: '5. Risk Explanation',
    icon: <HelpCircle size={24} color="#ea580c" />,
    tag: '"Why This Score?" Rationale',
    description: 'Transparent factor contribution breakdown reveals the mathematical drivers of every score.',
    details: [
      'Infrastructure Gap (25% weight): Bed shortfall relative to catchment population.',
      'Workforce Gap (25% weight): Deficit in clinical officers and nursing staff.',
      'Service Gap (20% weight) & Medicine Gap (15% weight): Utilization and pharmacy stockouts.',
      'Accessibility Gap (15% weight): Referral travel distance beyond 18 km barriers.'
    ],
    suggestedTab: 'detail'
  },
  {
    title: '6. Intervention Recommendation',
    icon: <Truck size={24} color="#059669" />,
    tag: 'Decision Support Rules',
    description: 'The deterministic rule engine matches specific gap patterns to suitable public health actions.',
    details: [
      'Long distance + low mobile coverage ➔ Mobile Medical Unit & remote immunization outreach.',
      'Declining immunization/ANC ➔ Specialized antenatal and child immunization camps.',
      'Doctor shortage ➔ Temporary staff reserve shifts & e-Sanjeevani telemedicine kiosks.',
      'Pharmacy depletion ➔ Emergency essential drug redistribution from district warehouse.'
    ],
    suggestedTab: 'detail'
  },
  {
    title: '7. Resource Simulation',
    icon: <Truck size={24} color="#7c3aed" />,
    tag: 'What-If Allocator',
    description: 'Test hypothetical resource deployments before committing administrative decisions.',
    details: [
      'Adjust quantities of available mobile units, outreach teams, and medicine kits.',
      'Observe multi-criteria ranking assigning resources to high-risk zones with compatible gaps.',
      'Review estimated post-allocation score reductions with transparent calculation disclaimers.'
    ],
    suggestedTab: 'prioritization'
  },
  {
    title: '8. Intervention Requests',
    icon: <ClipboardCheck size={24} color="#0d9488" />,
    tag: 'Authorized Workflow',
    description: 'Submit formal administrative intervention requests for responsible official review.',
    details: [
      'Record structured intervention requests with justification, priority, and date.',
      'Generates a unique tracking ID (e.g. NHG-2026-0001) with review status updates.',
      'Important: The system records an administrative request for review; it does NOT automatically dispatch real government vehicles.'
    ],
    suggestedTab: 'requests'
  }
];

export const TutorialGuide: React.FC<TutorialGuideProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  if (!isOpen) return null;

  const currentStep = TUTORIAL_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      if (onNavigateTab && TUTORIAL_STEPS[nextIndex].suggestedTab) {
        onNavigateTab(TUTORIAL_STEPS[nextIndex].suggestedTab!);
      }
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      if (onNavigateTab && TUTORIAL_STEPS[prevIndex].suggestedTab) {
        onNavigateTab(TUTORIAL_STEPS[prevIndex].suggestedTab!);
      }
    }
  };

  const handleFinish = () => {
    try {
      localStorage.setItem('nhg_tutorial_completed', 'true');
    } catch {
      // ignore
    }
    onClose();
  };

  const handleSkip = () => {
    handleFinish();
  };

  return (
    <div className="tutorial-overlay" id="tutorial-onboarding-modal">
      <div className="tutorial-card">
        {/* Header */}
        <div className="tutorial-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Compass size={22} color="#0d9488" />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                ARC Guided Tutorial
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Step {currentStepIndex + 1} of {TUTORIAL_STEPS.length}
              </div>
            </div>
          </div>

          <button 
            id="btn-tutorial-skip-x"
            onClick={handleSkip} 
            className="btn-close"
            title="Skip tutorial"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="tutorial-progress-track">
          <div 
            className="tutorial-progress-fill" 
            style={{ width: `${((currentStepIndex + 1) / TUTORIAL_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="tutorial-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div className="tutorial-step-icon">
              {currentStep.icon}
            </div>
            <div>
              <span className="meta-badge" style={{ background: '#f0fdfa', color: '#0f766e', borderColor: '#ccfbf1' }}>
                {currentStep.tag}
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
                {currentStep.title}
              </h3>
            </div>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5, marginBottom: '1rem' }}>
            {currentStep.description}
          </p>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ fontSize: '0.775rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem' }}>
              Key Insights for District Officers:
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {currentStep.details.map((point, i) => (
                <li key={i} style={{ fontSize: '0.825rem', color: '#334155', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span style={{ color: '#0d9488', fontWeight: 800, marginTop: '2px' }}>•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {currentStepIndex === 7 && (
            <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '6px', padding: '0.75rem', marginTop: '0.75rem', fontSize: '0.8rem', color: '#92400e', display: 'flex', gap: '0.5rem' }}>
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Administrative Notice:</strong> Submitting an intervention request saves the record for authorized district review. It does not automatically dispatch real vehicles.
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="tutorial-footer">
          <button 
            id="btn-tutorial-skip"
            onClick={handleSkip} 
            className="btn-outline" 
            style={{ fontSize: '0.85rem' }}
          >
            Skip tutorial
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              id="btn-tutorial-back"
              onClick={handleBack} 
              disabled={isFirstStep}
              className="btn-outline"
              style={{ fontSize: '0.85rem', opacity: isFirstStep ? 0.4 : 1 }}
            >
              <ChevronLeft size={16} /> Back
            </button>

            <button 
              id="btn-tutorial-next"
              onClick={handleNext} 
              className="btn-primary"
              style={{ fontSize: '0.85rem', minWidth: '90px', justifyContent: 'center' }}
            >
              {isLastStep ? (
                <>Finish <Check size={16} /></>
              ) : (
                <>Next <ChevronRight size={16} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
