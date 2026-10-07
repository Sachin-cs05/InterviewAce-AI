import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Mic,
  Keyboard,
  Clock,
  Award,
} from 'lucide-react';
import { api } from '../services/api';

export const InterviewDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await api.getInterview(id);
        if (res.success && res.interview) {
          setInterview(res.interview);
        }
      } catch (err) {
        setError(err.message || 'Failed to load details');
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading question responses...</p>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div style={{ maxWidth: '480px', margin: '40px auto', textAlign: 'center' }}>
        <h2>Session Not Found</h2>
        <button onClick={() => navigate('/history')} className="btn btn-secondary" style={{ marginTop: '16px' }}>
          Back to History
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Breadcrumb Header */}
      <div>
        <Link to={`/interview/${id}/result`} className="btn btn-ghost btn-sm" style={{ marginBottom: '12px', paddingLeft: 0 }}>
          <ArrowLeft size={16} />
          <span>Back to Performance Report</span>
        </Link>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Question Breakdown & Feedback
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          {interview.jobRole} • {interview.interviewType} • {interview.questions.length} Total Questions
          {interview.customSkills ? ` • Focus Skills: ${interview.customSkills}` : ''}
        </p>
      </div>

      {/* Questions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {interview.questions.map((q, index) => {
          const evalData = q.evaluation || {};
          const score = evalData.score || 0;

          return (
            <div key={q._id || index} className="saas-card" style={{ padding: '28px' }}>
              {/* Question Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-primary">Question {index + 1}</span>
                  <span className="badge badge-default">{q.category}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {q.audioUsed ? (
                    <span className="badge badge-default" title="Voice Input Used">
                      <Mic size={12} /> Spoken
                    </span>
                  ) : (
                    <span className="badge badge-default" title="Typed Input">
                      <Keyboard size={12} /> Typed
                    </span>
                  )}
                  {score > 0 && (
                    <span
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: 700,
                        color: score >= 8 ? '#16A34A' : score >= 6 ? '#D97706' : '#DC2626',
                      }}
                    >
                      {score.toFixed(1)} / 10
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text */}
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', lineHeight: 1.45 }}>
                "{q.questionText}"
              </h2>

              {/* Candidate Submitted Answer */}
              <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '16px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Your Submitted Answer:
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {q.userAnswer || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No answer submitted.</span>}
                </p>
              </div>

              {/* AI Diagnostic Breakdown */}
              {evalData.positiveFeedback && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                  {/* Positive Feedback */}
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={16} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>Positive Feedback: </strong>
                      {evalData.positiveFeedback}
                    </div>
                  </div>

                  {/* Missing Points */}
                  {evalData.missingPoints && evalData.missingPoints.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <AlertTriangle size={16} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>Missing Concepts: </strong>
                        {evalData.missingPoints.join(' • ')}
                      </div>
                    </div>
                  )}

                  {/* Improvement Suggestion */}
                  {evalData.improvementSuggestion && (
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <Lightbulb size={16} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>Key Recommendation: </strong>
                        {evalData.improvementSuggestion}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
