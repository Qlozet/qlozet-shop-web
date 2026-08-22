import React from 'react';

// ─── Shared Styles ───────────────────────────────────────────
export const cardStyle: React.CSSProperties = {
  // Profile renders inside the shell's near-black content card, so the profile
  // cards use the dark-grey ground (--bg-base) to stand out against it; insets
  // on the card step up to --bg-surface-elevated.
  background: 'var(--bg-base)',
  borderRadius: '24px',
  border: '1px solid var(--border-glass)',
  boxShadow: 'var(--shadow-sm)',
  overflow: 'hidden',
};

export const sectionTitle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 800,
  color: 'var(--text-primary)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  padding: '18px 20px 10px',
};

export const fieldLabel: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: '6px',
};

export const fieldInput: React.CSSProperties = {
  width: '100%',
  padding: '10px 0',
  fontSize: '14px',
  fontWeight: 500,
  color: 'var(--text-primary)',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid var(--border-glass)',
  outline: 'none',
  borderRadius: 0,
  boxShadow: 'none',
};

export const statusColors: Record<string, { bg: string; text: string }> = {
  'Pending': { bg: 'rgba(249,115,22,0.1)', text: '#F97316' },
  'Processing': { bg: 'rgba(59,130,246,0.1)', text: '#3B82F6' },
  'Shipped': { bg: 'rgba(234,179,8,0.1)', text: '#CA8A04' },
  'Delivered': { bg: 'rgba(34,197,94,0.1)', text: '#22C55E' },
  'Refused': { bg: 'rgba(239,68,68,0.1)', text: '#EF4444' },
};
