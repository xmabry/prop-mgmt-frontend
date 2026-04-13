import styles from './StatCard.module.css';

export default function StatCard({ label, value, icon, variant = 'default', sub }) {
  return (
    <div className={[styles.card, styles[variant]].join(' ')}>
      <div className={styles.top}>
        <span className={styles.icon}>{icon}</span>
        <div>
          <p className={styles.label}>{label}</p>
          <p className={styles.value}>{value}</p>
          {sub && <p className={styles.sub}>{sub}</p>}
        </div>
      </div>
    </div>
  );
}
