'use client';

import React, { useState } from 'react';
import { Pencil, Trash2, Search, X, Navigation, MapPin } from 'lucide-react';
import Toggle from '../components/Toggle';
import { cardStyle, fieldInput } from '../styles';
import { defaultAddresses, suggestedAddresses } from '../data';
import type { ActiveSection, AddressEntry } from '../types';

interface AddressBookProps {
  activeSection: ActiveSection;
  setActiveSection: (s: ActiveSection) => void;
}

export default function AddressBook({ activeSection, setActiveSection }: AddressBookProps) {
  const [addresses, setAddresses] = useState<AddressEntry[]>(defaultAddresses);
  const [addressSearch, setAddressSearch] = useState('');

  const toggleDefaultAddress = (id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  };
  const deleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  if (activeSection === 'add-address') {
    return (
      <div className="animate-fade-in flex flex-col" style={{ gap: '16px' }}>
        <div className="flex items-center justify-between">
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Add Address</h3>
          <button className="transition-all hover:opacity-90 active:scale-95" style={{ padding: '10px 24px', borderRadius: '100px', background: '#1A1A1A', color: '#FFF', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', border: 'none', cursor: 'pointer' }}>
            Add Address
          </button>
        </div>

        <div style={cardStyle}>
          <div className="flex items-center" style={{ padding: '14px 20px', gap: '10px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <Search size={16} color="#999" />
            <input type="text" value={addressSearch} onChange={(e) => setAddressSearch(e.target.value)} placeholder="Search for items and brands" className="flex-1" style={{ ...fieldInput, borderBottom: 'none', padding: '0', fontSize: '13px' }} />
            {addressSearch && (
              <button onClick={() => setAddressSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={16} color="#999" />
              </button>
            )}
          </div>

          <button className="w-full flex items-center hover:bg-gray-50 transition-colors" style={{ padding: '14px 20px', gap: '10px', background: 'none', border: 'none', borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer' }}>
            <Navigation size={16} color="#462814" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>Use your current location</span>
          </button>

          {suggestedAddresses.map((addr, i) => (
            <button key={i} className="w-full flex items-start hover:bg-gray-50 transition-colors" style={{ padding: '14px 20px', gap: '12px', background: 'none', border: 'none', borderBottom: i < suggestedAddresses.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', textAlign: 'left' }}>
              <MapPin size={16} color="#999" className="flex-shrink-0" style={{ marginTop: '2px' }} />
              <div className="flex flex-col" style={{ gap: '2px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>{addr.main}</span>
                <span style={{ fontSize: '12px', color: '#999' }}>{addr.sub}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col" style={{ gap: '16px' }}>
      <div className="flex items-center justify-between">
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Address Book</h3>
        <button onClick={() => setActiveSection('add-address')} className="transition-all hover:opacity-90 active:scale-95" style={{ padding: '10px 24px', borderRadius: '100px', background: '#1A1A1A', color: '#FFF', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', border: 'none', cursor: 'pointer' }}>
          Add Address
        </button>
      </div>

      {addresses.map((addr) => (
        <div key={addr.id} style={{ ...cardStyle, padding: '20px' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-start" style={{ gap: '12px' }}>
              <div className="flex-shrink-0" style={{ width: '18px', height: '18px', borderRadius: '50%', border: addr.isDefault ? '5px solid #1A1A1A' : '2px solid #CCC', marginTop: '2px' }} />
              <div className="flex flex-col" style={{ gap: '2px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>{addr.name}</span>
                {addr.lines.map((line, i) => (
                  <span key={i} style={{ fontSize: '13px', color: '#666', lineHeight: 1.5 }}>{line}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center flex-shrink-0" style={{ gap: '8px' }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <Pencil size={16} color="#888" />
              </button>
              <button onClick={() => deleteAddress(addr.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <Trash2 size={16} color="#888" />
              </button>
            </div>
          </div>
          <div className="flex items-center" style={{ gap: '10px', marginTop: '14px' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#FFF', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#1A1A1A', borderRadius: '4px', padding: '4px 10px' }}>
              {addr.isDefault ? 'Your Default Measurement' : 'Toggle to make default'}
            </span>
            <Toggle value={addr.isDefault} onChange={() => toggleDefaultAddress(addr.id)} />
          </div>
        </div>
      ))}
    </div>
  );
}
