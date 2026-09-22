'use client';

import React, { useState } from 'react';
import { ShieldCheck, ChevronRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { cardStyle } from '../styles';
import type { ActiveSection } from '../types';

interface AccountSecurityProps {
  activeSection: ActiveSection;
  setActiveSection: (s: ActiveSection) => void;
}

function PasswordField({
  label, value, onChange, show, onToggleShow, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  placeholder: string;
}) {
  return (
    <div style={{ borderRadius: '16px', border: '1px solid var(--border-glass)', background: 'var(--bg-base)', padding: '14px 20px' }}>
      <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
        {label}
      </label>
      <div className="flex items-center justify-between">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={label === 'Current Password' ? 'current-password' : 'new-password'}
          className="flex-1"
          style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', background: 'none', border: 'none', outline: 'none', letterSpacing: '0.1em' }}
        />
        <button
          onClick={onToggleShow}
          type="button"
          className="flex items-center justify-center transition-all"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
        >
          {show ? <EyeOff size={18} color="var(--text-muted)" /> : <Eye size={18} color="var(--text-muted)" />}
        </button>
      </div>
    </div>
  );
}

export default function AccountSecurity({ activeSection, setActiveSection }: AccountSecurityProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("The new passwords don't match.");
      return;
    }
    setSaving(true);
    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success('Password updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveSection('account-security');
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { message?: string | string[] } } };
      const msg = anyErr?.response?.data?.message;
      toast.error((Array.isArray(msg) ? msg[0] : msg) || 'Could not update your password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ═══════════════════════════════════════════════════════════
  //  CHANGE PASSWORD
  // ═══════════════════════════════════════════════════════════
  if (activeSection === 'change-password') {
    return (
      <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
        {/* Header card */}
        <div style={cardStyle}>
          <div style={{ padding: '24px 20px' }}>
            <ShieldCheck size={28} color="var(--brand-brown)" strokeWidth={1.5} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '12px' }}>
              Change Password
            </h3>
          </div>
        </div>

        {/* Password fields */}
        <div className="flex flex-col" style={{ gap: '12px' }}>
          <PasswordField
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showCurrent}
            onToggleShow={() => setShowCurrent(!showCurrent)}
            placeholder="Your current password"
          />
          <PasswordField
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            onToggleShow={() => setShowNew(!showNew)}
            placeholder="At least 8 characters"
          />
          <PasswordField
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirm}
            onToggleShow={() => setShowConfirm(!showConfirm)}
            placeholder="Repeat the new password"
          />
        </div>

        {/* Submit */}
        <button
          onClick={submit}
          disabled={saving || !currentPassword || !newPassword || !confirmPassword}
          className="w-full flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          style={{ padding: '16px', borderRadius: '14px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', border: 'none', cursor: saving ? 'wait' : 'pointer' }}
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? 'Updating…' : 'Update Password'}
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
          <ShieldCheck size={28} color="var(--brand-brown)" strokeWidth={1.5} />
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '12px' }}>
            Account Security
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Keep your account safe with a strong, unique password.
          </p>
        </div>
      </div>

      {/* Options — passkeys (Face ID / fingerprint sign-in) join this list
          once WebAuthn lands on the backend. */}
      <button
        onClick={() => setActiveSection('change-password')}
        className="w-full flex items-center justify-between transition-all hover:bg-[var(--bg-surface-elevated)]"
        style={{ padding: '18px 20px', borderRadius: '16px', border: '1px solid var(--border-glass)', background: 'var(--bg-base)', cursor: 'pointer' }}
      >
        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Change Password</span>
        <ChevronRight size={18} color="var(--text-muted)" />
      </button>
    </div>
  );
}
