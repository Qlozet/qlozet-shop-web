'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, ChevronDown, Minus, Plus, Ruler } from 'lucide-react';

import type { ApiSizeGuide } from '@/lib/api-types';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string; // e.g. "Men / Kaftan"
  guideData?: ApiSizeGuide | null;
}

// "Part – instruction" pairs; the part renders bold, the instruction muted.
const HOW_TO_MEASURE_STEPS: [string, string][] = [
  ['Neck', 'Measure around the base of the neck, where a shirt collar sits.'],
  ['Chest', 'Measure around the fullest part with arms lowered, keeping the tape flat across the back.'],
  ['Waist', 'Measure around the narrowest point of the waistline.'],
  ['Hips', 'With feet together, measure around the fullest part.'],
  ['Inside leg', 'Measure from the highest point of the crotch down to the ankle bone.'],
];

// ─── Shared Size Guide Content ────────────────────────────────────

/** Convert a raw measurement value based on source/target unit */
const CM_PER_INCH = 2.54;
function convertValue(val: number, fromUnit: string, toUnit: 'CM' | 'IN'): number {
  const from = fromUnit.toLowerCase();
  if ((from === 'cm' && toUnit === 'CM') || (from === 'inch' && toUnit === 'IN') || (from === 'in' && toUnit === 'IN')) return val;
  if (from === 'cm' && toUnit === 'IN') return Math.round((val / CM_PER_INCH) * 10) / 10;
  // inch → cm
  return Math.round(val * CM_PER_INCH * 10) / 10;
}

function formatRange(min: number, max: number): string {
  if (min === max) return String(min);
  return `${min}–${max}`;
}

