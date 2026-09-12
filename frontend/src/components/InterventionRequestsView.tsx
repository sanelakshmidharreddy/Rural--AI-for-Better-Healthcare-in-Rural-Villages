import React, { useState, useEffect } from 'react';
import { api, InterventionRequestItem } from '../services/api';
import { FileText, Plus, RefreshCw, Filter, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

interface InterventionRequestsViewProps {
  onNewRequestClick: () => void;
}

export const InterventionRequestsView: React.FC<InterventionRequestsViewProps> = ({
  onNewRequestClick
}) => {
  const [requests, setRequests] = useState<InterventionRequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getInterventionRequests(selectedStatusFilter !== 'all' ? selectedStatusFilter : undefined);
      setRequests(res.data.requests);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch intervention requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [selectedStatusFilter]);

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      await api.updateInterventionRequestStatus(requestId, newStatus);
      fetchRequests();
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('approved') || s.includes('completed')) return 'risk-badge low';
    if (s.includes('review') || s.includes('scheduled')) return 'risk-badge moderate';
    if (s.includes('rejected')) return 'risk-badge critical';
    return 'meta-badge';
  };

  return (
    <div>
      {/* Header & Create Button */}
      <div className="section-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 className="section-title" style={{ margin: 0 }}>
              <FileText size={22} color="#0d9488" />
              Administrative Intervention Requests History
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.35rem' }}>
              Track, review, and manage formal intervention requests submitted for Tirunelveli district health catchments.
            </p>
          </div>

          <button onClick={onNewRequestClick} className="btn-primary">
            <Plus size={16} /> Submit New Intervention Request
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="section-card">
        <div className="filter-bar" style={{ margin: 0 }}>
          <div className="filter-group">
            <Filter size={16} color="#64748b" />
            <span className="filter-label">Filter by Status:</span>
            <select 
              value={selectedStatusFilter}
              onChange={e => setSelectedStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Request Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under review">Under review</option>
              <option value="Approved">Approved</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <button onClick={fetchRequests} className="btn-outline" style={{ marginLeft: 'auto' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="section-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <RefreshCw size={24} color="#0d9488" className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
            Loading intervention request records...
          </div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <FileText size={32} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '0.25rem' }}>No Intervention Requests Found</h4>
            <p style={{ fontSize: '0.85rem' }}>Submit a new request to track administrative resource deployment.</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Target Zone & Block</th>
                  <th>Intervention Strategy</th>
                  <th>Resource & Qty</th>
                  <th>Requested Date</th>
                  <th>Officer & Org</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: 800, color: '#0d9488' }}>{req.id}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{req.zoneName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{req.block} Block</div>
                    </td>
                    <td style={{ fontSize: '0.825rem', color: '#334155' }}>
                      <div style={{ fontWeight: 600 }}>{req.interventionType}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.2rem' }}>
                        Justification: "{req.justification.length > 50 ? `${req.justification.slice(0, 50)}...` : req.justification}"
                      </div>
                    </td>
                    <td>
                      <span className="meta-badge" style={{ backgroundColor: '#f0fdfa', color: '#0f766e', borderColor: '#ccfbf1' }}>
                        {req.resourceType} (x{req.quantity})
                      </span>
                    </td>
                    <td>{req.requestedDate}</td>
                    <td style={{ fontSize: '0.825rem' }}>
                      <div style={{ fontWeight: 600 }}>{req.contactPerson}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{req.requestingOrg}</div>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(req.status)}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      <select 
                        value={req.status}
                        onChange={e => handleStatusChange(req.id, e.target.value)}
                        className="filter-select"
                        style={{ fontSize: '0.775rem', padding: '0.25rem 0.5rem' }}
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Under review">Under review</option>
                        <option value="Approved">Approved</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
