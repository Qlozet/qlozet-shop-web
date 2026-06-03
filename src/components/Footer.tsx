import Link from 'next/link';
import React from 'react';
import { QlozetLogo } from '@/components/QlozetLogo';

export const Footer = () => {
  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          MOBILE FOOTER (< lg) — Compact, elegant app-style footer
          ═══════════════════════════════════════════════════════════ */}
      <footer className="lg:hidden w-full flex flex-col" style={{ gap: '0' }}>

        {/* Newsletter — compact pill */}
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
              style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', boxShadow: 'none', WebkitAppearance: 'none', padding: '8px 0' }}
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
          {[
            { label: 'Help & FAQ', href: '/' },
            { label: 'Returns', href: '/' },
            { label: 'Virtual Fitting', href: '/bespoke' },
            { label: 'About Us', href: '/' },
            { label: 'Features', href: '/' },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              style={{
                padding: '8px 16px',
                borderRadius: '100px',
                background: '#F5F5F5',
                fontSize: '11px',
                fontWeight: 600,
                color: '#666',
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
          <Link href="#" style={{ fontSize: '11px', fontWeight: 700, color: '#AAA', textTransform: 'uppercase', letterSpacing: '0.06em', textDecoration: 'none' }}>
            Instagram
          </Link>
          <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#DDD' }} />
          <Link href="#" style={{ fontSize: '11px', fontWeight: 700, color: '#AAA', textTransform: 'uppercase', letterSpacing: '0.06em', textDecoration: 'none' }}>
            Twitter
          </Link>
          <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#DDD' }} />
          <Link href="#" style={{ fontSize: '11px', fontWeight: 700, color: '#AAA', textTransform: 'uppercase', letterSpacing: '0.06em', textDecoration: 'none' }}>
            LinkedIn
          </Link>
        </div>

        {/* Region + Legal */}
        <div className="flex flex-col items-center" style={{ gap: '10px', padding: '8px 0 20px' }}>
          <div className="flex items-center" style={{ gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.5)' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#888' }}>Nigeria</span>
            <span style={{ fontSize: '11px', color: '#CCC', margin: '0 4px' }}>·</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#CCC' }}>UK</span>
          </div>
          <div className="flex items-center" style={{ gap: '12px' }}>
            <Link href="#" style={{ fontSize: '10px', fontWeight: 600, color: '#BBB', textDecoration: 'none' }}>Privacy</Link>
            <Link href="#" style={{ fontSize: '10px', fontWeight: 600, color: '#BBB', textDecoration: 'none' }}>Terms</Link>
          </div>
          <span style={{ fontSize: '9px', fontWeight: 600, color: '#CCC', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            © {new Date().getFullYear()} Qlozet Studios
          </span>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════════
          DESKTOP FOOTER (≥ lg) — Premium refined layout
          ═══════════════════════════════════════════════════════════ */}
      <footer className="hidden lg:flex w-full flex-col overflow-hidden rounded-[2.5rem] text-white relative" style={{ background: 'linear-gradient(145deg, #1E1410 0%, #110A06 50%, #0D0805 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
        
        {/* Ambient glow effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2.5rem]">
          <div className="absolute -top-[40%] -left-[5%] w-[45%] h-[80%] bg-[#D4AF37] opacity-[0.025] blur-[100px] rounded-full" />
          <div className="absolute -bottom-[30%] -right-[10%] w-[35%] h-[60%] bg-[#8B5E3C] opacity-[0.03] blur-[80px] rounded-full" />
        </div>

        {/* Top Section — Logo + Description | Newsletter */}
        <div className="relative z-10 flex items-start justify-between" style={{ padding: '56px 56px 0' }}>
          
          {/* Left — Branding */}
          <div className="flex flex-col" style={{ gap: '20px', maxWidth: '340px' }}>
            <Link href="/">
              <QlozetLogo width={72} color="#FFFFFF" className="opacity-90 hover:opacity-100 transition-opacity" />
            </Link>
            <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>
              Designing the future of fashion-tech through seamless fit intelligence and curated designer experiences.
            </p>
          </div>

          {/* Right — Newsletter */}
          <div className="flex flex-col items-end" style={{ gap: '12px', maxWidth: '380px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
              Stay Ahead
            </span>
            <div
              className="flex items-center w-full transition-all duration-300 focus-within:border-white/20 focus-within:bg-white/[0.07]"
              style={{
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '100px',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '4px 4px 4px 20px',
              }}
            >
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/25"
                style={{ fontSize: '13px', padding: '10px 0', background: 'transparent', border: 'none', outline: 'none', boxShadow: 'none' }}
              />
              <button
                className="flex-shrink-0 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-[0.97]"
                style={{
                  padding: '11px 32px',
                  borderRadius: '100px',
                  background: '#FFFFFF',
                  color: '#1A1A1A',
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

        {/* Divider */}
        <div style={{ margin: '40px 56px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }} />

        {/* Link Columns */}
        <div className="relative z-10 grid grid-cols-4" style={{ padding: '36px 56px 0', gap: '24px' }}>
          
          {[
            {
              title: 'Solutions',
              links: [
                { label: 'Qlozet App', href: '/' },
                { label: 'AI Engine', href: '/' },
                { label: 'Virtual Fitting', href: '/bespoke' },
                { label: 'Size Intelligence', href: '/' },
              ],
            },
            {
              title: 'Company',
              links: [
                { label: 'About Us', href: '/' },
                { label: 'Customers', href: '/' },
                { label: 'Features', href: '/' },
                { label: 'Careers', href: '/' },
              ],
            },
            {
              title: 'Support',
              links: [
                { label: 'Help & FAQ', href: '/' },
                { label: 'Returns', href: '/' },
                { label: 'Shipping Info', href: '/' },
                { label: 'Contact Us', href: '/' },
              ],
            },
            {
              title: 'Region',
              links: [],
              custom: (
                <ul className="flex flex-col" style={{ gap: '14px' }}>
                  <li>
                    <span className="flex items-center cursor-pointer transition-colors hover:text-white" style={{ gap: '10px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px rgba(34,197,94,0.5)' }} />
                      Nigeria
                    </span>
                  </li>
                  <li>
                    <span className="flex items-center cursor-pointer transition-colors hover:text-white" style={{ gap: '10px', fontSize: '14px', color: 'rgba(255,255,255,0.35)' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
                      United Kingdom
                    </span>
                  </li>
                </ul>
              ),
            },
          ].map((col) => (
            <div key={col.title} className="flex flex-col" style={{ gap: '18px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
                {col.title}
              </span>
              {col.custom ? col.custom : (
                <ul className="flex flex-col" style={{ gap: '14px' }}>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="transition-all duration-300 hover:text-white hover:translate-x-1"
                        style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', display: 'inline-block' }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div
          className="relative z-10 flex items-center justify-between"
          style={{ margin: '40px 56px 0', padding: '24px 0 40px', borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Copyright */}
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>
            © {new Date().getFullYear()} Qlozet Studios. All rights reserved.
          </span>

          {/* Social + Legal */}
          <div className="flex items-center" style={{ gap: '28px' }}>
            {['Instagram', 'Twitter', 'LinkedIn'].map((s) => (
              <Link
                key={s}
                href="#"
                className="transition-all duration-300 hover:text-[#D4AF37]"
                style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}
              >
                {s}
              </Link>
            ))}
            <span style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.1)' }} />
            {['Privacy', 'Terms'].map((l) => (
              <Link
                key={l}
                href="#"
                className="transition-all duration-300 hover:text-white"
                style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}
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
