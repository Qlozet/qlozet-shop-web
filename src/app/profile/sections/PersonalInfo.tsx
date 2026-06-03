'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Pencil, Calendar } from 'lucide-react';
import DatePicker, { MONTHS } from '../components/DatePicker';
import { fieldLabel, fieldInput } from '../styles';

interface PersonalInfoProps {
  userName?: string;
}

export default function PersonalInfo({ userName }: PersonalInfoProps) {
  const [fullName, setFullName] = useState(userName || 'Kemi Ayomi');
  const [username, setUsername] = useState('@Kem_ayo');
  const [email, setEmail] = useState('kemi@gmail.com');
  const [address, setAddress] = useState('13c Hallen estate, Abuja, Nigeria');
  const [dob, setDob] = useState(new Date(1995, 4, 20));
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <div className="animate-fade-in" style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: '32px', position: 'relative' }}>
      {/* Avatar */}
      <div className="flex items-start" style={{ marginBottom: '28px' }}>
        <div className="relative">
          <div className="overflow-hidden" style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#F0ECE8', border: '3px solid #E8E0D8' }}>
            <Image src="/image/woman.png" alt="Profile Photo" width={100} height={100} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
          </div>
          <button style={{ position: 'absolute', top: '0', right: '-8px', width: '28px', height: '28px', borderRadius: '50%', background: '#FFF', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Pencil size={12} color="#666" />
          </button>
        </div>
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '28px' }}>
        Basic Info
      </h3>

      <div className="flex flex-col" style={{ gap: '24px' }}>
        <div>
          <label style={fieldLabel}>Full Name*</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={fieldInput} />
        </div>
        <div>
          <label style={fieldLabel}>Username*</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={fieldInput} />
        </div>
        <div>
          <label style={fieldLabel}>Email Address*</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={fieldInput} />
        </div>
        <div>
          <label style={fieldLabel}>Address*</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} style={fieldInput} />
        </div>
        <div className="relative">
          <label style={fieldLabel}>Date of Birth</label>
          <div className="flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A' }}>
              {MONTHS[dob.getMonth()]} {dob.getDate()}, {dob.getFullYear()}
            </span>
            <button onClick={() => setShowDatePicker(!showDatePicker)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <Calendar size={18} color="#888" />
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
        className="w-full transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ marginTop: '36px', padding: '16px', borderRadius: '12px', background: '#462814', color: '#FFF', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', cursor: 'pointer' }}
      >
        Save Changes
      </button>
    </div>
  );
}
