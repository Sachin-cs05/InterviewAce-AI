import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Mic,
  MicOff,
  Send,
  RefreshCw,
} from 'lucide-react';
import { WaveVisualizer } from '../common/WaveVisualizer';

/**
 * AIAvatarInterviewer
 * Unified Single Card Interview Stage:
 * - Left Side: 3D AI Interviewer Avatar with speech-synchronized lipsync (zero light flicker)
 * - Right Side: Live Progressive Question + "Give Your Response" Voice Recording + Submit
 */
export const AIAvatarInterviewer = ({
  isSpeaking = false,
  spokenCharIndex = 0,
  questionText = '',
  category = 'Technical',
  questionIndex = 0,
  onToggleSpeech,
  // Candidate Response Props
  candidateAnswer = '',
  onAnswerChange,
  isListening = false,
  onToggleRecording,
  hasSpeechRecognition = true,
  isSubmitting = false,
  evaluatingState = false,
  onResetAnswer,
  onSubmitAnswer,
}) => {
  // 'rest' | 'mid' | 'open'
  const [currentFrame, setCurrentFrame] = useState('rest');

  // Progressive Word-by-Word Speech Reveal State
  const words = React.useMemo(() => {
    if (!questionText) return [];
    return questionText.trim().split(/\s+/);
  }, [questionText]);

  const [revealedWordCount, setRevealedWordCount] = useState(0);
  const [hasCompletedSpeech, setHasCompletedSpeech] = useState(false);

  // Reset progressive reveal when question index or text changes
  useEffect(() => {
    setRevealedWordCount(0);
    setHasCompletedSpeech(false);
  }, [questionIndex, questionText]);

  // Progressive word reveal ticker synchronized with speech
  useEffect(() => {
    if (!isSpeaking) {
      if (hasCompletedSpeech || revealedWordCount > 0) {
        setRevealedWordCount(words.length);
        setHasCompletedSpeech(true);
      }
      return;
    }

    const interval = setInterval(() => {
      setRevealedWordCount((prev) => {
        if (prev >= words.length) {
          clearInterval(interval);
          setHasCompletedSpeech(true);
          return words.length;
        }
        return prev + 1;
      });
    }, 185);

    return () => clearInterval(interval);
  }, [isSpeaking, words.length, hasCompletedSpeech, revealedWordCount]);

  // Sync with browser speech boundary charIndex when available
  useEffect(() => {
    if (spokenCharIndex && spokenCharIndex > 0 && words.length > 0) {
      let charAcc = 0;
      let matchedCount = 0;
      for (let i = 0; i < words.length; i++) {
        if (spokenCharIndex >= charAcc) {
          matchedCount = i + 1;
        }
        charAcc += words[i].length + 1;
      }
      setRevealedWordCount((prev) => Math.max(prev, Math.min(words.length, matchedCount)));
    }
  }, [spokenCharIndex, words]);

  // Fallback: If speech wasn't triggered within 2.5s, reveal full text
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isSpeaking && revealedWordCount === 0) {
        setRevealedWordCount(words.length);
        setHasCompletedSpeech(true);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [isSpeaking, revealedWordCount, words.length]);

  // Preload frames into memory immediately
  useEffect(() => {
    const urls = ['/avatar-rest.jpg', '/avatar-talk-mid.jpg', '/avatar-talk-open.jpg'];
    urls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  // Natural speech cadence & mouth articulation rhythm (zero background flicker)
  useEffect(() => {
    if (!isSpeaking) {
      setCurrentFrame('rest');
      return;
    }

    const rhythmSequence = [
      'mid',
      'open',
      'mid',
      'rest',
      'mid',
      'open',
      'open',
      'mid',
      'rest',
      'mid',
      'open',
      'mid',
    ];
    let step = 0;

    const interval = setInterval(() => {
      step = (step + 1) % rhythmSequence.length;
      setCurrentFrame(rhythmSequence[step]);
    }, 130);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  const wordCount = candidateAnswer.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div
      className="saas-card unified-interview-card"
      style={{
        padding: '30px 36px',
        border: '1.5px solid var(--border-subtle)',
        backgroundColor: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={16} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              AI Interviewer
            </span>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-subtle)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {category}
            </span>
          </div>
        </div>

        {/* Status Badge & Audio Trigger Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isSpeaking ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                border: '1px solid rgba(79, 70, 229, 0.2)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--accent-primary)',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#22C55E',
                }}
              />
              <span>Speaking Question...</span>
            </div>
          ) : isListening ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#DC2626',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#DC2626',
                }}
              />
              <span>Listening to Candidate...</span>
            </div>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-subtle)',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'var(--text-muted)',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94A3B8' }} />
              <span>Ready</span>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleSpeech}
            className={`btn btn-sm ${isSpeaking ? 'btn-danger' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.78125rem', gap: '6px' }}
            title={isSpeaking ? 'Stop speaking' : 'Listen to question aloud'}
          >
            {isSpeaking ? (
              <>
                <VolumeX size={14} />
                <span>Stop Audio</span>
              </>
            ) : (
              <>
                <Volume2 size={14} />
                <span>Listen to Question</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Avatar | Right Question & Response Area */}
      <div className="unified-interview-grid">
        {/* ============================================================ */}
        {/* LEFT COLUMN: 3D AI Interviewer Avatar Stage                  */}
        {/* ============================================================ */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '12px',
          }}
        >
          {/* Avatar Visual Container (Static Border & Constant Shadow: NO Light Blinking) */}
          <div
            className="avatar-frame"
            style={{
              position: 'relative',
              width: '230px',
              height: '230px',
              borderRadius: '24px',
              overflow: 'hidden',
              backgroundColor: '#F1F5F9',
              border: '2px solid var(--border-default)',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
              flexShrink: 0,
            }}
          >
            {/* 1. Permanent Solid Base Image: 100% of background, clothes, hair & laptop NEVER change */}
            <img
              src="/avatar-rest.jpg"
              alt="AI Interviewer"
              className="avatar-base-img"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 35%',
                display: 'block',
                userSelect: 'none',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />

            {/* 2. Seamless Feathered Mouth Layer (Mid-speech) */}
            <img
              src="/avatar-talk-mid.jpg"
              alt="Speaking Mid"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 35%',
                display: 'block',
                userSelect: 'none',
                pointerEvents: 'none',
                zIndex: 2,
                opacity: currentFrame === 'mid' ? 1 : 0,
                maskImage: 'radial-gradient(ellipse 32px 22px at 53.5% 42.5%, black 55%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse 32px 22px at 53.5% 42.5%, black 55%, transparent 100%)',
                transition: 'opacity 0.05s ease',
              }}
            />

            {/* 3. Seamless Feathered Mouth Layer (Open-speech) */}
            <img
              src="/avatar-talk-open.jpg"
              alt="Speaking Open"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 35%',
                display: 'block',
                userSelect: 'none',
                pointerEvents: 'none',
                zIndex: 3,
                opacity: currentFrame === 'open' ? 1 : 0,
                maskImage: 'radial-gradient(ellipse 32px 22px at 53.5% 42.5%, black 55%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse 32px 22px at 53.5% 42.5%, black 55%, transparent 100%)',
                transition: 'opacity 0.05s ease',
              }}
            />

            {/* Floating Subtle Audio Equalizer Indicator inside Avatar Frame */}
            {isSpeaking && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(15, 23, 42, 0.78)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  zIndex: 10,
                }}
              >
                <div className="avatar-audio-bar bar-1" />
                <div className="avatar-audio-bar bar-2" />
                <div className="avatar-audio-bar bar-3" />
                <div className="avatar-audio-bar bar-4" />
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    marginLeft: '4px',
                    letterSpacing: '0.02em',
                  }}
                >
                  Alex • Speaking
                </span>
              </div>
            )}
          </div>

          {/* Avatar Name & Role Sub-badge */}
          <div
            style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              Alex (AI Interviewer)
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Senior Technical Lead
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Question Text & "Give Your Response" Area      */}
        {/* ============================================================ */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            minWidth: 0,
          }}
        >
          {/* Section 1: Question Box with live speech-synchronized reveal */}
          <div
            style={{
              backgroundColor: '#FAFAFC',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '18px 22px',
            }}
          >
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--accent-primary)',
                  backgroundColor: 'var(--accent-subtle)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--accent-border)',
                }}
              >
                Question {questionIndex + 1}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Listen and provide your answer
              </span>
            </div>

            <h2
              style={{
                fontSize: '1.2rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                lineHeight: 1.55,
                margin: 0,
                letterSpacing: '-0.01em',
                minHeight: '2.5em',
              }}
            >
              <span
                style={{
                  color: 'var(--accent-primary)',
                  fontWeight: 800,
                  fontSize: '1.3rem',
                  marginRight: '8px',
                  display: 'inline-block',
                }}
              >
                Q.
              </span>
              <span>"</span>
              {words.slice(0, revealedWordCount).map((word, idx) => (
                <span
                  key={`${idx}-${word}`}
                  style={{
                    display: 'inline-block',
                    marginRight: '0.28em',
                    animation: 'wordRevealFade 0.15s ease-out forwards',
                  }}
                >
                  {word}
                </span>
              ))}

              {/* Active typing cursor while interviewer is speaking */}
              {isSpeaking && revealedWordCount < words.length && (
                <span
                  style={{
                    display: 'inline-block',
                    width: '2px',
                    height: '1.1em',
                    backgroundColor: 'var(--accent-primary)',
                    marginLeft: '2px',
                    verticalAlign: 'text-bottom',
                    animation: 'cursorBlink 0.65s infinite',
                  }}
                />
              )}

              {/* Closing quote when complete */}
              {(revealedWordCount >= words.length || hasCompletedSpeech) && <span>"</span>}
            </h2>
          </div>

          {/* Section 2: Evaluating State or Response Interactive Area */}
          {evaluatingState ? (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div className="ai-orb-container" style={{ width: '48px', height: '48px' }}>
                <div className="ai-orb thinking" style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>
                  ✦
                </div>
              </div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                AI is analyzing your response...
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', margin: 0 }}>
                Evaluating technical accuracy, completeness, and structure
              </p>
            </div>
          ) : (
            /* Circular Voice Response Interactive Hub */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '28px 20px',
                backgroundColor: isListening ? '#FEF2F2' : 'var(--bg-subtle)',
                borderRadius: '24px',
                border: `1.5px solid ${isListening ? '#FECACA' : 'var(--border-subtle)'}`,
                gap: '16px',
                transition: 'all 0.25s ease',
                textAlign: 'center',
              }}
            >
              {/* Prominent Circular Microphone Button */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Active Ripple Wave Ring */}
                {isListening && (
                  <div
                    style={{
                      position: 'absolute',
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(220, 38, 38, 0.15)',
                      animation: 'orb-pulse 1.8s ease-in-out infinite',
                      pointerEvents: 'none',
                    }}
                  />
                )}

                <button
                  type="button"
                  onClick={onToggleRecording}
                  className="btn"
                  style={{
                    width: '88px',
                    height: '88px',
                    borderRadius: '50%',
                    padding: 0,
                    backgroundColor: isListening ? '#DC2626' : 'var(--accent-primary)',
                    backgroundImage: isListening
                      ? 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)'
                      : 'linear-gradient(135deg, var(--accent-primary) 0%, #6366F1 100%)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isListening
                      ? '0 0 0 8px rgba(220, 38, 38, 0.2), 0 10px 28px rgba(220, 38, 38, 0.35)'
                      : '0 0 0 8px rgba(79, 70, 229, 0.12), 0 8px 24px rgba(79, 70, 229, 0.3)',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    border: 'none',
                    zIndex: 2,
                  }}
                  title={isListening ? 'Click to finish speaking' : 'Click to give your response'}
                >
                  {isListening ? <MicOff size={36} /> : <Mic size={36} />}
                </button>
              </div>

              {/* Status & Subtitle directly below Circle */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div
                  style={{
                    fontSize: '1.0625rem',
                    fontWeight: 700,
                    color: isListening ? '#DC2626' : 'var(--text-primary)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {isListening ? 'Listening... Tap to Finish' : 'Give Your Response'}
                </div>

                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {isListening ? (
                    'Speaking active • Tap the circle when done'
                  ) : candidateAnswer.trim() ? (
                    <span style={{ color: '#16A34A', fontWeight: 600 }}>
                      ✓ Response recorded ({wordCount} words) • Ready to submit
                    </span>
                  ) : (
                    'Click the circle to start speaking your answer'
                  )}
                </div>

                {isListening && (
                  <div style={{ marginTop: '6px' }}>
                    <WaveVisualizer isActive={true} />
                  </div>
                )}
              </div>

              {/* Action Buttons: Clear & Submit */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '4px',
                  width: '100%',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                {candidateAnswer && (
                  <button
                    type="button"
                    onClick={onResetAnswer}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--text-muted)' }}
                    title="Clear current recorded answer"
                  >
                    <RefreshCw size={14} />
                    <span>Clear Answer</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onSubmitAnswer}
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{
                    padding: '10px 30px',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    opacity: isSubmitting ? 0.75 : 1,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <span>Submit Answer</span>
                      <Send size={15} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
