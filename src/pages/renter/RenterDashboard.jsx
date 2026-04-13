import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMaintenanceRequests, getPayments, getPropertyById } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import styles from './RenterDashboard.module.css';

function statusVariant(status) {
  const map = { open: 'warning', in_progress: 'primary', completed: 'success', cancelled: 'default' };
  return map[status] || 'default';
}

function statusLabel(status) {
  return status?.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || status;
}

export default function RenterDashboard() {
  const { user } = useAuth();
  const [maintenance, setMaintenance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMaintenanceRequests({ tenantName: user.name }),
      getPayments({ tenantName: user.name }),
      getPropertyById(user.propertyId),
    ])
      .then(([m, p, prop]) => {
        setMaintenance(m);
        setPayments(p);
        setProperty(prop);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const openRequests = maintenance.filter((m) => m.status === 'open').length;
  const totalPaid = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pendingPayment = payments.find((p) => p.status === 'pending');

  if (loading) return <div className={styles.loading}>Loading your dashboard…</div>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.greeting}>Welcome back, {user.name} 👋</h1>
          {property && (
            <p className={styles.propertyAddress}>
              📍 {property.address}, {property.city}, {property.state}
            </p>
          )}
        </div>
        {pendingPayment && (
          <div className={styles.paymentAlert}>
            <span>⚠️ Rent due for {pendingPayment.month}</span>
            <Link to="/renter/pay-rent" className={styles.payNowLink}>Pay Now →</Link>
          </div>
        )}
      </div>

      <div className={styles.stats}>
        <StatCard label="Monthly Rent" value={property ? `$${property.rent.toLocaleString()}` : '—'} icon="🏠" />
        <StatCard label="Open Maintenance" value={openRequests} icon="🔧" variant={openRequests > 0 ? 'warning' : 'success'} />
        <StatCard label="Total Paid (YTD)" value={`$${totalPaid.toLocaleString()}`} icon="💳" variant="success" />
        <StatCard label="Payment Status" value={pendingPayment ? 'Due' : 'Current'} icon="📋" variant={pendingPayment ? 'danger' : 'success'} />
      </div>

      <div className={styles.grid}>
        <Card
          title="Recent Maintenance Requests"
          action={<Link to="/renter/maintenance" className={styles.viewAll}>View all →</Link>}
        >
          {maintenance.length === 0 ? (
            <p className={styles.empty}>No maintenance requests yet.</p>
          ) : (
            <div className={styles.list}>
              {maintenance.slice(0, 4).map((req) => (
                <div key={req.id} className={styles.listItem}>
                  <div>
                    <p className={styles.itemTitle}>{req.category}: {req.description.slice(0, 50)}{req.description.length > 50 ? '…' : ''}</p>
                    <p className={styles.itemSub}>Submitted {req.createdAt}</p>
                  </div>
                  <Badge variant={statusVariant(req.status)}>{statusLabel(req.status)}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card
          title="Payment History"
          action={<Link to="/renter/receipts" className={styles.viewAll}>View receipts →</Link>}
        >
          {payments.length === 0 ? (
            <p className={styles.empty}>No payment history.</p>
          ) : (
            <div className={styles.list}>
              {payments.slice(0, 4).map((pmt) => (
                <div key={pmt.id} className={styles.listItem}>
                  <div>
                    <p className={styles.itemTitle}>{pmt.month}</p>
                    <p className={styles.itemSub}>{pmt.paidOn ? `Paid on ${pmt.paidOn}` : 'Pending'}</p>
                  </div>
                  <div className={styles.itemRight}>
                    <span className={styles.amount}>${pmt.amount.toLocaleString()}</span>
                    <Badge variant={pmt.status === 'paid' ? 'success' : 'warning'}>
                      {pmt.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
