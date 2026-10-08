import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  ListFilter,
  Share2,
  Award,
  Clock,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { ScoreRadial } from '../components/common/ScoreRadial';

export const InterviewResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.getFinalReport(id);
        if (res.success) {
          setInterview(res.interview);
          setReport(res.report || res.interview.finalReport);

          // Confetti celebration if high score
          if ((res.report?.overallScore || 0) >= 7.5) {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 },
            });
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load interview results');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div className="ai-orb-container">
          <div className="ai-orb thinking">✦</div>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Generating Comprehensive Evaluation Report...
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div style={{ maxWidth: '480px', margin: '60px auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Report Unavailable</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>{error || 'No report found.'}</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const overall = report.overallScore || 0;
  let statusBadge = { label: 'Strong Hire', class: 'badge-success' };
  if (overall < 6) {
    statusBadge = { label: 'Needs Practice', class: 'badge-warning' };
  } else if (overall < 8) {
    statusBadge = { label: 'Promising Candidate', class: 'badge-primary' };
  }

  const categoryScores = [
    { name: 'Technical Knowledge', score: report.technicalAccuracy || overall, desc: 'Concept accuracy and framework mechanics' },
    { name: 'Answer Relevance', score: report.answerRelevance || overall, desc: 'Focus and addressing prompt constraints' },
    { name: 'Communication Clarity', score: report.communicationClarity || overall, desc: 'Structure, vocabulary, and articulation' },
    { name: 'Problem Solving', score: report.problemSolving || overall, desc: 'Trade-off analysis and architecture flow' },
  ];

  const answeredQuestionsCount =
    interview?.answeredQuestionCount ??
    (interview?.questions?.filter((q) => q.userAnswer && q.userAnswer.trim().length > 0)?.length || 0);

  const generatedQuestionsCount =
    interview?.generatedQuestionCount ??
    (interview?.questions?.length || 0);

  const violationCount = interview?.violationCount || 0;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Top Header Card */}
      <div
        className="saas-card"
        style={{
          padding: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div style={{ maxWidth: '580px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className={`badge ${statusBadge.class}`} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              <Award size={14} /> {statusBadge.label}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Completed on {new Date(interview?.completedAt || interview?.updatedAt).toLocaleDateString()}
            </span>
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Performance Evaluation: {interview?.jobRole}
          </h1>

          {interview?.customSkills && (
            <div style={{ marginBottom: '8px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>Focus Skills: </span>
              <span>{interview.customSkills}</span>
            </div>
          )}

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.5 }}>
            {report.summary || 'Your turn-by-turn answers have been evaluated against technical depth, communication structure, and relevance.'}
          </p>
        </div>

        {/* Big Overall Radial Meter */}
        <div style={{ padding: '8px' }}>
          <ScoreRadial score={overall} size={130} strokeWidth={11} label="Overall Score" />
        </div>
      </div>

      {/* Key Interview Statistics Bar */}
      <div
        className="saas-card"
        style={{
          padding: '20px 28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Interview Duration
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} style={{ color: 'var(--accent-primary)' }} />
            <span>{interview?.duration || 30} minutes</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Questions Answered
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} style={{ color: 'var(--accent-primary)' }} />
            <span>{answeredQuestionsCount} of {generatedQuestionsCount}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Overall Score
          </span>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: overall >= 7.5 ? '#16A34A' : overall >= 6 ? 'var(--accent-primary)' : '#D97706',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Award size={18} />
            <span>{Math.round(overall > 10 ? overall : overall * 10)}/100</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Proctoring Notices
          </span>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: violationCount > 0 ? '#D97706' : '#16A34A',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ShieldCheck size={18} />
            <span>{violationCount} recorded</span>
          </div>
        </div>
      </div>

      {/* Category Scores Breakdown */}
      <div className="saas-card" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Evaluation Rubric Breakdown
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Standardized 10-point scoring across core engineering dimensions
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
          {categoryScores.map((cat) => {
            const scoreVal = Number(cat.score).toFixed(1);
            const percent = Math.min(100, Math.max(0, cat.score * 10));
            return (
              <div
                key={cat.name}
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {cat.name}
                  </span>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                    {scoreVal}
                  </span>
                </div>

                {/* Progress bar meter */}
                <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--border-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${percent}%`,
                      height: '100%',
                      backgroundColor: 'var(--accent-primary)',
                      borderRadius: '999px',
                    }}
                  />
                </div>

                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                  {cat.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths & Weaknesses 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Key Strengths */}
        <div className="saas-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Demonstrated Strengths
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(report.strengths || ['Good engagement with core concepts']).map((str, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                <span style={{ color: '#16A34A', fontWeight: 700 }}>•</span>
                <span>{str}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Areas to Improve */}
        <div className="saas-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={16} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Areas to Improve
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(report.areasToImprove || ['Deepen coverage of trade-offs and edge cases']).map((area, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                <span style={{ color: '#D97706', fontWeight: 700 }}>•</span>
                <span>{area}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="saas-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lightbulb size={16} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Personalized AI Action Recommendations
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(report.recommendations || []).map((rec, idx) => (
            <div
              key={idx}
              style={{
                padding: '12px 16px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.45,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              <span className="badge badge-primary" style={{ padding: '2px 6px', fontSize: '0.6875rem' }}>
                Tip {idx + 1}
              </span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action CTAs */}
      <div
        className="saas-card"
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Link to={`/history/${id}`} className="btn btn-secondary">
          <ListFilter size={16} />
          <span>Inspect Question-by-Question Details</span>
        </Link>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/interview/new" className="btn btn-primary">
            <RotateCcw size={16} />
            <span>Try Another Interview</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
