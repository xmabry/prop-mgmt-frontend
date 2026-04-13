import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMaintenanceRequests, getPayments, getProperties } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import styles from './AdminDashboard.module.css';

function statusVariant(s) {
  return { open: 'warning', in_progress: 'primary', completed: 'success' }[s] || 'default';
}
function statusLabel(s) {
  return s?.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminDashboard() {
  const [data, setData] = useState({ maintenance: [], payments: [], properties: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMaintenanceRequests(),
      getPayments(),
      getProperties(),
    ]).then(([maintenance, payments, properties]) => {
      setData({ maintenance, payments, properties });
    }).finally(() => setLoading(false));
  }, []);

  const { maintenance, payments, properties } = data;
  const openMaint = maintenance.filter((m) => m.status === 'open').length;
  const inProgressMaint = maintenance.filter((m) => m.status === 'in_progress').length;
  const totalRevenue = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pendingPayments = payments.filter((p) => p.status === 'pending').length;
  const occupiedProps = properties.filter((p) => p.status === 'occupied').length;

  if (loading) return <div className={styles.loading}>Loading dashboard…</div>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.subtitle}>Overview of your properties and tenants</p>
        </div>
      </div>

      <div className={styles.stats}>
        <StatCard label="Total Properties" value={properties.length} icon="🏘️" sub={`${occupiedProps} occupied`} />
        <StatCard label="Open Maintenance" value={openMaint + inProgressMaint} icon="🔧" variant="warning" sub={`${openMaint} open, ${inProgressMaint} in progress`} />
        <StatCard label="Total Revenue (YTD)" value={`$${totalRevenue.toLocaleString()}`} icon="💰" variant="success" />
        <StatCard label="Pending Payments" value={pendingPayments} icon="⚠️" variant={pendingPayments > 0 ? 'danger' : 'success'} />
      </div>

      <div className={styles.grid}>
        <Card
          title="Recent Maintenance"
          action={<Link to="/admin/maintenance" className={styles.viewAll}>View all →</Link>}
        >
          {maintenance.slice(0, 5).map((req) => (
            <div key={req.id} className={styles.listItem}>
              <div>
                <p className={styles.itemTitle}>{req.property}</p>
                <p className={styles.itemSub}>{req.category}: {req.description.slice(0, 50)}</p>
              </div>
              <div className={styles.itemBadges}>
                <Badge variant={statusVariant(req.status)}>{statusLabel(req.status)}</Badge>
              </div>
            </div>
          ))}
        </Card>

        <Card
          title="Properties Overview"
          action={<Link to="/admin/properties" className={styles.viewAll}>View all →</Link>}
        >
          {properties.map((prop) => (
            <div key={prop.id} className={styles.listItem}>
              <div>
                <p className={styles.itemTitle}>{prop.address}</p>
                <p className={styles.itemSub}>{prop.tenant || 'Vacant'} · ${prop.rent.toLocaleString()}/mo</p>
              </div>
              <Badge variant={prop.status === 'occupied' ? 'success' : 'warning'}>{prop.status}</Badge>
            </div>
          ))}
        </Card>

        <Card
          title="Recent Payments"
          action={<Link to="/admin/payments" className={styles.viewAll}>View all →</Link>}
        >
          {payments.slice(0, 5).map((pmt) => (
            <div key={pmt.id} className={styles.listItem}>
              <div>
                <p className={styles.itemTitle}>{pmt.tenantName}</p>
                <p className={styles.itemSub}>{pmt.month} · {pmt.property?.split(',')[0]}</p>
              </div>
              <div className={styles.itemRight}>
                <span className={styles.amount}>${pmt.amount.toLocaleString()}</span>
                <Badge variant={pmt.status === 'paid' ? 'success' : 'warning'}>{pmt.status}</Badge>
              </div>
            </div>
          ))}
        </Card>

        <Card title="Quick Links">
          <div className={styles.quickLinks}>
            <Link to="/admin/calendar" className={styles.quickLink}>
              <span>📅</span><span>Google Calendar</span>
            </Link>
            <Link to="/admin/github-projects" className={styles.quickLink}>
              <span>🐙</span><span>GitHub Projects</span>
            </Link>
            <Link to="/admin/tax-forms" className={styles.quickLink}>
              <span>📄</span><span>Tax Forms</span>
            </Link>
            <Link to="/admin/maintenance" className={styles.quickLink}>
              <span>🔧</span><span>Maintenance</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
