import React from 'react';

export function Badge({ children, variant = 'default', style = {} }) {
  const styles = {
    default: { background: 'var(--glass)', color: 'var(--text-sec)', border: '1px solid var(--glass-border)' },
    success: { background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid rgba(52,199,89,0.3)' },
    danger: { background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid rgba(255,59,92,0.3)' },
    warning: { background: 'rgba(245,166,35,0.12)', color: '#F5A623', border: '1px solid rgba(245,166,35,0.3)' },
    info: { background: 'var(--blue-dim)', color: 'var(--blue)', border: '1px solid rgba(79,142,247,0.3)' },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: '100px',
        fontSize: '11px',
        fontWeight: 600,
        ...styles[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}