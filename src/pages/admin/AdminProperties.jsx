import { useEffect, useState } from 'react';
import { getProperties } from '../../services/api';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';
import styles from './AdminProperties.module.css';

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getProperties().then(setProperties).finally(() => setLoading(false));
  }, []);

  const occupied = properties.filter((p) => p.status === 'occupied');
  const vacant = properties.filter((p) => p.status === 'vacant');
  const totalRevenue = occupied.reduce((s, p) => s + p.rent, 0);
  const filtered = filter === 'all' ? properties : properties.filter((p) => p.status === filter);

  if (loading) return <p className={styles.loading}>Loading properties…</p>;

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Properties</h1>
          <p className={styles.subtitle}>Manage your property portfolio</p>
        </div>
      </div>

      <div className={styles.stats}>
        <StatCard label="Total Properties" value={properties.length} icon="🏘️" />
        <StatCard label="Occupied" value={occupied.length} icon="✅" variant="success" />
        <StatCard label="Vacant" value={vacant.length} icon="🔑" variant={vacant.length > 0 ? 'warning' : 'success'} />
        <StatCard label="Monthly Revenue" value={`$${totalRevenue.toLocaleString()}`} icon="💰" variant="success" />
      </div>

      <div className={styles.filters}>
        {['all', 'occupied', 'vacant'].map((f) => (
          <button
            key={f}
            className={[styles.filterBtn, filter === f ? styles.active : ''].join(' ')}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {filtered.map((prop) => (
          <Card key={prop.id} className={styles.propCard}>
            <div className={styles.propHeader}>
              <div className={styles.propIcon}>{prop.type === 'Commercial' ? '🏢' : prop.type === 'Single Family' ? '🏠' : '🏗️'}</div>
              <Badge variant={prop.status === 'occupied' ? 'success' : 'warning'}>{prop.status}</Badge>
            </div>
            <h3 className={styles.propAddress}>{prop.address}</h3>
            <p className={styles.propCity}>{prop.city}, {prop.state} {prop.zip}</p>
            <div className={styles.propDetails}>
              <div className={styles.propRow}><span>Type</span><span>{prop.type}</span></div>
              {prop.bedrooms > 0 && <div className={styles.propRow}><span>Beds / Baths</span><span>{prop.bedrooms}bd / {prop.bathrooms}ba</span></div>}
              <div className={styles.propRow}><span>Monthly Rent</span><strong>${prop.rent.toLocaleString()}</strong></div>
              <div className={styles.propRow}><span>Owner</span><span>{prop.ownerName}</span></div>
              {prop.tenant && <div className={styles.propRow}><span>Tenant</span><span>{prop.tenant}</span></div>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
