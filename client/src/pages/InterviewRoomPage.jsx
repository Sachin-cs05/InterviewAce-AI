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
  ArrowLeft,
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
  const [inputMode, setInputMode] = useState('voice'); // 'voice' | 'text'
  const [hasRecordedVoice, setHasRecordedVoice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
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
    hasSpeechRecognition,
  } = useSpeech();

  const timerRef = useRef(null);
  const spokenQuestionRef = useRef(null);
  const handleTimeExpiredRef = useRef(null);
  const lastFullscreenExitRef = useRef(0);
  const lastVisibilityRef = useRef(0);

  // Auto-switch to text input if Speech Recognition is not supported by browser
  useEffect(() => {
    if (!hasSpeechRecognition) {
      setInputMode('text');
    }
  }, [hasSpeechRecognition]);

  // Load interview session
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await api.getInterview(id);
        if (res.success && res.interview) {
          setInterview(res.interview);
          const initialIdx = res.interview.currentQuestionIndex || 0;
          setCurrentIdx(initialIdx);

          if (typeof res.interview.violationCount === 'number') {
            setViolationCount(res.interview.violationCount);
          }

          if (res.interview.status === 'completed') {
            navigate(`/interview/${id}/result`);
          } else if (res.interview.status === 'in_progress' && res.interview.endTime) {
            // Re-entering active interview: calculate server-authoritative remaining time
            const now = Date.now();
            const endMs = new Date(res.interview.endTime).getTime();
            const diffSec = Math.max(0, Math.floor((endMs - now) / 1000));
            setRemainingSeconds(diffSec);
            if (diffSec <= 0) {
              handleTimeExpired();
            }
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

  // Proctoring Focus & Tab Activity Event Listeners
  useEffect(() => {
    if (!hasStartedInterview) return;

    const onFullscreenChange = () => {
      const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(isFull);
      if (!isFull) {
        const now = Date.now();
        // Prevent duplicate dual-fired event within 1.2 seconds
        if (now - lastFullscreenExitRef.current > 1200) {
          lastFullscreenExitRef.current = now;
          setShowFullscreenWarning(true);
          setViolationCount((prev) => prev + 1);
          api.recordViolation(id, { type: 'fullscreen_exit' }).catch((err) => {
            console.warn('Persist fullscreen violation error:', err);
          });
        }
      } else {
        setShowFullscreenWarning(false);
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        const now = Date.now();
        // Prevent duplicate rapid-fire event within 1.2 seconds
        if (now - lastVisibilityRef.current > 1200) {
          lastVisibilityRef.current = now;
          setViolationCount((prev) => prev + 1);
          toast.warning('⚠️ Proctoring Notice: Tab switch detected. Please stay on this tab during your interview.');
          api.recordViolation(id, { type: 'tab_switch' }).catch((err) => {
            console.warn('Persist tab switch violation error:', err);
          });
        }
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
  }, [hasStartedInterview, id, toast]);

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
      const finalAnswer = (candidateAnswer || transcript || '').trim();
      if (finalAnswer.length > 0) {
        await api.submitAnswer(id, {
          questionIndex: currentIdx,
          answerText: finalAnswer,
          audioUsed: Boolean(hasRecordedVoice && inputMode === 'voice'),
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

  useEffect(() => {
    handleTimeExpiredRef.current = handleTimeExpired;
  });

  // STABLE Countdown Timer: Dependent ONLY on hasStartedInterview, interview?.endTime, and isTimeUp
  useEffect(() => {
    if (!hasStartedInterview || !interview?.endTime || isTimeUp) return;

    const endTimeMs = new Date(interview.endTime).getTime();

    const checkCountdown = () => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((endTimeMs - now) / 1000));
      setRemainingSeconds(diffSec);

      if (diffSec <= 0) {
        if (handleTimeExpiredRef.current) {
          handleTimeExpiredRef.current();
        }
      }
    };

    checkCountdown();
    const interval = setInterval(checkCountdown, 1000);
    return () => clearInterval(interval);
  }, [hasStartedInterview, interview?.endTime, isTimeUp]);

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

  // Sync speech transcript with answer state and track voice usage accurately
  useEffect(() => {
    if (transcript && transcript.trim().length > 0) {
      setCandidateAnswer(transcript);
      setHasRecordedVoice(true);
    }
  }, [transcript]);

  // Reset voice flag when question advances
  useEffect(() => {
    setHasRecordedVoice(false);
  }, [currentIdx]);

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
    if (!hasSpeechRecognition) {
      toast.warning("Speech recognition is not supported in this browser. Please type your answer or use Chrome/Edge.");
      setInputMode('text');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      cancelSpeech();
      setHasRecordedVoice(true);
      setInputMode('voice');
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
    if (isSubmitting || isFinishing || timeUpSubmitting) return;

    if (isListening) {
      stopListening();
    }
    cancelSpeech();

    const finalAnswer = (candidateAnswer || transcript || '').trim();

    if (!finalAnswer) {
      toast.warning(inputMode === 'voice' && hasSpeechRecognition
        ? 'Please speak your response or click type to enter text before submitting.'
        : 'Please enter your response before submitting.');
      return;
    }

    const audioUsed = Boolean(hasRecordedVoice && inputMode === 'voice');

    setError('');
    setIsSubmitting(true);
    setEvaluatingState(true);

    try {
      const res = await api.submitAnswer(id, {
        questionIndex: currentIdx,
        answerText: finalAnswer,
        audioUsed,
        timeSpentSeconds: secondsElapsed,
      });

      if (res.success) {
        setTimeout(() => {
          setEvaluatingState(false);
          setIsSubmitting(false);
          resetTranscript();
          setCandidateAnswer('');
          setHasRecordedVoice(false);

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

  // Exit / Finish interview with ANSWER LOSS PREVENTION
  const handleFinishInterview = async () => {
    if (isFinishing || isSubmitting || timeUpSubmitting) return;

    if (isListening) {
      stopListening();
    }
    cancelSpeech();

    const unsavedAnswer = (candidateAnswer || transcript || '').trim();

    setIsFinishing(true);
    setError('');

    try {
      // 1. If an answer has been spoken/typed, first save it successfully
      if (unsavedAnswer.length > 0) {
        const audioUsed = Boolean(hasRecordedVoice && inputMode === 'voice');
        const res = await api.submitAnswer(id, {
          questionIndex: currentIdx,
          answerText: unsavedAnswer,
          audioUsed,
          timeSpentSeconds: secondsElapsed,
        });

        if (!res.success) {
          throw new Error(res.message || 'Failed to save final answer');
        }
      }

      // 2. Only after answer persistence succeeds, complete the interview
      const compRes = await api.completeInterview(id);
      if (compRes.success) {
        cleanupProctoringAndFullscreen();
        navigate(`/interview/${id}/result`);
      } else {
        throw new Error(compRes.message || 'Failed to complete interview session');
      }
    } catch (err) {
      console.error('Finish interview error:', err);
      toast.error(err.message || 'Failed to finish interview. Your answer is preserved. Please try again.');
      setError(err.message || 'Failed to finish interview. Your answer is preserved.');
      setIsFinishing(false);
      // DO NOT navigate, DO NOT clear candidateAnswer!
    }
  };

  const handleExitInterview = () => {
    if (window.confirm('Are you sure you want to exit this interview? Your previous answers remain saved, but any unsubmitted answer for the current question will be lost.')) {
      cleanupProctoringAndFullscreen();
      navigate('/dashboard');
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

  // Pre-Interview Setup Complete Handler (Starts the Interview on Server & Starts the Timer)
  const handleSetupComplete = async (stream) => {
    try {
      const res = await api.startInterview(id);
      if (res.success && res.interview) {
        setInterview(res.interview);
      }
    } catch (err) {
      console.warn('Start interview request:', err);
    }
    setProctorStream(stream);
    setHasStartedInterview(true);
    setIsFullscreen(true);
  };

  // Mandatory Pre-Interview Verification Screen
  if (!hasStartedInterview) {
    return (
      <ProctoringSetupModal
        onComplete={handleSetupComplete}
        interviewTitle={interview?.jobRole || interview?.title || 'Technical AI Interview'}
      />
    );
  }

  // Word count for candidate answer
  const wordCount = candidateAnswer.trim().split(/\s+/).filter(Boolean).length;

  // Time-based Progress Bar Calculation (% of session duration elapsed)
  const totalDurationSec = (interview?.duration || 30) * 60;
  const timeElapsedPercent = remainingSeconds !== null
    ? Math.min(100, Math.max(0, ((totalDurationSec - remainingSeconds) / totalDurationSec) * 100))
    : 0;

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
      {/* Background Soft Organic Waves */}
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

      <div className="interview-room-container">
        {/* ============================================================ */}
        {/* TOP BAR (OUTSIDE MAIN CARD): Exit Interview (Left) & Timer (Right) */}
        {/* ============================================================ */}
        <div className="interview-room-topbar">
          <button
            type="button"
            onClick={handleExitInterview}
            className="interview-exit-btn"
            title="Exit interview and return to dashboard"
            aria-label="Exit interview"
          >
            <ArrowLeft size={16} />
            <span>Exit Interview</span>
          </button>

          <div
            className="interview-timer-badge"
            style={{
              backgroundColor: timerBg,
              borderColor: timerBorder,
              color: timerColor,
            }}
            title="Remaining interview duration"
          >
            <Clock size={16} color={timerColor} />
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatCountdown(remainingSeconds)} remaining
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MAIN DOMINANT INTERVIEW CARD                                  */}
        {/* ============================================================ */}
        <div className="exact-interview-card">
          <div className="exact-interview-grid">
            {/* ---------------------------------------------------------- */}
            {/* LEFT COLUMN: AI Avatar, Waveform & Meta                    */}
            {/* ---------------------------------------------------------- */}
            <div className="exact-avatar-wrapper">
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

              {/* Symmetrical Soundwave Indicator under Avatar */}
              <div
                className="exact-soundwave-container"
                title={isSpeaking ? 'Click to pause audio narration' : 'Click to hear question audio'}
                onClick={() => {
                  if (isSpeaking) {
                    cancelSpeech();
                  } else if (currentQuestion?.questionText) {
                    speak(currentQuestion.questionText);
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    if (isSpeaking) cancelSpeech();
                    else if (currentQuestion?.questionText) speak(currentQuestion.questionText);
                  }
                }}
                aria-label="Soundwave audio toggle"
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
              <h3 className="interview-avatar-name">
                Alex (AI Interviewer)
              </h3>
              <p className="interview-avatar-role">
                Senior Technical Lead
              </p>

              {/* Round Pill Badge */}
              <span className="interview-round-badge">
                {interview?.interviewType ? `${interview.interviewType} Round` : 'Technical Round'}
              </span>
            </div>

            {/* ---------------------------------------------------------- */}
            {/* RIGHT COLUMN: Question & Response Stage                    */}
            {/* ---------------------------------------------------------- */}
            <div className="interview-right-column">
              {/* Question Header: Question Label + Category + Listen Control */}
              <div className="interview-question-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="interview-question-label">
                    QUESTION {currentIdx + 1}
                  </span>

                  {currentQuestion?.category && (
                    <span className="interview-category-tag">
                      {currentQuestion.category}
                    </span>
                  )}
                </div>

                {/* Listen to Question Control */}
                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) {
                      cancelSpeech();
                    } else if (currentQuestion?.questionText) {
                      speak(currentQuestion.questionText);
                    }
                  }}
                  className="interview-listen-btn"
                  title={isSpeaking ? 'Pause question audio' : 'Listen to question audio'}
                  aria-label={isSpeaking ? 'Pause question audio' : 'Listen to question audio'}
                >
                  {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  <span>{isSpeaking ? 'Pause Audio' : 'Listen to Question'}</span>
                </button>
              </div>

              {/* Time Progress Bar */}
              <div
                className="interview-progress-bar-track"
                title={`Time Progress: ${Math.round(timeElapsedPercent)}% elapsed`}
              >
                <div
                  className="interview-progress-bar-fill"
                  style={{ width: `${timeElapsedPercent}%` }}
                />
              </div>

              {/* Question Box */}
              <div className="interview-question-box">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span className="interview-question-q">Q.</span>
                  <p className="interview-question-text">
                    {currentQuestion?.questionText || 'Loading question...'}
                  </p>
                </div>

                <div className="interview-question-hint">
                  <span>💡</span>
                  <span>Take your time. Speak clearly. Aim for 1–2 minutes.</span>
                </div>
              </div>

              {/* Candidate Response Interaction Stage */}
              <div className="interview-response-stage">
                {/* Microphone Circle with glowing halo */}
                <div className={`exact-mic-halo ${isListening ? 'listening' : ''}`}>
                  <button
                    type="button"
                    onClick={toggleRecording}
                    disabled={!hasSpeechRecognition}
                    className="exact-mic-btn"
                    title={
                      !hasSpeechRecognition
                        ? "Speech recognition isn't supported in this browser. Please type your response below."
                        : isListening
                        ? 'Stop recording'
                        : 'Click to start speaking your answer'
                    }
                    aria-label={isListening ? 'Stop recording voice answer' : 'Start recording voice answer'}
                    style={{
                      background: !hasSpeechRecognition
                        ? '#CBD5E1'
                        : isListening
                        ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                        : 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
                      cursor: !hasSpeechRecognition ? 'not-allowed' : 'pointer',
                      opacity: !hasSpeechRecognition ? 0.7 : 1,
                    }}
                  >
                    {isListening ? (
                      <MicOff size={28} />
                    ) : (
                      <Mic size={28} color={!hasSpeechRecognition ? '#64748B' : '#FFFFFF'} />
                    )}
                  </button>
                </div>

                {/* Response Title & Helper */}
                <div>
                  <h4
                    style={{
                      fontSize: '1.0625rem',
                      fontWeight: 700,
                      color: !hasSpeechRecognition ? '#475569' : isListening ? '#DC2626' : '#1E293B',
                      margin: 0,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {!hasSpeechRecognition
                      ? 'Speech Recognition Unavailable'
                      : isListening
                      ? 'Listening to your response...'
                      : 'Give Your Response'}
                  </h4>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: '#94A3B8',
                      margin: '4px 0 0 0',
                    }}
                  >
                    {!hasSpeechRecognition
                      ? "Speech recognition isn't supported in this browser. Please type your answer below."
                      : isListening
                      ? 'Speak clearly • Click the circle when finished'
                      : candidateAnswer.trim()
                      ? `Response recorded (${wordCount} words) • Ready to submit`
                      : 'Click the circle to start speaking your answer'}
                  </p>
                </div>

                {/* Textarea Fallback (when typing mode selected or voice unavailable) */}
                {(!hasSpeechRecognition || inputMode === 'text') && (
                  <div style={{ width: '100%', maxWidth: '480px', textAlign: 'left' }}>
                    <textarea
                      value={candidateAnswer}
                      onChange={(e) => {
                        setCandidateAnswer(e.target.value);
                        if (hasRecordedVoice) {
                          setHasRecordedVoice(false);
                        }
                      }}
                      placeholder="Type your response here..."
                      rows={3}
                      className="interview-answer-textarea"
                      aria-label="Written response text"
                    />
                  </div>
                )}

                {/* Voice / Text Mode Toggle */}
                {hasSpeechRecognition && (
                  <button
                    type="button"
                    onClick={() => {
                      if (isListening) stopListening();
                      setInputMode(inputMode === 'voice' ? 'text' : 'voice');
                    }}
                    className="interview-mode-toggle"
                  >
                    {inputMode === 'voice' ? 'Switch to typing response' : 'Switch to voice response'}
                  </button>
                )}

                {/* Spoken Transcript Preview */}
                {hasSpeechRecognition && inputMode === 'voice' && candidateAnswer.trim().length > 0 && (
                  <div className="interview-transcript-preview">
                    <div style={{ flex: 1, minWidth: 0, fontStyle: 'italic', wordBreak: 'break-word' }}>
                      "{candidateAnswer.trim()}"
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        resetTranscript();
                        setCandidateAnswer('');
                        setHasRecordedVoice(false);
                      }}
                      className="btn btn-ghost"
                      style={{ padding: '2px 6px', fontSize: '0.6875rem', color: '#94A3B8', flexShrink: 0 }}
                      title="Clear answer and re-record"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {/* Submit Answer Button */}
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
          <div className="interview-card-bottom-row">
            <span className="interview-recorded-note">
              <span>🔒</span>
              <span>Your session is recorded for evaluation.</span>
            </span>

            <button
              type="button"
              disabled={isFinishing || timeUpSubmitting}
              onClick={() => {
                if (isFinishing || timeUpSubmitting) return;
                if (window.confirm('Are you sure you want to finish this interview? Your answers will be submitted for evaluation.')) {
                  handleFinishInterview();
                }
              }}
              className="exact-finish-btn"
              style={{ opacity: isFinishing ? 0.7 : 1, cursor: isFinishing ? 'not-allowed' : 'pointer' }}
              title="Complete and finish interview"
              aria-label="Finish interview"
            >
              <Square size={11} fill="#FFFFFF" stroke="none" />
              <span>{isFinishing ? 'Finishing...' : 'Finish Interview'}</span>
            </button>
          </div>
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
