'use client';

import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, Check, Eye, EyeOff } from 'lucide-react';
import { cardStyle } from '../styles';
import type { ActiveSection } from '../types';

// ─── Demo Cards ──────────────────────────────────────────────
interface SavedCard {
  id: string;
  type: 'visa' | 'mastercard' | 'verve';
  last4: string;
  expiry: string;
  holder: string;
  isDefault: boolean;
  gradient: string;
}

const DEMO_CARDS: SavedCard[] = [
  {
    id: 'c1',
    type: 'visa',
    last4: '4532',
    expiry: '09/27',
    holder: 'KEMI AYOMI',
    isDefault: true,
    gradient: 'linear-gradient(135deg, #1A1A1A 0%, #333333 50%, #1A1A1A 100%)',
  },
  {
    id: 'c2',
    type: 'mastercard',
    last4: '8891',
    expiry: '03/26',
    holder: 'KEMI AYOMI',
    isDefault: false,
    gradient: 'linear-gradient(135deg, #2C1810 0%, #5A3420 50%, #2C1810 100%)',
  },
  {
    id: 'c3',
    type: 'verve',
    last4: '0217',
    expiry: '11/28',
    holder: 'KEMI AYOMI',
    isDefault: false,
    gradient: 'linear-gradient(135deg, #0F4C3A 0%, #1A7A5E 50%, #0F4C3A 100%)',
  },
];

