'use client';

import React from 'react';

export const PromoBanner: React.FC = () => {
  return (
    <div
      className="relative overflow-hidden w-full rounded-[24px] lg:rounded-[20px]"
      style={{
        background: 'linear-gradient(135deg, #E8430A 0%, #FF6B35 50%, #E8430A 100%)',
        padding: '28px 20px',
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
      }}
    >
      {/* Decorative star patterns — left */}
      <div className="absolute" style={{ top: '15px', left: '20px', opacity: 0.25 }}>
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
          <path d="M25 0 L30 20 L50 25 L30 30 L25 50 L20 30 L0 25 L20 20 Z" fill="#FFFFFF" />
        </svg>
      </div>
      <div className="absolute" style={{ bottom: '10px', left: '60px', opacity: 0.15 }}>
        <svg width="30" height="30" viewBox="0 0 50 50" fill="none">
          <path d="M25 0 L30 20 L50 25 L30 30 L25 50 L20 30 L0 25 L20 20 Z" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Decorative star patterns — right */}
      <div className="absolute" style={{ top: '20px', right: '30px', opacity: 0.2 }}>
        <svg width="40" height="40" viewBox="0 0 50 50" fill="none">
          <path d="M25 0 L30 20 L50 25 L30 30 L25 50 L20 30 L0 25 L20 20 Z" fill="#FFFFFF" />
        </svg>
      </div>
      <div className="absolute" style={{ bottom: '15px', right: '50px', opacity: 0.15 }}>
        <svg width="24" height="24" viewBox="0 0 50 50" fill="none">
          <path d="M25 0 L30 20 L50 25 L30 30 L25 50 L20 30 L0 25 L20 20 Z" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Decorative dots */}
      <div className="absolute" style={{ top: '50%', left: '15px', transform: 'translateY(-50%)', opacity: 0.2 }}>
        <div className="flex flex-col" style={{ gap: '6px' }}>
          {[0,1,2,3].map((i) => (
            <div key={i} className="flex" style={{ gap: '6px' }}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FFFFFF' }} />
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FFFFFF' }} />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute" style={{ top: '50%', right: '15px', transform: 'translateY(-50%)', opacity: 0.2 }}>
        <div className="flex flex-col" style={{ gap: '6px' }}>
          {[0,1,2,3].map((i) => (
            <div key={i} className="flex" style={{ gap: '6px' }}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FFFFFF' }} />
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FFFFFF' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <h2
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#FFFFFF',
            fontFamily: 'var(--font-display)',
            lineHeight: 1.2,
            marginBottom: '4px',
          }}
        >
          Get 15% off your first
        </h2>
        <h2
          style={{
            fontSize: '32px',
            fontWeight: 800,
            color: '#FFFFFF',
            fontFamily: 'var(--font-display)',
            lineHeight: 1.2,
            marginBottom: '16px',
          }}
        >
          Bespoke order !
        </h2>

        {/* Coupon code */}
        <div className="flex items-center justify-center" style={{ gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
            Use code:
          </span>
          <span
            style={{
              background: '#FFFFFF',
              color: '#E8430A',
              fontSize: '12px',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '6px',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.05em',
            }}
          >
            2773672
          </span>
        </div>

        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
          Code expires in 2 days
        </span>
      </div>
    </div>
  );
};
