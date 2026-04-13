import { useState } from 'react';
import { buildCalendarUrl, EVENT_TYPES } from '../../services/googleCalendar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormField, { Input, Select, Textarea } from '../../components/common/FormField';
import styles from './CalendarIntegration.module.css';

const EVENT_TYPE_OPTIONS = [
  { value: EVENT_TYPES.MAINTENANCE, label: '🔧 Maintenance Request', color: '#f97316' },
  { value: EVENT_TYPES.REALTOR_MEETING, label: '🤝 Realtor Meeting', color: '#16a34a' },
  { value: EVENT_TYPES.OWNER_MEETING, label: '👔 Property Owner Meeting', color: '#2563eb' },
];

const emptyForm = {
  type: EVENT_TYPES.MAINTENANCE,
  title: '',
  description: '',
  location: '',
  startDate: '',
  startTime: '09:00',
  durationHours: '1',
  attendees: '',
};

export default function CalendarIntegration() {
  const [form, setForm] = useState(emptyForm);
  const [calUrl, setCalUrl] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.startDate) e.startDate = 'Date is required';
    return e;
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    const start = new Date(`${form.startDate}T${form.startTime}:00`);
    const end = new Date(start.getTime() + Number(form.durationHours) * 60 * 60 * 1000);

    const url = buildCalendarUrl({
      type: form.type,
      title: form.title,
      description: form.description,
      location: form.location,
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
    });
    setCalUrl(url);
  };

  const handleReset = () => {
    setForm(emptyForm);
    setCalUrl('');
    setErrors({});
  };

  const selectedType = EVENT_TYPE_OPTIONS.find((t) => t.value === form.type);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Google Calendar Integration</h1>
          <p className={styles.subtitle}>Create Google Calendar events for maintenance, realtor meetings, and owner meetings</p>
        </div>
      </div>

      <div className={styles.grid}>
        <Card title="Create Calendar Event">
          <form className={styles.form} onSubmit={handleGenerate}>
            <FormField label="Event Type" required>
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, title: '' })}>
                {EVENT_TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </FormField>

            <FormField label="Event Title" required error={errors.title}>
              <Input
                value={form.title}
                onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors({}); }}
                placeholder={selectedType ? `e.g., ${selectedType.label.split(' ').slice(1).join(' ')} - 123 Main St` : ''}
              />
            </FormField>

            <FormField label="Description">
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Event details, notes, or instructions…"
                rows={3}
              />
            </FormField>

            <FormField label="Location / Property Address">
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="123 Main St, Springfield, IL 62701"
              />
            </FormField>

            <div className={styles.dateRow}>
              <FormField label="Date" required error={errors.startDate}>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => { setForm({ ...form, startDate: e.target.value }); setErrors({}); }}
                  min={new Date().toISOString().split('T')[0]}
                />
              </FormField>
              <FormField label="Start Time">
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </FormField>
              <FormField label="Duration (hours)">
                <Select value={form.durationHours} onChange={(e) => setForm({ ...form, durationHours: e.target.value })}>
                  {['0.5', '1', '1.5', '2', '3', '4'].map((h) => (
                    <option key={h} value={h}>{h === '0.5' ? '30 min' : `${h} hr${h !== '1' ? 's' : ''}`}</option>
                  ))}
                </Select>
              </FormField>
            </div>

            <div className={styles.actions}>
              <Button variant="secondary" onClick={handleReset} type="button">Reset</Button>
              <Button variant="primary" type="submit">Generate Calendar Link</Button>
            </div>
          </form>
        </Card>

        <div className={styles.rightPanel}>
          <Card title="How It Works">
            <div className={styles.instructions}>
              <div className={styles.step}>
                <div className={styles.stepNum}>1</div>
                <p>Fill in the event details in the form.</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNum}>2</div>
                <p>Click <strong>Generate Calendar Link</strong> to create a Google Calendar URL.</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNum}>3</div>
                <p>Click <strong>Open in Google Calendar</strong> to add the event to your calendar.</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNum}>4</div>
                <p>Google Calendar will open in a new tab pre-filled with the event details.</p>
              </div>
            </div>
            <div className={styles.eventTypes}>
              <p className={styles.typesTitle}>Supported Event Types:</p>
              {EVENT_TYPE_OPTIONS.map((t) => (
                <div key={t.value} className={styles.typeItem} style={{ borderLeftColor: t.color }}>
                  {t.label}
                </div>
              ))}
            </div>
          </Card>

          {calUrl && (
            <Card title="✅ Calendar Event Ready" className={styles.resultCard}>
              <p className={styles.resultDesc}>Your event has been prepared. Click below to add it to Google Calendar.</p>
              <a
                href={calUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.calButton}
              >
                📅 Open in Google Calendar
              </a>
              <div className={styles.urlBox}>
                <p className={styles.urlLabel}>Direct link:</p>
                <input className={styles.urlInput} value={calUrl} readOnly onClick={(e) => e.target.select()} />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
