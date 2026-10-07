import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Maximize,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Lock,
} from 'lucide-react';

/**
 * ProctoringSetupModal
 * Mandatory camera, microphone, and fullscreen verification before entering the interview room.
 * Anti-cheating security compliance check.
 */
export const ProctoringSetupModal = ({ onComplete, interviewTitle = 'AI Technical Interview' }) => {
  const [stream, setStream] = useState(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [hasMic, setHasMic] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isRequesting, setIsRequesting] = useState(false);

  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  // Auto-request camera and microphone on mount
  useEffect(() => {
    requestMediaAccess();

    return () => {
      cleanupAudioAnalyser();
    };
  }, []);

  // Attach stream to video preview whenever stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const cleanupAudioAnalyser = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
    }
  };

  const startAudioMonitoring = (mediaStream) => {
    cleanupAudioAnalyser();
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.4;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(mediaStream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.warn('Audio level monitoring failed:', err);
    }
  };

  const requestMediaAccess = async () => {
    setIsRequesting(true);
    setPermissionError('');

    try {
      // Request both video and audio streams
      const userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: true,
      });

      setStream(userMediaStream);
      setHasCamera(true);
      setHasMic(true);
      startAudioMonitoring(userMediaStream);
    } catch (err) {
      console.error('Permission denied or media unavailable:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Camera & microphone permissions were denied. Please click the lock or camera icon in your browser URL bar and allow permissions to proceed.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionError('No camera or microphone device was detected on your system. Please connect required devices.');
      } else {
        setPermissionError(err.message || 'Unable to access camera and microphone. Please check your browser settings.');
      }
      setHasCamera(false);
      setHasMic(false);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleStartInterview = async () => {
    if (!hasCamera || !hasMic || !stream) {
      return;
    }

    // Request fullscreen mode
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request failed or was bypassed:', err);
    }

    cleanupAudioAnalyser();
    // Hand over stream to main interview room
    onComplete(stream);
  };

  const isReady = hasCamera && hasMic && !permissionError;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      <div
        className="saas-card"
        style={{
          maxWidth: '740px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '36px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          animation: 'fadeIn 0.3s ease-out forwards',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(79, 70, 229, 0.1)',
                  color: 'var(--accent-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <ShieldCheck size={14} />
                <span>Security & Proctoring Setup</span>
              </div>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Device Readiness & Anti-Cheating Check
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '6px', margin: 0 }}>
              Camera and microphone are mandatory. Interview will launch in full-screen mode to prevent cheating.
            </p>
          </div>
        </div>

        {/* Media Preview & Status Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '24px',
            alignItems: 'start',
          }}
          className="proctor-modal-grid"
        >
          {/* Left: Video Feed Preview Tile */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '4/3',
                backgroundColor: '#0F172A',
                borderRadius: '16px',
                overflow: 'hidden',
                border: `2px solid ${hasCamera ? '#22C55E' : 'var(--border-default)'}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
                  transform: 'scaleX(-1)', // Mirror view for natural feel
                  display: hasCamera ? 'block' : 'none',
                }}
              />

              {!hasCamera && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#94A3B8' }}>
                  {isRequesting ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <Camera size={38} color="#94A3B8" className="animate-spin" />
                      <span style={{ fontSize: '0.875rem' }}>Requesting Camera Access...</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <CameraOff size={42} color="#EF4444" />
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F8FAFC' }}>
                        Camera Inactive
                      </span>
                      <span style={{ fontSize: '0.75rem', maxWidth: '200px' }}>
                        Please grant camera permission to continue
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Live Status Overlay Tag */}
              {hasCamera && (
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(6px)',
                    color: '#22C55E',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
                  <span>CAMERA LIVE</span>
                </div>
              )}
            </div>

            {/* Audio Mic Level Meter */}
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: '12px',
                padding: '10px 14px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Mic size={16} color={hasMic ? '#22C55E' : 'var(--text-muted)'} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Microphone Input Test</span>
                  <span style={{ color: hasMic ? '#16A34A' : 'var(--text-muted)' }}>
                    {hasMic ? (audioLevel > 10 ? 'Sound Detected' : 'Listening...') : 'Disabled'}
                  </span>
                </div>
                <div
                  style={{
                    height: '6px',
                    width: '100%',
                    backgroundColor: 'var(--border-default)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${audioLevel}%`,
                      backgroundColor: audioLevel > 10 ? '#22C55E' : 'var(--accent-primary)',
                      transition: 'width 0.1s ease',
                      borderRadius: '3px',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Security Checkpoints List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Verification Checklist
            </div>

            {/* Check 1: Camera */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: hasCamera ? '#F0FDF4' : '#FEF2F2',
                border: `1px solid ${hasCamera ? '#BBF7D0' : '#FECACA'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: hasCamera ? '#DCFCE7' : '#FEE2E2',
                    color: hasCamera ? '#16A34A' : '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Camera size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Webcam Feed</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Continuous identity proctoring</div>
                </div>
              </div>
              {hasCamera ? <CheckCircle2 size={18} color="#16A34A" /> : <XCircle size={18} color="#DC2626" />}
            </div>

            {/* Check 2: Microphone */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: hasMic ? '#F0FDF4' : '#FEF2F2',
                border: `1px solid ${hasMic ? '#BBF7D0' : '#FECACA'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: hasMic ? '#DCFCE7' : '#FEE2E2',
                    color: hasMic ? '#16A34A' : '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Mic size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Audio Input</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Required for speech recognition</div>
                </div>
              </div>
              {hasMic ? <CheckCircle2 size={18} color="#16A34A" /> : <XCircle size={18} color="#DC2626" />}
            </div>

            {/* Check 3: Fullscreen Anti-Cheating Lock */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: '#EEF2FF',
                border: '1px solid #C7D2FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#E0E7FF',
                    color: '#4F46E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Maximize size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Fullscreen Lock</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Exiting or tab switching triggers alert</div>
                </div>
              </div>
              <Lock size={16} color="#4F46E5" />
            </div>

            {/* Rules Callout */}
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.45,
              }}
            >
              <strong>Anti-Cheating Rules:</strong> Window switching, exiting fullscreen, or turning off camera will be logged as security strikes in your final evaluation report.
            </div>
          </div>
        </div>

        {/* Permission Error Box */}
        {permissionError && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{permissionError}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {!isReady ? (
            <button
              type="button"
              onClick={requestMediaAccess}
              disabled={isRequesting}
              className="btn btn-secondary"
              style={{ gap: '8px', padding: '10px 20px', fontWeight: 600 }}
            >
              <Camera size={16} />
              <span>{isRequesting ? 'Checking Devices...' : 'Grant Camera & Mic Access'}</span>
            </button>
          ) : (
            <div style={{ fontSize: '0.8125rem', color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} />
              <span>All security prerequisites met</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleStartInterview}
            disabled={!isReady}
            className="btn btn-primary"
            style={{
              padding: '12px 32px',
              fontSize: '0.9375rem',
              fontWeight: 700,
              gap: '10px',
              boxShadow: isReady ? '0 4px 16px rgba(79, 70, 229, 0.35)' : 'none',
              opacity: isReady ? 1 : 0.6,
              cursor: isReady ? 'pointer' : 'not-allowed',
            }}
          >
            <Maximize size={18} />
            <span>Enter Fullscreen & Begin Interview</span>
          </button>
        </div>
      </div>
    </div>
  );
};
