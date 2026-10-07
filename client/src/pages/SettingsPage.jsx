import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Volume2,
  Mic,
  Shield,
  LogOut,
  Sliders,
  Play,
  Check,
  AlertTriangle,
  X,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSpeech } from '../hooks/useSpeech';
import { useToast } from '../context/ToastContext';

export const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { speak } = useSpeech();
  const { toast } = useToast();

  // Load preferences from localStorage or defaults
  const [speechRate, setSpeechRate] = useState(() => {
    return parseFloat(localStorage.getItem('interviewace_speech_rate') || '1.0');
  });
  const [autoPlayQuestions, setAutoPlayQuestions] = useState(() => {
    return localStorage.getItem('interviewace_autoplay_audio') !== 'false';
  });
  const [defaultAnswerMode, setDefaultAnswerMode] = useState(() => {
    return localStorage.getItem('interviewace_default_mode') || 'voice'; // 'voice' | 'text'
  });
  const [showTimer, setShowTimer] = useState(() => {
    return localStorage.getItem('interviewace_show_timer') !== 'false';
  });

  const [testingAudio, setTestingAudio] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Sync speech rate
  const handleRateChange = (rate) => {
    const val = parseFloat(rate);
    setSpeechRate(val);
    localStorage.setItem('interviewace_speech_rate', val.toString());
    toast.info(`Speech rate set to ${val}x`);
  };

  const handleToggleAutoPlay = (e) => {
    const checked = e.target.checked;
    setAutoPlayQuestions(checked);
    localStorage.setItem('interviewace_autoplay_audio', checked ? 'true' : 'false');
    toast.success(`Auto-play questions ${checked ? 'enabled' : 'disabled'}`);
  };

  const handleToggleMode = (mode) => {
    setDefaultAnswerMode(mode);
    localStorage.setItem('interviewace_default_mode', mode);
    toast.success(`Default response mode set to ${mode === 'voice' ? 'Voice' : 'Text'}`);
  };

  const handleToggleTimer = (e) => {
    const checked = e.target.checked;
    setShowTimer(checked);
    localStorage.setItem('interviewace_show_timer', checked ? 'true' : 'false');
    toast.success(`Interview timer ${checked ? 'shown' : 'hidden'}`);
  };

  const handleTestSpeech = () => {
    setTestingAudio(true);
    speak('Welcome to InterviewAce AI. Voice narration is configured and working smoothly.');
    setTimeout(() => setTestingAudio(false), 2500);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    toast.info('Signed out successfully.');
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          Customize your audio narration speed, response mode preferences, and account controls
        </p>
      </div>

      {/* SECTION 1: Speech & Audio Preferences */}
      <div className="saas-card" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Volume2 size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Speech & Audio Preferences
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Configure browser Text-to-Speech audio output speed
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Rate Selector Chips */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label">Speech Narration Rate ({speechRate}x)</label>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[0.75, 1.0, 1.25, 1.5].map((rate) => {
                const isSelected = speechRate === rate;
                return (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => handleRateChange(rate)}
                    className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, padding: '7px 10px', fontSize: '0.8125rem', fontWeight: 600 }}
                  >
                    {rate}x {rate === 1.0 && '• Normal'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Test Audio Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Test Audio Output
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Verify speech synthesis in your browser
              </div>
            </div>
            <button
              type="button"
              onClick={handleTestSpeech}
              disabled={testingAudio}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              <Play size={13} />
              <span>{testingAudio ? 'Speaking...' : 'Play Test Audio'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: Interview Preferences */}
      <div className="saas-card" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sliders size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Interview Preferences
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Control room mechanics and interaction toggles
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Default Answer Mode */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Default Answer Mode
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Choose whether microphone or text box opens by default
              </div>
            </div>
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '3px', border: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                onClick={() => handleToggleMode('voice')}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: defaultAnswerMode === 'voice' ? '#FFFFFF' : 'transparent',
                  color: defaultAnswerMode === 'voice' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  boxShadow: defaultAnswerMode === 'voice' ? 'var(--shadow-xs)' : 'none',
                }}
              >
                🎙️ Voice
              </button>
              <button
                type="button"
                onClick={() => handleToggleMode('text')}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: defaultAnswerMode === 'text' ? '#FFFFFF' : 'transparent',
                  color: defaultAnswerMode === 'text' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  boxShadow: defaultAnswerMode === 'text' ? 'var(--shadow-xs)' : 'none',
                }}
              >
                ⌨️ Text
              </button>
            </div>
          </div>

          {/* Auto-play AI Questions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Auto-play AI Questions
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Automatically speak the next question when loaded
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoPlayQuestions}
              onChange={handleToggleAutoPlay}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
          </div>

          {/* Show Timer during interview */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Show Active Interview Timer
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Display pacing clock while formulating your answers
              </div>
            </div>
            <input
              type="checkbox"
              checked={showTimer}
              onChange={handleToggleTimer}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: Account & Session */}
      <div className="saas-card" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Account & Session
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Manage active credentials and sign out
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Current Account
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {user?.email || 'Authenticated User'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="btn btn-danger btn-sm"
            style={{ gap: '6px' }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(3px)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="saas-card"
            style={{
              maxWidth: '400px',
              width: '100%',
              padding: '24px',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={18} />
              </div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Confirm Sign Out
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Are you sure you want to sign out of InterviewAce AI? You can log back in anytime.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={confirmLogout}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
