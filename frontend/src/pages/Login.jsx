import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Fill in all fields'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Demo login
  const demoLogin = async () => {
    setLoading(true);
    try {
      await login('aurora@demo.com', 'demo123');
      navigate('/');
    } catch {
      toast.error('Demo login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-layout">
      {/* Visual side */}
      <div className="auth-visual">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 60% 40%, rgba(201,168,76,0.15), transparent 60%)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1 className="auth-visual-title">Your style,<br /><em>perfected.</em></h1>
          <p style={{ color: 'rgba(240,237,232,0.5)', fontSize: '0.875rem', marginTop: 20, letterSpacing: '0.06em' }}>
            AI-powered fashion for the modern wardrobe
          </p>
        </div>

        {/* Decorative fashion words */}
        <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 24, opacity: 0.2 }}>
          {['STYLE', 'MODE', 'LOOK', 'CHIC'].map(w => (
            <span key={w} style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.3em', color: '#f0ede8' }}>{w}</span>
          ))}
        </div>
      </div>

      {/* Form side */}
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 300, marginBottom: 6 }}>
            Welcome back
          </h2>
          <p className="text-muted text-sm" style={{ marginBottom: 32 }}>
            Sign in to your Outfique account
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-full" style={{ justifyContent: 'center', marginTop: 8 }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div style={{ position: 'relative', margin: '24px 0', textAlign: 'center' }}>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
            <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--white)', padding: '0 12px', fontSize: '0.75rem', color: 'var(--muted)' }}>or</span>
          </div>

          <button className="btn btn-outline w-full btn-lg" style={{ justifyContent: 'center' }} onClick={demoLogin} disabled={loading}>
            Try demo account
          </button>

          <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: 24 }}>
            New here?{' '}
            <Link to="/signup" style={{ color: 'var(--gold)', fontWeight: 500 }}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}