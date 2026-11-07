'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Wallet, ArrowRight, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { TokenIcon } from '../icons/TokenIcon';
import { useWallet } from '@/hooks/useWallet';
import { useTokenPacks } from '@/hooks/useTokenPacks';

interface InsufficientTokensModalProps {
  isOpen: boolean;
  balance: number;
  cost: number;
  onClose: () => void;
  onPurchaseComplete?: () => void;
  /** What the tokens are for, as the end of "You need N tokens to …". */
  purpose?: string;
  /** Label of the button on the success step. */
  actionLabel?: string;
}

export const InsufficientTokensModal: React.FC<InsufficientTokensModalProps> = ({
  isOpen,
  balance,
  cost,
  onClose,
  onPurchaseComplete,
  purpose = 'generate a design',
  actionLabel = 'Generate Now',
}) => {
  const { walletBalance, purchaseTokens, fundWallet, pollTransaction, silentRefresh } = useWallet();
  const { packs: allPacks, loading: loadingPrice } = useTokenPacks(isOpen);

  const deficit = Math.max(0, cost - balance);

  // The packs that cover what is missing (all of them if none does), and
  // the smallest of those to start on.
  const covering = allPacks.filter((p) => p.total_tokens >= deficit);
  const packs = covering.length ? covering : allPacks;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'confirm' | 'purchasing' | 'funding' | 'success'>('select');
  const [error, setError] = useState<string | null>(null);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setError(null);
      setSelectedId(null);
    }
  }, [isOpen]);

  const selected = packs.find((p) => p.id === selectedId) ?? packs[0];
  const priceNGN = selected?.price_ngn ?? 0;
  const hasEnoughWallet = walletBalance >= priceNGN;

  const handlePurchase = async () => {
    if (!selected) return;
    setError(null);

    if (hasEnoughWallet) {
      // Direct purchase from wallet
      setStep('purchasing');
      const ok = await purchaseTokens(selected.id);
      if (ok) {
        await silentRefresh();
        setStep('success');
      } else {
        setError('Purchase failed. Please try again.');
        setStep('confirm');
      }
    } else {
      // Need to fund wallet first
      setStep('funding');
      const fundAmount = priceNGN - walletBalance + 100; // small buffer
      const result = await fundWallet(fundAmount);
      if (result.success && result.reference) {
        const status = await pollTransaction(result.reference, 20);
        if (status === 'success') {
          // Now purchase tokens
          setStep('purchasing');
          const ok = await purchaseTokens(selected.id);
          if (ok) {
            await silentRefresh();
            setStep('success');
          } else {
            setError('Token purchase failed after funding.');
            setStep('confirm');
          }
        } else {
          setError('Wallet funding did not complete. Please try again.');
          setStep('confirm');
        }
      } else {
        setError('Could not initiate wallet funding.');
        setStep('confirm');
      }
    }
  };

  const handleDone = () => {
    onClose();
    onPurchaseComplete?.();
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={step !== 'purchasing' && step !== 'funding' ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className="relative w-[92%] max-w-[400px] rounded-[24px] animate-fade-in overflow-hidden"
        style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.2)', background: 'var(--bg-base)' }}
      >
        {/* Close button */}
        {step !== 'purchasing' && step !== 'funding' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex items-center justify-center transition-all hover:bg-[var(--bg-surface-elevated)] rounded-full"
            style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            <X size={18} color="var(--text-muted)" />
          </button>
        )}

        {/* ═══ SELECT STEP ═══ */}
        {step === 'select' && (
          <div className="flex flex-col" style={{ padding: '28px 24px 24px' }}>
            {/* Header */}
            <div className="flex flex-col items-center text-center" style={{ gap: '12px', marginBottom: '24px' }}>
              <div
                className="flex items-center justify-center"
                style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))' }}
              >
                <AlertTriangle size={26} color="#F59E0B" strokeWidth={1.8} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Insufficient Tokens
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: '300px' }}>
                You need <strong style={{ color: 'var(--text-primary)' }}>{cost} tokens</strong> to {purpose}
                but only have <strong style={{ color: '#EF4444' }}>{balance}</strong>.
              </p>
            </div>

            {/* Balance summary */}
            <div
              className="flex items-center justify-between"
              style={{ padding: '14px 16px', borderRadius: '14px', background: 'var(--bg-surface-elevated)', marginBottom: '20px' }}
            >
              <div className="flex items-center" style={{ gap: '8px' }}>
                <TokenIcon size={16} color="#D4AF37" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Your Balance</span>
              </div>
              <span style={{ fontSize: '16px', fontWeight: 800, color: balance > 0 ? 'var(--text-primary)' : '#EF4444' }}>
                {balance}
              </span>
            </div>

            {/* Quick buy options */}
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
              Top up tokens
            </span>
            <div className="flex flex-col" style={{ gap: '8px', marginBottom: '20px' }}>
              {loadingPrice && !packs.length && (
                <div className="flex justify-center" style={{ padding: '16px' }}>
                  <Loader2 size={18} className="animate-spin" color="var(--text-muted)" />
                </div>
              )}
              {packs.map((pack) => {
                const on = selected?.id === pack.id;
                return (
                <button
                  key={pack.id}
                  onClick={() => setSelectedId(pack.id)}
                  className="flex items-center justify-between transition-all"
                  style={{
                    padding: '14px 16px',
                    borderRadius: '14px',
                    border: on ? '2px solid var(--brand-fill)' : '1.5px solid var(--border-glass)',
                    background: on ? 'rgba(70,40,20,0.03)' : 'var(--bg-surface-elevated)',
                    cursor: 'pointer',
                    gap: '10px',
                  }}
                >
                  <div className="flex items-center" style={{ gap: '10px', minWidth: 0 }}>
                    <TokenIcon size={16} color={on ? 'var(--brand-fill)' : 'var(--text-muted)'} />
                    <span className="flex flex-col" style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: '13px', fontWeight: on ? 800 : 600, color: 'var(--text-primary)' }}>
                        {pack.name} · {pack.total_tokens.toLocaleString()} tokens
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        ₦{pack.price_ngn.toLocaleString()}
                        {pack.bonus_tokens > 0 ? ` · ${pack.bonus_tokens.toLocaleString()} free` : ''}
                        {pack.designs != null ? ` · about ${pack.designs} design${pack.designs === 1 ? '' : 's'}` : ''}
                      </span>
                    </span>
                  </div>
                  <div
                    style={{
                      width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                      border: on ? '5px solid var(--brand-fill)' : '2px solid var(--border-glass)',
                    }}
                  />
                </button>
                );
              })}
            </div>

            {/* Continue button */}
            <button
              onClick={() => setStep('confirm')}
              disabled={!selected}
              className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                padding: '15px',
                borderRadius: '14px',
                background: 'var(--brand-fill)',
                color: 'var(--brand-fill-text)',
                fontSize: '13px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                border: 'none',
                cursor: 'pointer',
                gap: '8px',
              }}
            >
              Continue
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ═══ CONFIRM STEP ═══ */}
        {step === 'confirm' && (
          <div className="flex flex-col" style={{ padding: '28px 24px 24px' }}>
            <div className="flex flex-col items-center text-center" style={{ gap: '12px', marginBottom: '24px' }}>
              <div
                className="flex items-center justify-center"
                style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(70,40,20,0.06)' }}
              >
                <TokenIcon size={28} color="var(--brand-fill)" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Confirm Purchase
              </h3>
            </div>

            {/* Summary */}
            <div className="flex flex-col" style={{ borderRadius: '16px', background: 'var(--bg-surface-elevated)', padding: '16px', gap: '12px', marginBottom: '20px' }}>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Tokens</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selected ? `${selected.name} · ${selected.total_tokens.toLocaleString()} tokens` : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Price</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {loadingPrice ? '...' : `₦${priceNGN.toLocaleString()}`}
                </span>
              </div>
              <div style={{ height: '1px', background: 'var(--border-glass)' }} />
              <div className="flex items-center justify-between">
                <div className="flex items-center" style={{ gap: '6px' }}>
                  <Wallet size={14} color="#2D6A4F" strokeWidth={2} />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Wallet Balance</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: hasEnoughWallet ? '#2D6A4F' : '#EF4444' }}>
                  ₦{walletBalance.toLocaleString()}
                </span>
              </div>
              {!hasEnoughWallet && (
                <div style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 600, background: 'rgba(245,158,11,0.08)', padding: '8px 12px', borderRadius: '8px' }}>
                  Your wallet balance is low. You&apos;ll be redirected to fund your wallet.
                </div>
              )}
            </div>

            {error && (
              <div style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600, textAlign: 'center', marginBottom: '12px' }}>
                {error}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center" style={{ gap: '10px' }}>
              <button
                onClick={() => setStep('select')}
                className="flex-1 transition-all hover:bg-[var(--bg-surface-elevated)]"
                style={{ padding: '14px', borderRadius: '14px', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
              >
                Back
              </button>
              <button
                onClick={handlePurchase}
                disabled={loadingPrice || !selected}
                className="flex-[2] flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  background: hasEnoughWallet ? '#2D6A4F' : 'var(--brand-fill)',
                  color: hasEnoughWallet ? '#FFF' : 'var(--brand-fill-text)',
                  fontSize: '13px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  border: 'none',
                  cursor: loadingPrice ? 'not-allowed' : 'pointer',
                  gap: '8px',
                  opacity: loadingPrice ? 0.5 : 1,
                }}
              >
                {hasEnoughWallet ? (
                  <>Buy {selected?.name ?? 'pack'}</>
                ) : (
                  <>Fund & Buy</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ═══ PURCHASING / FUNDING ═══ */}
        {(step === 'purchasing' || step === 'funding') && (
          <div className="flex flex-col items-center justify-center text-center" style={{ padding: '48px 24px', gap: '20px' }}>
            <div
              className="flex items-center justify-center"
              style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(124,58,237,0.08)' }}
            >
              <Loader2 size={28} color="#7C3AED" className="animate-spin" />
            </div>
            <div>
              <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {step === 'funding' ? 'Funding Wallet...' : 'Purchasing Tokens...'}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {step === 'funding' ? 'Complete payment in the new tab' : 'This will take a moment'}
              </p>
            </div>
          </div>
        )}

        {/* ═══ SUCCESS ═══ */}
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center text-center" style={{ padding: '48px 24px', gap: '20px' }}>
            <div
              className="flex items-center justify-center"
              style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(45,106,79,0.08)' }}
            >
              <CheckCircle2 size={32} color="#2D6A4F" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>Tokens Added!</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                You now have enough tokens. Tap below to continue.
              </p>
            </div>
            <button
              onClick={handleDone}
              className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                padding: '15px',
                borderRadius: '14px',
                background: '#9B51E0',
                color: '#FFF',
                fontSize: '13px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                border: 'none',
                cursor: 'pointer',
                gap: '8px',
                marginTop: '8px',
              }}
            >
              {actionLabel}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
