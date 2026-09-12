import React, { useState, useMemo } from 'react';
import type { ZoneSummary } from '../services/api';
import { MapPin, Filter, Search, ArrowUpDown } from 'lucide-react';

interface RiskMapAndRankingProps {
  zones: ZoneSummary[];
  onSelectZone: (zoneId: string) => void;
}

export const RiskMapAndRanking: React.FC<RiskMapAndRankingProps> = ({
  zones,
  onSelectZone
}) => {
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all');
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const blocksList = useMemo(() => {
    const set = new Set(zones.map(z => z.block));
    return Array.from(set).sort();
  }, [zones]);

  const filteredZones = useMemo(() => {
    return zones.filter(z => {
      if (selectedRiskFilter !== 'all' && z.riskCategory.toLowerCase() !== selectedRiskFilter.toLowerCase()) {
        return false;
      }
      if (selectedBlockFilter !== 'all' && z.block !== selectedBlockFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          z.name.toLowerCase().includes(q) ||
          z.block.toLowerCase().includes(q) ||
          z.mainGap.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [zones, selectedRiskFilter, selectedBlockFilter, searchQuery]);

  return (
    <div>
      <div className="section-card">
        <h3 className="section-title">
          <MapPin size={20} color="#0d9488" />
          Tirunelveli District Block & PHC Catchment Risk Visualization
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
          Interactive risk visualization across 10 rural health blocks in Tirunelveli district. 
          Click on any block card to quickly jump into detailed zone metrics.
        </p>

        <div className="map-grid">
          {zones.map(zone => (
            <div 
              key={zone.id}
              className={`block-map-card`}
              onClick={() => onSelectZone(zone.id)}
            >
              <div className={`block-risk-strip ${zone.riskCategory.toLowerCase()}`} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                  {zone.block} Block
                </span>
                <span className={`risk-badge ${zone.riskCategory.toLowerCase()}`}>
                  {zone.riskCategory}
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.35rem' }}>
                {zone.name}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#475569' }}>
                <span>Gap Score:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: zone.riskColor }}>
                  {zone.riskScore}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem', fontStyle: 'italic' }}>
                Main gap: {zone.mainGap}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 className="section-title" style={{ margin: 0 }}>
            <ArrowUpDown size={20} color="#0d9488" />
            Ranked Priority Table ({filteredZones.length} Zones)
          </h3>
        </div>

        <div className="filter-bar">
          <div className="filter-group">
            <Filter size={16} color="#64748b" />
            <span className="filter-label">Risk Tier:</span>
            <select 
              value={selectedRiskFilter} 
              onChange={e => setSelectedRiskFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Risk Levels</option>
              <option value="critical">Critical Risk (76-100)</option>
              <option value="high">High Risk (51-75)</option>
              <option value="moderate">Moderate Risk (26-50)</option>
              <option value="low">Low Risk (0-25)</option>
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-label">Block:</span>
            <select 
              value={selectedBlockFilter} 
              onChange={e => setSelectedBlockFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Blocks</option>
              {blocksList.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="filter-group" style={{ marginLeft: 'auto', minWidth: '240px' }}>
            <Search size={16} color="#64748b" />
            <input 
              type="text"
              placeholder="Search zone, block or gap..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '0.85rem'
              }}
            />
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Health Zone / PHC Catchment</th>
                <th>Block</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th>Primary Healthcare Gap</th>
                <th>Population Affected</th>
                <th>Referral Distance</th>
                <th>Recommended Intervention</th>
                <th>Confidence</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredZones.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No rural health zones match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredZones.map((zone, index) => (
                  <tr key={zone.id}>
                    <td style={{ fontWeight: 800 }}>#{index + 1}</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{zone.name}</td>
                    <td>{zone.block}</td>
                    <td>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: zone.riskColor }}>
                        {zone.riskScore}
                      </span>
                    </td>
                    <td>
                      <span className={`risk-badge ${zone.riskCategory.toLowerCase()}`}>
                        {zone.riskCategory}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.825rem', color: '#334155' }}>{zone.mainGap}</td>
                    <td>{zone.population.toLocaleString()}</td>
                    <td>{zone.nearestFacilityDistance} km</td>
                    <td style={{ fontSize: '0.825rem', fontWeight: 500 }}>{zone.recommendedIntervention}</td>
                    <td style={{ fontSize: '0.775rem', color: '#64748b' }}>{zone.dataConfidence}</td>
                    <td>
                      <button 
                        onClick={() => onSelectZone(zone.id)}
                        className="btn-primary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
                      >
                        Inspect Zone
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
