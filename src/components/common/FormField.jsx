import styles from './FormField.module.css';

export default function FormField({ label, error, required, children, hint }) {
  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

export function Input({ className = '', ...props }) {
  return <input className={[styles.input, className].filter(Boolean).join(' ')} {...props} />;
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={[styles.input, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={[styles.input, styles.textarea, className].filter(Boolean).join(' ')} {...props} />;
}
