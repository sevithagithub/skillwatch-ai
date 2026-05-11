import { useState } from 'react';
import { signup, login as apiLogin } from '../services/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login({ onLogin }) {
  const [tab, setTab] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (tab === 'signup' && !name.trim()) errs.name = 'Name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!EMAIL_RE.test(email.trim())) errs.email = 'Enter a valid email address';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (tab === 'signup' && password && password !== confirmPwd) errs.confirmPwd = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setError('');
    if (!validate()) return;
    if (!email.trim() || !password.trim()) {
      return setError('Please enter your email and password.');
    }
    if (tab === 'signup' && !name.trim()) {
      return setError('Please enter your name.');
    }
    setLoading(true);
    try {
      let res;
      if (tab === 'signup') {
        res = await signup({ name: name.trim(), email: email.trim(), password });
      } else {
        res = await apiLogin({ email: email.trim(), password });
      }
      onLogin(res.data.user, res.data.access_token);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (detail === 'Email already registered') {
        setError('This email is already registered. Please sign in instead.');
      } else if (detail === 'Invalid email or password') {
        setError('Wrong email or password. Please try again.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Make sure the backend is running on port 8000.');
      } else {
        setError(detail || 'Something went wrong. Please try again.');
      }
    }
    setLoading(false);
  };

  const handleGuest = async () => {
    setLoading(true);
    setError('');
    // Use a fixed guest account so repeated clicks reuse same user
    const guestEmail = 'guest@skillwatch.ai';
    const guestPass = 'guestpass123';
    try {
      // Try login first (if guest already created)
      const res = await apiLogin({ email: guestEmail, password: guestPass });
      onLogin(res.data.user, res.data.access_token);
    } catch {
      try {
        // Create guest account
        const res = await signup({ name: 'Guest User', email: guestEmail, password: guestPass });
        onLogin(res.data.user, res.data.access_token);
      } catch (err2) {
        const detail = err2.response?.data?.detail;
        if (err2.code === 'ERR_NETWORK') {
          setError('Backend server not reachable. Please start it on port 8000.');
        } else {
          setError(detail || 'Guest login failed. Please try again.');
        }
      }
    }
    setLoading(false);
  };

  const FieldError = ({ field }) => errors[field]
    ? <div style={{ color: '#f87171', fontSize: 10, marginTop: 4 }}>⚠ {errors[field]}</div>
    : null;

  const switchTab = (t) => { setTab(t); setError(''); setErrors({}); setConfirmPwd(''); };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div style={{
        position: 'absolute', inset: 0, backgroundImage:
          'linear-gradient(rgba(0,212,161,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,161,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px', pointerEvents: 'none'
      }} />

      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="auth-logo" style={{ fontSize: 20, marginBottom: 4 }}>Skill<span>Watch</span> · AI</div>
          <div className="auth-tagline">Workforce Early Warning System</div>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => switchTab('login')}>Sign In</button>
          <button className={`auth-tab${tab === 'signup' ? ' active' : ''}`} onClick={() => switchTab('signup')}>Create Account</button>
        </div>

        {/* Name — signup only */}
        {tab === 'signup' && (
          <div className="auth-field">
            <label className="auth-label">Full Name *</label>
            <input id="auth-name" className="auth-input"
              placeholder="e.g. Savitha Ruhmini"
              value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
              autoComplete="name"
              style={{ borderColor: errors.name ? 'rgba(248,113,113,0.5)' : '' }} />
            <FieldError field="name" />
          </div>
        )}

        {/* Email */}
        <div className="auth-field">
          <label className="auth-label">Email Address *</label>
          <input id="auth-email" className="auth-input"
            placeholder="you@example.com"
            value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
            type="email" autoComplete="email"
            style={{ borderColor: errors.email ? 'rgba(248,113,113,0.5)' : '' }} />
          <FieldError field="email" />
        </div>

        {/* Password */}
        <div className="auth-field">
          <label className="auth-label">Password *</label>
          <input id="auth-password" className="auth-input"
            placeholder={tab === 'signup' ? 'At least 6 characters' : '••••••••'}
            value={password} onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
            type="password" autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{ borderColor: errors.password ? 'rgba(248,113,113,0.5)' : '' }} />
          <FieldError field="password" />
        </div>

        {/* Confirm Password — signup only */}
        {tab === 'signup' && (
          <div className="auth-field">
            <label className="auth-label">Confirm Password *</label>
            <input id="auth-confirm-pwd" className="auth-input"
              placeholder="Re-enter password"
              value={confirmPwd} onChange={e => { setConfirmPwd(e.target.value); setErrors(p => ({ ...p, confirmPwd: '' })); }}
              type="password" autoComplete="new-password"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ borderColor: errors.confirmPwd ? 'rgba(248,113,113,0.5)' : '' }} />
            <FieldError field="confirmPwd" />
          </div>
        )}

        {/* Global error */}
        {error && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '8px 12px', color: '#f87171', fontSize: 12, marginBottom: 10, lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        <button id="auth-submit-btn" className="auth-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Please wait...' : tab === 'login' ? 'Sign In →' : 'Create Account →'}
        </button>

        <div className="auth-divider">or continue without an account</div>
        <button id="guest-btn" className="auth-social" onClick={handleGuest} disabled={loading}>
          ⚡ &nbsp;Continue as Guest (Demo)
        </button>

        <div className="auth-switch" style={{ marginTop: 18 }}>
          {tab === 'login'
            ? <>No account? <span className="auth-link" onClick={() => switchTab('signup')}>Sign up free</span></>
            : <>Already have an account? <span className="auth-link" onClick={() => switchTab('login')}>Sign in</span></>}
        </div>
      </div>
    </div>
  );
}
