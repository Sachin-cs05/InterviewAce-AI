import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    const demoEmail = 'student@interviewace.ai';
    const demoPass = 'password123';

    try {
      // Try login first
      await login(demoEmail, demoPass);
      navigate('/dashboard');
    } catch (err) {
      // If user doesn't exist, create demo account automatically
      try {
        await register({
          name: 'Sachin (Student Demo)',
          email: demoEmail,
          password: demoPass,
          targetRole: 'Full Stack Developer',
          experienceLevel: 'Fresher',
        });
        navigate('/dashboard');
      } catch (regErr) {
        setError(regErr.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      {/* Brand Icon */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '1.2rem',
            boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
          }}
        >
          ✦
        </div>
        <span style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          InterviewAce AI
        </span>
      </Link>

      <div
        className="saas-card"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '36px 32px',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Enter your credentials to access your interview dashboard
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger-text)',
              border: '1px solid var(--danger-border)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                type="email"
                required
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="login-password">Password</label>
            </div>
            <input
              id="login-password"
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '6px', padding: '11px' }}
          >
            {loading ? 'Signing in...' : 'Sign In to Account'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Quick Demo Access for Recruiters/Evaluators */}
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="btn btn-secondary"
            style={{ width: '100%', fontSize: '0.8125rem', padding: '9px' }}
          >
            <Sparkles size={15} color="var(--accent-primary)" />
            <span>Explore with 1-Click Demo Account</span>
          </button>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Create one free
          </Link>
        </div>
      </div>
    </div>
  );
};
