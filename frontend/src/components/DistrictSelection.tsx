import React, { useState, useMemo } from 'react';
import type { DistrictItem } from '../services/api';
import { MapPin, Search, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

interface DistrictSelectionProps {
  districts: DistrictItem[];
  onSelectDistrict: (districtId: string) => void;
}

export const DistrictSelection: React.FC<DistrictSelectionProps> = ({
  districts,
  onSelectDistrict
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredDistricts = useMemo(() => {
    if (!searchQuery.trim()) return districts;
    const q = searchQuery.toLowerCase();
    return districts.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.region.toLowerCase().includes(q)
    );
  }, [districts, searchQuery]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0d9488', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          <MapPin size={16} /> State Selection — Tamil Nadu
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Select a Tamil Nadu District
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
          Choose a district to inspect rural healthcare gap analysis. Currently, <strong>Tirunelveli</strong> is active as the pilot demonstration district.
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '1.5rem', maxWidth: '400px', position: 'relative' }}>
        <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
          <Search size={16} />
        </div>
        <input 
          type="text"
          placeholder="Search Tamil Nadu district (e.g. Tirunelveli, Madurai)..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem 0.85rem 0.6rem 2.25rem',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '0.875rem',
            backgroundColor: '#ffffff'
          }}
        />
      </div>

      {/* District Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.15rem' }}>
        {filteredDistricts.map(district => {
          const isPilot = district.hasPilot;

          return (
            <div 
              key={district.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                border: isPilot ? '2px solid #0d9488' : '1px solid #e2e8f0',
                padding: '1.15rem',
                boxShadow: isPilot ? '0 4px 12px rgba(13, 148, 136, 0.12)' : '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.725rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                    {district.region}
                  </span>
                  {isPilot ? (
                    <span className="risk-badge low" style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}>
                      <CheckCircle2 size={12} /> Active Pilot
                    </span>
                  ) : (
                    <span className="meta-badge" style={{ fontSize: '0.7rem', backgroundColor: '#f1f5f9', color: '#64748b' }}>
                      <Clock size={12} /> Coming Soon
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                  {district.name}
                </h3>
                
                <p style={{ fontSize: '0.775rem', color: isPilot ? '#0f766e' : '#64748b', marginBottom: '1rem', fontWeight: isPilot ? 600 : 400 }}>
                  {district.status}
                </p>
              </div>

              <div>
                {isPilot ? (
                  <button 
                    onClick={() => onSelectDistrict(district.id)}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.5rem' }}
                  >
                    Open Dashboard <ArrowRight size={16} />
                  </button>
                ) : (
                  <button 
                    disabled 
                    className="btn-outline"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.5rem', opacity: 0.6, cursor: 'not-allowed', fontSize: '0.8rem' }}
                  >
                    Data Integration Planned
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
