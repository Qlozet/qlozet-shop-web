'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Wallet as WalletIcon, Coins, Award, ArrowLeft, Send, Scissors, PlusCircle,
  LockKeyhole, Sparkles, Zap, Crown, Gem, CircleCheck, CreditCard, Loader2, AlertCircle,
} from 'lucide-react';
import { TokenIcon } from '@/components/icons/TokenIcon';
import { cardStyle } from '../styles';
import type { ActiveSection } from '../types';
import { useWallet, type TokenPrice } from '@/hooks/useWallet';
import { WalletSkeleton } from '../components/Skeleton';

// ─── Token Package Definitions ────────────────────────────────
const TOKEN_PACKAGES = [
  { id: 'starter', tokens: 5, icon: Sparkles, color: '#8B5CF6', bgColor: 'rgba(139,92,246,0.08)', tag: null },
  { id: 'popular', tokens: 15, icon: Zap, color: '#D4AF37', bgColor: 'rgba(212,175,55,0.08)', tag: 'BEST VALUE' },
  { id: 'pro', tokens: 30, icon: Gem, color: '#3B82F6', bgColor: 'rgba(59,130,246,0.08)', tag: 'SAVE MORE' },
  { id: 'ultimate', tokens: 60, icon: Crown, color: '#462814', bgColor: 'rgba(70,40,20,0.06)', tag: 'BEST DEAL' },
];

// ─── Props ────────────────────────────────────────────────────
interface WalletSectionProps {
  activeSection: ActiveSection;
  setActiveSection: (s: ActiveSection) => void;
}

