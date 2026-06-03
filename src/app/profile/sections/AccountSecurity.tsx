'use client';

import React, { useState } from 'react';
import { ShieldCheck, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { cardStyle } from '../styles';
import type { ActiveSection } from '../types';

interface AccountSecurityProps {
  activeSection: ActiveSection;
  setActiveSection: (s: ActiveSection) => void;
}

export default function AccountSecurity({ activeSection, setActiveSection }: AccountSecurityProps) {
  const [faceId, setFaceId] = useState(false);
  const [password, setPassword] = useState('••••••••••••••');
  const [newPassword, setNewPassword] = useState('••••••••••••••••');
  const [confirmPassword, setConfirmPassword] = useState('••••••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ═══════════════════════════════════════════════════════════
  //  CHANGE PASSWORD
  // ═══════════════════════════════════════════════════════════
  if (activeSection === 'change-password') {
    return (
      <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
        {/* Header card */}
        <div style={cardStyle}>
          <div style={{ padding: '24px 20px' }}>
            <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.08)', marginBottom: '14px' }}>
              <ShieldCheck size={18} color="#1A1A1A" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Account Security
            </h3>
          </div>
        </div>

        {/* Password fields */}
        <div className="flex flex-col" style={{ gap: '12px' }}>
          {/* Current Password */}
          <div style={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', background: '#FFFFFF', padding: '14px 20px' }}>
            <label style={{ fontSize: '10px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <div className="flex items-center justify-between">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1"
                style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A', background: 'none', border: 'none', outline: 'none', letterSpacing: '0.1em' }}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="flex items-center justify-center transition-all"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                {showPassword ? <EyeOff size={18} color="#999" /> : <Eye size={18} color="#999" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div style={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', background: '#FFFFFF', padding: '14px 20px' }}>
            <label style={{ fontSize: '10px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
              New Password
            </label>
            <div className="flex items-center justify-between">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex-1"
                style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A', background: 'none', border: 'none', outline: 'none', letterSpacing: '0.1em' }}
              />
              <button
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="flex items-center justify-center transition-all"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                {showNewPassword ? <EyeOff size={18} color="#999" /> : <Eye size={18} color="#999" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div style={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', background: '#FFFFFF', padding: '14px 20px' }}>
            <label style={{ fontSize: '10px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
              Confirm Password
            </label>
            <div className="flex items-center justify-between">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="flex-1"
                style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A', background: 'none', border: 'none', outline: 'none', letterSpacing: '0.1em' }}
              />
              <button
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="flex items-center justify-center transition-all"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                {showConfirmPassword ? <EyeOff size={18} color="#999" /> : <Eye size={18} color="#999" />}
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={() => setActiveSection('account-security')}
          className="w-full transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ padding: '16px', borderRadius: '14px', background: '#2C1810', color: '#FFF', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', border: 'none', cursor: 'pointer' }}
        >
          Submit
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  ACCOUNT SECURITY — Main view
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
      {/* Header card */}
      <div style={cardStyle}>
        <div style={{ padding: '24px 20px' }}>
          <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.08)', marginBottom: '14px' }}>
            <ShieldCheck size={18} color="#1A1A1A" />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Account Security
          </h3>
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-col" style={{ gap: '0' }}>
        {/* Change Password */}
        <button
          onClick={() => setActiveSection('change-password')}
          className="w-full flex items-center justify-between transition-all hover:bg-[#FAFAFA]"
          style={{ padding: '18px 20px', borderRadius: '16px 16px 0 0', border: '1px solid rgba(0,0,0,0.06)', borderBottom: 'none', background: '#FFFFFF', cursor: 'pointer' }}
        >
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A' }}>Change Password</span>
          <ChevronRight size={18} color="#CCC" />
        </button>

        {/* Face ID / Touch ID */}
        <div
          className="flex items-center justify-between"
          style={{ padding: '18px 20px', borderRadius: '0 0 16px 16px', border: '1px solid rgba(0,0,0,0.06)', background: '#FFFFFF' }}
        >
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A' }}>Face ID / Touch ID</span>
          <button
            onClick={() => setFaceId(!faceId)}
            className="relative transition-all"
            style={{
              width: '44px',
              height: '24px',
              borderRadius: '100px',
              background: faceId ? '#2C1810' : '#E5E5E5',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <div
              className="absolute transition-all"
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#FFFFFF',
                top: '2px',
                left: faceId ? '22px' : '2px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
