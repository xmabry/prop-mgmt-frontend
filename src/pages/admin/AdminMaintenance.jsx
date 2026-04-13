import { useEffect, useState } from 'react';
import { getMaintenanceRequests, updateMaintenanceRequest } from '../../services/api';
import { buildCalendarUrl, EVENT_TYPES } from '../../services/googleCalendar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import FormField, { Select, Input, Textarea } from '../../components/common/FormField';
import styles from './AdminMaintenance.module.css';

const STATUS_OPTIONS = ['open', 'in_progress', 'completed', 'cancelled'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical'];

function statusVariant(s) {
  return { open: 'warning', in_progress: 'primary', completed: 'success', cancelled: 'default' }[s] || 'default';
}
function priorityVariant(p) {
  return { low: 'success', medium: 'warning', high: 'danger', critical: 'danger' }[p] || 'default';
}
function statusLabel(s) {
  return s?.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminMaintenance() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getMaintenanceRequests()
      .then(setRequests)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  const openEdit = (req) => {
    setSelected(req);
    setEditForm({
      status: req.status,
      priority: req.priority,
      notes: req.notes || '',
      scheduledDate: req.scheduledDate ? req.scheduledDate.split('T')[0] : '',
      scheduledTime: req.scheduledDate?.includes('T') ? req.scheduledDate.split('T')[1]?.slice(0, 5) : '',
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const scheduledDate = editForm.scheduledDate && editForm.scheduledTime
        ? `${editForm.scheduledDate}T${editForm.scheduledTime}:00`
        : editForm.scheduledDate || '';
      const updated = await updateMaintenanceRequest(selected.id, {
        status: editForm.status,
        priority: editForm.priority,
        notes: editForm.notes,
        scheduledDate,
      });
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setSelected(null);
    } finally {
      setSaving(false);
    }
  };

  const getCalendarUrl = (req) => {
    if (!req.scheduledDate) return null;
    const start = new Date(req.scheduledDate);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    return buildCalendarUrl({
      type: EVENT_TYPES.MAINTENANCE,
      title: `Maintenance: ${req.category} @ ${req.property}`,
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
          <p className={styles.subtitle}>Manage all maintenance requests across properties</p>
        </div>
      </div>

      <div className={styles.filters}>
        {['all', ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            className={[styles.filterBtn, filter === s ? styles.activeFilter : ''].join(' ')}
            onClick={() => setFilter(s)}
          >
            {statusLabel(s === 'all' ? 'all' : s) || 'All'}
            <span className={styles.filterCount}>
              {s === 'all' ? requests.length : requests.filter((r) => r.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className={styles.loading}>Loading…</p>
      ) : filtered.length === 0 ? (
        <Card><p className={styles.empty}>No maintenance requests found.</p></Card>
      ) : (
        <div className={styles.table}>
          <table>
            <thead>
              <tr>
                <th>Tenant / Property</th>
                <th>Category</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Scheduled</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => {
                const calUrl = getCalendarUrl(req);
                return (
                  <tr key={req.id}>
                    <td>
                      <p className={styles.tenantName}>{req.tenantName}</p>
                      <p className={styles.propAddress}>{req.property}</p>
                    </td>
                    <td>{req.category}</td>
                    <td className={styles.descCell}>{req.description}</td>
                    <td><Badge variant={priorityVariant(req.priority)}>{req.priority}</Badge></td>
                    <td><Badge variant={statusVariant(req.status)}>{statusLabel(req.status)}</Badge></td>
                    <td>
                      {req.scheduledDate ? (
                        <div>
                          <p className={styles.schedDate}>
                            {new Date(req.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                          {calUrl && (
                            <a href={calUrl} target="_blank" rel="noopener noreferrer" className={styles.calLink}>
                              📅 Add
                            </a>
                          )}
                        </div>
                      ) : '—'}
                    </td>
                    <td>
                      <Button variant="outline" size="sm" onClick={() => openEdit(req)}>Edit</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={`Edit Request #${selected?.id}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSelected(null)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>Save Changes</Button>
          </>
        }
      >
        {selected && (
          <div className={styles.editForm}>
            <div className={styles.editInfo}>
              <p><strong>{selected.tenantName}</strong> · {selected.property}</p>
              <p className={styles.editDesc}>{selected.description}</p>
            </div>
            <FormField label="Status">
              <Select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
              </Select>
            </FormField>
            <FormField label="Priority">
              <Select value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}>
                {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </Select>
            </FormField>
            <FormField label="Scheduled Date">
              <Input type="date" value={editForm.scheduledDate} onChange={(e) => setEditForm({ ...editForm, scheduledDate: e.target.value })} />
            </FormField>
            {editForm.scheduledDate && (
              <FormField label="Scheduled Time">
                <Input type="time" value={editForm.scheduledTime} onChange={(e) => setEditForm({ ...editForm, scheduledTime: e.target.value })} />
              </FormField>
            )}
            <FormField label="Internal Notes">
              <Textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} placeholder="Add notes for the maintenance team…" rows={3} />
            </FormField>
          </div>
        )}
      </Modal>
    </div>
  );
}
