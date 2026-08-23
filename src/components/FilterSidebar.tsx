'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const PRICE_MAX = 200000;
const PRICE_STEP = 5000;

// ─── Component Props ──────────────────────────────────────────────
interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  minPrice: number;
  onMinPriceChange: (price: number) => void;
  maxPrice: number;
  onMaxPriceChange: (price: number) => void;
  onSale: boolean;
  onOnSaleChange: (v: boolean) => void;
  inStock: boolean;
  onInStockChange: (v: boolean) => void;
  onReset: () => void;
}

// ─── Checkbox visual ──────────────────────────────────────────────
const CheckBox: React.FC<{ checked: boolean }> = ({ checked }) =>
  checked ? (
    <div
      className="w-[24px] h-[24px] rounded-lg flex items-center justify-center"
      style={{ background: 'var(--brand-fill)' }}
    >
      <svg width="14" height="12" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 4L3.5 6.5L9 1" stroke="var(--brand-fill-text)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  ) : (
    <div
      className="w-[24px] h-[24px] rounded-lg"
      style={{ border: '1px solid var(--border-glass)', background: 'var(--bg-surface-elevated)' }}
    />
  );

// ─── Shared Filter Content ────────────────────────────────────────
const FilterContent: React.FC<{
  sortBy: string;
  onSortChange: (s: string) => void;
  minPrice: number;
  onMinPriceChange: (p: number) => void;
  maxPrice: number;
  onMaxPriceChange: (p: number) => void;
  onSale: boolean;
  onOnSaleChange: (v: boolean) => void;
  inStock: boolean;
  onInStockChange: (v: boolean) => void;
}> = ({ sortBy, onSortChange, minPrice, onMinPriceChange, maxPrice, onMaxPriceChange, onSale, onOnSaleChange, inStock, onInStockChange }) => (
  <>
    {/* Sorting */}
    <div className="flex flex-col gap-6">
      <h4 className="text-sm font-bold text-[var(--text-primary)]">Sort by</h4>
      <div className="flex flex-col gap-5">
        {[
          { id: 'rating', label: 'Best selling' },
          { id: 'newest', label: 'Newest' },
          { id: 'priceAsc', label: 'Price: Low - High' },
          { id: 'priceDesc', label: 'Price: High - Low' }
        ].map((option) => (
          <label key={option.id} className="flex items-center justify-between cursor-pointer group">
            <span className={`text-[15px] ${sortBy === option.id ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>
              {option.label}
            </span>
            <div className={`w-[24px] h-[24px] rounded-full border flex items-center justify-center transition-colors ${sortBy === option.id ? 'border-[var(--brand-fill)]' : 'border-[var(--border-glass)] group-hover:border-[var(--text-muted)]'}`}>
              {sortBy === option.id && <div className="w-[14px] h-[14px] bg-[var(--brand-fill)] rounded-full" />}
            </div>
            <input
              type="radio"
              name="sort"
              value={option.id}
              checked={sortBy === option.id}
              onChange={() => onSortChange(option.id)}
              className="hidden"
            />
          </label>
        ))}
      </div>
    </div>

    <div className="w-full h-px" style={{ background: 'var(--bg-surface-elevated)' }} />

    {/* On Sale */}
    <button type="button" onClick={() => onOnSaleChange(!onSale)} className="flex items-center justify-between cursor-pointer w-full" style={{ background: 'none', border: 'none', padding: 0 }}>
      <span className="text-sm font-bold text-[var(--text-primary)]">On sale</span>
      <CheckBox checked={onSale} />
    </button>

    <div className="w-full h-px" style={{ background: 'var(--bg-surface-elevated)' }} />

    {/* Price */}
    <div className="flex flex-col gap-8">
      <h4 className="text-sm font-bold text-[var(--text-primary)]">Price</h4>
      <div className="relative w-full h-2 bg-[var(--bg-surface-elevated)] rounded-full mt-4">
        {/* Active fill between min and max */}
        <div
          className="absolute top-0 h-full bg-[var(--brand-fill)] rounded-full"
          style={{ left: `${(minPrice / PRICE_MAX) * 100}%`, right: `${100 - (maxPrice / PRICE_MAX) * 100}%` }}
        />
        {/* Min thumb */}
        <input
          type="range"
          min={0}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={minPrice}
          onChange={(e) => onMinPriceChange(Math.min(Number(e.target.value), maxPrice - PRICE_STEP))}
          className="dual-range"
          style={{ zIndex: minPrice > PRICE_MAX - PRICE_STEP * 2 ? 5 : 3 }}
          aria-label="Minimum price"
        />
        {/* Max thumb */}
        <input
          type="range"
          min={0}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(Math.max(Number(e.target.value), minPrice + PRICE_STEP))}
          className="dual-range"
          style={{ zIndex: 4 }}
          aria-label="Maximum price"
        />
      </div>

      <div className="flex items-center justify-between gap-5 mt-2">
        <div className="flex-1 rounded-2xl px-6 py-4 flex items-center justify-center" style={{ border: '1px solid var(--border-glass)' }}>
          <span className="text-[15px] font-medium text-[var(--text-secondary)]">
            {minPrice > 0 ? `₦${minPrice.toLocaleString()}` : '₦0'}
          </span>
        </div>
        <span className="text-[var(--text-muted)] font-bold">-</span>
        <div className="flex-1 rounded-2xl px-6 py-4 flex items-center justify-center" style={{ border: '1px solid var(--border-glass)' }}>
          <span className="text-[15px] font-medium text-[var(--text-secondary)]">
            {maxPrice >= PRICE_MAX ? '₦200K+' : `₦${maxPrice.toLocaleString()}`}
          </span>
        </div>
      </div>
    </div>

    <div className="w-full h-px" style={{ background: 'var(--bg-surface-elevated)' }} />

    {/* In Stock */}
    <button type="button" onClick={() => onInStockChange(!inStock)} className="flex items-center justify-between cursor-pointer w-full" style={{ background: 'none', border: 'none', padding: 0 }}>
      <span className="text-sm font-bold text-[var(--text-primary)]">In-stock only</span>
      <CheckBox checked={inStock} />
    </button>
  </>
);

// ─── FilterSidebar Component ──────────────────────────────────────
export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  sortBy,
  onSortChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  onSale,
  onOnSaleChange,
  inStock,
  onInStockChange,
  onReset,
}) => {
  const content = (
    <FilterContent
      sortBy={sortBy}
      onSortChange={onSortChange}
      minPrice={minPrice}
      onMinPriceChange={onMinPriceChange}
      maxPrice={maxPrice}
      onMaxPriceChange={onMaxPriceChange}
      onSale={onSale}
      onOnSaleChange={onOnSaleChange}
      inStock={inStock}
      onInStockChange={onInStockChange}
    />
  );

  return (
    <>
      {/* ══════ MOBILE: Bottom Sheet ══════ */}
      <div className="lg:hidden">
        {/* Backdrop */}
        <div
          className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={onClose}
        />

        {/* Bottom Sheet */}
        <div
          className={`fixed left-3 right-3 bottom-3 z-[70] rounded-[24px] flex flex-col transition-transform duration-500 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%+20px)]'}`}
          style={{ maxHeight: '70vh', background: 'var(--bg-base)', boxShadow: '0 -4px 40px rgba(0,0,0,0.12), 0 8px 30px rgba(0,0,0,0.1)' }}
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: 'var(--border-glass)' }} />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between shrink-0" style={{ padding: '16px 24px' }}>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Filters</h3>
            <button
              onClick={onClose}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors bg-[var(--bg-surface-elevated)] rounded-full p-2"
            >
              <X size={18} strokeWidth={3} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-8 hide-scrollbar" style={{ padding: '0 24px 24px 24px' }}>
            {content}
          </div>

          {/* Footer */}
          <div className="shrink-0 flex items-center gap-3" style={{ padding: '16px 24px 24px 24px' }}>
            <button
              onClick={onReset}
              className="flex-1 hover:bg-[var(--bg-surface-elevated)] transition-colors"
              style={{ padding: '14px', borderRadius: '14px', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="flex-1 transition-opacity hover:opacity-90"
              style={{ padding: '14px', borderRadius: '14px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* ══════ DESKTOP: Floating side panel inside white card — portalled to body, stays fixed ══════ */}
      {typeof document !== 'undefined' && createPortal(
        <div
          className={`hidden lg:block fixed z-[60] pointer-events-none transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'}`}
          style={{ left: '120px', top: '48px', bottom: '48px' }}
        >
          <aside
            className={`h-full w-[320px] rounded-[24px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] flex flex-col ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
            style={{ background: 'var(--bg-base)', border: '1px solid var(--border-glass)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between shrink-0" style={{ padding: '24px 24px 20px 24px' }}>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Filters</h3>
              <button
                onClick={onClose}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors bg-[var(--bg-surface-elevated)] rounded-full p-2"
              >
                <X size={16} strokeWidth={3} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-10 hide-scrollbar" style={{ padding: '0 24px 24px 24px' }}>
              {content}
            </div>

            {/* Footer */}
            <div className="shrink-0 flex items-center gap-3" style={{ padding: '16px 24px 24px 24px' }}>
              <button
                onClick={onReset}
                className="flex-1 hover:bg-[var(--bg-surface-elevated)] transition-colors"
                style={{ padding: '14px', borderRadius: '14px', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
              >
                Reset
              </button>
              <button
                onClick={onClose}
                className="flex-1 transition-opacity hover:opacity-90"
                style={{ padding: '14px', borderRadius: '14px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
              >
                Done
              </button>
            </div>
          </aside>
        </div>,
        document.body
      )}
    </>
  );
};
