'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Wallet as WalletIcon, Coins, Award, ArrowLeft, Send, Scissors, PlusCircle, LockKeyhole, Sparkles, Zap, Crown, Gem, Check, CircleCheck, CreditCard } from 'lucide-react';
import { cardStyle } from '../styles';
import { walletMonths } from '../data';
import type { ActiveSection, Transaction } from '../types';

const TOKEN_PACKAGES = [
  { id: 'starter', name: 'Starter', tokens: 5, price: 2500, originalPrice: 3000, icon: Sparkles, color: '#8B5CF6', bgColor: 'rgba(139,92,246,0.08)', tag: null },
  { id: 'popular', name: 'Popular', tokens: 15, price: 6000, originalPrice: 9000, icon: Zap, color: '#D4AF37', bgColor: 'rgba(212,175,55,0.08)', tag: 'BEST VALUE' },
  { id: 'pro', name: 'Pro', tokens: 30, price: 10000, originalPrice: 18000, icon: Gem, color: '#3B82F6', bgColor: 'rgba(59,130,246,0.08)', tag: 'SAVE 44%' },
  { id: 'ultimate', name: 'Ultimate', tokens: 60, price: 18000, originalPrice: 36000, icon: Crown, color: '#462814', bgColor: 'rgba(70,40,20,0.06)', tag: 'SAVE 50%' },
];

interface WalletSectionProps {
  activeSection: ActiveSection;
  setActiveSection: (s: ActiveSection) => void;
}

