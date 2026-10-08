import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  BarChart2,
  Award,
  Clock,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  FileQuestion,
  Lightbulb,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalInterviews: 0,
    completedCount: 0,
    averageScore: 0,
    bestScore: 0,
    recentInterviews: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.getDashboardStats();
        if (res.success && res.stats) {
          setStats(res.stats);
        }
      } catch (err) {
        console.warn('Failed to load stats:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getScoreBadge = (score) => {
    // Score can be on 1-10 scale or 1-100 scale
    const normalized = score > 10 ? score : score * 10;
    if (normalized >= 80) {
      return <span className="badge badge-success">{normalized.toFixed(0)}/100 • Strong</span>;
    }
    if (normalized >= 60) {
      return <span className="badge badge-warning">{normalized.toFixed(0)}/100 • Developing</span>;
    }
    if (normalized > 0) {
      return <span className="badge badge-default" style={{ color: 'var(--danger-text)', borderColor: 'var(--danger-border)', backgroundColor: 'var(--danger-bg)' }}>{normalized.toFixed(0)}/100</span>;
    }
    return <span className="badge badge-default">In Progress</span>;
  };

  // Extract completed interviews with scores for the performance chart
  const completedInterviews = stats.recentInterviews
    .filter((i) => i.score > 0)
    .map((item, index) => ({
      index: index + 1,
      role: item.jobRole,
      score: item.score > 10 ? Math.round(item.score) : Math.round(item.score * 10),
      date: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }))
    .reverse(); // chronological order

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* 1. Welcome Card */}
      <div
        className="saas-card"
        style={{
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          background: 'linear-gradient(to right, #FFFFFF, #FBFBFE)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Candidate Dashboard
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.name?.split(' ')[0] || 'Sachin'} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '620px', lineHeight: 1.5 }}>
            {stats.totalInterviews === 0
              ? 'Start your first mock interview and get personalized AI feedback.'
              : 'Keep practicing to improve your interview performance.'}
          </p>
        </div>

        <Link to="/interview/new" className="btn btn-primary btn-lg btn-hover-arrow">
          <Sparkles size={18} />
          <span>Start New Interview</span>
          <ArrowRight size={16} className="btn-arrow-icon" />
        </Link>
      </div>

      {/* 2. Statistics Grid (with loading skeletons) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {/* Card 1: Total Interviews */}
        <div className="saas-card card-interactive" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Interviews</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileQuestion size={18} />
              </div>
            </div>
            {loading ? (
              <div className="skeleton" style={{ height: '36px', width: '60px', marginBottom: '8px' }} />
            ) : (
              <div style={{ fontSize: '2.125rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>
                {stats.totalInterviews}
              </div>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>
            {stats.completedCount} completed sessions
          </div>
        </div>

        {/* Card 2: Average Score */}
        <div className="saas-card card-interactive" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Average Score</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart2 size={18} />
              </div>
            </div>
            {loading ? (
              <div className="skeleton" style={{ height: '36px', width: '80px', marginBottom: '8px' }} />
            ) : (
              <div style={{ fontSize: '2.125rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>
                {stats.averageScore > 0
                  ? `${stats.averageScore > 10 ? Math.round(stats.averageScore) : Math.round(stats.averageScore * 10)}%`
                  : '—'}
              </div>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>
            Across all completed rubrics
          </div>
        </div>

        {/* Card 3: Best Performance */}
        <div className="saas-card card-interactive" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Best Performance</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={18} />
              </div>
            </div>
            {loading ? (
              <div className="skeleton" style={{ height: '36px', width: '80px', marginBottom: '8px' }} />
            ) : (
              <div style={{ fontSize: '2.125rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>
                {stats.bestScore > 0
                  ? `${stats.bestScore > 10 ? Math.round(stats.bestScore) : Math.round(stats.bestScore * 10)}%`
                  : '—'}
              </div>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>
            Top evaluation grade
          </div>
        </div>

        {/* Card 4: Active Track */}
        <div className="saas-card card-interactive" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Track</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {user?.targetRole || 'Full Stack Developer'}
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>
            {user?.experienceLevel || 'Fresher'} level
          </div>
        </div>
      </div>

      {/* 3. Performance Overview Section */}
      <div className="saas-card" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Performance Overview
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Track score progression across recent completed interview rounds
            </p>
          </div>
          {completedInterviews.length > 0 && (
            <span className="badge badge-primary" style={{ padding: '4px 10px' }}>
              <TrendingUp size={14} />
              <span>{completedInterviews.length} Sessions Logged</span>
            </span>
          )}
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: '180px', width: '100%', borderRadius: 'var(--radius-md)' }} />
        ) : completedInterviews.length === 0 ? (
          /* Empty State: No Completed Interviews Yet */
          <div className="empty-state-card" style={{ padding: '40px 20px' }}>
            <div className="empty-state-icon">
              <TrendingUp size={22} />
            </div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Your performance journey starts here.
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '380px', marginBottom: '20px', lineHeight: 1.5 }}>
              Complete your first interview to see your progress and track performance trends over time.
            </p>
            <Link to="/interview/new" className="btn btn-primary btn-sm btn-hover-arrow">
              <span>Start Your First Interview</span>
              <ArrowRight size={14} className="btn-arrow-icon" />
            </Link>
          </div>
        ) : (
          /* Minimal SVG Visual Score Trend */
          <div>
            <div style={{ width: '100%', height: '160px', position: 'relative' }}>
              <svg viewBox="0 0 600 140" style={{ width: '100%', height: '100%', overflow: 'visible' }} preserveAspectRatio="none">
                <line x1="0" y1="20" x2="600" y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="70" x2="600" y2="70" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2="600" y2="120" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />

                {/* Render points & line */}
                {(() => {
                  const pts = completedInterviews.map((item, idx) => {
                    const x = completedInterviews.length === 1 ? 300 : 50 + (idx * 500) / (completedInterviews.length - 1);
                    // Map score 50-100 to y 120-20
                    const y = 120 - ((item.score - 50) / 50) * 100;
                    return { x, y, score: item.score, label: item.date };
                  });

                  const pointsStr = pts.map((p) => `${p.x},${p.y}`).join(' ');

                  return (
                    <>
                      {pts.length > 1 && (
                        <polyline
                          fill="none"
                          stroke="var(--accent-primary)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={pointsStr}
                        />
                      )}
                      {pts.map((p, i) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="5" fill="#FFFFFF" stroke="var(--accent-primary)" strokeWidth="2.5" />
                          <text x={p.x} y={p.y - 10} textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="700">
                            {p.score}%
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 10px 0 10px', borderTop: '1px solid var(--border-subtle)', marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {completedInterviews.map((item, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Round {item.index}</span>
                  <div style={{ fontSize: '0.6875rem' }}>{item.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Recent Interviews List / Table */}
      <div className="saas-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Mock Interviews
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Review prior questions, feedback, and technical diagnostics
            </p>
          </div>
          {stats.recentInterviews.length > 0 && (
            <Link to="/history" className="btn btn-ghost btn-sm" style={{ gap: '4px' }}>
              <span>View All History</span>
              <ChevronRight size={14} />
            </Link>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="skeleton" style={{ height: '48px', width: '100%' }} />
            <div className="skeleton" style={{ height: '48px', width: '100%' }} />
            <div className="skeleton" style={{ height: '48px', width: '100%' }} />
          </div>
        ) : stats.recentInterviews.length === 0 ? (
          /* Empty State for Recent Interviews */
          <div className="empty-state-card">
            <div className="empty-state-icon">
              <Sparkles size={24} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
              No Mock Interviews Yet
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '420px', marginBottom: '20px', lineHeight: 1.5 }}>
              Configure your first AI interview to start practicing. You can answer via voice or keyboard, and receive detailed diagnostic scoring.
            </p>
            <Link to="/interview/new" className="btn btn-primary btn-hover-arrow">
              <Sparkles size={16} />
              <span>Configure Your First Interview</span>
              <ArrowRight size={14} className="btn-arrow-icon" />
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '12px 24px', fontWeight: 600 }}>Job Role</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Interview Type</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Duration</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Questions Answered</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Score</th>
                  <th style={{ padding: '12px 20px', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '12px 24px', fontWeight: 600, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentInterviews.map((item) => {
                  const dateStr = new Date(item.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const answeredCount = item.answeredQuestionCount ?? item.questionCount ?? 0;
                  return (
                    <tr key={item._id} style={{ borderBottom: '1px solid var(--border-subtle)' }} className="table-row-hover">
                      <td style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.jobRole}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span className="badge badge-default">{item.interviewType}</span>
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                        <span className="badge badge-default" style={{ fontSize: '0.75rem' }}>
                          ⏱ {item.duration || 30} min
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                        {answeredCount} Answered
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {getScoreBadge(item.score)}
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        {dateStr}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        {item.status === 'completed' ? (
                          <Link to={`/interview/${item._id}/result`} className="btn btn-secondary btn-sm">
                            <span>View Report</span>
                            <ArrowRight size={13} />
                          </Link>
                        ) : item.status === 'ready' ? (
                          <Link to={`/interview/${item._id}`} className="btn btn-primary btn-sm">
                            <span>Start</span>
                            <ArrowRight size={13} />
                          </Link>
                        ) : (
                          <Link to={`/interview/${item._id}`} className="btn btn-primary btn-sm">
                            <span>Continue</span>
                            <ArrowRight size={13} />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. AI Coach Tip Card */}
      <div
        className="saas-card"
        style={{
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          backgroundColor: '#FFFFFF',
          borderLeft: '4px solid var(--accent-primary)',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            backgroundColor: 'var(--accent-subtle)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Lightbulb size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            AI Coach Tip
          </div>
          <p style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.45 }}>
            Try explaining technical concepts using a real-world example or trade-off analysis. It makes your answers clearer, more structured, and more convincing to engineering hiring managers.
          </p>
        </div>
      </div>
    </div>
  );
};
