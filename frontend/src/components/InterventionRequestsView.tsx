import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { InterventionRequest } from '../services/api';
import { 
  ClipboardList, Plus, Filter, AlertTriangle, RefreshCw, 
  CheckCircle2, FileText 
} from 'lucide-react';

interface InterventionRequestsViewProps {
  onOpenNewRequest: () => void;
}

export const InterventionRequestsView: React.FC<InterventionRequestsViewProps> = ({
  onOpenNewRequest
}) => {
  const [requests, setRequests] = useState<InterventionRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<InterventionRequest | null>(null);
  const [statusUpdateValue, setStatusUpdateValue] = useState<string>('Under review');
  const [statusUpdateNotes, setStatusUpdateNotes] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await api.getInterventionRequests();
      setRequests(res.data.requests);
      if (res.data.requests.length > 0 && !selectedRequest) {
        setSelectedRequest(res.data.requests[0]);
      }
    } catch (err: any) {
      console.error('Failed to load intervention requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleUpdateStatus = async () => {
    if (!selectedRequest) return;
    setUpdating(true);
    setUpdateSuccess(null);
    try {
      const res = await api.updateInterventionRequestStatus(
        selectedRequest.id,
        statusUpdateValue,
        statusUpdateNotes
      );
      setSelectedRequest(res.data.request);
      setUpdateSuccess(`Status updated to "${res.data.request.status}"`);
      setStatusUpdateNotes('');
      // refresh list
      const listRes = await api.getInterventionRequests();
      setRequests(listRes.data.requests);
      setTimeout(() => setUpdateSuccess(null), 4000);
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (statusFilter === 'all') return true;
    return r.status.toLowerCase().includes(statusFilter.toLowerCase());
  });

  const getStatusBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('approved') || s.includes('completed')) return 'status-approved';
    if (s.includes('review')) return 'status-under-review';
    if (s.includes('submitted')) return 'status-submitted';
    if (s.includes('rejected')) return 'status-rejected';
    return 'status-draft';
  };

  return (
    <div className="requests-view-container">
      {/* Top Banner Notice */}
      <div className="disclaimer-banner" style={{ marginBottom: '1.25rem' }}>
        <AlertTriangle size={18} />
        <div>
          <strong>Administrative Workflow:</strong> This prototype records an intervention request for authorized review. It does not automatically dispatch real-world government resources.
        </div>
      </div>

      {/* Header & Controls */}
      <div className="section-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 className="section-title" style={{ margin: 0 }}>
            <ClipboardList size={22} color="#0d9488" />
            Intervention Requests Registry ({requests.length} Records)
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.25rem 0 0' }}>
            Track, review, and authorize primary healthcare intervention packages across Tirunelveli district.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="filter-group">
            <Filter size={15} color="#64748b" />
            <select 
              id="select-filter-request-status"
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted for review</option>
              <option value="review">Under review</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <button 
            id="btn-open-new-request"
            onClick={onOpenNewRequest} 
            className="btn-primary"
          >
            <Plus size={16} /> Submit New Request
          </button>
        </div>
      </div>

      {/* Content split into list and details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.2fr) minmax(360px, 1.8fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
        {/* Left: Requests List */}
        <div className="section-card" style={{ padding: '1rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0' }}>
            Submitted Requests ({filteredRequests.length})
          </h4>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
              <div>Loading requests registry...</div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
              <FileText size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
              <p>No intervention requests recorded under this filter.</p>
              <button 
                onClick={onOpenNewRequest} 
                className="btn-outline" 
                style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}
              >
                Create first request
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '560px', overflowY: 'auto' }}>
              {filteredRequests.map(req => {
                const isSelected = selectedRequest?.id === req.id;
                return (
                  <div 
                    key={req.id}
                    id={`request-item-${req.id}`}
                    onClick={() => setSelectedRequest(req)}
                    className={`request-list-item ${isSelected ? 'selected' : ''}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0d9488' }}>
                        {req.id}
                      </span>
                      <span className={`request-status-badge ${getStatusBadgeClass(req.status)}`}>
                        {req.status}
                      </span>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                      {req.zoneName}
                    </div>

                    <div style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.2rem' }}>
                      {req.interventionType} • Qty: {req.quantity}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.725rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                      <span>Target: {req.requestedDate}</span>
                      <span style={{ fontWeight: 600, color: req.priority === 'Immediate' ? '#dc2626' : '#ea580c' }}>
                        {req.priority} Priority
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Request Details & Action */}
        <div className="section-card">
          {selectedRequest ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                      {selectedRequest.id}
                    </span>
                    <span className={`request-status-badge ${getStatusBadgeClass(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Submitted on: {new Date(selectedRequest.createdAt).toLocaleString()}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="risk-badge" style={{ background: selectedRequest.priority === 'Immediate' ? '#fef2f2' : '#fff7ed', color: selectedRequest.priority === 'Immediate' ? '#dc2626' : '#ea580c' }}>
                    {selectedRequest.priority} Priority
                  </span>
                </div>
              </div>

              {/* Grid details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="detail-stat-box">
                  <div className="stat-label">Target Health Zone</div>
                  <div className="stat-value">{selectedRequest.zoneName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Block: {selectedRequest.block}, Tirunelveli</div>
                </div>

                <div className="detail-stat-box">
                  <div className="stat-label">Intervention Package</div>
                  <div className="stat-value">{selectedRequest.interventionType}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Resource: {selectedRequest.resourceType} (Qty: {selectedRequest.quantity})</div>
                </div>

                <div className="detail-stat-box">
                  <div className="stat-label">Requested Deployment Date</div>
                  <div className="stat-value">{selectedRequest.requestedDate}</div>
                </div>

                <div className="detail-stat-box">
                  <div className="stat-label">Requesting Agency</div>
                  <div className="stat-value">{selectedRequest.requestingOrganization}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Contact: {selectedRequest.contactPerson} {selectedRequest.contactPhone ? `(${selectedRequest.contactPhone})` : ''}</div>
                </div>
              </div>

              {/* Justification Box */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Administrative Justification
                </div>
                <div style={{ fontSize: '0.875rem', color: '#1e293b', lineHeight: 1.5 }}>
                  {selectedRequest.justification}
                </div>
                {selectedRequest.notes && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.825rem', color: '#475569' }}>
                    <strong>Audit History / Notes:</strong>
                    <pre style={{ fontFamily: 'inherit', whiteSpace: 'pre-wrap', marginTop: '0.25rem', color: '#334155' }}>
                      {selectedRequest.notes}
                    </pre>
                  </div>
                )}
              </div>

              {/* Status Update Control */}
              <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '8px', padding: '1rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f766e', marginBottom: '0.5rem' }}>
                  Review & Update Request Status
                </h4>

                {updateSuccess && (
                  <div style={{ background: '#ecfdf5', color: '#059669', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.825rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={16} /> {updateSuccess}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr auto', gap: '0.75rem', alignItems: 'flex-end' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>New Status</label>
                    <select 
                      id="select-update-status"
                      value={statusUpdateValue}
                      onChange={(e) => setStatusUpdateValue(e.target.value)}
                      className="form-input"
                      style={{ padding: '0.45rem' }}
                    >
                      <option value="Under review">Under review</option>
                      <option value="Approved">Approved</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Reviewer Notes</label>
                    <input 
                      id="input-update-notes"
                      type="text" 
                      placeholder="Add review remarks or approval notes..."
                      value={statusUpdateNotes}
                      onChange={(e) => setStatusUpdateNotes(e.target.value)}
                      className="form-input"
                      style={{ padding: '0.45rem' }}
                    />
                  </div>

                  <button 
                    id="btn-update-request-status"
                    onClick={handleUpdateStatus} 
                    disabled={updating}
                    className="btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  >
                    {updating ? <RefreshCw size={14} className="animate-spin" /> : 'Update'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              Select a request from the left list to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
