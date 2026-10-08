import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Search,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  Filter,
  ArrowUpDown,
  ChevronRight,
} from 'lucide-react';
import { api } from '../services/api';

export const HistoryPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST'); // 'NEWEST' | 'OLDEST' | 'HIGHEST_SCORE' | 'LOWEST_SCORE'

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.getHistory();
        if (res.success && res.interviews) {
          setInterviews(res.interviews);
        }
      } catch (err) {
        console.warn('Failed to load history:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const processedInterviews = useMemo(() => {
    let result = interviews.filter((item) => {
      const matchesSearch =
        item.jobRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.interviewType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = filterType === 'ALL' || item.interviewType === filterType;
      return matchesSearch && matchesFilter;
    });

    // Sorting
    result.sort((a, b) => {
      const scoreA = a.finalReport?.overallScore || 0;
      const scoreB = b.finalReport?.overallScore || 0;
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      switch (sortBy) {
        case 'OLDEST':
          return dateA - dateB;
        case 'HIGHEST_SCORE':
          return scoreB - scoreA;
        case 'LOWEST_SCORE':
          return scoreA - scoreB;
        case 'NEWEST':
        default:
          return dateB - dateA;
      }
    });

    return result;
  }, [interviews, searchQuery, filterType, sortBy]);

  const getScoreBadge = (rawScore) => {
    const score = rawScore > 10 ? rawScore : rawScore * 10;
    if (score >= 80) {
      return <span className="badge badge-success">{score.toFixed(0)}/100 • Strong</span>;
    }
    if (score >= 60) {
      return <span className="badge badge-warning">{score.toFixed(0)}/100 • Developing</span>;
    }
    if (score > 0) {
      return <span className="badge badge-default" style={{ color: 'var(--danger-text)', borderColor: 'var(--danger-border)', backgroundColor: 'var(--danger-bg)' }}>{score.toFixed(0)}/100</span>;
    }
    return <span className="badge badge-default">In Progress</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            Interview History
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Review past mock interview sessions, questions, and performance trajectories
          </p>
        </div>

        <Link to="/interview/new" className="btn btn-primary btn-hover-arrow">
          <Sparkles size={16} />
          <span>New Interview</span>
          <ArrowRight size={14} className="btn-arrow-icon" />
        </Link>
      </div>

      {/* Filter, Search & Sort Toolbar */}
      <div
        className="saas-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by job role or track..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              backgroundColor: 'transparent',
            }}
          />
        </div>

        {/* Filters and Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Type filter chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {['ALL', 'Technical', 'HR', 'Mixed'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`btn btn-sm ${filterType === type ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.75rem', padding: '5px 10px' }}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '12px' }}>
            <ArrowUpDown size={14} color="var(--text-muted)" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select"
              style={{ fontSize: '0.75rem', padding: '5px 10px', width: 'auto', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)' }}
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="HIGHEST_SCORE">Highest Score</option>
              <option value="LOWEST_SCORE">Lowest Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="skeleton" style={{ height: '72px', width: '100%', borderRadius: 'var(--radius-lg)' }} />
          <div className="skeleton" style={{ height: '72px', width: '100%', borderRadius: 'var(--radius-lg)' }} />
          <div className="skeleton" style={{ height: '72px', width: '100%', borderRadius: 'var(--radius-lg)' }} />
        </div>
      ) : processedInterviews.length === 0 ? (
        <div className="saas-card empty-state-card">
          <div className="empty-state-icon">
            <History size={24} />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
            {searchQuery || filterType !== 'ALL' ? 'No Sessions Found' : 'No interviews yet'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '380px', marginBottom: '20px', lineHeight: 1.5 }}>
            {searchQuery || filterType !== 'ALL'
              ? 'No interviews match your search or filter criteria. Try clearing your filters.'
              : 'Start your first mock interview to see your performance history here.'}
          </p>
          <Link to="/interview/new" className="btn btn-primary btn-sm btn-hover-arrow">
            <Sparkles size={15} />
            <span>Start Your First Interview</span>
            <ArrowRight size={13} className="btn-arrow-icon" />
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="saas-card desktop-table-container" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '14px 24px', fontWeight: 600 }}>Job Role</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>Interview Type</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>Duration</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>Questions Answered</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>Score</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '14px 24px', fontWeight: 600, textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {processedInterviews.map((item) => {
                    const score = item.finalReport?.overallScore || 0;
                    const dateStr = new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                    const answeredCount =
                      item.answeredQuestionCount ??
                      (item.questions?.filter((q) => q.userAnswer && q.userAnswer.trim().length > 0)?.length ||
                      item.questionCount || 0);

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
                        <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                          {answeredCount} Answered
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          {getScoreBadge(score)}
                        </td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                          {dateStr}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span className={`badge ${item.status === 'completed' ? 'badge-success' : item.status === 'ready' ? 'badge-warning' : 'badge-default'}`}>
                            {item.status === 'completed' ? 'Completed' : item.status === 'ready' ? 'Ready' : 'In Progress'}
                          </span>
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
          </div>

          {/* Mobile Stacked Card View */}
          <div className="mobile-stacked-cards" style={{ display: 'none', flexDirection: 'column', gap: '12px' }}>
            {processedInterviews.map((item) => {
              const score = item.finalReport?.overallScore || 0;
              const dateStr = new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const answeredCount =
                item.answeredQuestionCount ??
                (item.questions?.filter((q) => q.userAnswer && q.userAnswer.trim().length > 0)?.length ||
                item.questionCount || 0);

              return (
                <div key={item._id} className="saas-card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                        {item.jobRole}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {dateStr} • ⏱ {item.duration || 30} min • {answeredCount} Answered
                      </div>
                    </div>
                    <span className="badge badge-default">{item.interviewType}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    <div>{getScoreBadge(score)}</div>
                    {item.status === 'completed' ? (
                      <Link to={`/interview/${item._id}/result`} className="btn btn-secondary btn-sm">
                        <span>View Report</span>
                        <ChevronRight size={14} />
                      </Link>
                    ) : item.status === 'ready' ? (
                      <Link to={`/interview/${item._id}`} className="btn btn-primary btn-sm">
                        <span>Start</span>
                        <ChevronRight size={14} />
                      </Link>
                    ) : (
                      <Link to={`/interview/${item._id}`} className="btn btn-primary btn-sm">
                        <span>Continue</span>
                        <ChevronRight size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
