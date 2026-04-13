import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as apiLogin } from '../services/api';
import Button from '../components/common/Button';
import FormField, { Input } from '../components/common/FormField';
import styles from './Login.module.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await apiLogin(form.email, form.password);
      login(user);
      navigate(user.role === 'admin' ? '/admin' : '/renter');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    setForm({ email: `${role}@demo.com`, password: 'demo123' });
    setError('');
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroIcon}>🏢</div>
            <h1 className={styles.heroTitle}>PropMgmt</h1>
            <p className={styles.heroSubtitle}>Property Management Portal</p>
            <ul className={styles.features}>
              <li>🔧 Submit & track maintenance requests</li>
              <li>💳 Pay rent and view receipts</li>
              <li>📄 Access tax documents</li>
              <li>📅 Schedule via Google Calendar</li>
              <li>🐙 GitHub Projects integration</li>
            </ul>
          </div>
        </div>

        <div className={styles.form}>
          <h2 className={styles.formTitle}>Sign In</h2>
          <p className={styles.formSubtitle}>Access your property management portal</p>

          {error && (
            <div className={styles.alert} role="alert">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.fields}>
              <FormField label="Email Address" required>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </FormField>
              <FormField label="Password" required>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </FormField>
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} className={styles.submitBtn}>
              Sign In
            </Button>
          </form>

          <div className={styles.demo}>
            <p className={styles.demoLabel}>Demo accounts:</p>
            <div className={styles.demoButtons}>
              <button className={styles.demoBtn} onClick={() => fillDemo('renter')}>
                🏠 Renter Demo
              </button>
              <button className={styles.demoBtn} onClick={() => fillDemo('admin')}>
                ⚙️ Admin Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
