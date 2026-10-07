import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Clock,
  Send,
  AlertCircle,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { api } from '../services/api';
import { useSpeech } from '../hooks/useSpeech';
import { useToast } from '../context/ToastContext';
import { ProctoringSetupModal } from '../components/interview/ProctoringSetupModal';
import { ProctoringWebcamTile } from '../components/interview/ProctoringWebcamTile';
import { FullscreenWarningModal } from '../components/interview/FullscreenWarningModal';

// Symmetrical vertical soundwave bars matching the reference design
const SOUNDWAVE_BARS = [
  { staticHeight: 5, activeHeight: 14 },
  { staticHeight: 9, activeHeight: 20 },
  { staticHeight: 15, activeHeight: 25 },
  { staticHeight: 21, activeHeight: 12 },
  { staticHeight: 13, activeHeight: 24 },
  { staticHeight: 23, activeHeight: 16 },
  { staticHeight: 15, activeHeight: 27 },
  { staticHeight: 25, activeHeight: 18 },
  { staticHeight: 15, activeHeight: 27 },
  { staticHeight: 23, activeHeight: 16 },
  { staticHeight: 13, activeHeight: 24 },
  { staticHeight: 21, activeHeight: 12 },
  { staticHeight: 15, activeHeight: 25 },
  { staticHeight: 9, activeHeight: 20 },
  { staticHeight: 5, activeHeight: 14 },
];

