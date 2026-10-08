import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, HelpCircle, Menu, X, Info } from 'lucide-react';

export const Header = ({ title = 'Dashboard', onOpenMobileNav }) => {
  const [showHelpModal, setShowHelpModal] = useState(false);

  return (
    <>
      <header className="top-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Mobile Menu Drawer Toggle Button */}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onOpenMobileNav}
            aria-label="Open navigation menu"
            style={{
              padding: '8px',
              color: 'var(--text-secondary)',
              display: 'none',
            }}
            id="mobile-drawer-toggle"
          >
            <Menu size={20} />
          </button>

          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {title}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Help Guidelines Button */}
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: '8px', color: 'var(--text-secondary)' }}
            title="InterviewAce Guidelines"
            onClick={() => setShowHelpModal(true)}
          >
            <HelpCircle size={19} />
          </button>

          {/* Start Interview Action */}
          <Link to="/interview/new" className="btn btn-primary btn-sm">
            <Sparkles size={15} />
            <span>Start Interview</span>
          </Link>
        </div>
      </header>

      {/* Quick Help Modal */}
      {showHelpModal && (
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
          onClick={() => setShowHelpModal(false)}
        >
          <div
            className="saas-card"
            style={{
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Info size={18} />
                </div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Platform Guidelines
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="btn btn-ghost"
                style={{ padding: '4px', color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p>
                <strong>1. Role Customization:</strong> Select your target tech stack and upload an optional PDF resume for project-specific questions.
              </p>
              <p>
                <strong>2. Answer Modes:</strong> Speak naturally using your microphone with real-time speech-to-text, or toggle keyboard text input anytime.
              </p>
              <p>
                <strong>3. AI Scoring:</strong> Each answer is scored on technical correctness, clarity, and depth, pinpointing missing edge cases.
              </p>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowHelpModal(false)}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
