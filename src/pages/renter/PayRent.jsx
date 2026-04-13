import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPayments, submitPayment, getPropertyById } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import FormField, { Select, Input } from '../../components/common/FormField';
import styles from './PayRent.module.css';

const PAYMENT_METHODS = ['Bank Transfer', 'Credit Card', 'Debit Card', 'ACH', 'Check'];
const CURRENT_MONTH = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

export default function PayRent() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ method: 'Bank Transfer', cardNumber: '', expiry: '', cvv: '', accountNumber: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const load = () => {
    Promise.all([
      getPayments({ tenantName: user.name }),
      getPropertyById(user.propertyId),
    ]).then(([pmts, prop]) => {
      setPayments(pmts);
      setProperty(prop);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pendingPayment = payments.find((p) => p.status === 'pending');

  const handlePay = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await submitPayment({
        tenantName: user.name,
        property: property?.address || '123 Main St, Apt 2B',
        amount: property?.rent || 0,
        month: CURRENT_MONTH,
        method: form.method,
      });
      setPayments((prev) =>
        prev.map((p) => (p.status === 'pending' ? { ...p, status: 'paid', paidOn: result.paidOn, receiptId: result.receiptId } : p))
      );
      setShowModal(false);
      setSuccess(result);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className={styles.loading}>Loading…</p>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Pay Rent</h1>
          <p className={styles.subtitle}>Manage your rent payments</p>
        </div>
      </div>

      {success && (
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✅</div>
          <div>
            <p className={styles.successTitle}>Payment Submitted!</p>
            <p className={styles.successSub}>Receipt: <strong>{success.receiptId}</strong> — Amount: <strong>${success.amount?.toLocaleString()}</strong></p>
          </div>
          <Button variant="ghost" onClick={() => setSuccess(null)}>✕</Button>
        </div>
      )}

      <div className={styles.grid}>
        <Card title="Current Balance">
          <div className={styles.balanceBox}>
            <p className={styles.balanceLabel}>
              {pendingPayment ? `${pendingPayment.month} — Due` : 'All Payments Current'}
            </p>
            <p className={styles.balanceAmount}>${property?.rent?.toLocaleString() || '—'}</p>
            {pendingPayment ? (
              <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>
                💳 Pay Now
              </Button>
            ) : (
              <Badge variant="success">✓ Paid</Badge>
            )}
          </div>
        </Card>

        <Card title="Property Details">
          {property ? (
            <div className={styles.propDetails}>
              <div className={styles.propRow}><span>Address</span><span>{property.address}</span></div>
              <div className={styles.propRow}><span>City</span><span>{property.city}, {property.state} {property.zip}</span></div>
              <div className={styles.propRow}><span>Type</span><span>{property.type}</span></div>
              <div className={styles.propRow}><span>Beds / Baths</span><span>{property.bedrooms}bd / {property.bathrooms}ba</span></div>
              <div className={styles.propRow}><span>Monthly Rent</span><strong>${property.rent.toLocaleString()}</strong></div>
            </div>
          ) : <p>No property info.</p>}
        </Card>
      </div>

      <Card title="Payment History" className={styles.historyCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Period</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Date Paid</th>
              <th>Receipt</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>{p.month}</td>
                <td>${p.amount.toLocaleString()}</td>
                <td>{p.method || '—'}</td>
                <td>{p.paidOn || '—'}</td>
                <td>{p.receiptId || '—'}</td>
                <td><Badge variant={p.status === 'paid' ? 'success' : 'warning'}>{p.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Submit Rent Payment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="success" loading={submitting} onClick={handlePay}>
              Confirm Payment ${property?.rent?.toLocaleString()}
            </Button>
          </>
        }
      >
        <div className={styles.paymentSummary}>
          <div className={styles.payRow}><span>Tenant</span><span>{user.name}</span></div>
          <div className={styles.payRow}><span>Property</span><span>{property?.address}</span></div>
          <div className={styles.payRow}><span>Period</span><span>{CURRENT_MONTH}</span></div>
          <div className={[styles.payRow, styles.totalRow].join(' ')}>
            <span>Amount Due</span>
            <strong>${property?.rent?.toLocaleString()}</strong>
          </div>
        </div>

        <form className={styles.payForm} onSubmit={handlePay}>
          <FormField label="Payment Method" required>
            <Select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
              {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
            </Select>
          </FormField>

          {(form.method === 'Credit Card' || form.method === 'Debit Card') && (
            <>
              <FormField label="Card Number" required>
                <Input
                  placeholder="•••• •••• •••• ••••"
                  value={form.cardNumber}
                  onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
                  maxLength={19}
                />
              </FormField>
              <div className={styles.cardRow}>
                <FormField label="Expiry">
                  <Input placeholder="MM/YY" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} maxLength={5} />
                </FormField>
                <FormField label="CVV">
                  <Input placeholder="•••" value={form.cvv} onChange={(e) => setForm({ ...form, cvv: e.target.value })} maxLength={4} />
                </FormField>
              </div>
            </>
          )}

          {(form.method === 'Bank Transfer' || form.method === 'ACH') && (
            <FormField label="Account / Routing Number" hint="Demo – not stored or transmitted">
              <Input
                placeholder="Account number"
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
              />
            </FormField>
          )}
        </form>
      </Modal>
    </div>
  );
}
