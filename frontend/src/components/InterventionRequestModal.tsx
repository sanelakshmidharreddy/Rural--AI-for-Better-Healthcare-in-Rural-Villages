import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ZoneSummary, InterventionRequest } from '../services/api';
import { X, Send, AlertTriangle, RefreshCw } from 'lucide-react';

interface InterventionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  zones: ZoneSummary[];
  preselectedZoneId?: string | null;
  preselectedResourceType?: string;
  preselectedInterventionType?: string;
  onRequestSubmitted: (request: InterventionRequest) => void;
}

export const InterventionRequestModal: React.FC<InterventionRequestModalProps> = ({
  isOpen,
  onClose,
  zones,
  preselectedZoneId,
  preselectedResourceType,
  preselectedInterventionType,
  onRequestSubmitted
}) => {
  const [zoneId, setZoneId] = useState<string>('');
  const [interventionType, setInterventionType] = useState<string>('Mobile Medical Unit & Outreach');
  const [resourceType, setResourceType] = useState<string>('Mobile Medical Unit');
  const [quantity, setQuantity] = useState<number>(1);
  const [requestedDate, setRequestedDate] = useState<string>('');
  const [priority, setPriority] = useState<string>('High');
  const [justification, setJustification] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [requestingOrganization, setRequestingOrganization] = useState<string>('Tirunelveli District Public Health Society');
  const [contactPerson, setContactPerson] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [confirmed, setConfirmed] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Pre-fill fields
      const targetZoneId = preselectedZoneId || (zones.length > 0 ? zones[0].id : '');
      setZoneId(targetZoneId);

      if (preselectedResourceType) {
        setResourceType(preselectedResourceType);
      }
      if (preselectedInterventionType) {
        setInterventionType(preselectedInterventionType);
      } else {
        const found = zones.find(z => z.id === targetZoneId);
        if (found) {
          setInterventionType(found.recommendedIntervention);
          setJustification(`Address critical gap in ${found.name} (${found.mainGap}) to improve catchment healthcare delivery.`);
        }
      }

      // Default date to next week (YYYY-MM-DD)
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setRequestedDate(d.toISOString().split('T')[0]);
      setErrorMessage(null);
    }
  }, [isOpen, preselectedZoneId, preselectedResourceType, preselectedInterventionType, zones]);

  const selectedZone = zones.find(z => z.id === zoneId);

  const handleZoneChange = (newZoneId: string) => {
    setZoneId(newZoneId);
    const found = zones.find(z => z.id === newZoneId);
    if (found) {
      setInterventionType(found.recommendedIntervention);
      setJustification(`Address critical gap in ${found.name} (${found.mainGap}) to improve catchment healthcare delivery.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Form validation
    if (!zoneId) {
      setErrorMessage('Please select a target rural health zone.');
      return;
    }
    if (quantity <= 0 || isNaN(quantity)) {
      setErrorMessage('Quantity must be greater than zero.');
      return;
    }
    if (!requestedDate) {
      setErrorMessage('Please provide a valid requested deployment date.');
      return;
    }
    if (!justification.trim()) {
      setErrorMessage('Justification is required and cannot be empty.');
      return;
    }
    if (!requestingOrganization.trim()) {
      setErrorMessage('Requesting organization name is required.');
      return;
    }
    if (!contactPerson.trim()) {
      setErrorMessage('Contact person name is required.');
      return;
    }
    if (!confirmed) {
      setErrorMessage('Please confirm that this request is submitted for authorized administrative review.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createInterventionRequest({
        zoneId,
        zoneName: selectedZone?.name || 'Catchment Zone',
        block: selectedZone?.block || 'Rural Block',
        district: 'Tirunelveli',
        interventionType,
        resourceType,
        quantity: Number(quantity),
        requestedDate,
        priority,
        justification: justification.trim(),
        notes: notes.trim() || undefined,
        requestingOrganization: requestingOrganization.trim(),
        contactPerson: contactPerson.trim(),
        contactPhone: contactPhone.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        confirmed: true
      });

      onRequestSubmitted(res.data.request);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit intervention request. Please check required fields.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" id="intervention-request-modal">
      <div className="modal-container" style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Send size={20} color="#0d9488" /> Submit Intervention Request
            </h3>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
              Record a public health resource request for authorized district health officer review.
            </div>
          </div>
          <button onClick={onClose} className="btn-close" id="btn-close-request-modal">
            <X size={20} />
          </button>
        </div>

        {/* Governance Disclaimer */}
        <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '0.75rem 1rem', margin: '1rem 1.5rem 0', fontSize: '0.8rem', color: '#92400e', display: 'flex', gap: '0.5rem' }}>
          <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Notice:</strong> This prototype records an intervention request for authorized review. It does not automatically dispatch real-world government resources.
          </div>
        </div>

        {errorMessage && (
          <div style={{ margin: '1rem 1.5rem 0', padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.85rem' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            {/* Zone selection */}
            <div>
              <label className="form-label">Target Rural Health Zone *</label>
              <select 
                id="select-request-zone"
                value={zoneId} 
                onChange={(e) => handleZoneChange(e.target.value)}
                className="form-input"
                required
              >
                {zones.map(z => (
                  <option key={z.id} value={z.id}>
                    {z.name} ({z.block} Block - {z.riskCategory} Risk)
                  </option>
                ))}
              </select>
            </div>

            {/* Block (read only based on zone) */}
            <div>
              <label className="form-label">Block & District</label>
              <input 
                type="text" 
                value={`${selectedZone?.block || ''} Block, Tirunelveli`} 
                disabled 
                className="form-input"
                style={{ background: '#f1f5f9', color: '#475569' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: '1rem', marginBottom: '1rem' }}>
            {/* Intervention Type */}
            <div>
              <label className="form-label">Intervention Package *</label>
              <select 
                id="select-intervention-type"
                value={interventionType} 
                onChange={(e) => setInterventionType(e.target.value)}
                className="form-input"
                required
              >
                <option value="Mobile Medical Unit & Remote Immunization Outreach">Mobile Medical Unit & Outreach</option>
                <option value="Specialized ANC & Child Immunization Outreach Camps">ANC & Child Immunization Camps</option>
                <option value="Temporary Staff Deployment & Telemedicine Specialist Support">Temporary Clinician / ANM Staff</option>
                <option value="Emergency Drug & Essential Equipment Redistribution">Emergency Pharmacy Redistribution</option>
                <option value="Community Health Literacy & Preventive Awareness Outreach">Preventive Screening Campaign</option>
              </select>
            </div>

            {/* Resource Type */}
            <div>
              <label className="form-label">Resource Type *</label>
              <select 
                id="select-resource-type"
                value={resourceType} 
                onChange={(e) => setResourceType(e.target.value)}
                className="form-input"
                required
              >
                <option value="Mobile Medical Unit">Mobile Medical Unit</option>
                <option value="Maternal & Immunization Outreach Team">Outreach Medical Team</option>
                <option value="Essential Medicine Redistribution Kit">Essential Medicine Kit</option>
                <option value="Telemedicine Consultation Terminal">Telemedicine Node</option>
                <option value="Temporary Doctor / ANM Staff Support">Temporary Staff Shift</option>
                <option value="108 Referral Ambulance Unit">Referral Ambulance</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="form-label">Quantity *</label>
              <input 
                id="input-request-quantity"
                type="number" 
                min="1" 
                max="50"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            {/* Requested Date */}
            <div>
              <label className="form-label">Requested Deployment Date *</label>
              <input 
                id="input-request-date"
                type="date" 
                value={requestedDate}
                onChange={(e) => setRequestedDate(e.target.value)}
                className="form-input"
                required
              />
            </div>

            {/* Priority */}
            <div>
              <label className="form-label">Urgency & Priority *</label>
              <select 
                id="select-request-priority"
                value={priority} 
                onChange={(e) => setPriority(e.target.value)}
                className="form-input"
                required
              >
                <option value="Immediate">Immediate Priority (Emergency)</option>
                <option value="High">High Priority</option>
                <option value="Moderate">Moderate Priority</option>
                <option value="Low">Low / Scheduled Routine</option>
              </select>
            </div>
          </div>

          {/* Justification */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Administrative Justification *</label>
            <textarea 
              id="textarea-request-justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={2}
              placeholder="Detail reasons for resource request, target villages, and expected outcome..."
              className="form-input"
              required
            />
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Logistical Notes / Village Coordination (Optional)</label>
            <input 
              id="input-request-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Village Panchayat meeting hall identified for clinic..."
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            {/* Requesting Organization */}
            <div>
              <label className="form-label">Requesting Organization *</label>
              <input 
                id="input-requesting-org"
                type="text" 
                value={requestingOrganization}
                onChange={(e) => setRequestingOrganization(e.target.value)}
                className="form-input"
                required
              />
            </div>

            {/* Contact Person */}
            <div>
              <label className="form-label">Responsible Contact Person *</label>
              <input 
                id="input-contact-person"
                type="text" 
                placeholder="Dr. S. Ramanathan / Block Health Officer"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Contact Phone</label>
              <input 
                type="text" 
                placeholder="+91 94430 XXXXX"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Contact Email</label>
              <input 
                type="email" 
                placeholder="officer@tnhealth.gov.in"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
            <input 
              id="checkbox-request-confirm"
              type="checkbox" 
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              style={{ marginTop: '3px', cursor: 'pointer' }}
            />
            <label htmlFor="checkbox-request-confirm" style={{ fontSize: '0.825rem', color: '#334155', cursor: 'pointer' }}>
              I confirm that this intervention request is submitted for authorized administrative review by the Tirunelveli District Health Society.
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-outline"
            >
              Cancel
            </button>
            <button 
              id="btn-submit-intervention-request"
              type="submit" 
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <><RefreshCw size={16} className="animate-spin" /> Submitting...</>
              ) : (
                <><Send size={16} /> Submit intervention request</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
