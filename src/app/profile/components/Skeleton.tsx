'use client';

import React from 'react';

// ─── Skeleton Pulse ──────────────────────────────────────────
// Reusable shimmer/pulse skeleton primitives for loading states

const pulseKeyframes = `
@keyframes skeletonPulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
`;

const baseStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, #F0F0F0 25%, #E8E8E8 50%, #F0F0F0 75%)',
  backgroundSize: '200% 100%',
  borderRadius: '8px',
  animation: 'skeletonPulse 1.5s ease-in-out infinite',
};

/** Rectangular skeleton block */
export function SkeletonBox({ width, height, borderRadius, style }: {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}) {
  return (
    <>
      <style>{pulseKeyframes}</style>
      <div style={{ ...baseStyle, width: width || '100%', height: height || '16px', borderRadius: borderRadius ?? '8px', ...style }} />
    </>
  );
}

/** Circle skeleton (e.g. avatar, icon) */
export function SkeletonCircle({ size = 40, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <>
      <style>{pulseKeyframes}</style>
      <div style={{ ...baseStyle, width: size, height: size, borderRadius: '50%', ...style }} />
    </>
  );
}

/** A row with icon circle + two text lines (common pattern) */
export function SkeletonRow({ style }: { style?: React.CSSProperties }) {
  return (
    <div className="flex items-center" style={{ gap: '12px', padding: '16px 20px', ...style }}>
      <SkeletonCircle size={34} />
      <div className="flex flex-col flex-1" style={{ gap: '6px' }}>
        <SkeletonBox width="60%" height="12px" />
        <SkeletonBox width="40%" height="10px" />
      </div>
      <SkeletonBox width="60px" height="14px" />
    </div>
  );
}

// ─── Section-Specific Skeletons ──────────────────────────────

/** Wallet section skeleton — balance card + transaction rows */
export function WalletSkeleton() {
  return (
    <div className="flex flex-col" style={{ gap: '20px' }}>
      {/* Balance card */}
      <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div className="flex flex-col sm:flex-row">
          <div className="flex-1 flex flex-col" style={{ padding: '24px 28px', gap: '16px' }}>
            <SkeletonCircle size={28} />
            <SkeletonBox width="140px" height="18px" />
            <div className="flex" style={{ gap: '10px' }}>
              <SkeletonBox width="120px" height="36px" borderRadius="8px" />
              <SkeletonBox width="120px" height="36px" borderRadius="8px" />
            </div>
          </div>
          <div className="flex flex-col justify-center" style={{ padding: '24px 28px', gap: '14px', borderLeft: '1px solid rgba(0,0,0,0.05)' }}>
            <div className="flex items-center" style={{ gap: '10px' }}>
              <SkeletonCircle size={32} />
              <div className="flex flex-col" style={{ gap: '4px' }}>
                <SkeletonBox width="100px" height="10px" />
                <SkeletonBox width="80px" height="20px" />
              </div>
            </div>
            <div className="flex items-center" style={{ gap: '10px' }}>
              <SkeletonCircle size={32} />
              <div className="flex flex-col" style={{ gap: '4px' }}>
                <SkeletonBox width="80px" height="10px" />
                <SkeletonBox width="60px" height="20px" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction rows */}
      <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px' }}>
          <SkeletonBox width="140px" height="12px" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
            <SkeletonRow />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Measurement section skeleton — profile cards */
export function MeasurementSkeleton() {
  return (
    <div className="flex flex-col" style={{ gap: '12px' }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ background: '#FFF', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <SkeletonCircle size={42} />
          <div className="flex flex-col flex-1" style={{ gap: '6px' }}>
            <SkeletonBox width="45%" height="14px" />
            <SkeletonBox width="30%" height="10px" />
          </div>
          <SkeletonBox width="50px" height="24px" borderRadius="100px" />
        </div>
      ))}
    </div>
  );
}

/** Address book skeleton — address cards */
export function AddressBookSkeleton() {
  return (
    <div className="flex flex-col" style={{ gap: '12px' }}>
      {[1, 2].map((i) => (
        <div key={i} style={{ background: '#FFF', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', padding: '20px' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-start" style={{ gap: '12px', flex: 1 }}>
              <SkeletonCircle size={36} />
              <div className="flex flex-col flex-1" style={{ gap: '8px' }}>
                <SkeletonBox width="50%" height="14px" />
                <SkeletonBox width="80%" height="11px" />
                <SkeletonBox width="60%" height="11px" />
              </div>
            </div>
            <div className="flex" style={{ gap: '8px' }}>
              <SkeletonBox width="28px" height="28px" borderRadius="50%" />
              <SkeletonBox width="28px" height="28px" borderRadius="50%" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
