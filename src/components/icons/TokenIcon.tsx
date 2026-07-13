'use client';

import React from 'react';

interface TokenIconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Solid filled token/coin icon — replaces the stroked lucide Coins.
 * A single coin with a "T" emblem.
 */
export const TokenIcon: React.FC<TokenIconProps> = ({
  size = 16,
  color = '#D4AF37',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ flexShrink: 0 }}
  >
    {/* Coin body */}
    <circle cx="12" cy="12" r="10" fill={color} />
    {/* Inner ring */}
    <circle cx="12" cy="12" r="7.5" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
    {/* "T" letter for Token */}
    <text
      x="12"
      y="16"
      textAnchor="middle"
      fill="rgba(255,255,255,0.9)"
      fontSize="10"
      fontWeight="800"
      fontFamily="system-ui, sans-serif"
      style={{ letterSpacing: '-0.5px' }}
    >
      T
    </text>
  </svg>
);
