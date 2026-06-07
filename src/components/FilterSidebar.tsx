'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// ─── Component Props ──────────────────────────────────────────────
interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  maxPrice: number;
  onMaxPriceChange: (price: number) => void;
  onReset: () => void;
}

// ─── Shared Filter Content ────────────────────────────────────────
const FilterContent: React.FC<{
  sortBy: string;
  onSortChange: (s: string) => void;
  maxPrice: number;
  onMaxPriceChange: (p: number) => void;
}> = ({ sortBy, onSortChange, maxPrice, onMaxPriceChange }) => (
  <>
    {/* Sorting */}
    <div className="flex flex-col gap-6">
      <h4 className="text-sm font-bold text-[#111111]">Sort by</h4>
      <div className="flex flex-col gap-5">
        {[
          { id: 'rating', label: 'Best selling' },
          { id: 'newest', label: 'Newest' },
          { id: 'priceAsc', label: 'Price: Low - High' },
          { id: 'priceDesc', label: 'Price: High - Low' }
        ].map((option) => (
          <label key={option.id} className="flex items-center justify-between cursor-pointer group">
            <span className={`text-[15px] ${sortBy === option.id ? 'font-semibold text-black' : 'text-gray-600 group-hover:text-black'}`}>
              {option.label}
            </span>
            <div className={`w-[24px] h-[24px] rounded-full border flex items-center justify-center transition-colors ${sortBy === option.id ? 'border-black' : 'border-gray-300 group-hover:border-gray-400'}`}>
              {sortBy === option.id && <div className="w-[14px] h-[14px] bg-black rounded-full" />}
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

    <div className="w-full h-px bg-gray-100" />

    {/* On Sale */}
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm font-bold text-[#111111]">On sale</span>
      <div className="w-[24px] h-[24px] border border-gray-200 rounded-lg bg-gray-50" />
    </label>

    <div className="w-full h-px bg-gray-100" />

    {/* Price */}
    <div className="flex flex-col gap-8">
      <h4 className="text-sm font-bold text-[#111111]">Price</h4>
      <div className="relative w-full h-2 bg-gray-200 rounded-full mt-4">
        <div className="absolute left-0 top-0 h-full bg-[#462814] rounded-full" style={{ width: `${(maxPrice / 200000) * 100}%` }} />
        <input
          type="range"
          min={0}
          max={200000}
          step={5000}
          className="absolute w-full -top-2.5 h-8 opacity-0 cursor-pointer"
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(Number(e.target.value))}
        />
        {/* Fake min thumb */}
        <div className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-[#462814] rounded-full shadow-md pointer-events-none" style={{ left: '-12px' }} />
        {/* Max thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-[#462814] rounded-full shadow-md pointer-events-none"
          style={{ left: `calc(${(maxPrice / 200000) * 100}% - 12px)` }}
        />
      </div>

      <div className="flex items-center justify-between gap-5 mt-2">
        <div className="flex-1 border border-gray-200 rounded-2xl px-6 py-4 flex items-center justify-center">
          <span className="text-[15px] font-medium text-gray-700">0</span>
        </div>
        <span className="text-gray-300 font-bold">-</span>
        <div className="flex-1 border border-gray-200 rounded-2xl px-6 py-4 flex items-center justify-center">
          <span className="text-[15px] font-medium text-gray-700">{maxPrice >= 200000 ? '200K+' : maxPrice.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <div className="w-full h-px bg-gray-100" />

    {/* In Stock */}
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm font-bold text-[#111111]">In-stock</span>
      <div className="w-[24px] h-[24px] bg-black rounded-lg flex items-center justify-center">
        <svg width="14" height="12" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </label>
  </>
);

// ─── FilterSidebar Component ──────────────────────────────────────
export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  sortBy,
  onSortChange,
  maxPrice,
  onMaxPriceChange,
  onReset,
}) => {
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
          className={`fixed left-3 right-3 bottom-3 z-[70] bg-white rounded-[24px] flex flex-col transition-transform duration-500 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%+20px)]'}`}
          style={{ maxHeight: '60vh', boxShadow: '0 -4px 40px rgba(0,0,0,0.12), 0 8px 30px rgba(0,0,0,0.1)' }}
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: '#DDD' }} />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between shrink-0" style={{ padding: '16px 24px' }}>
            <h3 className="text-lg font-bold text-[#111111]">Filters</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2"
            >
              <X size={18} strokeWidth={3} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-8 hide-scrollbar" style={{ padding: '0 24px 24px 24px' }}>
            <FilterContent sortBy={sortBy} onSortChange={onSortChange} maxPrice={maxPrice} onMaxPriceChange={onMaxPriceChange} />
          </div>

          {/* Footer */}
          <div className="shrink-0 flex items-center gap-3" style={{ padding: '16px 24px 24px 24px' }}>
            <button
              onClick={onReset}
              className="flex-1 hover:bg-gray-200 transition-colors"
              style={{ padding: '14px', borderRadius: '14px', background: '#F4F4F4', color: '#1A1A1A', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="flex-1 hover:bg-gray-800 transition-colors"
              style={{ padding: '14px', borderRadius: '14px', background: '#1A1A1A', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
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
            className={`h-full w-[320px] bg-white rounded-[24px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] flex flex-col border border-gray-100 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between shrink-0" style={{ padding: '24px 24px 20px 24px' }}>
              <h3 className="text-lg font-bold text-[#111111]">Filters</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-black transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2"
              >
                <X size={16} strokeWidth={3} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-10 hide-scrollbar" style={{ padding: '0 24px 24px 24px' }}>
              <FilterContent sortBy={sortBy} onSortChange={onSortChange} maxPrice={maxPrice} onMaxPriceChange={onMaxPriceChange} />
            </div>

            {/* Footer */}
            <div className="shrink-0 flex items-center gap-3" style={{ padding: '16px 24px 24px 24px' }}>
              <button
                onClick={onReset}
                className="flex-1 hover:bg-gray-200 transition-colors"
                style={{ padding: '14px', borderRadius: '14px', background: '#F4F4F4', color: '#1A1A1A', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
              >
                Reset
              </button>
              <button
                onClick={onClose}
                className="flex-1 hover:bg-gray-800 transition-colors"
                style={{ padding: '14px', borderRadius: '14px', background: '#1A1A1A', color: '#FFFFFF', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
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
