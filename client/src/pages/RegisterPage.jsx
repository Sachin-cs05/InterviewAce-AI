import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    targetRole: 'Full Stack Developer',
    experienceLevel: 'Fresher',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
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
        padding: '32px 24px',
      }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
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
          maxWidth: '460px',
          padding: '36px 32px',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px' }}>
            Create Your Account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Get started with AI mock interviews and targeted feedback
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
            <label className="form-label" htmlFor="register-name">Full Name</label>
            <input
              id="register-name"
              name="name"
              type="text"
              required
              className="form-input"
              placeholder="e.g. Alex Chen"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email Address</label>
            <input
              id="register-email"
              name="email"
              type="email"
              required
              className="form-input"
              placeholder="alex@university.edu"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Password (min. 6 characters)</label>
            <input
              id="register-password"
              name="password"
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="register-role">Primary Role</label>
              <select
                id="register-role"
                name="targetRole"
                className="form-select"
                value={formData.targetRole}
                onChange={handleChange}
              >
                <option value="Frontend Developer">Frontend</option>
                <option value="Backend Developer">Backend</option>
                <option value="Full Stack Developer">Full Stack</option>
                <option value="Java Developer">Java Developer</option>
                <option value="Software Engineer">Software Engineer</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-exp">Experience</label>
              <select
                id="register-exp"
                name="experienceLevel"
                className="form-select"
                value={formData.experienceLevel}
                onChange={handleChange}
              >
                <option value="Fresher">Fresher / Grad</option>
                <option value="1–2 Years">1–2 Years</option>
                <option value="2–5 Years">2–5 Years</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '11px' }}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
