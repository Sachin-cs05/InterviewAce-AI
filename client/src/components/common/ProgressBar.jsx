import React from 'react';

export const ProgressBar = ({ current = 1, total = 5, showLabel = true }) => {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            Question {current} of {total}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            {Math.round(percentage)}% Completed
          </span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: '6px',
          backgroundColor: 'var(--border-subtle)',
          borderRadius: '999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: 'var(--accent-primary)',
            borderRadius: '999px',
            transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
    </div>
  );
};
