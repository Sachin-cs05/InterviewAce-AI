import React from 'react';
import { AlertTriangle, Maximize, ShieldAlert } from 'lucide-react';

/**
 * FullscreenWarningModal
 * Appears immediately if candidate exits fullscreen mode during an active interview session.
 * Enforces anti-cheating compliance.
 */
export const FullscreenWarningModal = ({ onReEnterFullscreen, violationCount = 1 }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.94)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        className="saas-card"
        style={{
          maxWidth: '520px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '36px',
          textAlign: 'center',
          boxShadow: '0 25px 60px -15px rgba(220, 38, 38, 0.4)',
          border: '2px solid #FECACA',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
          animation: 'fadeIn 0.25s ease-out forwards',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#FEF2F2',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 0 8px rgba(220, 38, 38, 0.1)',
          }}
        >
          <ShieldAlert size={36} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#DC2626',
            }}
          >
            Proctoring Focus Notice
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Fullscreen Mode Exited
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
            You have exited fullscreen mode. Fullscreen and window focus are monitored to maintain a consistent assessment environment.
          </p>
        </div>

        <div
          style={{
            padding: '10px 16px',
            borderRadius: '10px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            fontSize: '0.8125rem',
            color: '#B91C1C',
            fontWeight: 600,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <AlertTriangle size={16} />
          <span>Proctoring Notice #{violationCount} recorded for review</span>
        </div>

        <button
          type="button"
          onClick={onReEnterFullscreen}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '12px 24px',
            fontSize: '0.9375rem',
            fontWeight: 700,
            gap: '8px',
            backgroundColor: '#DC2626',
            borderColor: '#DC2626',
            boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)',
            marginTop: '6px',
          }}
        >
          <Maximize size={18} />
          <span>Return to Fullscreen Now</span>
        </button>
      </div>
    </div>
  );
};