export default function WalletSection({ activeSection, setActiveSection }: WalletSectionProps) {
  const {
    walletBalance,
    tokenBalance,
    transactions,
    isLoading,
    error,
    isFunding,
    isPurchasing,
    refresh,
    getTokenPrice,
    fundWallet,
    pollTransaction,
    purchaseTokens,
  } = useWallet();

  const [selectedPackage, setSelectedPackage] = useState('popular');
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});
  const [isPriceLoading, setIsPriceLoading] = useState(false);

  // Fund wallet form
  const [fundAmount, setFundAmount] = useState('5000');
  const [fundReference, setFundReference] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Post-purchase state
  const [purchasedTokens, setPurchasedTokens] = useState(0);
  const [preBalanceTokens, setPreBalanceTokens] = useState(0);
  const [preBalanceWallet, setPreBalanceWallet] = useState(0);
  const [fundedAmount, setFundedAmount] = useState(0);

  // Mobile transaction pagination
  const [mobileVisibleCount, setMobileVisibleCount] = useState(5);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ─── Fetch token prices only when entering buy-tokens ────────
  const FALLBACK_PRICE_PER_TOKEN_NGN = 16.5; // $0.01 × ~₦1,650/USD — used when API is down
  const pricesFetched = useRef(false);
  useEffect(() => {
    if (activeSection !== 'buy-tokens' && activeSection !== 'confirm-token-purchase') return;
    if (pricesFetched.current && Object.keys(tokenPrices).length > 0) return;

    let cancelled = false;
    const fetchPrices = async () => {
      setIsPriceLoading(true);
      const basePrice = await getTokenPrice(1, 'NGN');
      const pricePerToken = basePrice?.amount ?? FALLBACK_PRICE_PER_TOKEN_NGN;
      if (!cancelled) {
        const results: Record<string, number> = {};
        TOKEN_PACKAGES.forEach((pkg) => {
          results[pkg.id] = Math.round(pricePerToken * pkg.tokens * 10) / 10;
        });
        setTokenPrices(results);
        pricesFetched.current = true;
        setIsPriceLoading(false);
      }
    };
    fetchPrices();
    return () => { cancelled = true; };
  }, [activeSection]);

  // ═══════════════════════════════════════════════════════════════
  //  BUY TOKENS
  // ═══════════════════════════════════════════════════════════════
  if (activeSection === 'buy-tokens') {
    const selected = TOKEN_PACKAGES.find(p => p.id === selectedPackage) || TOKEN_PACKAGES[1];
    const price = tokenPrices[selected.id] || 0;
    const SelectedIcon = selected.icon;

    return (
      <div className="animate-fade-in flex flex-col" style={{ gap: '24px' }}>
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
            const pkgPrice = tokenPrices[pkg.id];
            return (
              <button
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className="flex items-center justify-between transition-all active:scale-[0.99]"
                style={{
                  padding: '18px 20px', borderRadius: '14px',
                  border: isSelected ? `2px solid ${pkg.color}` : '2px solid #F0F0F0',
                  background: isSelected ? pkg.bgColor : '#FAFAFA',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '15px', color: '#1A1A1A' }}>
                  <strong style={{ fontWeight: 800 }}>{pkg.tokens.toLocaleString()}</strong>{' '}
                  <span style={{ fontWeight: 500, color: '#666' }}>tokens</span>
                  {pkg.tag && (
                    <span style={{ marginLeft: '8px', padding: '2px 8px', borderRadius: '4px', background: pkg.bgColor, fontSize: '9px', fontWeight: 800, color: pkg.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {pkg.tag}
                    </span>
                  )}
                </span>
                <span style={{
                  padding: '6px 16px', borderRadius: '100px',
                  background: isSelected ? pkg.color : '#462814',
                  color: '#FFF', fontSize: '12px', fontWeight: 700,
                  minWidth: '80px', textAlign: 'center',
                }}>
                  {isPriceLoading ? '...' : pkgPrice != null ? `₦${pkgPrice.toLocaleString()}` : '—'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Summary */}
        <div style={{ ...cardStyle, padding: '0', overflow: 'hidden' }}>
          <div className="flex items-center justify-between" style={{ padding: '18px 20px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
            <div className="flex items-center" style={{ gap: '12px' }}>
              <div className="flex items-center justify-center" style={{ width: '36px', height: '36px', borderRadius: '10px', background: selected.bgColor }}>
                <SelectedIcon size={18} color={selected.color} strokeWidth={1.8} />
              </div>
              <div className="flex flex-col">
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A' }}>{selected.id.charAt(0).toUpperCase() + selected.id.slice(1)} Package</span>
                <span style={{ fontSize: '11px', color: '#BBB' }}>{selected.tokens} tokens</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A' }}>
                {price ? `₦${price.toLocaleString()}` : '—'}
              </span>
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
          disabled={!price}
          className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
          style={{
            padding: '16px', borderRadius: '12px',
            background: price ? '#462814' : '#D4C9C0',
            color: '#FFF', fontSize: '13px', fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.06em',
            border: 'none', cursor: price ? 'pointer' : 'not-allowed',
          }}
        >
          {price ? `Buy ${selected.tokens} Tokens — ₦${price.toLocaleString()}` : 'Loading prices...'}
        </button>

        <div className="flex items-center justify-center" style={{ gap: '6px' }}>
          <LockKeyhole size={11} color="#CCC" strokeWidth={2} />
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#CCC' }}>Deducted from your <strong style={{ color: '#999' }}>wallet balance</strong></span>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  CONFIRM TOKEN PURCHASE
  // ═══════════════════════════════════════════════════════════════
  if (activeSection === 'confirm-token-purchase') {
    const selected = TOKEN_PACKAGES.find(p => p.id === selectedPackage) || TOKEN_PACKAGES[1];
    const price = tokenPrices[selected.id] || 0;
    const SelectedIcon = selected.icon;
    const hasEnough = walletBalance >= price;

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
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>{selected.tokens} Tokens</span>
                <span style={{ fontSize: '12px', color: '#888' }}>Deducted from wallet</span>
              </div>
            </div>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A' }}>₦{price.toLocaleString()}</span>
          </div>

          <div className="flex flex-col" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed rgba(0,0,0,0.1)', gap: '12px' }}>
            <div className="flex justify-between items-center text-[13px]">
              <span style={{ color: '#666' }}>Wallet Balance</span>
              <span style={{ fontWeight: 600, color: hasEnough ? '#1A1A1A' : '#EF4444' }}>₦{walletBalance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span style={{ color: '#666' }}>Token Cost</span>
              <span style={{ fontWeight: 600, color: '#1A1A1A' }}>-₦{price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center" style={{ marginTop: '4px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>Remaining</span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: hasEnough ? '#462814' : '#EF4444' }}>
                ₦{Math.max(0, walletBalance - price).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Insufficient balance warning */}
        {!hasEnough && (
          <div className="flex items-center" style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', gap: '10px' }}>
            <AlertCircle size={16} color="#EF4444" />
            <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600 }}>
              Insufficient wallet balance. <button onClick={() => setActiveSection('fund-wallet')} style={{ textDecoration: 'underline', background: 'none', border: 'none', color: '#EF4444', fontWeight: 700, cursor: 'pointer' }}>Fund wallet</button>
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-center" style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', gap: '10px' }}>
            <AlertCircle size={16} color="#EF4444" />
            <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {/* Action */}
        <button
          onClick={async () => {
            setPreBalanceTokens(tokenBalance);
            setPreBalanceWallet(walletBalance);
            setPurchasedTokens(selected.tokens);
            const ok = await purchaseTokens(selected.tokens);
            if (ok) setActiveSection('token-purchase-success');
          }}
          disabled={isPurchasing || !hasEnough}
          className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
          style={{
            padding: '16px', borderRadius: '12px',
            background: isPurchasing || !hasEnough ? '#D4C9C0' : '#462814',
            color: '#FFF', fontSize: '13px', fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.06em',
            border: 'none', cursor: isPurchasing || !hasEnough ? 'not-allowed' : 'pointer',
            gap: '8px', marginTop: '12px',
          }}
        >
          {isPurchasing && <Loader2 size={16} className="animate-spin" />}
          {isPurchasing ? 'Processing...' : `Confirm — ₦${price.toLocaleString()}`}
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  TOKEN PURCHASE SUCCESS
  // ═══════════════════════════════════════════════════════════════
  if (activeSection === 'token-purchase-success') {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center text-center" style={{ gap: '24px', padding: '40px 20px' }}>
        <div className="flex items-center justify-center" style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(34,197,94,0.1)' }}>
          <CircleCheck size={40} color="#22C55E" strokeWidth={1.5} />
        </div>

        <div className="flex flex-col" style={{ gap: '8px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1A1A1A' }}>Purchase Successful!</h2>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.5, maxWidth: '280px' }}>
            You've purchased <strong>{purchasedTokens} tokens</strong>.
          </p>
        </div>

        <div style={{ ...cardStyle, width: '100%', maxWidth: '320px', padding: '24px', marginTop: '8px', background: '#FAFAFA' }}>
          <div className="flex flex-col items-center" style={{ gap: '4px' }}>
            <span style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Tokens Added</span>
            <span style={{ fontSize: '36px', fontWeight: 800, color: '#1A1A1A', lineHeight: 1 }}>+{purchasedTokens}</span>
          </div>
          <div className="flex justify-between items-center" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '12px', color: '#888' }}>New Balance</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>{tokenBalance} tokens</span>
          </div>
        </div>

        <div className="flex flex-col w-full" style={{ gap: '12px', maxWidth: '320px', marginTop: '16px' }}>
          <button
            onClick={() => setActiveSection('wallet')}
            className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ padding: '16px', borderRadius: '12px', background: '#462814', color: '#FFF', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', border: 'none', cursor: 'pointer' }}
          >
            Back to Wallet
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  FUND WALLET (Paystack)
  // ═══════════════════════════════════════════════════════════════
  if (activeSection === 'fund-wallet') {
    return (
      <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
        <div style={{ ...cardStyle, padding: '32px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '28px' }}>
            <div className="flex flex-col" style={{ gap: '4px' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A' }}>Fund Your Wallet</span>
              <span style={{ fontSize: '12px', color: '#999' }}>Pay via Paystack (opens in new tab)</span>
            </div>
            <LockKeyhole size={18} color="#22C55E" />
          </div>

          <div className="flex flex-col" style={{ gap: '6px', marginBottom: '24px' }}>
            <label style={{ fontSize: '10px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Amount (NGN)</label>
            <input
              type="number"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              placeholder="5000"
              style={{ width: '100%', padding: '14px 0', fontSize: '24px', fontWeight: 800, color: '#1A1A1A', background: 'transparent', border: 'none', borderBottom: '2px solid #462814', outline: 'none', borderRadius: 0, boxShadow: 'none' }}
            />
          </div>

          {/* Quick amount buttons */}
          <div className="flex" style={{ gap: '8px', marginBottom: '24px' }}>
            {[2000, 5000, 10000, 20000].map((amt) => (
              <button
                key={amt}
                onClick={() => setFundAmount(String(amt))}
                className="flex-1 transition-all active:scale-95"
                style={{
                  padding: '10px', borderRadius: '8px',
                  border: fundAmount === String(amt) ? '2px solid #462814' : '1px solid rgba(0,0,0,0.08)',
                  background: fundAmount === String(amt) ? 'rgba(70,40,20,0.06)' : '#FAFAFA',
                  fontSize: '11px', fontWeight: 700, color: '#1A1A1A',
                  cursor: 'pointer',
                }}
              >
                ₦{amt.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Current balance */}
          <div className="flex items-center justify-between" style={{ padding: '14px 0', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '12px', color: '#888' }}>Current Balance</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>₦{walletBalance.toLocaleString()}</span>
          </div>

          {error && (
            <div className="flex items-center" style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', gap: '8px', marginBottom: '16px' }}>
              <AlertCircle size={14} color="#EF4444" />
              <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600 }}>{error}</span>
            </div>
          )}

          <button
            onClick={async () => {
              const amount = parseFloat(fundAmount);
              if (!amount || amount < 100) return;
              setFundedAmount(amount);
              const result = await fundWallet(amount);
              if (result.success && result.reference) {
                setFundReference(result.reference);
                // Start polling in background
                setIsPolling(true);
                const status = await pollTransaction(result.reference);
                setIsPolling(false);
                if (status === 'success') {
                  setActiveSection('fund-wallet-success');
                }
              }
            }}
            disabled={isFunding || !fundAmount || parseFloat(fundAmount) < 100}
            className="w-full transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              marginTop: '16px', padding: '16px', borderRadius: '12px',
              background: isFunding ? '#D4C9C0' : '#064E3B',
              color: '#FFF', fontSize: '14px', fontWeight: 700,
              border: 'none', cursor: isFunding ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {isFunding && <Loader2 size={16} className="animate-spin" />}
            {isFunding ? 'Opening Paystack...' : isPolling ? 'Waiting for payment...' : `Fund ₦${(parseFloat(fundAmount) || 0).toLocaleString()}`}
          </button>

          {isPolling && (
            <p style={{ fontSize: '11px', color: '#888', textAlign: 'center', marginTop: '12px', lineHeight: 1.5 }}>
              Complete payment in the Paystack tab. This page will update automatically.
            </p>
          )}

          <div className="flex items-center justify-center" style={{ marginTop: '20px', gap: '6px' }}>
            <LockKeyhole size={12} color="#999" />
            <span style={{ fontSize: '11px', color: '#999' }}>Secured by <strong style={{ color: '#1A1A1A' }}>paystack</strong></span>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  FUND WALLET SUCCESS
  // ═══════════════════════════════════════════════════════════════
  if (activeSection === 'fund-wallet-success') {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center text-center" style={{ gap: '24px', padding: '40px 20px' }}>
        <div className="flex items-center justify-center" style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(34,197,94,0.1)' }}>
          <CircleCheck size={40} color="#22C55E" strokeWidth={1.5} />
        </div>

        <div className="flex flex-col" style={{ gap: '8px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1A1A1A' }}>Wallet Funded!</h2>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.5, maxWidth: '280px' }}>
            You've successfully added <strong>₦{fundedAmount.toLocaleString()}</strong> to your Qlozet wallet.
          </p>
        </div>

        <div style={{ ...cardStyle, width: '100%', maxWidth: '320px', padding: '24px', marginTop: '8px', background: '#FAFAFA' }}>
          <div className="flex flex-col items-center" style={{ gap: '4px' }}>
            <span style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Amount Added</span>
            <span style={{ fontSize: '36px', fontWeight: 800, color: '#1A1A1A', lineHeight: 1 }}>+₦{fundedAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '12px', color: '#888' }}>New Balance</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>₦{walletBalance.toLocaleString()}</span>
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

  // ═══════════════════════════════════════════════════════════════
  //  WALLET MAIN
  // ═══════════════════════════════════════════════════════════════
  if (isLoading) return <div className="animate-fade-in"><WalletSkeleton /></div>;

  return (
    <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
      {/* Balance Card */}
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
                <WalletIcon size={16} color="#2D6A4F" strokeWidth={1.8} />
              </div>
              <div className="flex flex-col">
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Wallet Balance (NGN)</span>
                <span style={{ fontSize: '22px', fontWeight: 800, color: '#1A1A1A' }}>
                  {isLoading ? '...' : `₦${walletBalance.toLocaleString()}`}
                </span>
              </div>
            </div>
            <div className="flex items-center" style={{ gap: '10px' }}>
              <div className="flex items-center justify-center" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)' }}>
                <TokenIcon size={18} color="#D4AF37" />
              </div>
              <div className="flex flex-col">
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tokens (TCN)</span>
                <span style={{ fontSize: '22px', fontWeight: 800, color: '#1A1A1A' }}>
                  {isLoading ? '...' : tokenBalance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      {transactions.length > 0 ? (() => {
        // Group transactions by month
        const txList = isMobile ? transactions.slice(0, mobileVisibleCount) : transactions;
        const grouped: Record<string, typeof transactions> = {};
        txList.forEach((tx) => {
          const d = new Date(tx.createdAt);
          const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(tx);
        });

        return (
          <div className="flex flex-col" style={{ gap: '20px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Transactions</h4>

            {Object.entries(grouped).map(([month, txs]) => (
              <div key={month} className="flex flex-col" style={{ gap: '0' }}>
                {/* Month header */}
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                  {month}
                </span>

                <div style={{ ...cardStyle, ...(isMobile ? {} : { maxHeight: '55vh', overflowY: 'auto' as const }) }}>
                  {txs.map((tx, i) => {
                    const isCredit = tx.type === 'fund' || tx.type === 'credit' || tx.type === 'refund';
                    const date = new Date(tx.createdAt);
                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                    // Status icon (only for non-success)
                    const statusIcon = tx.status === 'pending' ? (
                      <div className="flex items-center justify-center flex-shrink-0" style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(245,158,11,0.12)' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      </div>
                    ) : (tx.status === 'failed' || tx.status === 'reversed') ? (
                      <div className="flex items-center justify-center flex-shrink-0" style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(239,68,68,0.12)' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      </div>
                    ) : null;

                    return (
                      <div
                        key={tx._id || i}
                        className="flex items-center justify-between"
                        style={{ padding: '16px 20px', borderBottom: i < txs.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}
                      >
                        <div className="flex items-center" style={{ gap: '14px' }}>
                          <div className="flex items-center justify-center flex-shrink-0" style={{ width: '38px', height: '38px', borderRadius: '12px', background: isCredit ? 'rgba(45,106,79,0.08)' : 'rgba(70,40,20,0.06)' }}>
                            {isCredit ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="5 12 12 19 19 12"/></svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#462814" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 5 5 12"/></svg>
                            )}
                          </div>
                          <div className="flex flex-col" style={{ gap: '2px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>{tx.description || tx.type}</span>
                            <span style={{ fontSize: '11px', color: '#BBBBBB' }}>{dateStr} · {timeStr}</span>
                          </div>
                        </div>
                        <div className="flex items-center flex-shrink-0" style={{ gap: '8px' }}>
                          <div className="flex items-center" style={{ gap: '5px' }}>
                            {tx.description?.toLowerCase().includes('token') ? (
                              <Sparkles size={13} color={isCredit ? '#2D6A4F' : '#1A1A1A'} strokeWidth={2} />
                            ) : (
                              <WalletIcon size={13} color={isCredit ? '#2D6A4F' : '#1A1A1A'} strokeWidth={2} />
                            )}
                            <span style={{ fontSize: '13px', fontWeight: 700, color: isCredit ? '#2D6A4F' : '#1A1A1A' }}>
                              {isCredit ? '+' : '-'}₦{tx.amount.toLocaleString()}
                            </span>
                          </div>
                          {statusIcon}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {isMobile && mobileVisibleCount < transactions.length && (
              <button
                onClick={() => setMobileVisibleCount((c) => c + 5)}
                className="w-full transition-all hover:opacity-80 active:scale-[0.98]"
                style={{ padding: '12px', borderRadius: '12px', background: 'rgba(70,40,20,0.06)', color: '#462814', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.04em' }}
              >
                Load More
              </button>
            )}
          </div>
        );
      })() : !isLoading ? (
        <div className="flex flex-col items-center justify-center" style={{ padding: '40px 20px', gap: '12px' }}>
          <TokenIcon size={32} color="#DDD" />
          <span style={{ fontSize: '13px', color: '#999' }}>No transactions yet</span>
        </div>
      ) : null}
    </div>
  );
}
