import Link from 'next/link';
import React from 'react';

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
          <div
            className="brand-logo-stacked"
            style={{ fontSize: '18px', letterSpacing: '0.15em', color: '#FFFFFF', marginBottom: '12px' }}
          >
            <div><span>Q</span><span>L</span></div>
            <div><span>O</span><span>Z</span></div>
            <div><span>E</span><span>T</span></div>
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
          DESKTOP FOOTER (≥ lg) — Full premium layout
          ═══════════════════════════════════════════════════════════ */}
      <footer className="hidden lg:flex w-full flex-col justify-between overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#2D1B13] to-[#110A07] text-white shadow-2xl border border-[#3E2519]" style={{ height: 'auto', minHeight: '390px', padding: 'clamp(64px, 10vw, 80px) clamp(32px, 8vw, 80px)' }}>
        <div className="grid gap-20 lg:gap-12 lg:grid-cols-12 relative z-10">
          
          {/* Subtle background glow effect inside the footer */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none rounded-[4rem]">
              <div className="absolute -top-[50%] -left-[10%] w-[50%] h-[100%] bg-[#D4AF37] opacity-[0.03] blur-[120px] rounded-full"></div>
          </div>

          {/* Branding & Newsletter Column */}
          <div className="flex flex-col gap-10 lg:col-span-5 relative z-10">
            <div className="flex flex-col gap-3">
              <Link href="/" className="font-display text-4xl font-bold tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 hover:scale-[1.02] transition-transform origin-left w-max">
                QLZT
              </Link>
              <p className="max-w-md font-body text-base leading-relaxed text-white/60 font-light">
                Designing the future of fashion-tech through seamless fit intelligence and curated designer experiences.
              </p>
            </div>

            {/* Newsletter Signup */}
            <div className="flex flex-col gap-3">
              <h4 className="font-display text-base font-semibold uppercase tracking-[0.25em] text-white">
                Stay Ahead
              </h4>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-0 sm:max-w-sm sm:overflow-hidden rounded-3xl sm:rounded-full border border-white/10 bg-white/5 p-2 sm:p-1 backdrop-blur-md transition-all focus-within:border-white/50 focus-within:bg-white/10 focus-within:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full rounded-full bg-transparent px-4 py-2.5 font-body text-base text-white placeholder-white/30 outline-none transition-all sm:w-auto sm:flex-1"
                />
                <button 
                  className="w-fit self-start sm:self-auto shrink-0 whitespace-nowrap rounded-full bg-white py-2.5 font-body text-sm font-bold uppercase tracking-widest text-[#3A3A3A] transition-all hover:bg-neutral-100 hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] active:scale-[0.98]"
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                >
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-10 lg:grid-cols-4 lg:col-span-7 relative z-10 pt-2 lg:pl-12">
            
            <div className="flex flex-col gap-4">
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                Solutions
              </span>
              <ul className="flex flex-col gap-3">
                <li><Link href="/" className="font-body text-base text-white/70 transition-all duration-300 hover:translate-x-1.5 hover:text-[#D4AF37] inline-block">Qlozet App</Link></li>
                <li><Link href="/" className="font-body text-base text-white/70 transition-all duration-300 hover:translate-x-1.5 hover:text-[#D4AF37] inline-block">AI Engine</Link></li>
                <li><Link href="/bespoke" className="font-body text-base text-white/70 transition-all duration-300 hover:translate-x-1.5 hover:text-[#D4AF37] inline-block">Virtual Fitting</Link></li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                Company
              </span>
              <ul className="flex flex-col gap-3">
                <li><Link href="/" className="font-body text-base text-white/70 transition-all duration-300 hover:translate-x-1.5 hover:text-[#D4AF37] inline-block">Customers</Link></li>
                <li><Link href="/" className="font-body text-base text-white/70 transition-all duration-300 hover:translate-x-1.5 hover:text-[#D4AF37] inline-block">Features</Link></li>
                <li><Link href="/" className="font-body text-base text-white/70 transition-all duration-300 hover:translate-x-1.5 hover:text-[#D4AF37] inline-block">About Us</Link></li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                Care
              </span>
              <ul className="flex flex-col gap-3">
                <li><Link href="/" className="font-body text-base text-white/70 transition-all duration-300 hover:translate-x-1.5 hover:text-[#D4AF37] inline-block">Help & FAQ</Link></li>
                <li><Link href="/" className="font-body text-base text-white/70 transition-all duration-300 hover:translate-x-1.5 hover:text-[#D4AF37] inline-block">Returns</Link></li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                Region
              </span>
              <ul className="flex flex-col gap-3">
                <li><span className="font-body text-base text-white/70 flex items-center gap-2 cursor-pointer hover:text-white transition-colors"><span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> Nigeria</span></li>
                <li><span className="font-body text-base text-white/70 flex items-center gap-2 cursor-pointer hover:text-white transition-colors"><span className="w-1.5 h-1.5 rounded-full bg-white/20"></span> UK</span></li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 flex flex-col items-center gap-8 border-t border-white/10 pt-10 sm:mt-auto sm:flex-row sm:justify-between relative z-10">
          <div className="flex flex-col gap-2 text-center sm:text-left">
            <span className="font-body text-[12px] uppercase tracking-[0.25em] text-white/40 font-semibold">
              © {new Date().getFullYear()} QLOZET STUDIOS. ALL RIGHTS RESERVED.
            </span>
          </div>

          {/* Social & Legal Group */}
          <div className="flex flex-wrap items-center justify-center gap-6 font-body text-[12px] font-bold uppercase tracking-[0.2em] text-white/50">
            <Link href="#" className="transition-all hover:text-[#D4AF37] hover:tracking-[0.25em]">Instagram</Link>
            <Link href="#" className="transition-all hover:text-[#D4AF37] hover:tracking-[0.25em]">Twitter</Link>
            <Link href="#" className="transition-all hover:text-[#D4AF37] hover:tracking-[0.25em]">LinkedIn</Link>
            <div className="hidden h-px w-6 bg-white/20 sm:block"></div>
            <Link href="#" className="transition-all hover:text-white">Privacy</Link>
            <Link href="#" className="transition-all hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </>
  );
};
