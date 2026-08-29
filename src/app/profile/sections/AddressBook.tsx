'use client';

import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Search, X, Navigation, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { useApp } from '@/context/AppContext';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import Toggle from '../components/Toggle';
import { cardStyle, fieldInput } from '../styles';
import { suggestedAddresses } from '../data';
import type { ActiveSection, AddressEntry } from '../types';
import { AddressBookSkeleton } from '../components/Skeleton';

interface AddressBookProps {
  activeSection: ActiveSection;
  setActiveSection: (s: ActiveSection) => void;
}

export default function AddressBook({ activeSection, setActiveSection }: AddressBookProps) {
  const { user } = useApp();
  const [addresses, setAddresses] = useState<AddressEntry[]>([]);
  const [addressSearch, setAddressSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ text: '', type: 'success' });

  // Load shipping address from backend
  const fetchAddresses = () => {
    setIsLoading(true);
    api.get('/users/customer/addresses')
      .then((res) => {
        setIsLoading(false);
        // Backend interceptor wraps as { statusCode, data: [...] }
        const data = res.data?.data ?? res.data;
        if (data) {
          const list = Array.isArray(data) ? data : [data];
          const parsed: AddressEntry[] = list
            .filter((item: any) => item._id || item.id)
            .map((item: any) => ({
            id: item._id || item.id,
            name: item.label || item.full_name || 'Shipping Address',
            lines: [
              item.address,
              `${item.city || ''}, ${item.state || ''} ${item.country || ''}`,
              item.phone_number || ''
            ].filter(Boolean),
            isDefault: item.is_default || false,
          }));
          setAddresses(parsed);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        console.warn('[AddressBook] GET /addresses failed:', err.response?.status, err.response?.data || err.message);
      });
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = (selectedAddr: { main: string, sub: string }) => {
    setIsLoading(true);
    setFeedback({ text: '', type: 'success' });

    const sanitizedName = (user?.name || 'Guest').replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' ').trim() || 'Guest';

    // Detect country from address sub text
    const subLower = selectedAddr.sub.toLowerCase();
    let country = 'Nigeria';
    let defaultPostal = '900108';
    let defaultLat = 9.0765;
    let defaultLng = 7.3986;
    if (subLower.includes('united states')) {
      country = 'United States';
      defaultPostal = '10001';
      defaultLat = 40.7128;
      defaultLng = -74.0060;
    } else if (subLower.includes('united kingdom')) {
      country = 'United Kingdom';
      defaultPostal = 'SW1A 1AA';
      defaultLat = 51.5074;
      defaultLng = -0.1278;
    }

    // Mock geolocation coordinates for selected addresses
    const payload = {
      full_name: sanitizedName,
      phone_number: user?.phone || '',
      address: selectedAddr.main,
      city: selectedAddr.sub.split(',')[0]?.trim() || '',
      state: selectedAddr.sub.split(',')[1]?.trim() || '',
      country,
      postal_code: defaultPostal,
      latitude: defaultLat,
      longitude: defaultLng
    };

    api.post('/users/customer/addresses', { ...payload, label: selectedAddr.main })
      .then(() => {
        setIsLoading(false);
        setFeedback({ text: 'Address added successfully!', type: 'success' });
        fetchAddresses();
        setActiveSection('address-book');
      })
      .catch((err) => {
        setIsLoading(false);
        setFeedback({ text: err.response?.data?.message || 'Failed to save address.', type: 'error' });
      });
  };

  const toggleDefaultAddress = async (id: string) => {
    // Optimistic update
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    try {
      await api.patch(`/users/customer/addresses/${id}/default`);
    } catch (err: any) {
      console.error('Failed to set default:', err);
      setFeedback({ text: err.response?.data?.message || 'Failed to set default address.', type: 'error' });
      fetchAddresses(); // revert to server state
    }
  };

  const deleteAddress = async (id: string) => {
    // Optimistic update
    const prev = addresses;
    setAddresses(p => p.filter(a => a.id !== id));
    try {
      await api.delete(`/users/customer/addresses/${id}`);
    } catch (err: any) {
      console.error('Failed to delete:', err);
      setFeedback({ text: err.response?.data?.message || 'Failed to delete address.', type: 'error' });
      setAddresses(prev); // revert on failure
    }
  };

  // Google Places integration
  const { isLoaded, predictions, search, getPlaceDetails, clearPredictions } = useGooglePlaces();

  if (activeSection === 'add-address') {
    const query = addressSearch.toLowerCase().trim();
    
    // Local fallback addresses
    const filteredAddresses = query
      ? suggestedAddresses.filter(
          (addr) =>
            addr.main.toLowerCase().includes(query) ||
            addr.sub.toLowerCase().includes(query)
        )
      : suggestedAddresses;

    // Highlight matching text within a string
    const highlightMatch = (text: string) => {
      if (!query) return <>{text}</>;
      const idx = text.toLowerCase().indexOf(query);
      if (idx === -1) return <>{text}</>;
      return (
        <>
          {text.slice(0, idx)}
          <strong style={{ color: 'var(--brand-brown)', fontWeight: 700 }}>{text.slice(idx, idx + query.length)}</strong>
          {text.slice(idx + query.length)}
        </>
      );
    };

    const isUsingGoogle = isLoaded && query.length > 0;
    const showEmptyState = isUsingGoogle ? predictions.length === 0 : filteredAddresses.length === 0;

    return (
      <div className="animate-fade-in flex flex-col" style={{ gap: '16px' }}>
        <div className="flex items-center justify-between">
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Add Address</h3>
        </div>

        {feedback.text && (
          <div 
            style={{ 
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

        {!isLoaded && !process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY && (
          <div style={{ fontSize: '11px', color: '#B45309', background: '#FEF3C7', padding: '8px 12px', borderRadius: '8px', fontWeight: 600 }}>
            Note: Google Places API key not found. Using local address suggestions.
          </div>
        )}

        <div style={cardStyle}>
          <div className="flex items-center" style={{ padding: '14px 20px', gap: '10px', borderBottom: '1px solid var(--border-glass)' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              value={addressSearch}
              onChange={(e) => {
                setAddressSearch(e.target.value);
                search(e.target.value);
              }}
              placeholder={isLoaded ? "Search Google Maps..." : "Type an area, city, or state..."}
              className="flex-1"
              style={{ ...fieldInput, borderBottom: 'none', padding: '0', fontSize: '13px' }}
              autoFocus
            />
            {addressSearch && (
              <button 
                onClick={() => {
                  setAddressSearch('');
                  clearPredictions();
                }} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={16} color="var(--text-muted)" />
              </button>
            )}
          </div>

          {!addressSearch && (
            <button className="w-full flex items-center hover:bg-[var(--bg-surface-elevated)] transition-colors" style={{ padding: '14px 20px', gap: '10px', background: 'none', border: 'none', borderBottom: '1px solid var(--border-glass)', cursor: 'pointer' }}>
              <Navigation size={16} color="var(--brand-brown)" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Use your current location</span>
            </button>
          )}

          {addressSearch && showEmptyState && (
            <div className="flex flex-col items-center justify-center" style={{ padding: '40px 20px', gap: '8px' }}>
              <MapPin size={24} color="var(--text-muted)" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>No places match &ldquo;{addressSearch}&rdquo;</span>
            </div>
          )}

          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {isUsingGoogle ? (
              // GOOGLE PLACES PREDICTIONS
              predictions.map((addr, i) => (
                <button 
                  key={addr.placeId}
                  onClick={async () => {
                    setIsLoading(true);
                    setAddressSearch(addr.fullDescription);
                    clearPredictions();
                    try {
                      const details = await getPlaceDetails(addr.placeId);
                      
                      const sanitizedName = (user?.name || 'Guest').replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' ').trim() || 'Guest';
                      
                      const payload = {
                        full_name: sanitizedName,
                        phone_number: user?.phone || '',
                        address: details.address,
                        city: details.city || addr.main,
                        state: details.state,
                        country: details.country || 'Nigeria',
                        postal_code: details.postalCode || '000000',
                        latitude: details.lat,
                        longitude: details.lng
                      };

                      await api.post('/users/customer/addresses', { ...payload, label: addr.main });
                      
                      setFeedback({ text: 'Address added successfully!', type: 'success' });
                      fetchAddresses();
                      setActiveSection('address-book');
                    } catch (err: any) {
                      setFeedback({ text: err.response?.data?.message || 'Failed to retrieve or save place.', type: 'error' });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className="w-full flex items-start hover:bg-[var(--bg-surface-elevated)] transition-colors" 
                  style={{ padding: '14px 20px', gap: '12px', background: 'none', border: 'none', borderBottom: i < predictions.length - 1 ? '1px solid var(--border-glass)' : 'none', cursor: 'pointer', textAlign: 'left', opacity: isLoading ? 0.7 : 1 }}
                >
                  <MapPin size={16} color="var(--text-muted)" className="flex-shrink-0" style={{ marginTop: '2px' }} />
                  <div className="flex flex-col" style={{ gap: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{highlightMatch(addr.main)}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{highlightMatch(addr.sub)}</span>
                  </div>
                </button>
              ))
            ) : (
              // LOCAL FALLBACK ADDRESSES
              filteredAddresses.map((addr, i) => (
                <button 
                  key={`${addr.main}-${addr.sub}-${i}`}
                  onClick={() => handleAddAddress(addr)}
                  disabled={isLoading}
                  className="w-full flex items-start hover:bg-[var(--bg-surface-elevated)] transition-colors" 
                  style={{ padding: '14px 20px', gap: '12px', background: 'none', border: 'none', borderBottom: i < filteredAddresses.length - 1 ? '1px solid var(--border-glass)' : 'none', cursor: 'pointer', textAlign: 'left', opacity: isLoading ? 0.7 : 1 }}
                >
                  <MapPin size={16} color="var(--text-muted)" className="flex-shrink-0" style={{ marginTop: '2px' }} />
                  <div className="flex flex-col" style={{ gap: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{highlightMatch(addr.main)}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{highlightMatch(addr.sub)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col" style={{ gap: '16px' }}>
      {/* Header card — mirrors the My Measurement landing header */}
      <div style={cardStyle}>
        <div className="flex flex-col" style={{ padding: '24px 20px' }}>
          <MapPin size={32} color="var(--text-primary)" strokeWidth={1.5} style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '4px' }}>
            Address Book
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
            {addresses.length > 0
              ? `${addresses.length} saved address${addresses.length === 1 ? '' : 'es'} — your default is used at checkout.`
              : 'Save a delivery address to speed up checkout.'}
          </p>
          <button
            onClick={() => setActiveSection('add-address')}
            className="self-start transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ padding: '12px 24px', borderRadius: '10px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', cursor: 'pointer' }}
          >
            Add Address
          </button>
        </div>
      </div>

      {isLoading && addresses.length === 0 && (
        <AddressBookSkeleton />
      )}

      {addresses.length === 0 && !isLoading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px', background: 'var(--bg-base)', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
          No shipping addresses found. Add a new address to get started.
        </div>
      )}

      {addresses.map((addr) => (
        <div key={addr.id} style={{ ...cardStyle, padding: '20px' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-start" style={{ gap: '12px' }}>
              <div className="flex-shrink-0" style={{ width: '18px', height: '18px', borderRadius: '50%', border: addr.isDefault ? '5px solid var(--brand-fill)' : '2px solid var(--border-glass)', marginTop: '2px' }} />
              <div className="flex flex-col" style={{ gap: '2px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{addr.name}</span>
                {addr.lines.map((line, i) => (
                  <span key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{line}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center flex-shrink-0" style={{ gap: '8px' }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <Pencil size={16} color="var(--text-muted)" />
              </button>
              <button onClick={() => deleteAddress(addr.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <Trash2 size={16} color="var(--text-muted)" />
              </button>
            </div>
          </div>
          <div className="flex items-center" style={{ gap: '10px', marginTop: '14px' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--brand-fill-text)', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'var(--brand-fill)', borderRadius: '4px', padding: '4px 10px' }}>
              {addr.isDefault ? 'Your Default Address' : 'Toggle to make default'}
            </span>
            <Toggle value={addr.isDefault} onChange={() => toggleDefaultAddress(addr.id)} />
          </div>
        </div>
      ))}
    </div>
  );
}
