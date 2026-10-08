import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  UploadCloud,
  FileText,
  X,
  Code2,
  Server,
  Layers,
  Coffee,
  Cpu,
  Check,
  AlertCircle,
  ArrowRight,
  Clock,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ROLES = [
  { id: 'Frontend Developer', label: 'Frontend Developer', icon: Code2, desc: 'React, CSS, Browser APIs, Web Performance' },
  { id: 'Backend Developer', label: 'Backend Developer', icon: Server, desc: 'Node.js, Databases, REST APIs, Scalability' },
  { id: 'Full Stack Developer', label: 'Full Stack Developer', icon: Layers, desc: 'End-to-End MERN, State Management & Databases' },
  { id: 'Java Developer', label: 'Java Developer', icon: Coffee, desc: 'Core Java, OOP, Spring Boot, Multithreading' },
  { id: 'Software Engineer', label: 'Software Engineer', icon: Cpu, desc: 'Data Structures, Algorithms, Problem Solving' },
  { id: 'custom', label: 'Custom Role', icon: Sparkles, desc: 'Create an interview for any job role you are targeting.' },
];

const PREDEFINED_ROLE_IDS = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Java Developer',
  'Software Engineer',
];

export const CreateInterviewPage = () => {
  const { user } = useAuth();

  const [selectedRoleCard, setSelectedRoleCard] = useState(() => {
    if (user?.targetRole && !PREDEFINED_ROLE_IDS.includes(user.targetRole)) {
      return 'custom';
    }
    return user?.targetRole || 'Full Stack Developer';
  });

  const [customRoleTitle, setCustomRoleTitle] = useState(() => {
    if (user?.targetRole && !PREDEFINED_ROLE_IDS.includes(user.targetRole)) {
      return user.targetRole;
    }
    return localStorage.getItem('interviewace_recent_custom_role') || '';
  });

  const [customSkills, setCustomSkills] = useState('');
  const [customDescription, setCustomDescription] = useState('');

  const [interviewType, setInterviewType] = useState(user?.defaultInterviewType || 'Technical');
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || 'Fresher');
  const [duration, setDuration] = useState(30); // 10 to 90 min, default 30 min
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Profile preferences integration: Sync default preferences if loaded
  useEffect(() => {
    if (user) {
      if (user.targetRole) {
        if (!PREDEFINED_ROLE_IDS.includes(user.targetRole)) {
          setSelectedRoleCard('custom');
          setCustomRoleTitle(user.targetRole);
        } else {
          setSelectedRoleCard(user.targetRole);
        }
      }
      if (user.defaultInterviewType) setInterviewType(user.defaultInterviewType);
      if (user.experienceLevel) setExperienceLevel(user.experienceLevel);
    }
  }, [user]);

  const validateAndSetFile = (file) => {
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      const msg = 'Please upload a PDF file smaller than 5 MB.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      const msg = 'Resume PDF exceeds 5 MB limit. Please upload a smaller file.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setError('');
    setResumeFile(file);
    toast.success(`Resume "${file.name}" uploaded successfully.`);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.info('Resume removed.');
  };

  const handleStartInterview = async (e) => {
    e.preventDefault();
    setError('');

    // Determine target job role and validation
    let effectiveJobRole = '';
    const jobRoleType = selectedRoleCard === 'custom' ? 'custom' : 'predefined';

    if (selectedRoleCard === 'custom') {
      if (!customRoleTitle || !customRoleTitle.trim()) {
        const valMsg = 'Please enter your target job role.';
        setError(valMsg);
        toast.error(valMsg);
        return;
      }
      effectiveJobRole = customRoleTitle.trim();
      try {
        localStorage.setItem('interviewace_recent_custom_role', effectiveJobRole);
      } catch (err) {
        // ignore localStorage errors
      }
    } else {
      effectiveJobRole = selectedRoleCard;
    }

    // Duration validation
    if (duration < 10 || duration > 90) {
      const valMsg = 'Choose a duration between 10 and 90 minutes.';
      setError(valMsg);
      toast.error(valMsg);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('jobRole', effectiveJobRole);
      formData.append('jobRoleType', jobRoleType);
      if (jobRoleType === 'custom') {
        formData.append('customSkills', customSkills.trim());
        formData.append('customDescription', customDescription.trim());
      }
      formData.append('interviewType', interviewType);
      formData.append('experienceLevel', experienceLevel);
      formData.append('duration', duration);
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      toast.info('AI is generating personalized interview questions...');
      const res = await api.createInterview(formData);

      if (res.success && res.interviewId) {
        toast.success('Interview room initialized!');
        navigate(`/interview/${res.interviewId}`);
      }
    } catch (err) {
      const errMessage = err.message || "We couldn't prepare your interview. Please try again.";
      setError(errMessage);
      toast.error(errMessage);
      setLoading(false);
      if (err.message && err.message.toLowerCase().includes('not authorized')) {
        setTimeout(() => {
          navigate('/login');
        }, 1200);
      }
    }
  };

  return (
    <div style={{ maxWidth: '1100px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', letterSpacing: '-0.02em' }}>
          Configure Mock Interview
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Customize your target track, question parameters, and attach your resume for hyper-relevant prompts.
        </p>
      </div>

      {error && (
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
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleStartInterview} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Step 1: Target Job Role */}
        <div className="saas-card" style={{ padding: '28px 32px' }}>
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              1. Target Job Role
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Choose a popular role or create an interview for ANY role you're targeting.
            </p>
          </div>

          <div className="role-cards-grid">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRoleCard === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRoleCard(role.id)}
                  className="card-interactive"
                  style={{
                    padding: '20px 22px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    backgroundColor: isSelected ? 'var(--accent-subtle)' : '#FFFFFF',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 0 1px var(--accent-border)' : 'var(--shadow-xs)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-subtle)',
                        color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    {isSelected && (
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent-primary)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {role.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {role.desc}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Role Form — Shown when Custom Role card is selected */}
          {selectedRoleCard === 'custom' && (
            <div
              style={{
                marginTop: '18px',
                padding: '20px',
                backgroundColor: '#FAFAFC',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Custom Role Configuration
                </h3>
              </div>

              {/* Job Role * (Required) */}
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                  <span>Job Role</span>
                  <span style={{ color: 'var(--accent-primary)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. DevOps Engineer, Data Scientist, AI/ML Engineer..."
                  value={customRoleTitle}
                  onChange={(e) => {
                    setCustomRoleTitle(e.target.value);
                    if (error) setError('');
                  }}
                  style={{ backgroundColor: '#FFFFFF' }}
                  autoFocus
                />

                {/* Suggestions / Examples */}
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Examples:</span>
                  {[
                    'DevOps Engineer',
                    'Data Scientist',
                    'AI/ML Engineer',
                    'Cloud Engineer',
                    'Cybersecurity Engineer',
                  ].map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => {
                        setCustomRoleTitle(example);
                        if (error) setError('');
                      }}
                      className="badge"
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '3px 8px',
                        fontSize: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                        e.currentTarget.style.color = 'var(--accent-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills / Technologies (Optional) */}
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px' }}>
                  Skills / Technologies <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.78125rem' }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. AWS, Docker, Kubernetes, Jenkins"
                  value={customSkills}
                  onChange={(e) => setCustomSkills(e.target.value)}
                  style={{ backgroundColor: '#FFFFFF' }}
                />
              </div>

              {/* Role Description (Optional) */}
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px' }}>
                  Role Description <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.78125rem' }}>(Optional)</span>
                </label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Describe the role or the kind of interview you are preparing for..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  style={{ backgroundColor: '#FFFFFF', resize: 'vertical' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Interview Parameters */}
        <div className="saas-card" style={{ padding: '28px 32px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              2. Interview Parameters
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Configure your interview type, experience level, and duration.
            </p>
          </div>

          {/* Top Row: Interview Type and Experience Level */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '26px' }}>
            {/* Interview Type */}
            <div>
              <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Interview Type</label>
              <div style={{ display: 'flex', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '4px', border: '1px solid var(--border-subtle)' }}>
                {['Technical', 'HR', 'Mixed'].map((type) => {
                  const isSelected = interviewType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setInterviewType(type)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Experience Level</label>
              <div style={{ display: 'flex', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '4px', border: '1px solid var(--border-subtle)' }}>
                {['Fresher', '1–2 Years', '2–5 Years'].map((exp) => {
                  const isSelected = experienceLevel === exp;
                  return (
                    <button
                      key={exp}
                      type="button"
                      onClick={() => setExperienceLevel(exp)}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {exp}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interview Duration System */}
          <div style={{ paddingTop: '22px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px', display: 'block' }}>
                  Interview Duration
                </label>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  How long do you want to practice?
                </p>
              </div>

              {/* Selected Value: ⏱ 30 minutes */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--accent-subtle)',
                  color: 'var(--accent-primary)',
                  border: '1.5px solid var(--accent-border)',
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  letterSpacing: '-0.01em',
                }}
              >
                <Clock size={16} />
                <span>⏱ {duration} minutes</span>
              </div>
            </div>

            {/* Slider with track gradient */}
            <div style={{ marginBottom: '16px' }}>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="saas-range-slider"
                style={{
                  background: `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-primary) ${((duration - 10) / (90 - 10)) * 100}%, #E2E8F0 ${((duration - 10) / (90 - 10)) * 100}%, #E2E8F0 100%)`,
                }}
                aria-label="Interview Duration Slider"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                <span>10 min</span>
                <span>90 min</span>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {[15, 30, 45, 60, 90].map((mins) => {
                const isSelected = duration === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    style={{
                      padding: '7px 16px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-default)',
                      backgroundColor: isSelected ? 'var(--accent-subtle)' : '#FFFFFF',
                      color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? 'var(--shadow-xs)' : 'none',
                    }}
                  >
                    <span>{mins} min</span>
                  </button>
                );
              })}
              {![15, 30, 45, 60, 90].includes(duration) && (
                <span
                  style={{
                    padding: '7px 14px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--accent-primary)',
                    border: '1px solid var(--accent-border)',
                  }}
                >
                  Custom ({duration} min)
                </span>
              )}
            </div>

            {/* AI Pacing Note */}
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
              <span>AI will dynamically adjust questions and follow-ups based on your selected duration and interview pace.</span>
            </p>
          </div>
        </div>

        {/* Step 3: Resume Upload */}
        <div className="saas-card" style={{ padding: '28px 32px' }}>
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                3. Upload Resume (Optional)
              </h2>
              <span className="badge badge-primary" style={{ fontSize: '0.6875rem' }}>Personalized</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Upload your PDF resume so the AI can cross-examine past projects, libraries, and frameworks you listed.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {!resumeFile ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '1.5px dashed var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                padding: '40px 24px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-subtle)',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease, background-color 0.2s ease',
              }}
              className="card-interactive"
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <UploadCloud size={24} />
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Drag & drop your PDF resume here
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                PDF files only (Maximum 5 MB)
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 24px',
                backgroundColor: 'var(--accent-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--accent-border)',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-xs)',
                    flexShrink: 0,
                  }}
                >
                  <FileText size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {resumeFile.name}
                    </span>
                    <span className="badge badge-success" style={{ padding: '2px 6px', fontSize: '0.6875rem' }}>
                      <CheckCircle2 size={11} /> Uploaded
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI extraction
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '5px' }}
                >
                  <RefreshCw size={13} />
                  <span>Replace</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemoveResume}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--danger-text)', gap: '4px' }}
                >
                  <X size={14} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Step 4: Compact Interview Summary */}
        <div
          className="saas-card"
          style={{
            padding: '20px 32px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Session Summary
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', fontSize: '0.84375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              <span>{selectedRoleCard === 'custom' ? (customRoleTitle.trim() || 'Custom Role') : selectedRoleCard}</span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span>{interviewType}</span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span>{experienceLevel}</span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>⏱ {duration} minutes</span>
            </div>
            {selectedRoleCard === 'custom' && customSkills.trim() && (
              <div style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)' }}>
                <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>Skills: </span>
                <span>{customSkills.trim()}</span>
              </div>
            )}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              AI will dynamically adjust questions and follow-ups throughout the interview.
            </p>
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Resume: {resumeFile ? <strong style={{ color: '#16A34A' }}>Uploaded ({resumeFile.name})</strong> : <span style={{ color: 'var(--text-muted)' }}>Not uploaded</span>}
          </div>
        </div>

        {/* Step 5: Start Interview Bar */}
        <div
          className="saas-card"
          style={{
            padding: '24px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Ready to begin?
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              AI interviewer will ask turn-by-turn questions with speech and keyboard input modes.
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg btn-hover-arrow"
            style={{ padding: '12px 28px', minWidth: '220px' }}
          >
            {loading ? (
              <>
                <div className="wave-bar active" style={{ backgroundColor: '#FFFFFF', width: '3px', height: '14px' }} />
                <span>Preparing Interview...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Start AI Interview</span>
                <ArrowRight size={16} className="btn-arrow-icon" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