export default function WalletSection({ activeSection, setActiveSection }: WalletSectionProps) {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [selectedPackage, setSelectedPackage] = useState('popular');

  // ─── Buy Tokens ───
  if (activeSection === 'buy-tokens') {
    const selected = TOKEN_PACKAGES.find(p => p.id === selectedPackage) || TOKEN_PACKAGES[1];
    const discount = Math.round((1 - selected.price / selected.originalPrice) * 100);
    const SelectedIcon = selected.icon;

    return (
      <div className="animate-fade-in flex flex-col" style={{ gap: '24px' }}>
        {/* Header */}
        <div className="flex flex-col" style={{ gap: '8px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Choose a Token Package</h2>
          <p style={{ fontSize: '12px', color: '#999', lineHeight: 1.6 }}>
            Tokens power AI design generation in Bespoke Studio. More tokens, better value.
          </p>
        </div>

        {/* Token Packages */}
        <div className="flex flex-col" style={{ gap: '8px' }}>
          {TOKEN_PACKAGES.map((pkg) => {
            const isSelected = selectedPackage === pkg.id;
            return (
              <button
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className="flex items-center justify-between transition-all active:scale-[0.99]"
                style={{
                  padding: '18px 20px',
                  borderRadius: '14px',
                  border: isSelected ? `2px solid ${pkg.color}` : '2px solid #F0F0F0',
                  background: isSelected ? pkg.bgColor : '#FAFAFA',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {/* Left — Token count */}
                <span style={{ fontSize: '15px', color: '#1A1A1A' }}>
                  <strong style={{ fontWeight: 800 }}>{pkg.tokens.toLocaleString()}</strong>{' '}
                  <span style={{ fontWeight: 500, color: '#666' }}>tokens</span>
                </span>

                {/* Right — Price pill */}
                <span style={{
                  padding: '6px 16px',
                  borderRadius: '100px',
                  background: isSelected ? pkg.color : '#462814',
                  color: '#FFF',
                  fontSize: '12px',
                  fontWeight: 700,
                }}>
                  ₦{pkg.price.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Summary Card */}
        <div style={{ ...cardStyle, padding: '0', overflow: 'hidden' }}>
          <div className="flex items-center justify-between" style={{ padding: '18px 20px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <div className="flex items-center" style={{ gap: '12px' }}>
              <div className="flex items-center justify-center" style={{ width: '36px', height: '36px', borderRadius: '10px', background: selected.bgColor }}>
                <SelectedIcon size={18} color={selected.color} strokeWidth={1.8} />
              </div>
              <div className="flex flex-col">
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A' }}>{selected.name} Package</span>
                <span style={{ fontSize: '11px', color: '#BBB' }}>{selected.tokens} tokens</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A' }}>₦{selected.price.toLocaleString()}</span>
              {discount > 0 && <span style={{ fontSize: '10px', fontWeight: 700, color: '#22C55E' }}>-{discount}% off</span>}
            </div>
          </div>
          <div className="flex flex-col" style={{ padding: '14px 20px', gap: '8px' }}>
            {[
              { icon: <Sparkles size={13} color="#8B5CF6" strokeWidth={1.8} />, text: 'Generate AI design concepts' },
              { icon: <Zap size={13} color="#D4AF37" strokeWidth={1.8} />, text: 'Iterate and refine designs' },
              { icon: <Crown size={13} color="#462814" strokeWidth={1.8} />, text: 'Access premium templates' },
            ].map((item, i) => (
              <div key={i} className="flex items-center" style={{ gap: '10px' }}>
                {item.icon}
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#888' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Purchase Button */}
        <button
          onClick={() => setActiveSection('confirm-token-purchase')}
          className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
          style={{
            padding: '16px',
            borderRadius: '12px',
            background: '#462814',
            color: '#FFF',
            fontSize: '13px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Buy {selected.tokens} Tokens — ₦{selected.price.toLocaleString()}
        </button>

        <div className="flex items-center justify-center" style={{ gap: '6px' }}>
          <LockKeyhole size={11} color="#CCC" strokeWidth={2} />
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#CCC' }}>Secured by <strong style={{ color: '#999' }}>paystack</strong></span>
        </div>
      </div>
    );
  }

  // ─── Confirm Token Purchase ───
  if (activeSection === 'confirm-token-purchase') {
    const selected = TOKEN_PACKAGES.find(p => p.id === selectedPackage) || TOKEN_PACKAGES[1];
    const SelectedIcon = selected.icon;
    
    return (
      <div className="animate-fade-in flex flex-col" style={{ gap: '24px' }}>
        <div className="flex items-center" style={{ gap: '16px' }}>
          <button onClick={() => setActiveSection('buy-tokens')} className="flex items-center justify-center transition-all active:scale-90" style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={20} color="#1A1A1A" />
          </button>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Confirm Purchase</h2>
        </div>

        {/* Order Summary */}
        <div style={{ ...cardStyle, padding: '24px' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Order Summary</span>
          <div className="flex items-center justify-between" style={{ marginTop: '16px' }}>
            <div className="flex items-center" style={{ gap: '12px' }}>
              <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '12px', background: selected.bgColor }}>
                <SelectedIcon size={20} color={selected.color} strokeWidth={1.8} />
              </div>
              <div className="flex flex-col">
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>{selected.name} Token Package</span>
                <span style={{ fontSize: '12px', color: '#888' }}>{selected.tokens} tokens</span>
              </div>
            </div>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A' }}>₦{selected.price.toLocaleString()}</span>
          </div>
          
          <div className="flex flex-col" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed rgba(0,0,0,0.1)', gap: '12px' }}>
            <div className="flex justify-between items-center text-[13px]">
              <span style={{ color: '#666' }}>Subtotal</span>
              <span style={{ fontWeight: 600, color: '#1A1A1A' }}>₦{selected.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span style={{ color: '#666' }}>Fees</span>
              <span style={{ fontWeight: 600, color: '#1A1A1A' }}>₦0</span>
            </div>
            <div className="flex justify-between items-center" style={{ marginTop: '4px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>Total</span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#462814' }}>₦{selected.price.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="flex flex-col" style={{ gap: '12px' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pay With</span>
          
          {/* Wallet Option */}
          <button
            className="flex items-center justify-between transition-all active:scale-[0.99]"
            style={{ ...cardStyle, padding: '16px 20px', border: '2px solid #462814', cursor: 'pointer' }}
          >
            <div className="flex items-center" style={{ gap: '16px' }}>
              <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(70,40,20,0.06)' }}>
                <WalletIcon size={20} color="#462814" strokeWidth={1.8} />
              </div>
              <div className="flex flex-col items-start" style={{ gap: '2px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>Qlozet Wallet</span>
                <span style={{ fontSize: '11px', color: '#666' }}>Balance: ₦10,000</span>
              </div>
            </div>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '6px solid #462814', background: '#FFF' }} />
          </button>

          {/* Card Option */}
          <button
            className="flex items-center justify-between transition-all active:scale-[0.99] opacity-70"
            style={{ ...cardStyle, padding: '16px 20px', cursor: 'pointer' }}
          >
            <div className="flex items-center" style={{ gap: '16px' }}>
              <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#FAFAFA' }}>
                <CreditCard size={20} color="#888" strokeWidth={1.8} />
              </div>
              <div className="flex flex-col items-start" style={{ gap: '2px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>Debit / Credit Card</span>
                <span style={{ fontSize: '11px', color: '#666' }}>Paystack</span>
              </div>
            </div>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #DDD', background: '#FFF' }} />
          </button>
        </div>

        {/* Action */}
        <button
          onClick={() => setActiveSection('token-purchase-success')}
          className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ padding: '16px', borderRadius: '12px', background: '#462814', color: '#FFF', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', border: 'none', cursor: 'pointer', marginTop: '12px' }}
        >
          Pay ₦{selected.price.toLocaleString()}
        </button>
      </div>
    );
  }

  // ─── Token Purchase Success ───
  if (activeSection === 'token-purchase-success') {
    const selected = TOKEN_PACKAGES.find(p => p.id === selectedPackage) || TOKEN_PACKAGES[1];
    
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center text-center" style={{ gap: '24px', padding: '40px 20px' }}>
        <div className="flex items-center justify-center" style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(34,197,94,0.1)' }}>
          <CircleCheck size={40} color="#22C55E" strokeWidth={1.5} />
        </div>
        
        <div className="flex flex-col" style={{ gap: '8px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1A1A1A' }}>Payment Successful!</h2>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.5, maxWidth: '280px' }}>
            You've successfully purchased the <strong>{selected.name} Package</strong>.
          </p>
        </div>

        <div style={{ ...cardStyle, width: '100%', maxWidth: '320px', padding: '24px', marginTop: '8px', background: '#FAFAFA' }}>
          <div className="flex flex-col items-center" style={{ gap: '4px' }}>
            <span style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Tokens Added</span>
            <span style={{ fontSize: '36px', fontWeight: 800, color: '#1A1A1A', lineHeight: 1 }}>+{selected.tokens}</span>
          </div>
          <div className="flex justify-between items-center" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '12px', color: '#888' }}>New Balance</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>{900 + selected.tokens} tokens</span>
          </div>
        </div>

        <div className="flex flex-col w-full" style={{ gap: '12px', maxWidth: '320px', marginTop: '16px' }}>
          <button
            onClick={() => {}} // In a real app this would route to Bespoke Studio
            className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ padding: '16px', borderRadius: '12px', background: '#462814', color: '#FFF', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', border: 'none', cursor: 'pointer' }}
          >
            Go to Bespoke Studio
          </button>
          <button
            onClick={() => setActiveSection('wallet')}
            className="w-full flex items-center justify-center transition-all active:scale-[0.98]"
            style={{ padding: '16px', borderRadius: '12px', background: 'transparent', color: '#1A1A1A', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', border: 'none', cursor: 'pointer' }}
          >
            Back to Wallet
          </button>
        </div>
      </div>
    );
  }

  // ─── Fund Wallet ───
  if (activeSection === 'fund-wallet') {
    return (
      <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
        <div style={{ ...cardStyle, padding: '32px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '28px' }}>
            <div className="flex flex-col" style={{ gap: '4px' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A' }}>Fund Your Wallet</span>
              <span style={{ fontSize: '12px', color: '#999' }}>Secured by Paystack</span>
            </div>
            <LockKeyhole size={18} color="#22C55E" />
          </div>

          <div className="flex flex-col" style={{ gap: '6px', marginBottom: '24px' }}>
            <label style={{ fontSize: '10px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Amount (NGN)</label>
            <input type="text" defaultValue="10,000" style={{ width: '100%', padding: '14px 0', fontSize: '24px', fontWeight: 800, color: '#1A1A1A', background: 'transparent', border: 'none', borderBottom: '2px solid #462814', outline: 'none', borderRadius: 0, boxShadow: 'none' }} />
          </div>

          <div className="flex flex-col" style={{ gap: '20px' }}>
            <div className="flex flex-col" style={{ gap: '6px' }}>
              <label style={{ fontSize: '10px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Card Number</label>
              <input type="text" placeholder="1234 5678 1234 5678" style={{ width: '100%', padding: '14px 16px', fontSize: '14px', color: '#1A1A1A', background: '#FAFAFA', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '10px', outline: 'none', boxShadow: 'none' }} />
            </div>
            <div className="flex" style={{ gap: '12px' }}>
              <div className="flex-1 flex flex-col" style={{ gap: '6px' }}>
                <label style={{ fontSize: '10px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Card Expiry</label>
                <input type="text" placeholder="MM/YY" style={{ width: '100%', padding: '14px 16px', fontSize: '14px', color: '#1A1A1A', background: '#FAFAFA', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '10px', outline: 'none', boxShadow: 'none' }} />
              </div>
              <div className="flex-1 flex flex-col" style={{ gap: '6px' }}>
                <label style={{ fontSize: '10px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>CVV</label>
                <input type="text" placeholder="123" style={{ width: '100%', padding: '14px 16px', fontSize: '14px', color: '#1A1A1A', background: '#FAFAFA', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '10px', outline: 'none', boxShadow: 'none' }} />
              </div>
            </div>
          </div>

          <button onClick={() => setActiveSection('fund-wallet-success')} className="w-full transition-all hover:opacity-90 active:scale-[0.98]" style={{ marginTop: '32px', padding: '16px', borderRadius: '12px', background: '#22C55E', color: '#FFF', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Pay NGN 10,000
          </button>

          <div className="flex items-center justify-center" style={{ marginTop: '20px', gap: '6px' }}>
            <LockKeyhole size={12} color="#999" />
            <span style={{ fontSize: '11px', color: '#999' }}>Secured by <strong style={{ color: '#1A1A1A' }}>paystack</strong></span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Fund Wallet Success ───
  if (activeSection === 'fund-wallet-success') {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center text-center" style={{ gap: '24px', padding: '40px 20px' }}>
        <div className="flex items-center justify-center" style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(34,197,94,0.1)' }}>
          <CircleCheck size={40} color="#22C55E" strokeWidth={1.5} />
        </div>
        
        <div className="flex flex-col" style={{ gap: '8px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1A1A1A' }}>Wallet Funded!</h2>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.5, maxWidth: '280px' }}>
            You've successfully added <strong>₦10,000</strong> to your Qlozet wallet.
          </p>
        </div>

        <div style={{ ...cardStyle, width: '100%', maxWidth: '320px', padding: '24px', marginTop: '8px', background: '#FAFAFA' }}>
          <div className="flex flex-col items-center" style={{ gap: '4px' }}>
            <span style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Amount Added</span>
            <span style={{ fontSize: '36px', fontWeight: 800, color: '#1A1A1A', lineHeight: 1 }}>+₦10,000</span>
          </div>
          <div className="flex justify-between items-center" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '12px', color: '#888' }}>New Balance</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>₦80,000</span>
          </div>
        </div>

        <div className="flex flex-col w-full" style={{ gap: '12px', maxWidth: '320px', marginTop: '16px' }}>
          <button
            onClick={() => setActiveSection('wallet')}
            className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ padding: '16px', borderRadius: '12px', background: '#462814', color: '#FFF', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', border: 'none', cursor: 'pointer' }}
          >
            Go to Wallet
          </button>
        </div>
      </div>
    );
  }

  // ─── Transaction Detail ───
  if (activeSection === 'wallet-detail') {
    const tx = selectedTx;
    if (!tx || !tx.detail) return <WalletSection activeSection="wallet" setActiveSection={setActiveSection} />;
    const isSpend = tx.type === 'ngn-spent' || tx.type === 'points-spent';
    return (
      <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
        <button onClick={() => setActiveSection('wallet')} className="hidden lg:flex items-center justify-center self-start transition-all active:scale-90" style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={20} color="#1A1A1A" />
        </button>

        <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Transaction Details</h3>

        <div className="flex items-center justify-center" style={{ width: '56px', height: '56px', borderRadius: '16px', background: isSpend ? 'rgba(99,102,241,0.08)' : 'rgba(16,185,129,0.08)' }}>
          {isSpend ? <Send size={24} color="#6366F1" /> : <Scissors size={24} color="#10B981" />}
        </div>

        <div style={cardStyle}>
          <div className="flex items-start justify-between" style={{ padding: '20px' }}>
            <div className="flex flex-col" style={{ gap: '6px', flex: 1 }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{tx.detail.subtitle}</span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#1A1A1A' }}>{tx.detail.title}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#22C55E', background: 'rgba(34,197,94,0.08)', padding: '3px 10px', borderRadius: '4px', alignSelf: 'flex-start' }}>Successful</span>
            </div>
            {tx.detail.image && (
              <div className="flex-shrink-0 overflow-hidden" style={{ width: '70px', height: '85px', borderRadius: '10px', background: '#F5F5F5', marginLeft: '16px' }}>
                <Image src={tx.detail.image} alt="" width={70} height={85} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
              </div>
            )}
          </div>
          <div className="flex items-center justify-between" style={{ padding: '12px 20px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Reward Earned</span>
            <div className="flex items-center" style={{ gap: '5px' }}>
              <Award size={14} color="#D4AF37" />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#B8941F' }}>{tx.detail.rewardPts}</span>
            </div>
          </div>
        </div>

        {tx.detail.usedBy && (
          <div className="flex flex-col" style={{ gap: '10px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Used By</h4>
            <div style={cardStyle}>
              <div className="flex items-center" style={{ padding: '16px 20px', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#F0ECE8', overflow: 'hidden' }}>
                  <Image src="/image/woman.png" alt="" width={44} height={44} style={{ objectFit: 'cover' }} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>{tx.detail.usedBy}</span>
              </div>
            </div>
          </div>
        )}

        {tx.detail.brands && tx.detail.brands.length > 0 && (
          <div className="flex flex-col" style={{ gap: '10px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bought From</h4>
            <div style={cardStyle}>
              <div className="flex items-center" style={{ padding: '16px 20px', gap: '10px' }}>
                {tx.detail.brands.map((brand, i) => (
                  <div key={i} className="flex items-center justify-center" style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#1A1A1A', color: '#FFF', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    {brand}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ ...cardStyle, padding: '20px' }}>
          <div className="flex items-start justify-between" style={{ gap: '12px' }}>
            <div className="flex flex-col flex-1" style={{ gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase' }}>Invite a friend and get $7,000</span>
              <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.5 }}>They sign up and verify their identity. They spend up to $50,000 and you both get $7,000</p>
              <button style={{ padding: '8px 18px', borderRadius: '8px', background: '#462814', color: '#FFF', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>
                Invite Friends
              </button>
            </div>
            <div className="flex flex-col items-end" style={{ gap: '8px' }}>
              <PlusCircle size={20} color="#1A1A1A" />
              <span style={{ fontSize: '24px' }}>👛</span>
            </div>
          </div>
          <div className="flex items-center justify-end" style={{ marginTop: '8px', gap: '5px' }}>
            <Award size={14} color="#D4AF37" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#B8941F' }}>3.8pts</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Wallet Main ───
  return (
    <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
      <div style={{ ...cardStyle, padding: '0' }}>
        <div className="flex flex-col sm:flex-row">
          <div className="flex-1 flex flex-col" style={{ padding: '24px 28px', gap: '16px' }}>
            <WalletIcon size={28} color="#462814" strokeWidth={1.5} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>My Wallet</h3>
            <div className="flex items-center" style={{ gap: '10px' }}>
              <button onClick={() => setActiveSection('fund-wallet')} className="transition-all hover:opacity-90 active:scale-95" style={{ padding: '10px 24px', borderRadius: '8px', background: '#462814', color: '#FFF', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', border: 'none', cursor: 'pointer' }}>
                Fund Wallet
              </button>
              <button onClick={() => setActiveSection('buy-tokens')} className="flex items-center transition-all hover:opacity-90 active:scale-95" style={{ padding: '10px 24px', borderRadius: '8px', background: 'transparent', color: '#462814', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', border: '1.5px solid #462814', cursor: 'pointer', gap: '6px' }}>
                <Sparkles size={13} strokeWidth={2} /> Buy Tokens
              </button>
            </div>
          </div>
          <div className="flex flex-col justify-center" style={{ padding: '24px 28px', gap: '14px', borderLeft: '1px solid rgba(0,0,0,0.05)' }}>
            <div className="flex items-center" style={{ gap: '10px' }}>
              <div className="flex items-center justify-center" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(45,106,79,0.1)' }}>
                <Coins size={16} color="#2D6A4F" />
              </div>
              <div className="flex flex-col">
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Wallet Balance (NGN)</span>
                <span style={{ fontSize: '22px', fontWeight: 800, color: '#1A1A1A' }}>10,000</span>
              </div>
            </div>
            <div className="flex items-center" style={{ gap: '10px' }}>
              <div className="flex items-center justify-center" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)' }}>
                <Award size={16} color="#D4AF37" />
              </div>
              <div className="flex flex-col">
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Token Rewards (TCN)</span>
                <span style={{ fontSize: '22px', fontWeight: 800, color: '#1A1A1A' }}>900</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {walletMonths.map((month) => (
        <div key={month.label} className="flex flex-col" style={{ gap: '8px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{month.label}</h4>
          <div style={cardStyle}>
            {month.transactions.map((tx, i) => (
              <button
                key={tx.id}
                onClick={() => { setSelectedTx(tx); setActiveSection('wallet-detail'); }}
                className="w-full flex items-center justify-between hover:bg-gray-50/80 transition-colors"
                style={{ padding: '14px 20px', background: 'none', border: 'none', borderBottom: i < month.transactions.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <div className="flex items-center" style={{ gap: '12px' }}>
                  <div className="flex items-center justify-center flex-shrink-0" style={{ width: '34px', height: '34px', borderRadius: '50%', background: tx.type.includes('ngn') ? 'rgba(45,106,79,0.08)' : 'rgba(212,175,55,0.08)' }}>
                    {tx.type.includes('ngn') ? <Coins size={15} color="#2D6A4F" /> : <Award size={15} color="#D4AF37" />}
                  </div>
                  <div className="flex flex-col" style={{ gap: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>{tx.description}</span>
                    <span style={{ fontSize: '11px', color: '#AAA' }}>{tx.date}</span>
                  </div>
                </div>
                <div className="flex items-center flex-shrink-0" style={{ gap: '6px' }}>
                  <div className="flex items-center justify-center" style={{ width: '20px', height: '20px', borderRadius: '50%', background: tx.type.includes('ngn') ? 'rgba(45,106,79,0.1)' : 'rgba(212,175,55,0.1)' }}>
                    {tx.type.includes('ngn') ? <Coins size={10} color="#2D6A4F" /> : <Award size={10} color="#D4AF37" />}
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: tx.isPositive ? '#2D6A4F' : '#EF4444' }}>
                    {tx.isPositive ? '+' : ''}{tx.amount}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
