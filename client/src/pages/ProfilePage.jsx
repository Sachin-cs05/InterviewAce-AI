import React, { useState } from 'react';
import { User, Mail, Briefcase, Award, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

const PREDEFINED_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Java Developer',
  'Software Engineer',
];

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    targetRole: user?.targetRole || 'Full Stack Developer',
    experienceLevel: user?.experienceLevel || 'Fresher',
    defaultInterviewType: user?.defaultInterviewType || 'Technical',
    bio: user?.bio || '',
  });

  const [isCustomRole, setIsCustomRole] = useState(() => {
    return user?.targetRole ? !PREDEFINED_ROLES.includes(user.targetRole) : false;
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'IA';

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.targetRole.trim()) {
      const msg = 'Please enter your target job role.';
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setSaving(true);

    try {
      const res = await api.updateProfile(formData);
      if (res.success && res.user) {
        updateUser(res.user);
        if (isCustomRole && formData.targetRole.trim()) {
          try {
            localStorage.setItem('interviewace_recent_custom_role', formData.targetRole.trim());
          } catch (err) {
            // ignore localStorage error
          }
        }
        toast.success('Profile updated successfully.');
      }
    } catch (err) {
      const errText = err.message || 'Failed to update profile. Please try again.';
      setErrorMsg(errText);
      toast.error(errText);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Profile Header Card */}
      <div
        className="saas-card"
        style={{
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          background: 'linear-gradient(to right, #FFFFFF, #FBFBFE)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-subtle)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.375rem',
            border: '2px solid var(--accent-border)',
            boxShadow: 'var(--shadow-sm)',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {user?.name || 'Candidate'}
            </h1>
            <span className="badge badge-primary">
              {formData.experienceLevel === 'Fresher' ? 'Student / Fresher' : `${formData.experienceLevel} Experience`}
            </span>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {formData.targetRole}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'var(--danger-bg)',
            color: 'var(--danger-text)',
            border: '1px solid var(--danger-border)',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. Personal Information & Preferences Form */}
      <div className="saas-card" style={{ padding: '28px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Personal Information
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Basic account details and contact information
            </p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="profile-name">Full Name</label>
            <input
              id="profile-name"
              name="name"
              type="text"
              required
              className="form-input"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="profile-email">Email Address</label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Read-only</span>
            </div>
            <input
              id="profile-email"
              type="email"
              disabled
              className="form-input"
              value={user?.email || ''}
              style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
            />
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '4px 0' }} />

          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Career & Interview Preferences
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Set your default preferences used when generating new interview rooms
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-role">Target Job Role</label>
              <select
                id="profile-role"
                className="form-select"
                value={isCustomRole ? '__CUSTOM__' : formData.targetRole}
                onChange={(e) => {
                  if (e.target.value === '__CUSTOM__') {
                    setIsCustomRole(true);
                    if (PREDEFINED_ROLES.includes(formData.targetRole)) {
                      setFormData((prev) => ({ ...prev, targetRole: '' }));
                    }
                  } else {
                    setIsCustomRole(false);
                    setFormData((prev) => ({ ...prev, targetRole: e.target.value }));
                  }
                }}
              >
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Java Developer">Java Developer</option>
                <option value="Software Engineer">Software Engineer</option>
                <option value="__CUSTOM__">✨ Custom Role...</option>
              </select>

              {isCustomRole && (
                <div style={{ marginTop: '8px' }}>
                  <input
                    type="text"
                    name="targetRole"
                    className="form-input"
                    placeholder="e.g. DevOps Engineer, Data Scientist..."
                    value={formData.targetRole}
                    onChange={handleChange}
                    autoFocus
                  />
                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                    <span style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>Suggestions:</span>
                    {['DevOps Engineer', 'Data Scientist', 'AI/ML Engineer', 'Cloud Engineer'].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, targetRole: sug }))}
                        className="badge"
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          padding: '2px 6px',
                          fontSize: '0.71875rem',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-exp">Experience Level</label>
              <select
                id="profile-exp"
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

            <div className="form-group">
              <label className="form-label" htmlFor="profile-default-type">Default Interview Type</label>
              <select
                id="profile-default-type"
                name="defaultInterviewType"
                className="form-select"
                value={formData.defaultInterviewType}
                onChange={handleChange}
              >
                <option value="Technical">Technical</option>
                <option value="HR">HR / Behavioral</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
          </div>

          {/* Short Bio / Target Goal */}
          <div className="form-group">
            <label className="form-label" htmlFor="profile-bio">Short Bio / Target Goal</label>
            <textarea
              id="profile-bio"
              name="bio"
              rows={3}
              className="form-textarea"
              placeholder="Final-year CS student preparing for Full Stack Developer roles..."
              value={formData.bio}
              onChange={handleChange}
            />
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ minWidth: '140px' }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
