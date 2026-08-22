'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Pencil, Calendar, MapPin, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { api } from '@/lib/api';
import DatePicker, { MONTHS } from '../components/DatePicker';
import { fieldLabel, fieldInput } from '../styles';

interface PersonalInfoProps {
  userName?: string;
  onNavigateToAddressBook?: () => void;
}

export default function PersonalInfo({ userName, onNavigateToAddressBook }: PersonalInfoProps) {
  const { user, login } = useApp();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [defaultAddress, setDefaultAddress] = useState<{ address: string; city: string; state: string; country: string } | null>(null);
  const [dob, setDob] = useState(new Date(1995, 4, 20));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: 'success' });

  // Track original values to detect changes
  const originals = useRef({ fullName: '', username: '', address: '', dob: '' });

  // Fetch default address from backend
  useEffect(() => {
    api.get('/users/customer/addresses/default')
      .then((res) => {
        const data = res.data?.data ?? res.data;
        if (data && (data._id || data.id)) {
          setDefaultAddress(data);
          setAddress(`${data.address}, ${data.city}, ${data.state}`);
        }
      })
      .catch(() => {
        // No default address set — that's fine
      });
  }, []);

  // Sync profile details when context user loads
  useEffect(() => {
    if (user) {
      const name = user.name || '';
      const uname = user.username || '';
      const addr = user.address || '';
      const dobStr = user.dob ? new Date(user.dob).toISOString() : new Date(1995, 4, 20).toISOString();

      setFullName(name);
      setUsername(uname);
      setEmail(user.email || '');
      setAddress(addr);
      if (user.dob) setDob(new Date(user.dob));

      // Store originals for change detection
      originals.current = { fullName: name, username: uname, address: addr, dob: dobStr };
    }
  }, [user]);

  // Detect if any field has changed
  const hasChanges = useMemo(() => {
    const o = originals.current;
    return (
      fullName !== o.fullName ||
      username !== o.username ||
      address !== o.address ||
      dob.toISOString() !== o.dob
    );
  }, [fullName, username, address, dob]);

  const handleSaveChanges = () => {
    setIsLoading(true);
    setFeedback({ text: '', type: 'success' });

    api.patch('/users/me/profile', {
      full_name: fullName,
      username,
      address,
      dob: dob.toISOString(),
    })
      .then((res) => {
        setIsLoading(false);
        setFeedback({ text: 'Changes saved successfully!', type: 'success' });
        
        // Update originals so button disables again
        originals.current = { fullName, username, address, dob: dob.toISOString() };
        
        // Update user profile in context
        if (user) {
          const updatedUser = {
            ...user,
            name: fullName,
            username,
            address,
            dob: dob.toISOString(),
          };
          localStorage.setItem('qlozet_user', JSON.stringify(updatedUser));
          login(user.email, fullName);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        setFeedback({
          text: err.response?.data?.message || 'Failed to save changes. Please try again.',
          type: 'error',
        });
      });
  };

  return (
    <div className="animate-fade-in" style={{ background: 'var(--bg-base)', borderRadius: '16px', border: '1px solid var(--border-glass)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: '32px', position: 'relative' }}>
      
      {/* Feedback Messages */}
      {feedback.text && (
        <div 
          style={{ 
            marginBottom: '20px', 
            padding: '12px 16px', 
            borderRadius: '10px', 
            fontSize: '13px', 
            fontWeight: 600,
            background: feedback.type === 'error' ? '#FEF2F2' : '#F0FDF4',
            border: feedback.type === 'error' ? '1px solid #FECACA' : '1px solid #BBF7D0',
            color: feedback.type === 'error' ? '#DC2626' : '#16A34A'
          }}
        >
          {feedback.text}
        </div>
      )}

      {/* Avatar */}
      <div className="flex items-start" style={{ marginBottom: '28px' }}>
        <div className="relative">
          <div className="overflow-hidden" style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-surface-elevated)', border: '3px solid var(--border-glass)' }}>
            <Image src="/image/woman.png" alt="Profile Photo" width={100} height={100} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
          </div>
          <button style={{ position: 'absolute', top: '0', right: '-8px', width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-glass)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Pencil size={12} color="var(--text-secondary)" />
          </button>
        </div>
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '28px' }}>
        Basic Info
      </h3>

      <div className="flex flex-col" style={{ gap: '24px' }}>
        <div>
          <label style={fieldLabel}>Full Name*</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={fieldInput} />
        </div>
        <div>
          <label style={fieldLabel}>Username*</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} style={fieldInput} placeholder="Choose a unique username" />
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Must be unique. Letters, numbers, and underscores only.</span>
        </div>
        <div>
          <label style={fieldLabel}>Email Address*</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={fieldInput} disabled />
        </div>
        <div>
          <label style={fieldLabel}>Address*</label>
          <button
            onClick={() => onNavigateToAddressBook?.()}
            className="w-full flex items-center justify-between group hover:bg-gray-50 transition-colors"
            style={{
              borderBottom: '1px solid var(--border-glass)',
              paddingBottom: '10px',
              background: 'none',
              border: 'none',
              borderBottomWidth: '1px',
              borderBottomStyle: 'solid',
              borderBottomColor: 'var(--border-glass)',
              cursor: 'pointer',
              padding: '0 0 10px 0',
            }}
          >
            <div className="flex items-center" style={{ gap: '8px', flex: 1, minWidth: 0 }}>
              <MapPin size={14} color="var(--brand-brown)" className="flex-shrink-0" />
              <span style={{
                fontSize: '14px',
                fontWeight: 500,
                color: defaultAddress ? 'var(--text-primary)' : 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {defaultAddress 
                  ? `${defaultAddress.address}, ${defaultAddress.city}, ${defaultAddress.state}`
                  : 'Tap to set your default address'
                }
              </span>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" className="flex-shrink-0" />
          </button>
        </div>
        <div className="relative">
          <label style={fieldLabel}>Date of Birth</label>
          <div className="flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
              {MONTHS[dob.getMonth()]} {dob.getDate()}, {dob.getFullYear()}
            </span>
            <button onClick={() => setShowDatePicker(!showDatePicker)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <Calendar size={18} color="var(--text-muted)" />
            </button>
          </div>
          {showDatePicker && (
            <div style={{ position: 'absolute', top: '100%', left: '0', zIndex: 20, marginTop: '8px' }}>
              <DatePicker value={dob} onChange={(d) => setDob(d)} onClose={() => setShowDatePicker(false)} />
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleSaveChanges}
        disabled={!hasChanges || isLoading}
        className="w-full transition-all hover:opacity-90 active:scale-[0.98]"
        style={{
          marginTop: '36px',
          padding: '16px',
          borderRadius: '12px',
          background: hasChanges ? 'var(--brand-fill)' : 'var(--bg-surface-elevated)',
          color: hasChanges ? 'var(--brand-fill-text)' : 'var(--text-muted)',
          fontSize: '12px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          border: 'none',
          cursor: !hasChanges || isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.7 : 1,
        }}
      >
        {isLoading ? 'Saving Changes...' : hasChanges ? 'Save Changes' : 'No Changes'}
      </button>
    </div>
  );
}

