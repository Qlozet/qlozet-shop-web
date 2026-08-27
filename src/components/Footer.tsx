import Link from 'next/link';
import React from 'react';
import { QlozetLogo } from '@/components/QlozetLogo';

const QUICK_LINKS = [
  { label: 'Virtual Fitting', href: '/bespoke' },
  { label: 'About Us', href: '/' },
  { label: 'Features', href: '/' },
  { label: 'Help & FAQ', href: '/' },
  { label: 'Returns', href: '/' },
  { label: 'Shipping', href: '/' },
  { label: 'Contact', href: '/' },
];

const SOCIALS = ['Instagram', 'Twitter', 'LinkedIn'];

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          MOBILE FOOTER (< lg) — Compact, elegant app-style footer
          ═══════════════════════════════════════════════════════════ */}
      <footer className="lg:hidden w-full flex flex-col" style={{ gap: '0' }}>

        {/* Newsletter — compact pill (kept as a dark accent card in both themes) */}
        <div
          className="flex flex-col items-center text-center"
          style={{
            padding: '32px 20px',
            background: '#1A1A1A',
            borderRadius: '24px',
            marginBottom: '16px',
          }}
        >
          <div style={{ marginBottom: '12px' }}>
            <QlozetLogo width={48} color="#FFFFFF" />
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: '260px', marginBottom: '20px' }}>
            The future of fashion-tech. Seamless fit intelligence & curated designer experiences.
          </p>
          <div
            className="flex items-center w-full"
            style={{
              maxWidth: '320px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '100px',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '4px 4px 4px 16px',
            }}
          >
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 bg-transparent border-none outline-none text-[13px] text-white placeholder-white/30"
              style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', boxShadow: 'none', WebkitAppearance: 'none', padding: '8px 0', color: '#FFFFFF' }}
            />
            <button
              className="flex-shrink-0"
              style={{
                padding: '10px 22px',
                borderRadius: '100px',
                background: '#FFFFFF',
                color: '#1A1A1A',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Join
            </button>
          </div>
        </div>

        {/* Quick Links — horizontal pills */}
        <div
          className="flex flex-wrap justify-center"
          style={{ gap: '8px', padding: '16px 0' }}
        >
          {QUICK_LINKS.slice(0, 5).map((link) => (
            <Link
              key={link.label}
              href={link.href}
              style={{
                padding: '8px 16px',
                borderRadius: '100px',
                background: 'var(--bg-surface-elevated)',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Social + Region Row */}
        <div className="flex items-center justify-center" style={{ gap: '20px', padding: '16px 0 8px' }}>
          {SOCIALS.map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--border-glass)' }} />}
              <Link href="#" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textDecoration: 'none' }}>
                {s}
              </Link>
            </React.Fragment>
          ))}
        </div>

        {/* Region + Legal */}
        <div className="flex flex-col items-center" style={{ gap: '10px', padding: '8px 0 20px' }}>
          <div className="flex items-center" style={{ gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.5)' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nigeria</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 4px' }}>·</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>UK</span>
          </div>
          <div className="flex items-center" style={{ gap: '12px' }}>
            <Link href="#" style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy</Link>
            <Link href="#" style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none' }}>Terms</Link>
          </div>
          <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            © {year} Qlozet, Inc.
          </span>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════════
          DESKTOP FOOTER (≥ lg) — Clean, airy, theme-aware.
          No heavy box: sits on the page, separated by hairline rules.
          ═══════════════════════════════════════════════════════════ */}
      <footer
        className="hidden lg:flex w-full flex-col"
        style={{ marginTop: '32px', paddingTop: '44px', borderTop: '1px solid var(--border-glass)' }}
      >
        {/* Row 1 — Brand + Newsletter */}
        <div className="flex items-start justify-between" style={{ gap: '64px', paddingBottom: '36px' }}>
          {/* Brand */}
          <div className="flex flex-col" style={{ gap: '16px', maxWidth: '320px' }}>
            <Link href="/" className="opacity-90 hover:opacity-100 transition-opacity">
              <QlozetLogo width={64} color="var(--text-primary)" />
            </Link>
            <p style={{ fontSize: '13.5px', lineHeight: 1.7, color: 'var(--text-muted)', fontWeight: 400 }}>
              Designing the future of fashion-tech through seamless fit intelligence and curated designer experiences.
            </p>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col items-end" style={{ gap: '12px', width: '100%', maxWidth: '380px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Stay Ahead
            </span>
            <div
              className="flex items-center w-full transition-all"
              style={{
                background: 'var(--bg-surface-elevated)',
                borderRadius: '100px',
                border: '1px solid var(--border-glass)',
                padding: '4px 4px 4px 20px',
              }}
            >
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-transparent border-none outline-none"
                style={{ fontSize: '13px', padding: '10px 0', background: 'transparent', border: 'none', outline: 'none', boxShadow: 'none', color: 'var(--text-primary)' }}
              />
              <button
                className="flex-shrink-0 transition-all hover:opacity-90 active:scale-[0.97]"
                style={{
                  padding: '11px 30px',
                  borderRadius: '100px',
                  background: 'var(--brand-fill)',
                  color: 'var(--brand-fill-text)',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Row 2 — Quick links + Social, on one clean line */}
        <div
          className="flex items-center justify-between flex-wrap"
          style={{ gap: '20px', padding: '22px 0', borderTop: '1px solid var(--border-glass)' }}
        >
          <nav className="flex items-center flex-wrap" style={{ gap: '28px' }}>
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition-colors"
                style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center" style={{ gap: '22px' }}>
            {SOCIALS.map((s) => (
              <Link
                key={s}
                href="#"
                className="transition-colors hover:text-[#D4AF37]"
                style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', textDecoration: 'none' }}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>

        {/* Row 3 — Copyright + Region + Legal */}
        <div
          className="flex items-center justify-between"
          style={{ padding: '20px 0 40px', borderTop: '1px solid var(--border-glass)' }}
        >
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            © {year} Qlozet, Inc. All rights reserved.
          </span>
          <div className="flex items-center" style={{ gap: '20px' }}>
            <span className="flex items-center" style={{ gap: '7px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.5)' }} />
              Nigeria
              <span style={{ color: 'var(--text-muted)', margin: '0 2px' }}>·</span>
              <span style={{ color: 'var(--text-muted)' }}>UK</span>
            </span>
            <span style={{ width: '1px', height: '14px', background: 'var(--border-glass)' }} />
            {['Privacy', 'Terms'].map((l) => (
              <Link
                key={l}
                href="#"
                className="transition-colors"
                style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', textDecoration: 'none' }}
              >
                {l}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
};
