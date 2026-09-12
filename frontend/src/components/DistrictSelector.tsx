import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import type { DistrictItem } from '../services/api';
import { Search, MapPin, CheckCircle2, Clock, ArrowRight, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

interface DistrictSelectorProps {
  onSelectDistrict: (districtId: string) => void;
  onBackToLanding: () => void;
}

export const DistrictSelector: React.FC<DistrictSelectorProps> = ({
  onSelectDistrict,
  onBackToLanding
}) => {
  const [districts, setDistricts] = useState<DistrictItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadDistricts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDistricts();
      setDistricts(res.data.districts);
    } catch (err: any) {
      setError(err.message || 'Failed to load Tamil Nadu districts list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDistricts();
  }, []);

  const filteredDistricts = useMemo(() => {
    return districts.filter(d => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return d.name.toLowerCase().includes(q) || d.hq.toLowerCase().includes(q);
    });
  }, [districts, searchQuery]);

  return (
    <div className="district-selector-container">
      {/* Header & Controls */}
      <div className="district-header-section">
        <button 
          onClick={onBackToLanding} 
          className="btn-outline" 
          style={{ marginBottom: '1rem' }}
        >
          <ArrowLeft size={16} /> Back to Overview
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
              Tamil Nadu District HealthGrid Directory
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Select a district to view healthcare infrastructure, workforce capacity, and catchment gap analytics.
            </p>
          </div>

          <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '8px', padding: '0.6rem 1rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#0f766e', fontWeight: 600 }}>Coverage Status:</span>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0d9488' }}>
              1 Active Pilot / 38 Districts
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginTop: '1.25rem', position: 'relative', maxWidth: '480px' }}>
          <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            id="input-search-districts"
            type="text" 
            placeholder="Search Tamil Nadu district (e.g. Tirunelveli, Madurai)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.5rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="section-card" style={{ borderLeft: '4px solid #dc2626', backgroundColor: '#fef2f2', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#991b1b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
            <button onClick={loadDistricts} className="btn-primary" style={{ backgroundColor: '#dc2626' }}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="section-card" style={{ textAlign: 'center', padding: '3rem', marginTop: '1.5rem' }}>
          <RefreshCw size={32} color="#0d9488" className="animate-spin" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: '#64748b' }}>Loading Tamil Nadu district registries...</p>
        </div>
      )}

      {/* Districts Grid */}
      {!loading && !error && (
        <div className="district-grid" style={{ marginTop: '1.5rem' }}>
          {filteredDistricts.length === 0 ? (
            <div className="section-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2.5rem' }}>
              <p style={{ color: '#64748b' }}>No districts found matching "{searchQuery}".</p>
            </div>
          ) : (
            filteredDistricts.map(district => {
              const isPilot = district.hasActivePilot;
              return (
                <div 
                  key={district.id}
                  id={`district-card-${district.id}`}
                  className={`district-card ${isPilot ? 'pilot-active' : 'pilot-planned'}`}
                >
                  <div className="district-card-header">
                    <div>
                      <div className="district-name">
                        <MapPin size={16} color={isPilot ? '#0d9488' : '#94a3b8'} />
                        {district.name}
                      </div>
                      <div className="district-hq">Headquarters: {district.hq}</div>
                    </div>
                    {isPilot ? (
                      <span className="meta-badge" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>
                        <CheckCircle2 size={13} /> Active Pilot
                      </span>
                    ) : (
                      <span className="meta-badge" style={{ background: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' }}>
                        <Clock size={13} /> Coming soon
                      </span>
                    )}
                  </div>

                  <div className="district-card-body">
                    <div className="district-stat-row">
                      <span className="stat-label">Pilot Status:</span>
                      <span className="stat-value" style={{ color: isPilot ? '#0f766e' : '#64748b' }}>
                        {district.pilotStatus}
                      </span>
                    </div>
                    <div className="district-stat-row">
                      <span className="stat-label">Data Availability:</span>
                      <span className="stat-value">
                        {district.dataAvailabilityStatus}
                      </span>
                    </div>
                    {district.blocksCount && (
                      <div className="district-stat-row">
                        <span className="stat-label">Catchment Zones:</span>
                        <span className="stat-value" style={{ fontWeight: 700 }}>
                          {district.blocksCount} Rural Blocks
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="district-card-footer">
                    {isPilot ? (
                      <button 
                        id="btn-open-tirunelveli-dashboard"
                        onClick={() => onSelectDistrict(district.id)}
                        className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        Open dashboard <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button 
                        disabled
                        className="btn-outline"
                        style={{ width: '100%', justifyContent: 'center', opacity: 0.6, cursor: 'not-allowed' }}
                      >
                        Data integration planned
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
