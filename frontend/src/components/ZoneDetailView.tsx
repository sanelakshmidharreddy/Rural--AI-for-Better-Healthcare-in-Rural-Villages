import React from 'react';
import type { ZoneDetail, ScoreBreakdown, RecommendationData } from '../services/api';
import { 
  Building2, Truck, AlertTriangle, ArrowLeft, Lightbulb, TrendingUp, TrendingDown, Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ZoneDetailViewProps {
  data: {
    zone: ZoneDetail;
    scoreBreakdown: ScoreBreakdown;
    recommendation: RecommendationData;
  };
  onBack: () => void;
  onNavigateToPrioritization: () => void;
  onRequestIntervention?: (zoneId: string, resourceType?: string, interventionType?: string) => void;
}

export const ZoneDetailView: React.FC<ZoneDetailViewProps> = ({
  data,
  onBack,
  onNavigateToPrioritization,
  onRequestIntervention
}) => {
  const { zone, scoreBreakdown, recommendation } = data;

  const chartData = [
    { name: 'Infrastructure', rawScore: scoreBreakdown.contributions.infrastructureGap, weight: '25%', weightedScore: scoreBreakdown.weightedContributions.infrastructure, fill: '#0284c7' },
    { name: 'Workforce', rawScore: scoreBreakdown.contributions.workforceGap, weight: '25%', weightedScore: scoreBreakdown.weightedContributions.workforce, fill: '#ea580c' },
    { name: 'Service Util.', rawScore: scoreBreakdown.contributions.serviceUtilizationGap, weight: '20%', weightedScore: scoreBreakdown.weightedContributions.serviceUtilization, fill: '#d97706' },
    { name: 'Medicine Stock', rawScore: scoreBreakdown.contributions.medicineEquipmentGap, weight: '15%', weightedScore: scoreBreakdown.weightedContributions.medicineEquipment, fill: '#dc2626' },
    { name: 'Accessibility', rawScore: scoreBreakdown.contributions.accessibilityGap, weight: '15%', weightedScore: scoreBreakdown.weightedContributions.accessibility, fill: '#7c3aed' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button onClick={onBack} className="btn-outline">
          <ArrowLeft size={16} /> Back to Risk Overview
        </button>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {onRequestIntervention && (
            <button 
              id="btn-zone-submit-request"
              onClick={() => onRequestIntervention(zone.id, undefined, recommendation.recommendedIntervention)} 
              className="btn-primary"
              style={{ backgroundColor: '#0f766e' }}
            >
              Submit intervention request
            </button>
          )}
          <button onClick={onNavigateToPrioritization} className="btn-primary">
            Allocate Resources to Zone <Truck size={16} />
          </button>
        </div>
      </div>

      <div className="section-card" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span className={`risk-badge ${scoreBreakdown.riskCategory.toLowerCase()}`}>
                {scoreBreakdown.riskCategory} Risk Zone
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Block: <strong>{zone.block}</strong> | District: {zone.district}
              </span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              {zone.name}
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#475569' }}>
              Serving a rural catchment population of <strong>{zone.population.toLocaleString()}</strong> across 
              {zone.facilityCount} health facilities ({zone.facilityTypes}).
            </p>
          </div>

          <div className="score-meter-container">
            <div className={`score-circle ${scoreBreakdown.riskCategory.toLowerCase()}`}>
              <div className="score-num">{scoreBreakdown.overallScore}</div>
              <div className="score-denom">/ 100</div>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
              Prototype Healthcare Gap Score
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
              Confidence: {scoreBreakdown.confidenceLevel} | Period: {zone.dataPeriod}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="section-card">
          <h3 className="section-title">
            <AlertTriangle size={20} color="#ea580c" />
            Why This Zone is at {scoreBreakdown.riskCategory} Risk
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
            Top contributing healthcare gap drivers evaluated by the multi-criteria formula:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {scoreBreakdown.topFactors.map((factor, index) => (
              <div key={index} style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                borderLeft: '4px solid #ea580c'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                    #{index + 1} {factor.name}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ea580c' }}>
                    Sub-score: {factor.score}/100 (+{factor.impact} pts)
                  </span>
                </div>
                <div style={{ fontSize: '0.825rem', color: '#475569' }}>
                  {factor.detail}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
              Formula Component Score Contributions (0-100 Sub-gap scale)
            </h4>
            <div style={{ height: 180, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis domain={[0, 100]} fontSize={11} />
                  <Tooltip formatter={(value: any) => [`${value} / 100`, 'Gap Severity']} />
                  <Bar dataKey="rawScore" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="section-card">
          <h3 className="section-title">
            <Building2 size={20} color="#0d9488" />
            Healthcare Infrastructure & Utilization Indicators
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Doctor Availability</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: zone.doctorAvailability < 1.0 ? '#dc2626' : '#0f172a' }}>
                {zone.doctorAvailability} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>per 10k pop</span>
              </div>
              <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.2rem' }}>Benchmark: 2.5 per 10k</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Medicine Stock %</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: zone.medicineAvailability < 60 ? '#dc2626' : '#059669' }}>
                {zone.medicineAvailability}%
              </div>
              <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.2rem' }}>Target: &ge; 90%</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Immunization Coverage</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: zone.immunizationCoverage < 70 ? '#ea580c' : '#059669' }}>
                {zone.immunizationCoverage}%
              </div>
              <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.2rem' }}>Target: &ge; 95%</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Referral Distance</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: zone.nearestFacilityDistance > 15 ? '#dc2626' : '#0f172a' }}>
                {zone.nearestFacilityDistance} km
              </div>
              <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.2rem' }}>Nearest secondary hospital</div>
            </div>
          </div>

          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#334155', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={16} color="#0d9488" /> Early-Warning Trend Prioritization Signals
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.entries(zone.historicalIndicators || {}).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: '#f1f5f9', borderRadius: '6px', fontSize: '0.825rem' }}>
                <span style={{ textTransform: 'capitalize', color: '#334155' }}>
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </span>
                <span style={{ fontWeight: 700, color: val === 'Declining' ? '#dc2626' : val === 'Improving' ? '#059669' : '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {val === 'Declining' && <TrendingDown size={14} />}
                  {val === 'Improving' && <TrendingUp size={14} />}
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-card" style={{ borderLeft: '5px solid #0d9488' }}>
        <h3 className="section-title">
          <Lightbulb size={20} color="#0d9488" />
          Recommended Healthcare Intervention Package
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Primary Intervention Action
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d9488', marginBottom: '0.5rem' }}>
              {recommendation.recommendedIntervention}
            </div>
            <div className="risk-badge high" style={{ marginBottom: '0.75rem' }}>
              Priority: {recommendation.priority}
            </div>
            <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>
              <strong>Rationale:</strong> {recommendation.primaryReason}
            </p>
          </div>

          <div style={{ background: '#f0fdfa', padding: '1.15rem', borderRadius: '10px', border: '1px solid #ccfbf1' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f766e', marginBottom: '0.5rem' }}>
              Expected Benefit & Responsible Agency
            </h4>
            <div style={{ fontSize: '0.85rem', color: '#134e4a', marginBottom: '0.75rem' }}>
              <strong>Estimated Benefit:</strong> {recommendation.expectedBenefit}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#134e4a', marginBottom: '0.75rem' }}>
              <strong>Responsible Organization:</strong> {recommendation.responsibleAgency}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#0f766e', fontStyle: 'italic' }}>
              <strong>Alternative Strategy:</strong> {recommendation.alternativeIntervention}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748b', background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <strong>Decision-Support Notice:</strong> {recommendation.confidenceScore}. All expected benefits are prototype estimates generated from rule-based simulation.
        </div>
      </div>
    </div>
  );
};
