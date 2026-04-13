import { useEffect, useState } from 'react';
import { getPayments } from '../../services/api';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';
import styles from './AdminPayments.module.css';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getPayments().then(setPayments).finally(() => setLoading(false));
  }, []);

  const paid = payments.filter((p) => p.status === 'paid');
  const pending = payments.filter((p) => p.status === 'pending');
  const totalRevenue = paid.reduce((s, p) => s + p.amount, 0);
  const filtered = filter === 'all' ? payments : payments.filter((p) => p.status === filter);

  if (loading) return <p className={styles.loading}>Loading payments…</p>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Rent Payments</h1>
          <p className={styles.subtitle}>Track all rent payments across all properties</p>
        </div>
      </div>

      <div className={styles.stats}>
        <StatCard label="Total Revenue (YTD)" value={`$${totalRevenue.toLocaleString()}`} icon="💰" variant="success" />
        <StatCard label="Payments Received" value={paid.length} icon="✅" variant="success" />
        <StatCard label="Pending Payments" value={pending.length} icon="⏳" variant={pending.length > 0 ? 'danger' : 'success'} />
        <StatCard label="Total Payments" value={payments.length} icon="📋" />
      </div>

      <Card
        title="Payment Records"
        action={
          <div className={styles.filterGroup}>
            {['all', 'paid', 'pending'].map((f) => (
              <button
                key={f}
                className={[styles.filterBtn, filter === f ? styles.active : ''].join(' ')}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        }
      >
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Property</th>
                <th>Period</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date Paid</th>
                <th>Receipt ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className={styles.tenantName}>{p.tenantName}</td>
                  <td className={styles.propCell}>{p.property}</td>
                  <td>{p.month}</td>
                  <td className={styles.amountCell}>${p.amount.toLocaleString()}</td>
                  <td>{p.method || '—'}</td>
                  <td>{p.paidOn || '—'}</td>
                  <td className={styles.receiptId}>{p.receiptId || '—'}</td>
                  <td><Badge variant={p.status === 'paid' ? 'success' : 'warning'}>{p.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
