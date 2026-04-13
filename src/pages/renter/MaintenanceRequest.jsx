import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMaintenanceRequests, createMaintenanceRequest } from '../../services/api';
import { buildCalendarUrl, EVENT_TYPES } from '../../services/googleCalendar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import FormField, { Input, Select, Textarea } from '../../components/common/FormField';
import styles from './MaintenanceRequest.module.css';

const CATEGORIES = ['Plumbing', 'Electrical', 'HVAC', 'Appliances', 'Structural', 'Pest Control', 'Landscaping', 'General', 'Other'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

function statusVariant(s) {
  return { open: 'warning', in_progress: 'primary', completed: 'success', cancelled: 'default' }[s] || 'default';
}
function statusLabel(s) {
  return s?.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
function priorityVariant(p) {
  return { low: 'success', medium: 'warning', high: 'danger', critical: 'danger' }[p] || 'default';
}

const emptyForm = {
  category: 'Plumbing',
  description: '',
  priority: 'medium',
  scheduledDate: '',
  scheduledTime: '',
};

export default function MaintenanceRequest() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});

  const load = () => {
    setLoading(true);
    getMaintenanceRequests({ tenantName: user.name })
      .then(setRequests)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const validate = () => {
    const e = {};
    if (!form.description.trim()) e.description = 'Description is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setSubmitting(true);
    try {
      const scheduledDate = form.scheduledDate && form.scheduledTime
        ? `${form.scheduledDate}T${form.scheduledTime}:00`
        : form.scheduledDate || '';
      const newReq = await createMaintenanceRequest({
        tenantName: user.name,
        property: '123 Main St, Apt 2B',
        category: form.category,
        description: form.description,
        priority: form.priority,
        scheduledDate,
      });
      setRequests((prev) => [newReq, ...prev]);
      setShowModal(false);
      setForm(emptyForm);
      setSuccess('Maintenance request submitted successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const getCalendarUrl = (req) => {
    if (!req.scheduledDate) return null;
    const start = new Date(req.scheduledDate);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    return buildCalendarUrl({
      type: EVENT_TYPES.MAINTENANCE,
      title: `Maintenance: ${req.category} - ${req.description.slice(0, 50)}`,
      description: req.description,
      location: req.property,
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
    });
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Maintenance Requests</h1>
          <p className={styles.subtitle}>Submit and track your maintenance requests</p>
        </div>
        <Button variant="primary" onClick={() => { setShowModal(true); setErrors({}); }}>
          + New Request
        </Button>
      </div>

      {success && <div className={styles.successAlert}>{success}</div>}

      {loading ? (
        <p className={styles.loading}>Loading requests…</p>
      ) : requests.length === 0 ? (
        <Card>
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🔧</span>
            <p>No maintenance requests yet.</p>
            <Button variant="primary" onClick={() => setShowModal(true)}>Submit a Request</Button>
          </div>
        </Card>
      ) : (
        <div className={styles.requestsList}>
          {requests.map((req) => {
            const calUrl = getCalendarUrl(req);
            return (
              <Card key={req.id} className={styles.requestCard}>
                <div className={styles.reqHeader}>
                  <div className={styles.reqMeta}>
                    <span className={styles.category}>{req.category}</span>
                    <Badge variant={priorityVariant(req.priority)}>{req.priority}</Badge>
                    <Badge variant={statusVariant(req.status)}>{statusLabel(req.status)}</Badge>
                  </div>
                  <span className={styles.date}>Submitted {req.createdAt}</span>
                </div>
                <p className={styles.description}>{req.description}</p>
                {req.scheduledDate && (
                  <p className={styles.scheduled}>
                    📅 Scheduled: {new Date(req.scheduledDate).toLocaleString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                    {calUrl && (
                      <a href={calUrl} target="_blank" rel="noopener noreferrer" className={styles.calLink}>
                        → Add to Google Calendar
                      </a>
                    )}
                  </p>
                )}
                {req.notes && <p className={styles.notes}>📝 {req.notes}</p>}
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New Maintenance Request"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" loading={submitting} onClick={handleSubmit}>Submit Request</Button>
          </>
        }
      >
        <form className={styles.form} onSubmit={handleSubmit}>
          <FormField label="Category" required>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </FormField>
          <FormField label="Priority" required>
            <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Description" required error={errors.description}>
            <Textarea
              value={form.description}
              onChange={(e) => { setForm({ ...form, description: e.target.value }); setErrors({}); }}
              placeholder="Describe the issue in detail…"
              rows={4}
            />
          </FormField>
          <FormField label="Preferred Date" hint="Optional – leave blank if flexible">
            <Input
              type="date"
              value={form.scheduledDate}
              onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </FormField>
          {form.scheduledDate && (
            <FormField label="Preferred Time">
              <Input
                type="time"
                value={form.scheduledTime}
                onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
              />
            </FormField>
          )}
        </form>
      </Modal>
    </div>
  );
}
