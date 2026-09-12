import React from 'react';
import type { OverviewData } from '../services/api';
import { 
  Building2, Users, BedDouble, AlertCircle, Pill, 
  Truck, ArrowRight, TrendingDown, ShieldAlert
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DistrictOverviewProps {
  overview: OverviewData;
  onSelectZone: (zoneId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const DistrictOverview: React.FC<DistrictOverviewProps> = ({
  overview,
  onSelectZone,
  onNavigateTab
}) => {
  const { summaryMetrics, riskDistribution, topPriorityZones, districtMainGaps } = overview;

  return (
    <div>
      <div className="disclaimer-banner">
        <ShieldAlert size={18} />
        <div>
          <strong>Tirunelveli District Public Health Decision Support System:</strong> Prototype Demonstration Data active.
          Scores evaluate the gap between physical facility availability and effective healthcare delivery.
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Rural Health Zones</span>
            <div className="metric-icon-box"><Building2 size={20} /></div>
          </div>
          <div className="metric-value">{summaryMetrics.ruralZonesAnalysed}</div>
          <div className="metric-subtext">PHC Catchment Areas Analysed</div>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid #dc2626' }}>
          <div className="metric-header">
            <span className="metric-title">Critical-Risk Zones</span>
            <div className="metric-icon-box" style={{ background: '#fef2f2', color: '#dc2626' }}><AlertCircle size={20} /></div>
          </div>
          <div className="metric-value" style={{ color: '#dc2626' }}>{summaryMetrics.criticalRiskZones}</div>
          <div className="metric-subtext">Requires Immediate Intervention</div>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid #ea580c' }}>
          <div className="metric-header">
            <span className="metric-title">High-Risk Zones</span>
            <div className="metric-icon-box" style={{ background: '#fff7ed', color: '#ea580c' }}><AlertCircle size={20} /></div>
          </div>
          <div className="metric-value" style={{ color: '#ea580c' }}>{summaryMetrics.highRiskZones}</div>
          <div className="metric-subtext">Elevated Gap Profile</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Healthcare Facilities</span>
            <div className="metric-icon-box"><Building2 size={20} /></div>
          </div>
          <div className="metric-value">{summaryMetrics.totalHealthcareFacilities}</div>
          <div className="metric-subtext">District Hospitals, CHCs, PHCs</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Beds Capacity</span>
            <div className="metric-icon-box"><BedDouble size={20} /></div>
          </div>
          <div className="metric-value">{summaryMetrics.totalBeds}</div>
          <div className="metric-subtext">Operational Inpatient Beds</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Workforce Shortages</span>
            <div className="metric-icon-box" style={{ background: '#fffbeb', color: '#d97706' }}><Users size={20} /></div>
          </div>
          <div className="metric-value" style={{ color: '#d97706' }}>{summaryMetrics.facilitiesWithStaffGaps}</div>
          <div className="metric-subtext">Facilities with Staff Gaps</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Medicine Stock Depletions</span>
            <div className="metric-icon-box" style={{ background: '#fef2f2', color: '#dc2626' }}><Pill size={20} /></div>
          </div>
          <div className="metric-value" style={{ color: '#dc2626' }}>{summaryMetrics.facilitiesWithMedicineGaps}</div>
          <div className="metric-subtext">Facilities with Pharmacy Gaps</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Active Mobile Health Units</span>
            <div className="metric-icon-box"><Truck size={20} /></div>
          </div>
          <div className="metric-value">{summaryMetrics.activeMobileUnits}</div>
          <div className="metric-subtext">Outreach Vehicles Deployed</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="section-card">
          <h3 className="section-title">
            <AlertCircle size={20} color="#0d9488" />
            Tirunelveli District Risk Score Distribution
          </h3>
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistribution} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="category" type="category" width={80} />
                <Tooltip 
                  formatter={(value: any) => [`${value} Zones`, 'Quantity']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="section-card">
          <h3 className="section-title">
            <TrendingDown size={20} color="#ea580c" />
            Main District-Wide Healthcare Gaps
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {districtMainGaps.map((gap, idx) => (
              <div key={idx} style={{ 
                padding: '0.85rem 1rem', 
                backgroundColor: '#f8fafc', 
                borderRadius: '8px', 
                borderLeft: gap.severity === 'Critical' ? '4px solid #dc2626' : '4px solid #ea580c',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{gap.gapName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Affecting {gap.affectedZones} rural health zones</div>
                </div>
                <span className={`risk-badge ${gap.severity.toLowerCase()}`}>
                  {gap.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 className="section-title" style={{ margin: 0 }}>
            <ShieldAlert size={20} color="#dc2626" />
            Top Priority Health Zones Requiring Immediate Action
          </h3>
          <button onClick={() => onNavigateTab('ranking')} className="btn-primary">
            View All Priority Zones <ArrowRight size={16} />
          </button>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Priority Rank</th>
                <th>Health Zone / PHC Catchment</th>
                <th>Block</th>
                <th>Population</th>
                <th>Gap Score</th>
                <th>Risk Level</th>
                <th>Main Contributing Gap</th>
                <th>Recommended Intervention</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {topPriorityZones.map((zone, index) => (
                <tr key={zone.id}>
                  <td style={{ fontWeight: 700 }}>#{index + 1}</td>
                  <td style={{ fontWeight: 600 }}>{zone.name}</td>
                  <td>{zone.block}</td>
                  <td>{zone.population.toLocaleString()}</td>
                  <td>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: zone.riskColor }}>
                      {zone.riskScore}
                    </span>
                  </td>
                  <td>
                    <span className={`risk-badge ${zone.riskCategory.toLowerCase()}`}>
                      {zone.riskCategory}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.825rem', color: '#475569' }}>{zone.mainGap}</td>
                  <td style={{ fontSize: '0.825rem', fontWeight: 500 }}>{zone.recommendedIntervention}</td>
                  <td>
                    <button 
                      onClick={() => onSelectZone(zone.id)}
                      className="btn-outline"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
