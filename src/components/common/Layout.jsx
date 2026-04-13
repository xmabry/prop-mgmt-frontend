import Sidebar from './Sidebar';
import styles from './Layout.module.css';

export default function Layout({ role, children }) {
  return (
    <div className={styles.layout}>
      <Sidebar role={role} />
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
