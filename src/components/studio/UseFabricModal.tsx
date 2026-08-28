'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, ArrowLeft, Scissors, Pen, Sparkles, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { getProductName, getProductImage, getProductPrice, type ApiProduct } from '@/lib/api-types';
import { useBespokeDesigns, type BespokeDesign } from '@/hooks/useBespokeDesigns';
import { useCurrency } from '@/context/CurrencyContext';

// ═══════════════════════════════════════════════════════════════
//  UseFabricModal
//  Shown on fabric product pages. Lets the user choose to apply
//  the fabric to a Bespoke design or a Customizable clothing item.
//  Desktop: floating card (portalled). Mobile: bottom sheet (portalled).
// ═══════════════════════════════════════════════════════════════

type Step = 'choose' | 'bespoke' | 'custom';

interface UseFabricModalProps {
  isOpen: boolean;
  onClose: () => void;
  fabricImage: string;
  fabricName: string;
  fabricId: string;
  /** Fabric is out of stock — block applying it to an outfit. */
  soldOut?: boolean;
}

export const UseFabricModal: React.FC<UseFabricModalProps> = ({
  isOpen,
  onClose,
  fabricImage,
  fabricName,
  fabricId,
  soldOut = false,
}) => {
  const { fmt: fmtMoney } = useCurrency();
  const router = useRouter();
  const [step, setStep] = useState<Step>('choose');

  // The user's ACTUAL bespoke designs (from /bespoke/designs) — not placeholder
  // art. Only designs with a usable image and not cancelled are offered.
  const { designs, isLoading: loadingDesigns } = useBespokeDesigns();
  const designImageOf = (d: BespokeDesign): string | undefined =>
    d.design_images?.[0] ?? d.reference_images?.[0];
  const usableDesigns = designs.filter(
    (d) => d.status !== 'cancelled' && !!designImageOf(d),
  );

  // Customizable clothing from the user's wishlist — server-filtered via the
  // dedicated endpoint (kind: clothing, type: customize, status: active).
  const [customizableWishlistItems, setCustomizableWishlistItems] = useState<ApiProduct[]>([]);
  const [loadingCustom, setLoadingCustom] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoadingCustom(true);
    api
      .get('/products/wishlist/customizable')
      .then((res) => {
        const items = res.data?.data ?? res.data ?? [];
        if (!cancelled) setCustomizableWishlistItems(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        if (!cancelled) setCustomizableWishlistItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingCustom(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleBack = () => {
    if (step === 'choose') {
      onClose();
    } else {
      setStep('choose');
    }
  };

  const handleClose = () => {
    setStep('choose');
    onClose();
  };

  const handleSelectDesign = (design: BespokeDesign) => {
    handleClose();
    // Pass designId so the studio loads the REAL design (canvas, references and
    // selections), plus the fabric to apply on top of it.
    router.push(
      `/bespoke/studio?fabric=${encodeURIComponent(fabricId)}&designId=${encodeURIComponent(design._id)}`,
    );
  };

  const handleSelectProduct = (productId: string) => {
    handleClose();
    router.push(`/products/${productId}?fabric=${encodeURIComponent(fabricId)}&customize=true`);
  };

  // Only garments that accept external fabric can have this fabric applied — the
  // backend rejects the rest at add-to-cart, so gate them out of the picker too.
  // Treat undefined as allowed; exclude only an explicit `false`.
  const eligibleItems = customizableWishlistItems.filter((p: any) => {
    const accepts = p?.clothing?.accepts_external_fabric ?? p?.accepts_external_fabric;
    return accepts !== false;
  });

  // ── Panel Content ──────────────────────────────────────────────
  const panelContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between shrink-0" style={{ padding: '20px 24px 12px' }}>
        <div className="flex items-center" style={{ gap: '12px' }}>
          {step !== 'choose' && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center hover:bg-[var(--bg-surface-elevated)] transition-colors rounded-full"
              style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              <ArrowLeft size={18} color="var(--text-primary)" />
            </button>
          )}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {step === 'choose' ? 'Use Fabric' : step === 'bespoke' ? 'Your Designs' : 'Custom Clothing'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {step === 'choose'
                ? fabricName
                : step === 'bespoke'
                  ? 'Select a design to apply this fabric'
                  : 'Select an item to customize with this fabric'}
            </p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="transition-colors rounded-full p-2"
          style={{ background: 'var(--bg-surface-elevated)', color: 'var(--text-secondary)' }}
        >
          <X size={18} strokeWidth={3} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto hide-scrollbar" style={{ padding: '16px 24px 24px' }}>

        {/* ── Step 1: Choose Bespoke or Custom ── */}
        {step === 'choose' && (
          <div className="flex flex-col" style={{ gap: '14px' }}>
            {/* Fabric Preview */}
            <div className="flex items-center rounded-[16px] overflow-hidden" style={{ background: 'var(--bg-surface-elevated)', gap: '14px', padding: '12px' }}>
              <div className="relative flex-shrink-0 rounded-[12px] overflow-hidden" style={{ width: '56px', height: '56px' }}>
                <Image src={fabricImage} alt={fabricName} fill style={{ objectFit: 'cover' }} sizes="56px" />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{fabricName}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Selected fabric</p>
              </div>
            </div>

            {soldOut ? (
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#B4232A', background: 'rgba(180,35,42,0.06)', border: '1px solid rgba(180,35,42,0.15)', borderRadius: '12px', padding: '12px 14px', textAlign: 'center', margin: '4px 0' }}>
                This fabric is sold out, so it can&apos;t be applied to an outfit right now. Check back after it&apos;s restocked.
              </div>
            ) : (
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center', margin: '8px 0' }}>
                What would you like to use your fabric for?
              </p>
            )}

            {/* Bespoke Card */}
            <button
              onClick={() => setStep('bespoke')}
              disabled={soldOut}
              className="w-full flex items-center transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                padding: '20px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #3B0764 0%, #4C1D95 100%)',
                border: 'none',
                cursor: 'pointer',
                gap: '16px',
              }}
            >
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)' }}>
                <Sparkles size={24} color="#FFF" />
              </div>
              <div className="text-left">
                <p className="text-white" style={{ fontSize: '16px', fontWeight: 800 }}>Bespoke</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>Apply to one of your studio designs</p>
              </div>
            </button>

            {/* Custom Card */}
            <button
              onClick={() => setStep('custom')}
              disabled={soldOut}
              className="w-full flex items-center transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                padding: '16px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
                color: '#FFF',
                cursor: 'pointer',
                gap: '16px',
              }}
            >
              <div className="flex items-center justify-center flex-shrink-0" style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.2)' }}>
                <Pen size={24} color="#FFF" />
              </div>
              <div className="text-left">
                <p className="text-white" style={{ fontSize: '16px', fontWeight: 800 }}>Custom Clothing</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>Apply to a customizable outfit from your wishlist</p>
              </div>
            </button>
          </div>
        )}

        {/* ── Step 2a: Bespoke Designs Grid (the user's real designs) ── */}
        {step === 'bespoke' && (
          <div>
            {loadingDesigns ? (
              <div className="flex flex-col items-center justify-center" style={{ padding: '48px 20px', gap: '12px' }}>
                <Loader2 size={32} color="#4C1D95" className="animate-spin" />
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading your designs…</p>
              </div>
            ) : usableDesigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center" style={{ padding: '48px 20px', gap: '12px' }}>
                <Scissors size={40} color="var(--text-muted)" />
                <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>No designs yet</p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>Go to the Studio to create your first bespoke design.</p>
                <button
                  onClick={() => { handleClose(); router.push('/bespoke/studio'); }}
                  className="transition-all hover:opacity-90"
                  style={{ marginTop: '8px', padding: '12px 24px', borderRadius: '12px', background: '#4C1D95', color: '#FFF', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                >
                  Go to Studio
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2" style={{ gap: '12px' }}>
                {usableDesigns.map((design) => {
                  const img = designImageOf(design)!;
                  return (
                    <button
                      key={design._id}
                      onClick={() => handleSelectDesign(design)}
                      className="relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
                      style={{ aspectRatio: '3/4', borderRadius: '16px', border: '2px solid var(--border-glass)', background: 'var(--bg-surface-elevated)', cursor: 'pointer', padding: 0 }}
                    >
                      <Image src={img} alt={design.name || 'Design'} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 45vw, 180px" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)' }} />
                      <span className="absolute bottom-3 left-3 right-3 text-white truncate" style={{ fontSize: '11px', fontWeight: 700 }}>
                        {design.name || 'Untitled Design'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Step 2b: Custom Clothing Grid ── */}
        {step === 'custom' && (
          <div>
            {loadingCustom ? (
              <div className="flex flex-col items-center justify-center" style={{ padding: '48px 20px', gap: '12px' }}>
                <Loader2 size={32} color="#4C1D95" className="animate-spin" />
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading your customizable items…</p>
              </div>
            ) : eligibleItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center" style={{ padding: '48px 20px', gap: '12px' }}>
                <Pen size={40} color="var(--text-muted)" />
                <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>No eligible items in your wishlist</p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>Add a customizable item that accepts your own fabric to your wishlist first.</p>
                <button
                  onClick={() => { handleClose(); router.push('/products'); }}
                  className="transition-all hover:opacity-90"
                  style={{ marginTop: '8px', padding: '12px 24px', borderRadius: '12px', background: '#064E3B', color: '#FFF', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2" style={{ gap: '12px' }}>
                {eligibleItems.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => handleSelectProduct(product._id)}
                    className="relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] text-left"
                    style={{ borderRadius: '16px', border: '2px solid var(--border-glass)', background: 'var(--bg-surface-elevated)', cursor: 'pointer', padding: 0 }}
                  >
                    <div className="relative w-full" style={{ aspectRatio: '3/4' }}>
                      <Image src={getProductImage(product)} alt={getProductName(product)} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 45vw, 180px" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }} />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0" style={{ padding: '10px 12px' }}>
                      <p className="text-white" style={{ fontSize: '12px', fontWeight: 700, lineHeight: 1.3 }}>{getProductName(product)}</p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>{fmtMoney(getProductPrice(product))}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* ══════ MOBILE: Bottom Sheet — portalled to body ══════ */}
      {typeof document !== 'undefined' && createPortal(
        <div className="lg:hidden">
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-[90] bg-black/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={handleClose}
          />
          {/* Bottom Sheet */}
          <div
            className={`fixed left-3 right-3 bottom-3 z-[100] rounded-[24px] flex flex-col transition-transform duration-500 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%+20px)]'}`}
            style={{ maxHeight: '75vh', background: 'var(--bg-base)', boxShadow: '0 -4px 40px rgba(0,0,0,0.12), 0 8px 30px rgba(0,0,0,0.1)' }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: 'var(--drag-handle)' }} />
            </div>
            {panelContent}
          </div>
        </div>,
        document.body
      )}

      {/* ══════ DESKTOP: Floating card — portalled to body ══════ */}
      {typeof document !== 'undefined' && createPortal(
        <div
          className={`hidden lg:block fixed z-[60] pointer-events-none transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}
          style={{ right: '48px', top: '48px', bottom: '48px' }}
        >
          <aside
            className={`h-full w-[420px] rounded-[24px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] flex flex-col border overflow-hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
            style={{ background: 'var(--bg-base)', borderColor: 'var(--border-glass)' }}
          >
            {panelContent}
          </aside>
        </div>,
        document.body
      )}
    </>
  );
};
