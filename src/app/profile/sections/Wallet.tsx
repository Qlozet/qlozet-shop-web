'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Wallet as WalletIcon, Coins, Award, ArrowLeft, Send, Scissors, PlusCircle,
  LockKeyhole, Sparkles, Zap, Crown, Gem, CircleCheck, CreditCard, Loader2, AlertCircle,
} from 'lucide-react';
import { TokenIcon } from '@/components/icons/TokenIcon';
import { cardStyle } from '../styles';
import type { ActiveSection } from '../types';
import { useWallet } from '@/hooks/useWallet';
import { api } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';
import { WalletSkeleton } from '../components/Skeleton';

// ─── Token packs ──────────────────────────────────────────────
// The packs are set by the admin (GET /token/packs) and priced by the
// server; the shop only names the pack it buys. Looks go by position.
interface TokenPack {
  id: string;
  name: string;
  tokens: number;
  bonus_tokens: number;
  total_tokens: number;
  price_ngn: number;
  tag: string | null;
  /** About how many AI designs the pack covers. */
  designs: number | null;
}
const PACK_LOOKS = [
  { icon: Sparkles, color: '#8B5CF6', bgColor: 'rgba(139,92,246,0.08)' },
  { icon: Zap, color: '#D4AF37', bgColor: 'rgba(212,175,55,0.08)' },
  { icon: Gem, color: '#3B82F6', bgColor: 'rgba(59,130,246,0.08)' },
  { icon: Crown, color: 'var(--brand-brown)', bgColor: 'rgba(70,40,20,0.06)' },
];
const lookFor = (i: number) => PACK_LOOKS[Math.min(Math.max(i, 0), PACK_LOOKS.length - 1)];
/** The pack to start on: the first one the admin labelled, else the second. */
function defaultPackIndex(packs: TokenPack[]): number {
  const tagged = packs.findIndex((p) => p.tag);
  if (tagged >= 0) return tagged;
  return Math.min(1, Math.max(0, packs.length - 1));
}
const designsLine = (p: TokenPack) =>
  p.designs != null ? `Enough for about ${p.designs} AI design${p.designs === 1 ? '' : 's'}` : null;

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
    fundWallet,
    pollTransaction,
    purchaseTokens,
  } = useWallet();

  // The wallet is a ₦-denominated account — its balance and transactions stay
  // in ₦ (converting a ledger at a floating rate would make funds appear to
  // shrink/grow daily). When browsing in another currency we add a clearly
  // marked "≈" estimate under the balance, nothing more.
  const { fmt, isConverted } = useCurrency();

  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [packs, setPacks] = useState<TokenPack[]>([]);
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [packsFailed, setPacksFailed] = useState(false);

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

  // ─── Fetch the packs only when entering buy-tokens ──────────
  const pricesFetched = useRef(false);
  useEffect(() => {
    if (activeSection !== 'buy-tokens' && activeSection !== 'confirm-token-purchase') return;
    if (pricesFetched.current) return;

    let cancelled = false;
    const fetchPacks = async () => {
      setIsPriceLoading(true);
      setPacksFailed(false);
      try {
        const res = await api.get('/token/packs');
        const body = res.data?.data ?? res.data;
        if (!cancelled) {
          setPacks(Array.isArray(body?.packs) ? body.packs : []);
          pricesFetched.current = true;
        }
      } catch {
        if (!cancelled) setPacksFailed(true);
      } finally {
        if (!cancelled) setIsPriceLoading(false);
      }
    };
    fetchPacks();
    return () => { cancelled = true; };
  }, [activeSection]);

  const chosenIndex = packs.findIndex((p) => p.id === selectedPackage);
  const selectedIndex = chosenIndex >= 0 ? chosenIndex : defaultPackIndex(packs);
  const selectedPack: TokenPack | undefined = packs[selectedIndex];

  // ═══════════════════════════════════════════════════════════════
  //  BUY TOKENS
  // ═══════════════════════════════════════════════════════════════
  if (activeSection === 'buy-tokens') {
    const selected = selectedPack;
    const look = lookFor(selectedIndex);
    const price = selected?.price_ngn ?? 0;
    const SelectedIcon = look.icon;

    return (
      <div className="animate-fade-in flex flex-col" style={{ gap: '24px' }}>
        <div className="flex flex-col" style={{ gap: '8px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Choose a Token Pack</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Tokens power AI design generation in Bespoke Studio. Bigger packs come with free tokens, and tokens don&apos;t expire.
          </p>
        </div>

        {packsFailed && !packs.length && (
          <div className="flex items-center" style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', gap: '10px' }}>
            <AlertCircle size={16} color="#EF4444" />
            <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600 }}>Couldn&apos;t load the token packs. Go back and try again.</span>
          </div>
        )}

        {/* Token Packages */}
        <div className="flex flex-col" style={{ gap: '8px' }}>
          {isPriceLoading && !packs.length && (
            <div className="flex justify-center" style={{ padding: '24px' }}>
              <Loader2 size={18} className="animate-spin" color="var(--text-muted)" />
            </div>
          )}
          {packs.map((pkg, i) => {
            const isSelected = selected?.id === pkg.id;
            const pkgPrice = pkg.price_ngn;
            const pkgLook = lookFor(i);
            return (
              <button
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className="flex items-center justify-between transition-all active:scale-[0.99]"
                style={{
                  padding: '18px 20px', borderRadius: '14px',
                  border: isSelected ? `2px solid ${pkgLook.color}` : '2px solid var(--border-glass)',
                  background: isSelected ? pkgLook.bgColor : 'var(--bg-surface-elevated)',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span className="flex flex-col" style={{ gap: '3px', minWidth: 0 }}>
                  <span style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                    <strong style={{ fontWeight: 800 }}>{pkg.name}</strong>
                    {pkg.tag && (
                      <span style={{ marginLeft: '8px', padding: '2px 8px', borderRadius: '4px', background: pkgLook.bgColor, fontSize: '9px', fontWeight: 800, color: pkgLook.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {pkg.tag}
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {pkg.total_tokens.toLocaleString()} tokens
                    {pkg.bonus_tokens > 0 && (
                      <span style={{ color: '#16A34A', fontWeight: 700 }}> · {pkg.bonus_tokens.toLocaleString()} free</span>
                    )}
                  </span>
                  {designsLine(pkg) && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{designsLine(pkg)}</span>
                  )}
                </span>
                <span style={{
                  padding: '6px 16px', borderRadius: '100px',
                  background: isSelected ? pkgLook.color : 'var(--brand-fill)',
                  color: 'var(--brand-fill-text)', fontSize: '12px', fontWeight: 700,
                  minWidth: '80px', textAlign: 'center',
                }}>
                  ₦{pkgPrice.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Summary */}
        {selected && (
        <div style={{ ...cardStyle, padding: '0', overflow: 'hidden' }}>
          <div className="flex items-center justify-between" style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-glass)' }}>
            <div className="flex items-center" style={{ gap: '12px' }}>
              <div className="flex items-center justify-center" style={{ width: '36px', height: '36px', borderRadius: '10px', background: look.bgColor }}>
                <SelectedIcon size={18} color={look.color} strokeWidth={1.8} />
              </div>
              <div className="flex flex-col">
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{selected.name} pack</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {selected.total_tokens.toLocaleString()} tokens{selected.bonus_tokens > 0 ? ` (${selected.bonus_tokens.toLocaleString()} free)` : ''}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {price ? `₦${price.toLocaleString()}` : '—'}
              </span>
            </div>
          </div>
          <div className="flex flex-col" style={{ padding: '14px 20px', gap: '8px' }}>
            {[
              { icon: <Sparkles size={13} color="#8B5CF6" strokeWidth={1.8} />, text: designsLine(selected) ?? 'Generate AI design concepts' },
              { icon: <Zap size={13} color="#D4AF37" strokeWidth={1.8} />, text: 'Iterate and refine designs' },
              { icon: <Crown size={13} color="var(--brand-brown)" strokeWidth={1.8} />, text: "Tokens don't expire" },
            ].map((item, i) => (
              <div key={i} className="flex items-center" style={{ gap: '10px' }}>
                {item.icon}
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Purchase Button */}
        <button
          onClick={() => setActiveSection('confirm-token-purchase')}
          disabled={!price}
          className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
          style={{
            padding: '16px', borderRadius: '12px',
            background: price ? 'var(--brand-fill)' : 'var(--bg-surface-elevated)',
            color: 'var(--brand-fill-text)', fontSize: '13px', fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.06em',
            border: 'none', cursor: price ? 'pointer' : 'not-allowed',
          }}
        >
          {selected ? `Buy ${selected.name} — ₦${price.toLocaleString()}` : isPriceLoading ? 'Loading packs...' : 'Choose a pack'}
        </button>

        <div className="flex items-center justify-center" style={{ gap: '6px' }}>
          <LockKeyhole size={11} color="var(--text-muted)" strokeWidth={2} />
          <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)' }}>Deducted from your <strong style={{ color: 'var(--text-muted)' }}>wallet balance</strong></span>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  CONFIRM TOKEN PURCHASE
  // ═══════════════════════════════════════════════════════════════
  if (activeSection === 'confirm-token-purchase') {
    const selected = selectedPack;
    const look = lookFor(selectedIndex);
    const price = selected?.price_ngn ?? 0;
    const SelectedIcon = look.icon;
    const hasEnough = Boolean(selected) && walletBalance >= price;

    return (
      <div className="animate-fade-in flex flex-col" style={{ gap: '24px' }}>
        <div className="flex items-center" style={{ gap: '16px' }}>
          <button onClick={() => setActiveSection('buy-tokens')} className="flex items-center justify-center transition-all active:scale-90" style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={20} color="var(--text-primary)" />
          </button>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Confirm Purchase</h2>
        </div>

        {/* Order Summary */}
        <div style={{ ...cardStyle, padding: '24px' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Order Summary</span>
          <div className="flex items-center justify-between" style={{ marginTop: '16px' }}>
            <div className="flex items-center" style={{ gap: '12px' }}>
              <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '12px', background: look.bgColor }}>
                <SelectedIcon size={20} color={look.color} strokeWidth={1.8} />
              </div>
              <div className="flex flex-col">
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selected ? `${selected.name} · ${selected.total_tokens.toLocaleString()} tokens` : '—'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Deducted from wallet</span>
              </div>
            </div>
            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>₦{price.toLocaleString()}</span>
          </div>

          <div className="flex flex-col" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed var(--border-glass)', gap: '12px' }}>
            <div className="flex justify-between items-center text-[13px]">
              <span style={{ color: 'var(--text-secondary)' }}>Wallet Balance</span>
              <span style={{ fontWeight: 600, color: hasEnough ? 'var(--text-primary)' : '#EF4444' }}>₦{walletBalance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span style={{ color: 'var(--text-secondary)' }}>Token Cost</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>-₦{price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center" style={{ marginTop: '4px', paddingTop: '12px', borderTop: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Remaining</span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: hasEnough ? 'var(--brand-brown)' : '#EF4444' }}>
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
            if (!selected) return;
            setPurchasedTokens(selected.total_tokens);
            const ok = await purchaseTokens(selected.id);
            if (ok) setActiveSection('token-purchase-success');
          }}
          disabled={isPurchasing || !hasEnough}
          className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
          style={{
            padding: '16px', borderRadius: '12px',
            background: isPurchasing || !hasEnough ? 'var(--bg-surface-elevated)' : 'var(--brand-fill)',
            color: 'var(--brand-fill-text)', fontSize: '13px', fontWeight: 800,
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
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Purchase Successful!</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '280px' }}>
            You've purchased <strong>{purchasedTokens} tokens</strong>.
          </p>
        </div>

        <div style={{ ...cardStyle, width: '100%', maxWidth: '320px', padding: '24px', marginTop: '8px', background: 'var(--bg-surface-elevated)' }}>
          <div className="flex flex-col items-center" style={{ gap: '4px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Tokens Added</span>
            <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>+{purchasedTokens}</span>
          </div>
          <div className="flex justify-between items-center" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>New Balance</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{tokenBalance} tokens</span>
          </div>
        </div>

        <div className="flex flex-col w-full" style={{ gap: '12px', maxWidth: '320px', marginTop: '16px' }}>
          <button
            onClick={() => setActiveSection('wallet')}
            className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ padding: '16px', borderRadius: '12px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', border: 'none', cursor: 'pointer' }}
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
              <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Fund Your Wallet</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pay by card, bank transfer or USSD (opens in a new tab)</span>
            </div>
            <LockKeyhole size={18} color="#22C55E" />
          </div>

          <div className="flex flex-col" style={{ gap: '6px', marginBottom: '24px' }}>
            <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Amount (NGN)</label>
            <input
              type="number"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              placeholder="5000"
              style={{ width: '100%', padding: '14px 0', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', background: 'transparent', border: 'none', borderBottom: '2px solid var(--brand-fill)', outline: 'none', borderRadius: 0, boxShadow: 'none' }}
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
                  border: fundAmount === String(amt) ? '2px solid var(--brand-fill)' : '1px solid var(--border-glass)',
                  background: fundAmount === String(amt) ? 'rgba(70,40,20,0.06)' : 'var(--bg-surface-elevated)',
                  fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                ₦{amt.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Current balance */}
          <div className="flex items-center justify-between" style={{ padding: '14px 0', borderTop: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Current Balance</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>₦{walletBalance.toLocaleString()}</span>
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
              background: isFunding ? 'var(--bg-surface-elevated)' : '#064E3B',
              color: '#FFF', fontSize: '14px', fontWeight: 700,
              border: 'none', cursor: isFunding ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {isFunding && <Loader2 size={16} className="animate-spin" />}
            {isFunding ? 'Opening payment...' : isPolling ? 'Waiting for payment...' : `Fund ₦${(parseFloat(fundAmount) || 0).toLocaleString()}`}
          </button>

          {isPolling && (
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px', lineHeight: 1.5 }}>
              Complete the payment in the new tab. This page will update automatically.
            </p>
          )}

          <div className="flex items-center justify-center" style={{ marginTop: '20px', gap: '6px' }}>
            <LockKeyhole size={12} color="var(--text-muted)" />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Secured by <strong style={{ color: 'var(--text-primary)' }}>paystack</strong></span>
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
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Wallet Funded!</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '280px' }}>
            You've successfully added <strong>₦{fundedAmount.toLocaleString()}</strong> to your Qlozet wallet.
          </p>
        </div>

        <div style={{ ...cardStyle, width: '100%', maxWidth: '320px', padding: '24px', marginTop: '8px', background: 'var(--bg-surface-elevated)' }}>
          <div className="flex flex-col items-center" style={{ gap: '4px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Amount Added</span>
            <span style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>+₦{fundedAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>New Balance</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>₦{walletBalance.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col w-full" style={{ gap: '12px', maxWidth: '320px', marginTop: '16px' }}>
          <button
            onClick={() => setActiveSection('wallet')}
            className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ padding: '16px', borderRadius: '12px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', border: 'none', cursor: 'pointer' }}
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
            <WalletIcon size={28} color="var(--brand-brown)" strokeWidth={1.5} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>My Wallet</h3>
            <div className="flex items-center" style={{ gap: '10px' }}>
              <button onClick={() => setActiveSection('fund-wallet')} className="transition-all hover:opacity-90 active:scale-95" style={{ padding: '10px 24px', borderRadius: '8px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', border: 'none', cursor: 'pointer' }}>
                Fund Wallet
              </button>
              <button onClick={() => setActiveSection('buy-tokens')} className="flex items-center transition-all hover:opacity-90 active:scale-95" style={{ padding: '10px 24px', borderRadius: '8px', background: 'transparent', color: 'var(--brand-brown)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', border: '1.5px solid var(--brand-brown)', cursor: 'pointer', gap: '6px' }}>
                <Sparkles size={13} strokeWidth={2} /> Buy Tokens
              </button>
            </div>
          </div>
          <div className="flex flex-col justify-center" style={{ padding: '24px 28px', gap: '14px', borderLeft: '1px solid var(--border-glass)' }}>
            <div className="flex items-center" style={{ gap: '10px' }}>
              <div className="flex items-center justify-center" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(45,106,79,0.1)' }}>
                <WalletIcon size={16} color="#2D6A4F" strokeWidth={1.8} />
              </div>
              <div className="flex flex-col">
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Wallet Balance (NGN)</span>
                <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {isLoading ? '...' : `₦${walletBalance.toLocaleString()}`}
                </span>
                {!isLoading && isConverted && (
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    ≈ {fmt(walletBalance)} · estimate
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center" style={{ gap: '10px' }}>
              <div className="flex items-center justify-center" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)' }}>
                <TokenIcon size={18} color="#D4AF37" />
              </div>
              <div className="flex flex-col">
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tokens (TCN)</span>
                <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
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
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Transactions</h4>

            {Object.entries(grouped).map(([month, txs]) => (
              <div key={month} className="flex flex-col" style={{ gap: '0' }}>
                {/* Month header */}
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
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
                        style={{ padding: '16px 20px', borderBottom: i < txs.length - 1 ? '1px solid var(--border-glass)' : 'none' }}
                      >
                        <div className="flex items-center" style={{ gap: '14px' }}>
                          <div className="flex items-center justify-center flex-shrink-0" style={{ width: '38px', height: '38px', borderRadius: '12px', background: isCredit ? 'rgba(45,106,79,0.08)' : 'rgba(70,40,20,0.06)' }}>
                            {isCredit ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="5 12 12 19 19 12"/></svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand-brown)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 5 5 12"/></svg>
                            )}
                          </div>
                          <div className="flex flex-col" style={{ gap: '2px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{tx.description || tx.type}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{dateStr} · {timeStr}</span>
                          </div>
                        </div>
                        <div className="flex items-center flex-shrink-0" style={{ gap: '8px' }}>
                          <div className="flex items-center" style={{ gap: '5px' }}>
                            {tx.description?.toLowerCase().includes('token') ? (
                              <Sparkles size={13} color={isCredit ? '#2D6A4F' : 'var(--text-primary)'} strokeWidth={2} />
                            ) : (
                              <WalletIcon size={13} color={isCredit ? '#2D6A4F' : 'var(--text-primary)'} strokeWidth={2} />
                            )}
                            <span style={{ fontSize: '13px', fontWeight: 700, color: isCredit ? '#2D6A4F' : 'var(--text-primary)' }}>
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
                style={{ padding: '12px', borderRadius: '12px', background: 'rgba(70,40,20,0.06)', color: 'var(--brand-brown)', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.04em' }}
              >
                Load More
              </button>
            )}
          </div>
        );
      })() : !isLoading ? (
        <div className="flex flex-col items-center justify-center" style={{ padding: '40px 20px', gap: '12px' }}>
          <TokenIcon size={32} color="var(--text-muted)" />
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No transactions yet</span>
        </div>
      ) : null}
    </div>
  );
}
