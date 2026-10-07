import React from 'react';

export const ScoreRadial = ({ score = 0, size = 120, strokeWidth = 10, label = 'Overall' }) => {
  const normalizedScore = Math.max(0, Math.min(10, Number(score) || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 10) * circumference;

  let strokeColor = 'var(--accent-primary)';
  let bgTint = 'var(--accent-subtle)';

  if (normalizedScore >= 8) {
    strokeColor = '#16A34A';
    bgTint = '#F0FDF4';
  } else if (normalizedScore >= 6) {
    strokeColor = '#D97706';
    bgTint = '#FFFBEB';
  } else if (normalizedScore > 0) {
    strokeColor = '#DC2626';
    bgTint = '#FEF2F2';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--border-subtle)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated score circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>

        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: size > 100 ? '1.75rem' : '1.25rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
            {normalizedScore.toFixed(1)}
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>
            / 10
          </span>
        </div>
      </div>

      {label && (
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {label}
        </span>
      )}
    </div>
  );
};
