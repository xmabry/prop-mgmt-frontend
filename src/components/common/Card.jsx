import styles from './Card.module.css';

export default function Card({ children, className = '', title, subtitle, action }) {
  return (
    <div className={[styles.card, className].filter(Boolean).join(' ')}>
      {(title || action) && (
        <div className={styles.header}>
          <div>
            {title && <h3 className={styles.title}>{title}</h3>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={styles.body}>{children}</div>
    </div>
  );
}
