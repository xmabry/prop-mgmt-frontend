import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

const RENTER_NAV = [
  { label: 'Dashboard', path: '/renter', icon: '🏠', end: true },
  { label: 'Maintenance', path: '/renter/maintenance', icon: '🔧' },
  { label: 'Pay Rent', path: '/renter/pay-rent', icon: '💳' },
  { label: 'Receipts', path: '/renter/receipts', icon: '🧾' },
];

const ADMIN_NAV = [
  { label: 'Dashboard', path: '/admin', icon: '📊', end: true },
  { label: 'Properties', path: '/admin/properties', icon: '🏘️' },
  { label: 'Maintenance', path: '/admin/maintenance', icon: '🔧' },
  { label: 'Rent Payments', path: '/admin/payments', icon: '💰' },
  { label: 'Tax Forms', path: '/admin/tax-forms', icon: '📄' },
  { label: 'Calendar', path: '/admin/calendar', icon: '📅' },
  { label: 'GitHub Projects', path: '/admin/github-projects', icon: '🐙' },
];

export default function Sidebar({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = role === 'admin' ? ADMIN_NAV : RENTER_NAV;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={[styles.sidebar, collapsed ? styles.collapsed : ''].join(' ')}>
      <div className={styles.header}>
        <div className={styles.logo}>
          {!collapsed && (
            <>
              <span className={styles.logoIcon}>🏢</span>
              <span className={styles.logoText}>PropMgmt</span>
            </>
          )}
          {collapsed && <span className={styles.logoIcon}>🏢</span>}
        </div>
        <button className={styles.toggleBtn} onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <div className={styles.roleTag}>
        {!collapsed && (
          <span className={[styles.roleBadge, role === 'admin' ? styles.adminBadge : styles.renterBadge].join(' ')}>
            {role === 'admin' ? '⚙️ Admin' : '🏠 Renter'}
          </span>
        )}
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              [styles.navItem, isActive ? styles.active : ''].join(' ')
            }
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        {!collapsed && (
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{user?.name?.[0] || '?'}</div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{user?.name}</p>
              <p className={styles.userEmail}>{user?.email}</p>
            </div>
          </div>
        )}
        <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
          <span>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
