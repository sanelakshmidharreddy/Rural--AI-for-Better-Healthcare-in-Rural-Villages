import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { X, ShieldCheck } from 'lucide-react';

interface DataQualityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataQualityModal: React.FC<DataQualityModalProps> = ({ isOpen, onClose }) => {
  const [dataQuality, setDataQuality] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getDataQuality()
        .then(res => setDataQuality(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '1.75rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        position: 'relative'
      }}>
        <button 
          onClick={onClose} 
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#64748b'
          }}
        >
          <X size={22} />
        </button>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <ShieldCheck color="#0d9488" size={24} /> Data Quality & Audit Transparency
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
          Overview of data freshness, granularity, completeness, and prototype indicators for Tirunelveli district.
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading data quality metrics...</div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Data Period</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{dataQuality?.lastUpdated || 'Q3 2026'}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Data Granularity</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{dataQuality?.dataGranularity}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Average District Confidence</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>{dataQuality?.districtDataConfidenceAvg}</div>
              </div>
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
              Zone-Level Data Completeness & Confidence Ratings
            </h4>

            <div className="data-table-container" style={{ marginBottom: '1.25rem' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Zone</th>
                    <th>Block</th>
                    <th>Confidence</th>
                    <th>Completeness</th>
                    <th>Missing Indicators</th>
                  </tr>
                </thead>
                <tbody>
                  {dataQuality?.zoneDataQualityList?.map((item: any) => (
                    <tr key={item.zoneId}>
                      <td style={{ fontWeight: 600 }}>{item.zoneName}</td>
                      <td>{item.block}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: item.dataConfidence.includes('High') ? '#059669' : '#d97706' }}>
                          {item.dataConfidence}
                        </span>
                      </td>
                      <td>{item.dataCompletenessScore}%</td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {item.missingIndicators.length === 0 ? (
                          <span style={{ color: '#059669', fontWeight: 600 }}>None (100% complete)</span>
                        ) : (
                          <span style={{ color: '#dc2626' }}>{item.missingIndicators.join(', ')}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '1rem', borderRadius: '8px', fontSize: '0.825rem', color: '#92400e' }}>
              <strong>Public Health Governance Disclaimer:</strong> ARC is a decision support prototype designed for district administrative resource allocation. It does not replace official government health census records or provide clinical medical diagnoses.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
