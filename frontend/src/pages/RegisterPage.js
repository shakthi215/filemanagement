import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Spinner from '../components/UI/Spinner';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.bg}>
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        <div className={styles.grid} />
      </div>

      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>⬡</div>
          <span className={styles.logoText}>BizFiles</span>
        </div>

        <h1 className={styles.heading}>Create your workspace</h1>
        <p className={styles.subheading}>Start managing files in seconds — free forever</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Full name</label>
            <input
              type="text" name="name" value={form.name}
              onChange={handleChange} className={styles.input}
              placeholder="John Smith" autoComplete="name" autoFocus
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email address</label>
            <input
              type="email" name="email" value={form.email}
              onChange={handleChange} className={styles.input}
              placeholder="you@company.com" autoComplete="email"
            />
          </div>
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input
                type="password" name="password" value={form.password}
                onChange={handleChange} className={styles.input}
                placeholder="Min 6 chars" autoComplete="new-password"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Confirm</label>
              <input
                type="password" name="confirm" value={form.confirm}
                onChange={handleChange} className={styles.input}
                placeholder="Repeat password"
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <><Spinner size={18} color="#fff" /> Creating…</> : 'Create Account'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
