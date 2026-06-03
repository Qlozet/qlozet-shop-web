import React from 'react';

// ─── Shared Styles ───────────────────────────────────────────
export const cardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  borderRadius: '16px',
  border: '1px solid rgba(0,0,0,0.05)',
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  overflow: 'hidden',
};

export const sectionTitle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 800,
  color: '#1A1A1A',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  padding: '18px 20px 10px',
};

export const fieldLabel: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  color: '#999',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: '6px',
};

export const fieldInput: React.CSSProperties = {
  width: '100%',
  padding: '10px 0',
  fontSize: '14px',
  fontWeight: 500,
  color: '#1A1A1A',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid rgba(0,0,0,0.1)',
  outline: 'none',
  borderRadius: 0,
  boxShadow: 'none',
};

export const statusColors: Record<string, { bg: string; text: string }> = {
  'Shipped': { bg: 'rgba(234,179,8,0.1)', text: '#CA8A04' },
  'Refused': { bg: 'rgba(239,68,68,0.1)', text: '#EF4444' },
  'Delivered': { bg: 'rgba(34,197,94,0.1)', text: '#22C55E' },
  'Pending': { bg: 'rgba(249,115,22,0.1)', text: '#F97316' },
};