const SizeGuideContent: React.FC<{
  unit: 'CM' | 'IN';
  setUnit: (u: 'CM' | 'IN') => void;
  showHowTo: boolean;
  setShowHowTo: (v: boolean) => void;
  guideData?: ApiSizeGuide | null;
}> = ({ unit, setUnit, showHowTo, setShowHowTo, guideData }) => {

  const [selectedFitIdx, setSelectedFitIdx] = useState(0);
  const [showFitDropdown, setShowFitDropdown] = useState(false);

  const fitTypes = guideData?.fit_types ?? [];
  const selectedFit = fitTypes[selectedFitIdx] ?? null;
  const currentFitLabel = selectedFit?.label ?? 'Regular fit';

  /** Get the ease allowance for a body part from the selected fit type */
  const getEase = (bodyPart: string): number => {
    if (!selectedFit) return 0;
    const a = selectedFit.allowances.find(x => x.body_part === bodyPart);
    return a?.value ?? 0;
  };

  const hasEase = !!guideData?.body_parts?.some(bp => getEase(bp) > 0);

  /** Format a measurement cell with unit conversion + fit ease */
  const formatCell = (m: { min: number; max: number; body_part: string } | undefined, bp: string): string => {
    if (!m || !guideData) return '—';
    const ease = getEase(bp);
    const rawMin = convertValue(m.min + ease, guideData.unit, unit);
    const rawMax = convertValue(m.max + ease, guideData.unit, unit);
    return formatRange(rawMin, rawMax);
  };

  const sortedSizes = guideData ? [...guideData.sizes].sort((a, b) => a.sort_order - b.sort_order) : [];

  return (
  <>
    {/* Header row: title + unit toggle */}
    <div className="flex items-center justify-between" style={{ gap: '12px' }}>
      <div className="flex flex-col" style={{ gap: '2px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {hasEase ? 'Garment Measurements' : 'Body Measurements'}
        </h4>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          All values in {unit === 'CM' ? 'centimetres' : 'inches'}
        </span>
      </div>
      <div className="flex overflow-hidden shrink-0" style={{ borderRadius: '10px', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-elevated)', padding: '3px', gap: '2px' }}>
        {(['CM', 'IN'] as const).map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            style={{
              padding: '5px 14px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              borderRadius: '8px',
              backgroundColor: unit === u ? 'var(--brand-fill)' : 'transparent',
              color: unit === u ? 'var(--brand-fill-text)' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {u}
          </button>
        ))}
      </div>
    </div>

    {/* Fit selector — only when there is a real choice */}
    {fitTypes.length > 1 && (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowFitDropdown(!showFitDropdown)}
          className="w-full flex items-center justify-between transition-colors hover:bg-[var(--bg-surface-elevated)]"
          style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-glass)', background: 'var(--bg-base)', cursor: 'pointer' }}
        >
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Fit</span>
          <span className="flex items-center" style={{ gap: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {currentFitLabel}
            <ChevronDown size={14} color="var(--text-muted)" style={{ transform: showFitDropdown ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
          </span>
        </button>
        {showFitDropdown && (
          <div
            className="animate-fade-in"
            style={{
              position: 'absolute', left: 0, right: 0, top: '100%', marginTop: '4px',
              background: 'var(--bg-base)', borderRadius: '12px', border: '1px solid var(--border-glass)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 10, overflow: 'hidden',
            }}
          >
            {fitTypes.map((ft, idx) => (
              <button
                key={ft.name}
                onClick={() => { setSelectedFitIdx(idx); setShowFitDropdown(false); }}
                className="transition-colors hover:bg-[var(--bg-surface-elevated)]"
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '11px 14px', fontSize: '13px', fontWeight: idx === selectedFitIdx ? 800 : 500,
                  color: 'var(--text-primary)',
                  background: idx === selectedFitIdx ? 'var(--bg-surface-elevated)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                }}
              >
                {ft.label}
                {ft.description && <span style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', marginTop: '2px' }}>{ft.description}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    )}

    {/* Measurement table — bordered card, zebra rows, scrolls sideways when wide */}
    {guideData && guideData.body_parts.length > 0 && sortedSizes.length > 0 ? (
      <div style={{ border: '1px solid var(--border-glass)', borderRadius: '14px', overflow: 'hidden' }}>
        <div className="overflow-x-auto hide-scrollbar">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: guideData.body_parts.length > 3 ? `${120 + guideData.body_parts.length * 84}px` : undefined }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-elevated)' }}>
                <th style={{ position: 'sticky', left: 0, background: 'var(--bg-surface-elevated)', textAlign: 'left', padding: '12px 14px', fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
                  Size
                </th>
                {guideData.body_parts.map((bp) => (
                  <th key={bp} style={{ textAlign: 'center', padding: '12px 10px', fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
                    {bp}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedSizes.map((row, idx) => (
                <tr key={row.label} style={{ background: idx % 2 === 1 ? 'color-mix(in srgb, var(--bg-surface-elevated) 45%, transparent)' : 'transparent', borderTop: '1px solid var(--border-glass)' }}>
                  <td style={{ position: 'sticky', left: 0, background: idx % 2 === 1 ? 'var(--bg-surface-elevated)' : 'var(--bg-base)', padding: '12px 14px', fontSize: '13px', fontWeight: 800, color: 'var(--brand-brown)', whiteSpace: 'nowrap' }}>
                    {row.label}
                  </td>
                  {guideData.body_parts.map(bp => {
                    const m = row.measurements.find(x => x.body_part === bp);
                    return (
                      <td key={bp} style={{ textAlign: 'center', padding: '12px 10px', fontSize: '12.5px', fontWeight: 500, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                        {formatCell(m, bp)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {hasEase && (
          <p style={{ margin: 0, padding: '10px 14px', fontSize: '10.5px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-glass)', background: 'var(--bg-surface-elevated)' }}>
            Includes the extra room ("ease") a {currentFitLabel.toLowerCase()} garment is cut with.
          </p>
        )}
      </div>
    ) : (
      <div className="flex flex-col items-center text-center" style={{ padding: '28px 16px', gap: '8px', border: '1px dashed var(--border-glass)', borderRadius: '14px' }}>
        <Ruler size={22} color="var(--text-muted)" strokeWidth={1.5} />
        <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0, maxWidth: '260px' }}>
          This vendor hasn&apos;t added a size chart for this product. Use the measuring guide below and your saved measurements for the best fit.
        </p>
      </div>
    )}

    {/* HOW TO MEASURE (expandable) */}
    <div style={{ border: '1px solid var(--border-glass)', borderRadius: '14px', overflow: 'hidden' }}>
      <button
        onClick={() => setShowHowTo(!showHowTo)}
        className="w-full flex items-center justify-between transition-colors hover:bg-[var(--bg-surface-elevated)]"
        style={{
          padding: '14px 16px',
          fontSize: '12px',
          fontWeight: 800,
          color: 'var(--text-primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span>How to measure</span>
        {showHowTo ? <Minus size={16} color="var(--text-muted)" /> : <Plus size={16} color="var(--text-muted)" />}
      </button>

      {showHowTo && (
        <div className="animate-fade-in" style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border-glass)' }}>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '14px 0 16px' }}>
            Use a soft measuring tape over light clothing — snug, but never tight.
          </p>

          {/* Measurement Diagram */}
          <div className="flex justify-center" style={{ marginBottom: '16px' }}>
            <div className="relative" style={{ width: '120px', height: '200px' }}>
              <Image
                src="/image/man-measurement-pose.png"
                alt="How to measure"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="flex flex-col" style={{ gap: '10px' }}>
            {HOW_TO_MEASURE_STEPS.map(([part, instruction], i) => (
              <div key={part} className="flex" style={{ gap: '10px' }}>
                <span className="flex items-center justify-center shrink-0" style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-surface-elevated)', fontSize: '10px', fontWeight: 800, color: 'var(--brand-brown)', marginTop: '1px' }}>
                  {i + 1}
                </span>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  <b style={{ color: 'var(--text-primary)' }}>{part}</b> — {instruction}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </>
  );
};

// ─── SizeGuideModal Component ─────────────────────────────────────
export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  category = 'Men / Kaftan',
  guideData,
}) => {
  const [unit, setUnit] = useState<'CM' | 'IN'>('IN');
  const [showHowTo, setShowHowTo] = useState(false);

  const handleReset = () => { setUnit('IN'); setShowHowTo(false); };

  const closeBtnStyle: React.CSSProperties = {
    width: '32px', height: '32px', borderRadius: '50%',
    background: 'var(--bg-surface-elevated)', border: 'none', cursor: 'pointer',
  };

  const Header = (
    <>
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Size Guide</h3>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{category}</span>
      </div>
      <button onClick={onClose} className="flex items-center justify-center transition-colors hover:bg-[var(--border-glass)]" style={closeBtnStyle}>
        <X size={16} color="var(--text-primary)" strokeWidth={2.5} />
      </button>
    </>
  );

  const Footer = (
    <>
      <button
        onClick={handleReset}
        className="flex-1 transition-colors hover:opacity-90"
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
    </>
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
          className={`fixed left-3 right-3 bottom-3 z-[70] rounded-[24px] flex flex-col transition-transform duration-500 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%+20px)] pointer-events-none'}`}
          style={{ maxHeight: '85vh', background: 'var(--bg-base)', border: '1px solid var(--border-glass)', boxShadow: '0 -4px 40px rgba(0,0,0,0.12), 0 8px 30px rgba(0,0,0,0.1)' }}
        >

          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: 'var(--drag-handle)' }} />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between shrink-0" style={{ padding: '16px 24px' }}>
            {Header}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-5 hide-scrollbar" style={{ padding: '0 24px 24px 24px' }}>
            <SizeGuideContent
              unit={unit} setUnit={setUnit}
              showHowTo={showHowTo} setShowHowTo={setShowHowTo}
              guideData={guideData}
            />
          </div>

          {/* Footer */}
          <div className="shrink-0 flex items-center gap-3" style={{ padding: '16px 24px 24px 24px', borderTop: '1px solid var(--border-glass)' }}>
            {Footer}
          </div>
        </div>
      </div>

      {/* ══════ DESKTOP: Floating side panel — portalled to body, stays fixed ══════ */}
      {typeof document !== 'undefined' && createPortal(
        <div
          className={`hidden lg:block fixed z-[60] pointer-events-none transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'}`}
          style={{ left: '120px', top: '48px', bottom: '48px' }}
        >
          <aside
            className={`h-full w-[400px] rounded-[24px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
            style={{ background: 'var(--bg-base)', border: '1px solid var(--border-glass)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between shrink-0" style={{ padding: '24px 24px 20px 24px' }}>
              {Header}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-5 hide-scrollbar" style={{ padding: '0 24px 24px 24px' }}>
              <SizeGuideContent
                unit={unit} setUnit={setUnit}
                showHowTo={showHowTo} setShowHowTo={setShowHowTo}
                guideData={guideData}
              />
            </div>

            {/* Footer */}
            <div className="shrink-0 flex items-center gap-3" style={{ padding: '16px 24px 24px 24px', borderTop: '1px solid var(--border-glass)' }}>
              {Footer}
            </div>
          </aside>
        </div>,
        document.body
      )}
    </>
  );
};
