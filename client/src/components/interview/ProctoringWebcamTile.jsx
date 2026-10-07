import React, { useRef, useEffect, useState } from 'react';
import { Shield, Eye, AlertTriangle, Minimize2, Maximize2 } from 'lucide-react';

/**
 * ProctoringWebcamTile
 * Floating Picture-in-Picture candidate webcam video monitor during the interview.
 * Continuously displays the live video stream with active anti-cheating indicator.
 */
export const ProctoringWebcamTile = ({ stream, violationCount = 0 }) => {
  const videoRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 900,
        backgroundColor: '#0F172A',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1.5px rgba(255, 255, 255, 0.1)',
        width: isMinimized ? '140px' : '200px',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header Tag */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#DC2626',
              animation: 'orb-pulse 1.5s infinite',
            }}
          />
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: '#F8FAFC',
              letterSpacing: '0.04em',
            }}
          >
            PROCTOR LIVE
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsMinimized(!isMinimized)}
          style={{
            background: 'none',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={isMinimized ? 'Expand camera' : 'Minimize camera'}
        >
          {isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
        </button>
      </div>

      {/* Video Viewport */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: isMinimized ? '80px' : '130px',
          backgroundColor: '#000000',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)', // Mirror candidate video
          }}
        />

        {/* Anti-Cheating Shield Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '6px',
            left: '6px',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(4px)',
            borderRadius: '4px',
            padding: '2px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.625rem',
            color: '#38BDF8',
            fontWeight: 600,
          }}
        >
          <Shield size={10} />
          <span>AI Anti-Cheat</span>
        </div>

        {/* Warning Indicator if any violations recorded */}
        {violationCount > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              backgroundColor: '#DC2626',
              borderRadius: '4px',
              padding: '2px 5px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '0.625rem',
              color: '#FFFFFF',
              fontWeight: 700,
            }}
          >
            <AlertTriangle size={10} />
            <span>{violationCount} Strike{violationCount > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
};
