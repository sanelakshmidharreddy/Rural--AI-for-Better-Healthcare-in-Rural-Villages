import React, { useState } from 'react';
import { api, InterventionRequestCreateInput, ZoneSummary } from '../services/api';
import { Send, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface InterventionRequestFormProps {
  zones: ZoneSummary[];
  preselectedZoneId?: string | null;
  onSuccess: (requestId: string) => void;
  onCancel: () => void;
}

export const InterventionRequestForm: React.FC<InterventionRequestFormProps> = ({
  zones,
  preselectedZoneId,
  onSuccess,
  onCancel
}) => {
  const initialZone = zones.find(z => z.id === preselectedZoneId) || zones[0];

  const [formData, setFormData] = useState<InterventionRequestCreateInput>({
    zoneId: initialZone ? initialZone.id : '',
    zoneName: initialZone ? initialZone.name : '',
    block: initialZone ? initialZone.block : '',
    interventionType: 'Mobile Medical Unit & Remote Outreach',
    resourceType: 'Mobile Medical Unit',
    quantity: 1,
    requestedDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    priority: 'High Priority',
    justification: '',
    notes: '',
    requestingOrg: 'Tirunelveli District Public Health Office',
    contactPerson: '',
    contactPhone: '',
    contactEmail: ''
  });

  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleZoneChange = (zoneId: string) => {
    const z = zones.find(item => item.id === zoneId);
    if (z) {
      setFormData(prev => ({
        ...prev,
        zoneId: z.id,
        zoneName: z.name,
        block: z.block
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate fields strictly
    if (!formData.zoneId) {
      setValidationError("Please select a target rural health zone.");
      return;
    }
    if (formData.quantity <= 0) {
      setValidationError("Quantity must be greater than zero.");
      return;
    }
    if (!formData.requestedDate) {
      setValidationError("Please select a requested deployment date.");
      return;
    }
    if (!formData.justification || formData.justification.trim().length < 5) {
      setValidationError("Administrative justification is required (minimum 5 characters).");
      return;
    }
    if (!formData.requestingOrg.trim()) {
      setValidationError("Please specify the requesting organization.");
      return;
    }
    if (!formData.contactPerson.trim() || !formData.contactPhone.trim() || !formData.contactEmail.trim()) {
      setValidationError("Officer contact name, phone, and email are required for administrative review.");
      return;
    }
    if (!confirmed) {
      setValidationError("You must confirm that this is an administrative review request.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.createInterventionRequest(formData);
      onSuccess(res.data.id);
    } catch (err: any) {
      setValidationError(err.message || "Failed to submit intervention request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-card" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <h3 className="section-title">
        <Send size={22} color="#0d9488" />
        Submit Administrative Intervention Request
      </h3>
      <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
        Create a formal intervention record for district health administrative review.
      </p>

      {/* Disclaimers */}
      <div className="disclaimer-banner" style={{ marginBottom: '1.5rem' }}>
        <ShieldAlert size={20} />
        <div>
          <strong>Administrative Notice:</strong> This prototype records an intervention request for authorized review. It does not automatically dispatch real-world government resources.
        </div>
      </div>

      {validationError && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '0.85rem 1rem', borderRadius: '8px', color: '#dc2626', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} /> {validationError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.15rem', marginBottom: '1.25rem' }}>
          
          {/* Target Zone */}
          <div>
            <label className="filter-label" style={{ display: 'block', marginBottom: '0.35rem' }}>Target Health Zone *</label>
            <select 
              value={formData.zoneId}
              onChange={e => handleZoneChange(e.target.value)}
              className="filter-select"
              style={{ width: '100%', padding: '0.55rem' }}
            >
              {zones.map(z => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.block} Block — {z.riskCategory} Risk)
                </option>
              ))}
            </select>
          </div>

          {/* Intervention Strategy */}
          <div>
            <label className="filter-label" style={{ display: 'block', marginBottom: '0.35rem' }}>Intervention Strategy *</label>
            <select 
              value={formData.interventionType}
              onChange={e => setFormData(prev => ({ ...prev, interventionType: e.target.value }))}
              className="filter-select"
              style={{ width: '100%', padding: '0.55rem' }}
            >
              <option value="Mobile Medical Unit & Remote Outreach">Mobile Medical Unit & Remote Outreach</option>
              <option value="Specialized ANC & Child Immunization Camps">Specialized ANC & Child Immunization Camps</option>
              <option value="Temporary Staff Deployment & Telemedicine">Temporary Staff Deployment & Telemedicine</option>
              <option value="Emergency Drug & Equipment Redistribution">Emergency Drug & Equipment Redistribution</option>
              <option value="108 Referral Ambulance Network Reinforcement">108 Referral Ambulance Network Reinforcement</option>
            </select>
          </div>

          {/* Resource Type */}
          <div>
            <label className="filter-label" style={{ display: 'block', marginBottom: '0.35rem' }}>Resource Type *</label>
            <select 
              value={formData.resourceType}
              onChange={e => setFormData(prev => ({ ...prev, resourceType: e.target.value }))}
              className="filter-select"
              style={{ width: '100%', padding: '0.55rem' }}
            >
              <option value="Mobile Medical Unit">Mobile Medical Unit</option>
              <option value="Immunization Outreach Team">Immunization Outreach Team</option>
              <option value="Essential Medicine Kit">Essential Medicine Kit</option>
              <option value="Telemedicine Terminal">Telemedicine Terminal</option>
              <option value="Temporary Doctor / ANM Staff">Temporary Doctor / ANM Staff</option>
              <option value="108 Referral Ambulance">108 Referral Ambulance</option>
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="filter-label" style={{ display: 'block', marginBottom: '0.35rem' }}>Requested Quantity *</label>
            <input 
              type="number"
              min={1}
              max={100}
              value={formData.quantity}
              onChange={e => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          {/* Requested Date */}
          <div>
            <label className="filter-label" style={{ display: 'block', marginBottom: '0.35rem' }}>Requested Deployment Date *</label>
            <input 
              type="date"
              value={formData.requestedDate}
              onChange={e => setFormData(prev => ({ ...prev, requestedDate: e.target.value }))}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          {/* Priority */}
          <div>
            <label className="filter-label" style={{ display: 'block', marginBottom: '0.35rem' }}>Priority Level *</label>
            <select 
              value={formData.priority}
              onChange={e => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              className="filter-select"
              style={{ width: '100%', padding: '0.55rem' }}
            >
              <option value="Immediate Emergency">Immediate Emergency</option>
              <option value="High Priority">High Priority</option>
              <option value="Medium Priority">Medium Priority</option>
              <option value="Standard Scheduled">Standard Scheduled</option>
            </select>
          </div>

        </div>

        {/* Justification Textarea */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="filter-label" style={{ display: 'block', marginBottom: '0.35rem' }}>Administrative Justification & Rationale *</label>
          <textarea 
            rows={3}
            placeholder="Explain the healthcare gap justification (e.g. Manur doctor shortage at 0.2 per 10k pop with 25.5 km referral distance)..."
            value={formData.justification}
            onChange={e => setFormData(prev => ({ ...prev, justification: e.target.value }))}
            style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
          />
        </div>

        {/* Contact Fields */}
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
          Requesting Officer Contact Details
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label className="filter-label" style={{ display: 'block', marginBottom: '0.35rem' }}>Organization *</label>
            <input 
              type="text"
              value={formData.requestingOrg}
              onChange={e => setFormData(prev => ({ ...prev, requestingOrg: e.target.value }))}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label className="filter-label" style={{ display: 'block', marginBottom: '0.35rem' }}>Contact Officer Name *</label>
            <input 
              type="text"
              placeholder="e.g. Dr. S. Ramanathan"
              value={formData.contactPerson}
              onChange={e => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label className="filter-label" style={{ display: 'block', marginBottom: '0.35rem' }}>Contact Phone *</label>
            <input 
              type="text"
              placeholder="e.g. +91 94431 00000"
              value={formData.contactPhone}
              onChange={e => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label className="filter-label" style={{ display: 'block', marginBottom: '0.35rem' }}>Officer Email *</label>
            <input 
              type="email"
              placeholder="e.g. dho.tirunelveli@tn.gov.in"
              value={formData.contactEmail}
              onChange={e => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Checkbox confirmation */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <input 
            type="checkbox"
            id="confirmCheck"
            checked={confirmed}
            onChange={e => setConfirmed(e.target.checked)}
            style={{ marginTop: '0.2rem' }}
          />
          <label htmlFor="confirmCheck" style={{ fontSize: '0.825rem', color: '#475569', cursor: 'pointer' }}>
            I confirm that this request is submitted for authorized administrative review by district health authorities.
          </label>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel} className="btn-outline">
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
            style={{ padding: '0.65rem 1.5rem' }}
          >
            {loading ? "Submitting..." : "Submit intervention request"}
          </button>
        </div>

      </form>
    </div>
  );
};