// ─── Card Brand Logo ─────────────────────────────────────────
const CardBrandLogo = ({ type, size = 'md' }: { type: SavedCard['type']; size?: 'sm' | 'md' }) => {
  const w = size === 'sm' ? 32 : 44;
  const h = size === 'sm' ? 20 : 28;

  if (type === 'visa') {
    return (
      <div className="flex items-center justify-center" style={{ width: w, height: h }}>
        <span style={{ fontSize: size === 'sm' ? '10px' : '14px', fontWeight: 900, color: '#FFFFFF', fontStyle: 'italic', letterSpacing: '0.02em' }}>VISA</span>
      </div>
    );
  }
  if (type === 'mastercard') {
    return (
      <svg width={w} height={h} viewBox="0 0 40 28" fill="none">
        <circle cx="14" cy="14" r="10" fill="#EB001B" opacity="0.9" />
        <circle cx="26" cy="14" r="10" fill="#F79E1B" opacity="0.9" />
        <path d="M20 6a10 10 0 010 16 10 10 0 000-16z" fill="#FF5F00" />
      </svg>
    );
  }
  // verve
  return (
    <div className="flex items-center justify-center" style={{ width: w, height: h, borderRadius: '4px', background: 'rgba(255,255,255,0.15)' }}>
      <span style={{ fontSize: size === 'sm' ? '8px' : '10px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '0.06em' }}>VERVE</span>
    </div>
  );
};

// ─── Component ───────────────────────────────────────────────
interface PaymentInformationProps {
  activeSection: ActiveSection;
  setActiveSection: (s: ActiveSection) => void;
}

export default function PaymentInformation({ activeSection, setActiveSection }: PaymentInformationProps) {
  const [cards] = useState<SavedCard[]>(DEMO_CARDS);
  const [selectedCard, setSelectedCard] = useState<string>('c1');

  // Add card form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [holderName, setHolderName] = useState('');
  const [showCvv, setShowCvv] = useState(false);

  // Format card number with spaces
  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  // ═══════════════════════════════════════════════════════════
  //  ADD CARD FORM
  // ═══════════════════════════════════════════════════════════
  if (activeSection === 'add-card') {
    return (
      <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
        {/* Header card */}
        <div style={cardStyle}>
          <div style={{ padding: '24px 20px' }}>
            <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.08)', marginBottom: '14px' }}>
              <CreditCard size={18} color="#1A1A1A" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Add New Card
            </h3>
          </div>
        </div>

        {/* Preview card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #462814 0%, #6B3F20 50%, #462814 100%)',
            borderRadius: '20px',
            padding: '28px 24px',
            color: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
          <div style={{ position: 'absolute', bottom: '-40px', left: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)' }} />

          <div className="flex items-center justify-between">
            <div style={{ width: '40px', height: '30px', borderRadius: '6px', background: 'linear-gradient(135deg, #D4AF37 0%, #C49B2F 100%)' }} />
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Credit Card</div>
          </div>

          <div>
            <p style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '0.25em', fontFamily: 'monospace', marginBottom: '12px' }}>
              {cardNumber ? formatCardNumber(cardNumber) : '•••• •••• •••• ••••'}
            </p>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {holderName || 'YOUR NAME'}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 600 }}>
                {expiry || 'MM/YY'}
              </span>
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div className="flex flex-col" style={{ gap: '12px' }}>
          {/* Card Number */}
          <div style={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', background: '#FFFFFF', padding: '14px 20px' }}>
            <label style={{ fontSize: '10px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
              Card Number
            </label>
            <input
              type="text"
              value={formatCardNumber(cardNumber)}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              style={{ width: '100%', fontSize: '15px', fontWeight: 600, color: '#1A1A1A', background: 'none', border: 'none', outline: 'none', fontFamily: 'monospace', letterSpacing: '0.15em' }}
            />
          </div>

          {/* Expiry + CVV */}
          <div className="flex" style={{ gap: '12px' }}>
            <div className="flex-1" style={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', background: '#FFFFFF', padding: '14px 20px' }}>
              <label style={{ fontSize: '10px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                Expiry Date
              </label>
              <input
                type="text"
                value={formatExpiry(expiry)}
                onChange={(e) => setExpiry(e.target.value.replace(/\D/g, ''))}
                placeholder="MM/YY"
                maxLength={5}
                style={{ width: '100%', fontSize: '15px', fontWeight: 600, color: '#1A1A1A', background: 'none', border: 'none', outline: 'none', fontFamily: 'monospace' }}
              />
            </div>
            <div className="flex-1" style={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', background: '#FFFFFF', padding: '14px 20px' }}>
              <label style={{ fontSize: '10px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
                CVV
              </label>
              <div className="flex items-center justify-between">
                <input
                  type={showCvv ? 'text' : 'password'}
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="•••"
                  maxLength={3}
                  style={{ flex: 1, fontSize: '15px', fontWeight: 600, color: '#1A1A1A', background: 'none', border: 'none', outline: 'none', fontFamily: 'monospace' }}
                />
                <button onClick={() => setShowCvv(!showCvv)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                  {showCvv ? <EyeOff size={16} color="#999" /> : <Eye size={16} color="#999" />}
                </button>
              </div>
            </div>
          </div>

          {/* Cardholder Name */}
          <div style={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', background: '#FFFFFF', padding: '14px 20px' }}>
            <label style={{ fontSize: '10px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
              Cardholder Name
            </label>
            <input
              type="text"
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              placeholder="Name on card"
              style={{ width: '100%', fontSize: '14px', fontWeight: 600, color: '#1A1A1A', background: 'none', border: 'none', outline: 'none', textTransform: 'uppercase' }}
            />
          </div>
        </div>

        {/* Save Card */}
        <button
          onClick={() => setActiveSection('payment-information')}
          className="w-full transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ padding: '16px', borderRadius: '14px', background: '#2C1810', color: '#FFF', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', border: 'none', cursor: 'pointer' }}
        >
          Save Card
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  PAYMENT INFORMATION — Main view
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
      {/* Header card */}
      <div style={cardStyle}>
        <div className="flex items-center justify-between" style={{ padding: '24px 20px' }}>
          <div>
            <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.08)', marginBottom: '14px' }}>
              <CreditCard size={18} color="#1A1A1A" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Payment Information
            </h3>
            <p style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>
              {cards.length} card{cards.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          <button
            onClick={() => setActiveSection('add-card')}
            className="flex items-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ padding: '10px 20px', borderRadius: '10px', background: '#2C1810', color: '#FFF', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', border: 'none', cursor: 'pointer' }}
          >
            <Plus size={14} />
            Add Card
          </button>
        </div>
      </div>

      {/* Saved Cards */}
      <div className="flex flex-col" style={{ gap: '16px' }}>
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => setSelectedCard(card.id)}
            className="w-full text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{
              borderRadius: '20px',
              border: selectedCard === card.id ? '2px solid #D4AF37' : '2px solid transparent',
              padding: 0,
              background: 'none',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            {/* Visual Credit Card */}
            <div
              style={{
                background: card.gradient,
                borderRadius: '18px',
                padding: '24px 22px',
                color: '#FFFFFF',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '160px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {/* Decorative elements */}
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
              <div style={{ position: 'absolute', bottom: '-30px', right: '40px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
              <div style={{ position: 'absolute', top: '50%', left: '-10px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)' }} />

              {/* Top row: Chip + Default badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center" style={{ gap: '12px' }}>
                  {/* EMV Chip */}
                  <div style={{ width: '36px', height: '26px', borderRadius: '5px', background: 'linear-gradient(135deg, #D4AF37 0%, #BF9B30 100%)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.15)' }} />
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '1px', background: 'rgba(0,0,0,0.1)' }} />
                  </div>
                  {/* Contactless icon */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.4 }}>
                    <path d="M8.5 16.5a5 5 0 017 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M5 13a9 9 0 0114 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M12 20a1 1 0 100-2 1 1 0 000 2z" fill="white" />
                  </svg>
                </div>
                {card.isDefault && (
                  <div className="flex items-center" style={{ gap: '4px', padding: '4px 10px', borderRadius: '6px', background: 'rgba(212,175,55,0.25)' }}>
                    <Check size={10} color="#D4AF37" />
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Default</span>
                  </div>
                )}
              </div>

              {/* Card number */}
              <div style={{ marginTop: '20px' }}>
                <p style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '0.25em', fontFamily: 'monospace' }}>
                  •••• •••• •••• {card.last4}
                </p>
              </div>

              {/* Bottom row: Name + Expiry + Brand */}
              <div className="flex items-end justify-between" style={{ marginTop: '14px' }}>
                <div>
                  <p style={{ fontSize: '9px', fontWeight: 500, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>
                    Card Holder
                  </p>
                  <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em' }}>{card.holder}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '9px', fontWeight: 500, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>
                    Expires
                  </p>
                  <p style={{ fontSize: '12px', fontWeight: 700 }}>{card.expiry}</p>
                </div>
                <CardBrandLogo type={card.type} />
              </div>
            </div>

            {/* Selected indicator */}
            {selectedCard === card.id && (
              <div
                className="absolute flex items-center justify-center"
                style={{ top: '-6px', right: '-6px', width: '24px', height: '24px', borderRadius: '50%', background: '#D4AF37', border: '2px solid #FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
              >
                <Check size={12} color="#FFFFFF" strokeWidth={3} />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Card actions for selected */}
      <div className="flex" style={{ gap: '10px' }}>
        <button
          className="flex-1 flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ padding: '14px', borderRadius: '14px', background: '#F5F5F5', color: '#1A1A1A', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', border: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer' }}
        >
          <Check size={14} />
          Set as Default
        </button>
        <button
          className="flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ padding: '14px 20px', borderRadius: '14px', background: '#FEF2F2', color: '#EF4444', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', border: '1px solid rgba(239,68,68,0.1)', cursor: 'pointer' }}
        >
          <Trash2 size={14} />
          Remove
        </button>
      </div>

      {/* Accepted payment methods */}
      <div style={{ ...cardStyle, padding: '20px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
          Accepted Payment Methods
        </p>
        <div className="flex items-center" style={{ gap: '10px' }}>
          {/* Visa */}
          <div className="flex items-center justify-center" style={{ width: '50px', height: '32px', borderRadius: '8px', background: '#F7F7F7', border: '1px solid rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#1A1F71', fontStyle: 'italic' }}>VISA</span>
          </div>
          {/* Mastercard */}
          <div className="flex items-center justify-center" style={{ width: '50px', height: '32px', borderRadius: '8px', background: '#F7F7F7', border: '1px solid rgba(0,0,0,0.04)' }}>
            <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
              <circle cx="9" cy="8" r="6" fill="#EB001B" opacity="0.9" />
              <circle cx="15" cy="8" r="6" fill="#F79E1B" opacity="0.9" />
              <path d="M12 3a6 6 0 010 10 6 6 0 000-10z" fill="#FF5F00" />
            </svg>
          </div>
          {/* Verve */}
          <div className="flex items-center justify-center" style={{ width: '50px', height: '32px', borderRadius: '8px', background: '#F7F7F7', border: '1px solid rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: '8px', fontWeight: 800, color: '#00425F', letterSpacing: '0.04em' }}>VERVE</span>
          </div>
          {/* Apple Pay */}
          <div className="flex items-center justify-center" style={{ width: '50px', height: '32px', borderRadius: '8px', background: '#F7F7F7', border: '1px solid rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: '9px', fontWeight: 700, color: '#1A1A1A' }}> Pay</span>
          </div>
          {/* Google Pay */}
          <div className="flex items-center justify-center" style={{ width: '50px', height: '32px', borderRadius: '8px', background: '#F7F7F7', border: '1px solid rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: '9px', fontWeight: 700, color: '#4285F4' }}>G Pay</span>
          </div>
        </div>
      </div>
    </div>
  );
}
