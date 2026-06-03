'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Wallet as WalletIcon, Coins, Award, ArrowLeft, Send, Scissors, PlusCircle, LockKeyhole } from 'lucide-react';
import { cardStyle } from '../styles';
import { walletMonths } from '../data';
import type { ActiveSection, Transaction } from '../types';

interface WalletSectionProps {
  activeSection: ActiveSection;
  setActiveSection: (s: ActiveSection) => void;
}

export default function WalletSection({ activeSection, setActiveSection }: WalletSectionProps) {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

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

          <button onClick={() => setActiveSection('wallet')} className="w-full transition-all hover:opacity-90 active:scale-[0.98]" style={{ marginTop: '32px', padding: '16px', borderRadius: '12px', background: '#22C55E', color: '#FFF', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
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
            <button onClick={() => setActiveSection('fund-wallet')} className="transition-all hover:opacity-90 active:scale-95" style={{ padding: '10px 24px', borderRadius: '8px', background: '#462814', color: '#FFF', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>
              Fund Wallet
            </button>
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
