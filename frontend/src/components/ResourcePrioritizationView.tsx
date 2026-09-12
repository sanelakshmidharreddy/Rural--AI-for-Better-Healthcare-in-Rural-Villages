import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { PrioritizationResult } from '../services/api';
import { Truck, Plus, Minus, RefreshCw, CheckCircle2, TrendingDown, ShieldCheck } from 'lucide-react';

export const ResourcePrioritizationView: React.FC = () => {
  const [resources, setResources] = useState({
    mobileUnits: 2,
    outreachTeams: 3,
    medicineKits: 5,
    telemedicineNodes: 2,
    temporaryStaff: 2,
    ambulances: 1
  });

  const [result, setResult] = useState<PrioritizationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const runPrioritization = async () => {
    setLoading(true);
    try {
      const res = await api.runResourcePrioritization(resources);
      setResult(res.data);
    } catch (err: any) {
      console.error('Failed to calculate resource allocation scenario', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runPrioritization();
  }, []);

  const handleResourceChange = (key: keyof typeof resources, delta: number) => {
    setResources(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta)
    }));
  };

  return (
    <div>
      <div className="section-card">
        <h3 className="section-title">
          <Truck size={22} color="#0d9488" />
          Interactive Resource Allocation & "What-If" Scenario Simulator
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#475569' }}>
          Select available district healthcare resource packages. The optimization engine ranks Tirunelveli health zones 
          based on Healthcare Gap Score, population pressure, and resource-gap compatibility, projecting post-allocation risk reduction.
        </p>
      </div>

      <div className="section-card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
          1. Select Available Resource Pool Quantities
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          
          <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>Mobile Medical Units</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>For long referral distance zones</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={() => handleResourceChange('mobileUnits', -1)} className="btn-outline" style={{ padding: '0.2rem 0.5rem' }}><Minus size={14} /></button>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', minWidth: '24px', textAlign: 'center' }}>{resources.mobileUnits}</span>
              <button onClick={() => handleResourceChange('mobileUnits', 1)} className="btn-outline" style={{ padding: '0.2rem 0.5rem' }}><Plus size={14} /></button>
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>Outreach Camps</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ANC & Immunization drives</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={() => handleResourceChange('outreachTeams', -1)} className="btn-outline" style={{ padding: '0.2rem 0.5rem' }}><Minus size={14} /></button>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', minWidth: '24px', textAlign: 'center' }}>{resources.outreachTeams}</span>
              <button onClick={() => handleResourceChange('outreachTeams', 1)} className="btn-outline" style={{ padding: '0.2rem 0.5rem' }}><Plus size={14} /></button>
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>Medicine Kits</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Pharmacy stockout refills</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={() => handleResourceChange('medicineKits', -1)} className="btn-outline" style={{ padding: '0.2rem 0.5rem' }}><Minus size={14} /></button>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', minWidth: '24px', textAlign: 'center' }}>{resources.medicineKits}</span>
              <button onClick={() => handleResourceChange('medicineKits', 1)} className="btn-outline" style={{ padding: '0.2rem 0.5rem' }}><Plus size={14} /></button>
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>Telemedicine Terminals</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>e-Sanjeevani remote consults</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={() => handleResourceChange('telemedicineNodes', -1)} className="btn-outline" style={{ padding: '0.2rem 0.5rem' }}><Minus size={14} /></button>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', minWidth: '24px', textAlign: 'center' }}>{resources.telemedicineNodes}</span>
              <button onClick={() => handleResourceChange('telemedicineNodes', 1)} className="btn-outline" style={{ padding: '0.2rem 0.5rem' }}><Plus size={14} /></button>
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>Temporary Doctor / Staff</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Reserve clinician shifts</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={() => handleResourceChange('temporaryStaff', -1)} className="btn-outline" style={{ padding: '0.2rem 0.5rem' }}><Minus size={14} /></button>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', minWidth: '24px', textAlign: 'center' }}>{resources.temporaryStaff}</span>
              <button onClick={() => handleResourceChange('temporaryStaff', 1)} className="btn-outline" style={{ padding: '0.2rem 0.5rem' }}><Plus size={14} /></button>
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>108 Ambulances</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Referral emergency transport</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={() => handleResourceChange('ambulances', -1)} className="btn-outline" style={{ padding: '0.2rem 0.5rem' }}><Minus size={14} /></button>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', minWidth: '24px', textAlign: 'center' }}>{resources.ambulances}</span>
              <button onClick={() => handleResourceChange('ambulances', 1)} className="btn-outline" style={{ padding: '0.2rem 0.5rem' }}><Plus size={14} /></button>
            </div>
          </div>

        </div>

        <button 
          onClick={runPrioritization} 
          disabled={loading}
          className="btn-primary"
          style={{ padding: '0.65rem 1.5rem', fontSize: '0.9rem' }}
        >
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Run What-If Resource Prioritization
        </button>
      </div>

      {result && (
        <>
          <div className="dashboard-grid">
            <div className="metric-card" style={{ borderLeft: '4px solid #0d9488' }}>
              <div className="metric-header">
                <span className="metric-title">Allocated Packages</span>
                <div className="metric-icon-box"><CheckCircle2 size={20} /></div>
              </div>
              <div className="metric-value">{result.allocationSummary.totalAllocatedResources}</div>
              <div className="metric-subtext">Assigned to High-Priority Zones</div>
            </div>

            <div className="metric-card" style={{ borderLeft: '4px solid #059669' }}>
              <div className="metric-header">
                <span className="metric-title">Zones Benefiting</span>
                <div className="metric-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}><CheckCircle2 size={20} /></div>
              </div>
              <div className="metric-value" style={{ color: '#059669' }}>{result.allocationSummary.zonesBenefiting}</div>
              <div className="metric-subtext">Rural PHC Catchment Areas</div>
            </div>

            <div className="metric-card" style={{ borderLeft: '4px solid #0284c7' }}>
              <div className="metric-header">
                <span className="metric-title">Est. District Risk Reduction</span>
                <div className="metric-icon-box" style={{ background: '#f0f9ff', color: '#0284c7' }}><TrendingDown size={20} /></div>
              </div>
              <div className="metric-value" style={{ color: '#0284c7' }}>
                -{result.allocationSummary.districtRiskReductionPct}%
              </div>
              <div className="metric-subtext">Projected Healthcare Gap Delta</div>
            </div>
          </div>

          <div className="section-card">
            <h3 className="section-title">
              <ShieldCheck size={20} color="#0d9488" />
              Prioritized Resource Allocation List
            </h3>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Target Zone</th>
                    <th>Block</th>
                    <th>Assigned Resource Package</th>
                    <th>Initial Score</th>
                    <th>Projected Score</th>
                    <th>Gap Reduction</th>
                    <th>Allocation Rationale & Benefit</th>
                  </tr>
                </thead>
                <tbody>
                  {result.prioritizedAllocations.map(alloc => (
                    <tr key={alloc.zoneId}>
                      <td style={{ fontWeight: 800 }}>#{alloc.allocationPriorityRank}</td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{alloc.zoneName}</td>
                      <td>{alloc.block}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {alloc.assignedResources.map((res, i) => (
                            <span key={i} className="meta-badge" style={{ backgroundColor: '#f0fdfa', color: '#0f766e', borderColor: '#ccfbf1', width: 'fit-content' }}>
                              {res}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: '#dc2626' }}>{alloc.initialGapScore}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: '#059669' }}>{alloc.projectedPostAllocationScore}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#0d9488' }}>-{alloc.projectedScoreReduction} pts</span>
                      </td>
                      <td style={{ fontSize: '0.825rem', color: '#334155' }}>
                        <div><strong>Reason:</strong> {alloc.reason}</div>
                        <div style={{ color: '#059669', marginTop: '0.2rem' }}><strong>Expected Benefit:</strong> {alloc.expectedBenefit}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