export const InterviewRoomPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [interview, setInterview] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluatingState, setEvaluatingState] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [timeUpSubmitting, setTimeUpSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Lipsync frame state: 'rest' | 'mid' | 'open'
  const [currentFrame, setCurrentFrame] = useState('rest');

  // Proctoring & Anti-Cheating States
  const [hasStartedInterview, setHasStartedInterview] = useState(false);
  const [proctorStream, setProctorStream] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [violationCount, setViolationCount] = useState(0);

  const {
    isSpeaking,
    spokenCharIndex,
    speak,
    cancelSpeech,
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeech();

  const timerRef = useRef(null);
  const spokenQuestionRef = useRef(null);

  // Load interview session
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await api.getInterview(id);
        if (res.success && res.interview) {
          setInterview(res.interview);
          const initialIdx = res.interview.currentQuestionIndex || 0;
          setCurrentIdx(initialIdx);

          if (res.interview.status === 'completed') {
            navigate(`/interview/${id}/result`);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load interview session');
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [id, navigate]);

  // Preload lipsync frames
  useEffect(() => {
    ['/avatar-rest.jpg', '/avatar-talk-mid.jpg', '/avatar-talk-open.jpg'].forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  // Natural speech cadence & mouth articulation rhythm (zero flicker)
  useEffect(() => {
    if (!isSpeaking) {
      setCurrentFrame('rest');
      return;
    }

    const rhythm = ['mid', 'open', 'mid', 'rest', 'mid', 'open', 'open', 'mid', 'rest', 'mid', 'open', 'mid'];
    let step = 0;

    const interval = setInterval(() => {
      step = (step + 1) % rhythm.length;
      setCurrentFrame(rhythm[step]);
    }, 130);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  const cleanupProctoringAndFullscreen = () => {
    cancelSpeech();
    stopListening();
    if (proctorStream) {
      proctorStream.getTracks().forEach((track) => track.stop());
    }
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupProctoringAndFullscreen();
    };
  }, [proctorStream]);

  // Anti-Cheating Event Listeners: Fullscreen Exit & Tab Switching
  useEffect(() => {
    if (!hasStartedInterview) return;

    const onFullscreenChange = () => {
      const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(isFull);
      if (!isFull) {
        setShowFullscreenWarning(true);
        setViolationCount((prev) => prev + 1);
      } else {
        setShowFullscreenWarning(false);
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        setViolationCount((prev) => prev + 1);
        toast.warning('⚠️ Anti-Cheat Alert: Tab switch detected! Stay on this tab to avoid disqualification.');
      }
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [hasStartedInterview, toast]);

  const handleReEnterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
      }
      setShowFullscreenWarning(false);
    } catch (err) {
      console.warn('Re-entering fullscreen failed:', err);
      setShowFullscreenWarning(false);
    }
  };

  // Handle interview time expiration
  const handleTimeExpired = async () => {
    if (isTimeUp || timeUpSubmitting) return;
    setIsTimeUp(true);
    setTimeUpSubmitting(true);
    cleanupProctoringAndFullscreen();

    try {
      if (candidateAnswer && candidateAnswer.trim().length > 0) {
        await api.submitAnswer(id, {
          questionIndex: currentIdx,
          answerText: candidateAnswer.trim(),
          audioUsed: true,
          timeSpentSeconds: secondsElapsed,
        });
      } else {
        await api.completeInterview(id);
      }
    } catch (e) {
      console.warn('Expiration completion call:', e);
      try {
        await api.completeInterview(id);
      } catch (err) {
        // proceed
      }
    } finally {
      setTimeout(() => {
        navigate(`/interview/${id}/result`);
      }, 1500);
    }
  };

  // Countdown Timer
  useEffect(() => {
    if (!interview || interview.status === 'completed' || isTimeUp || !hasStartedInterview) return;

    const durationMins = interview.duration || 30;
    const endTimeMs = interview.endTime
      ? new Date(interview.endTime).getTime()
      : new Date(interview.startTime || interview.createdAt).getTime() + durationMins * 60 * 1000;

    const checkCountdown = () => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((endTimeMs - now) / 1000));
      setRemainingSeconds(diffSec);

      if (diffSec <= 0) {
        handleTimeExpired();
      }
    };

    checkCountdown();
    const interval = setInterval(checkCountdown, 1000);
    return () => clearInterval(interval);
  }, [interview, isTimeUp, candidateAnswer, currentIdx, secondsElapsed, hasStartedInterview]);

  // Update document.title to "Interview in progress – MM:SS"
  useEffect(() => {
    if (hasStartedInterview && remainingSeconds !== null) {
      const formatted = formatCountdown(remainingSeconds);
      document.title = `Interview in progress – ${formatted}`;
    }
    return () => {
      document.title = 'InterviewAce AI';
    };
  }, [hasStartedInterview, remainingSeconds]);

  // Per-question elapsed timer (for analytics)
  useEffect(() => {
    if (!hasStartedInterview) return;
    setSecondsElapsed(0);
    timerRef.current = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIdx, hasStartedInterview]);

  // Sync speech transcript with answer state
  useEffect(() => {
    if (transcript) {
      setCandidateAnswer(transcript);
    }
  }, [transcript]);

  // Auto-speak question on new index
  const currentQuestion = interview?.questions?.[currentIdx];

  useEffect(() => {
    if (!hasStartedInterview) return;

    if (currentQuestion?.questionText && spokenQuestionRef.current !== currentIdx) {
      spokenQuestionRef.current = currentIdx;
      const timer = setTimeout(() => {
        speak(currentQuestion.questionText);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentIdx, currentQuestion?.questionText, speak, hasStartedInterview]);

  const toggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      cancelSpeech();
      startListening();
    }
  };

  const formatCountdown = (totalSec) => {
    if (totalSec === null || totalSec === undefined) return '30:00';
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmitAnswer = async () => {
    if (isListening) {
      stopListening();
    }
    cancelSpeech();

    const finalAnswer = (candidateAnswer || transcript || '').trim();

    if (!finalAnswer) {
      toast.warning('Please click the microphone circle and speak your response before submitting.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    setEvaluatingState(true);

    try {
      const res = await api.submitAnswer(id, {
        questionIndex: currentIdx,
        answerText: finalAnswer,
        audioUsed: true,
        timeSpentSeconds: secondsElapsed,
      });

      if (res.success) {
        setTimeout(() => {
          setEvaluatingState(false);
          setIsSubmitting(false);
          resetTranscript();
          setCandidateAnswer('');

          if (res.isCompleted) {
            cleanupProctoringAndFullscreen();
            navigate(`/interview/${id}/result`);
          } else {
            if (res.interview) setInterview(res.interview);
            setCurrentIdx(res.nextQuestionIndex);
          }
        }, 1000);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit answer. Please try again.');
      setError(err.message || 'Failed to submit answer');
      setIsSubmitting(false);
      setEvaluatingState(false);
    }
  };

  // Exit / Finish interview manually
  const handleFinishInterview = async () => {
    cleanupProctoringAndFullscreen();
    try {
      if (candidateAnswer && candidateAnswer.trim().length > 0) {
        await api.submitAnswer(id, {
          questionIndex: currentIdx,
          answerText: candidateAnswer.trim(),
          audioUsed: true,
          timeSpentSeconds: secondsElapsed,
        });
      }
      await api.completeInterview(id);
    } catch (err) {
      console.warn('Finish interview completion:', err);
    } finally {
      navigate(`/interview/${id}/result`);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', backgroundColor: '#F8FAFC' }}>
        <div className="ai-orb-container">
          <div className="ai-orb thinking">✦</div>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Entering Interview Room...
        </p>
      </div>
    );
  }

  if (error && !interview) {
    return (
      <div style={{ maxWidth: '480px', margin: '80px auto', textAlign: 'center', padding: '24px' }}>
        <AlertCircle size={36} color="var(--danger-text)" style={{ marginBottom: '12px' }} />
        <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Session Unavailable</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>{error}</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Mandatory Pre-Interview Verification Screen
  if (!hasStartedInterview) {
    return (
      <ProctoringSetupModal
        onComplete={(stream) => {
          setProctorStream(stream);
          setHasStartedInterview(true);
          setIsFullscreen(true);
        }}
        interviewTitle={interview?.jobRole || interview?.title || 'Technical AI Interview'}
      />
    );
  }

  // Word count for candidate answer
  const wordCount = candidateAnswer.trim().split(/\s+/).filter(Boolean).length;
  const totalQuestions = interview?.questions?.length || 5;

  // Timer color states: normal, under 5 minutes amber/orange, under 1 minute red
  const under5Min = remainingSeconds !== null && remainingSeconds <= 300 && remainingSeconds > 60;
  const under1Min = remainingSeconds !== null && remainingSeconds <= 60;

  let timerColor = '#475569';
  let timerBg = '#F1F5F9';
  let timerBorder = '#E2E8F0';

  if (under1Min) {
    timerColor = '#DC2626';
    timerBg = '#FEF2F2';
    timerBorder = '#FECACA';
  } else if (under5Min) {
    timerColor = '#D97706';
    timerBg = '#FFFBEB';
    timerBorder = '#FDE68A';
  }

  return (
    <div className="exact-interview-screen">
      {/* Background Soft Organic Waves (matching presentation aesthetic) */}
      <svg
        className="exact-interview-bg-wave-svg"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-80 180 C 280 80, 580 440, 1080 240 C 1280 160, 1480 210, 1580 290"
          stroke="rgba(224, 231, 255, 0.45)"
          strokeWidth="110"
          strokeLinecap="round"
        />
        <path
          d="M180 860 C 580 660, 930 830, 1480 610"
          stroke="rgba(238, 242, 255, 0.65)"
          strokeWidth="150"
          strokeLinecap="round"
        />
      </svg>

      {/* Main Single Elevated White Card */}
      <div className="exact-interview-card">
        <div className="exact-interview-grid">
          {/* ============================================================ */}
          {/* LEFT COLUMN: 3D AI Interviewer Avatar, Waveform & Meta      */}
          {/* ============================================================ */}
          <div className="exact-avatar-wrapper">
            {/* Full unclipped 3D AI Interviewer Avatar */}
            <div
              className={`exact-avatar-stage ${isSpeaking ? 'speaking' : ''}`}
              title={isSpeaking ? 'Alex is speaking...' : 'Alex (AI Interviewer)'}
            >
              <img
                src="/avatar-alex-full.jpg"
                alt="Alex (AI Interviewer)"
                className="exact-avatar-full-img"
              />
            </div>

            {/* Symmetrical Purple Soundwave Indicator under Avatar */}
            <div
              className="exact-soundwave-container"
              title={isSpeaking ? 'AI Speaking question...' : 'Audio Ready'}
              onClick={() => {
                if (isSpeaking) {
                  cancelSpeech();
                } else if (currentQuestion?.questionText) {
                  speak(currentQuestion.questionText);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              {SOUNDWAVE_BARS.map((bar, idx) => (
                <div
                  key={idx}
                  className="exact-soundwave-bar"
                  style={{
                    height: isSpeaking ? `${bar.activeHeight}px` : `${bar.staticHeight}px`,
                    animation: isSpeaking ? 'exactWaveBounce 0.9s ease-in-out infinite alternate' : 'none',
                    animationDelay: `${idx * 0.06}s`,
                  }}
                />
              ))}
            </div>

            {/* AI Interviewer Name & Title */}
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#1E293B',
                marginTop: '12px',
                marginBottom: '2px',
                letterSpacing: '-0.01em',
              }}
            >
              Alex (AI Interviewer)
            </h3>
            <p
              style={{
                fontSize: '0.875rem',
                color: '#94A3B8',
                fontWeight: 500,
                margin: 0,
              }}
            >
              Senior Technical Lead
            </p>

            {/* Round Pill Badge */}
            <span
              style={{
                marginTop: '12px',
                padding: '5px 18px',
                borderRadius: '9999px',
                backgroundColor: '#EEF2FF',
                color: '#6366F1',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.01em',
                display: 'inline-block',
              }}
            >
              {interview?.interviewType ? `${interview.interviewType} Round` : 'Technical Round'}
            </span>
          </div>

          {/* ============================================================ */}
          {/* RIGHT COLUMN: Question & Response Stage                      */}
          {/* ============================================================ */}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
            {/* Header: Question Progress & Category (Left) & Timer Badge (Right) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                marginBottom: '10px',
              }}
            >
              {/* Question X of N badge + Optional Category tag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    padding: '5px 16px',
                    borderRadius: '9999px',
                    backgroundColor: '#EEF2FF',
                    color: '#6366F1',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                  }}
                >
                  Question {currentIdx + 1} of {totalQuestions}
                </span>

                {currentQuestion?.category && (
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      backgroundColor: '#F8FAFC',
                      color: '#475569',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    {currentQuestion.category}
                  </span>
                )}
              </div>

              {/* Timer badge with dynamic orange / red warning states */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 16px',
                  borderRadius: '12px',
                  backgroundColor: timerBg,
                  border: `1px solid ${timerBorder}`,
                  color: timerColor,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                }}
              >
                <Clock size={16} color={timerColor} />
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatCountdown(remainingSeconds)} remaining
                </span>
              </div>
            </div>

            {/* Thin Question Progress Bar below Header Row */}
            <div
              style={{
                width: '100%',
                height: '3.5px',
                backgroundColor: '#EEF2FF',
                borderRadius: '9999px',
                overflow: 'hidden',
                marginBottom: '18px',
              }}
              title={`Progress: Question ${currentIdx + 1} of ${totalQuestions}`}
            >
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, ((currentIdx + 1) / totalQuestions) * 100))}%`,
                  height: '100%',
                  backgroundColor: '#6366F1',
                  borderRadius: '9999px',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>

            {/* Question Box */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #EEF2F6',
                borderRadius: '18px',
                padding: '24px 28px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span
                  style={{
                    color: '#6366F1',
                    fontWeight: 800,
                    fontSize: '1.35rem',
                    lineHeight: 1.5,
                    flexShrink: 0,
                  }}
                >
                  Q.
                </span>
                <p
                  style={{
                    color: '#1E293B',
                    fontWeight: 600,
                    fontSize: '1.125rem',
                    lineHeight: 1.6,
                    margin: 0,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {currentQuestion?.questionText || 'Loading question...'}
                </p>
              </div>

              {/* Small Hint Line under Question */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  paddingTop: '10px',
                  borderTop: '1px dashed #E2E8F0',
                  fontSize: '0.8125rem',
                  color: '#94A3B8',
                }}
              >
                <span>💡</span>
                <span>Take your time. Speak clearly. Aim for 1–2 minutes.</span>
              </div>
            </div>

            {/* Response Interaction Box */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #F1F5F9',
                borderRadius: '22px',
                padding: '42px 32px 34px 32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: '16px',
                flex: 1,
              }}
            >
              {/* Microphone Circle with glowing outer halo */}
              <div className={`exact-mic-halo ${isListening ? 'listening' : ''}`}>
                <button
                  type="button"
                  onClick={toggleRecording}
                  className="exact-mic-btn"
                  title={isListening ? 'Stop recording' : 'Click to start speaking your answer'}
                  style={{
                    background: isListening
                      ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                      : 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
                  }}
                >
                  {isListening ? <MicOff size={30} /> : <Mic size={30} />}
                </button>
              </div>

              {/* Title & Helper Text */}
              <div>
                <h4
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: isListening ? '#DC2626' : '#1E293B',
                    margin: 0,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {isListening ? 'Listening to your response...' : 'Give Your Response'}
                </h4>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#94A3B8',
                    margin: '4px 0 0 0',
                  }}
                >
                  {isListening
                    ? 'Speak clearly • Click the circle when finished'
                    : candidateAnswer.trim()
                    ? `Response recorded (${wordCount} words) • Ready to submit`
                    : 'Click the circle to start speaking your answer'}
                </p>
              </div>

              {/* Transcript Preview (if candidate has spoken) */}
              {candidateAnswer.trim().length > 0 && (
                <div
                  style={{
                    maxWidth: '480px',
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.8125rem',
                    color: '#334155',
                    textAlign: 'left',
                    maxHeight: '75px',
                    overflowY: 'auto',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, fontStyle: 'italic', wordBreak: 'break-word' }}>
                    "{candidateAnswer.trim()}"
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      resetTranscript();
                      setCandidateAnswer('');
                    }}
                    className="btn btn-ghost"
                    style={{ padding: '2px 4px', fontSize: '0.6875rem', color: '#94A3B8', flexShrink: 0 }}
                    title="Clear answer and re-record"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Submit Answer Button with paper airplane */}
              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={isSubmitting}
                className={`exact-submit-btn ${candidateAnswer.trim() ? 'has-answer' : ''}`}
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
        </div>

        {/* ============================================================ */}
        {/* BOTTOM ROW: Footer Note + Red "Finish Interview" button      */}
        {/* ============================================================ */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '6px',
            width: '100%',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <span
            style={{
              fontSize: '0.8125rem',
              color: '#94A3B8',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>🔒</span>
            <span>Your session is recorded for evaluation.</span>
          </span>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to finish this interview? Your answers will be submitted for evaluation.')) {
                handleFinishInterview();
              }
            }}
            className="exact-finish-btn"
          >
            <Square size={11} fill="#FFFFFF" stroke="none" />
            <span>Finish Interview</span>
          </button>
        </div>
      </div>

      {/* Floating Candidate Live Webcam PiP Tile */}
      {hasStartedInterview && (
        <ProctoringWebcamTile
          stream={proctorStream}
          violationCount={violationCount}
        />
      )}

      {/* Fullscreen Violation Alert Modal */}
      {hasStartedInterview && showFullscreenWarning && (
        <FullscreenWarningModal
          onReEnterFullscreen={handleReEnterFullscreen}
          violationCount={violationCount}
        />
      )}
    </div>
  );
};
