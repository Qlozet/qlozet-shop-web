'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, ChevronDown, Minus, Plus } from 'lucide-react';

import type { ApiSizeGuide } from '@/lib/api-types';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string; // e.g. "Men / Kaftan"
  guideData?: ApiSizeGuide | null;
}

const HOW_TO_MEASURE_STEPS = [
  'Neck – Measure around neck base where shirt fits.',
  'Chest – Measure the around fullest part with arms lowered for the most accurate measurement. Make sure the tape is flat across the back.',
  'Waist – Measure around the narrowest point on the waistline.',
  'Hips – Feet together, measure the around the fullest part.',
  'Inside Leg – Measure from the highest point at crotch to ankle bone.',
];

const ACCESSORY_SECTIONS = ['Footing', 'Rings', 'Hats', 'Bags'];

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
  return `${min} – ${max}`;
}

const SizeGuideContent: React.FC<{
  unit: 'CM' | 'IN';
  setUnit: (u: 'CM' | 'IN') => void;
  showHowTo: boolean;
  setShowHowTo: (v: boolean) => void;
  expandedAccessory: string | null;
  setExpandedAccessory: (v: string | null) => void;
  guideData?: ApiSizeGuide | null;
}> = ({ unit, setUnit, showHowTo, setShowHowTo, expandedAccessory, setExpandedAccessory, guideData }) => {
  
  const [selectedFitIdx, setSelectedFitIdx] = useState(0);
  const [showFitDropdown, setShowFitDropdown] = useState(false);

  const fitTypes = guideData?.fit_types ?? [];
  const selectedFit = fitTypes[selectedFitIdx] ?? null;
  const currentFitLabel = selectedFit?.label ?? 'Regular fit';

  const headers = guideData ? ['SIZE', ...guideData.body_parts.map(bp => bp.toUpperCase())] : [];
  const gridTemplateColumns = headers.length > 0 ? `50px repeat(${headers.length - 1}, 1fr)` : '50px 1fr';

  /** Get the ease allowance for a body part from the selected fit type */
  const getEase = (bodyPart: string): number => {
    if (!selectedFit) return 0;
    const a = selectedFit.allowances.find(x => x.body_part === bodyPart);
    return a?.value ?? 0;
  };

  /** Format a measurement cell with unit conversion + fit ease */
  const formatCell = (m: { min: number; max: number; body_part: string } | undefined, bp: string): string => {
    if (!m || !guideData) return '-';
    const ease = getEase(bp);
    const rawMin = convertValue(m.min + ease, guideData.unit, unit);
    const rawMax = convertValue(m.max + ease, guideData.unit, unit);
    return formatRange(rawMin, rawMax);
  };

  return (
  <>
    {/* BODY MEASUREMENT header */}
    <h4 className="text-sm font-bold text-[#111111]" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {selectedFit && getEase(guideData?.body_parts?.[0] ?? '') > 0 ? 'Garment Measurement' : 'Body Measurement'}
    </h4>

    {/* Unit Toggle + Fit */}
    <div className="flex items-center justify-between">
      <div className="flex overflow-hidden" style={{ borderRadius: '8px', border: '1px solid #E5E5E5' }}>
        {(['CM', 'IN'] as const).map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            style={{
              padding: '6px 16px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: unit === u ? '#1A1A1A' : '#FFFFFF',
              color: unit === u ? '#FFFFFF' : '#666666',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {u}
          </button>
        ))}
      </div>
      {/* Fit type selector — dynamic from API or static fallback */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => fitTypes.length > 1 && setShowFitDropdown(!showFitDropdown)}
          className="flex items-center gap-1.5"
          style={{ fontSize: '13px', color: '#666', background: 'none', border: 'none', cursor: fitTypes.length > 1 ? 'pointer' : 'default', padding: 0 }}
        >
          <span>{currentFitLabel}</span>
          {fitTypes.length > 1 && <ChevronDown size={14} />}
        </button>
        {showFitDropdown && fitTypes.length > 1 && (
          <div
            className="animate-fade-in"
            style={{
              position: 'absolute', right: 0, top: '100%', marginTop: '4px',
              background: 'white', borderRadius: '10px', border: '1px solid #E5E5E5',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)', zIndex: 10, overflow: 'hidden',
              minWidth: '150px',
            }}
          >
            {fitTypes.map((ft, idx) => (
              <button
                key={ft.name}
                onClick={() => { setSelectedFitIdx(idx); setShowFitDropdown(false); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '10px 14px', fontSize: '12px', fontWeight: idx === selectedFitIdx ? 700 : 400,
                  color: idx === selectedFitIdx ? '#1A1A1A' : '#666',
                  background: idx === selectedFitIdx ? '#F5F5F5' : 'white',
                  border: 'none', cursor: 'pointer',
                }}
              >
                {ft.label}
                {ft.description && <span style={{ display: 'block', fontSize: '10px', color: '#999', marginTop: '2px' }}>{ft.description}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* Measurement Table */}
    {guideData && headers.length > 0 && (
    <div>
      {/* Table Header */}
      <div
        className="grid"
        style={{
          gridTemplateColumns,
          padding: '10px 0',
          borderBottom: '2px solid #E5E5E5',
        }}
      >
        {headers.map((h) => (
          <span key={h} style={{ fontSize: '10px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {h}
          </span>
        ))}
      </div>

      {/* Table Rows */}
      {guideData.sizes.sort((a, b) => a.sort_order - b.sort_order).map((row, idx) => (
        <div
          key={row.label}
          className="grid items-center"
          style={{
            gridTemplateColumns,
            padding: '14px 0',
            borderBottom: '1px solid #F0F0F0',
            backgroundColor: idx === 0 ? '#FAFAFA' : 'transparent',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>{row.label}</span>
          {guideData.body_parts.map(bp => {
            const m = row.measurements.find(x => x.body_part === bp);
            return (
              <span key={bp} style={{ fontSize: '12px', color: '#555' }}>
                {formatCell(m, bp)}
              </span>
            );
          })}
        </div>
      ))}
    </div>
    )}

    {/* Progress bar accent */}
    <div style={{ width: '60px', height: '3px', borderRadius: '2px', background: '#D4752A', margin: '0 auto' }} />

    <div className="w-full h-px bg-gray-100" />

    {/* HOW TO MEASURE button */}
    <button
      onClick={() => setShowHowTo(!showHowTo)}
      className="w-full flex items-center justify-between transition-colors hover:bg-gray-50"
      style={{
        padding: '14px',
        border: '1px solid #E5E5E5',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: 700,
        color: '#1A1A1A',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        background: 'white',
        cursor: 'pointer',
      }}
    >
      <span>HOW TO MEASURE</span>
      {showHowTo ? <Minus size={16} color="#999" /> : <Plus size={16} color="#999" />}
    </button>

    {/* How to Measure Section (expandable) */}
    {showHowTo && (
      <div className="animate-fade-in">
        <div
          style={{
            padding: '16px',
            borderRadius: '12px',
            background: '#FAFAFA',
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>Clothing</span>
            <Minus size={16} color="#999" />
          </div>
          <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6, marginBottom: '16px' }}>
            To choose the the correct size for you, measure you as follows:
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
          <ol style={{ paddingLeft: '16px', margin: 0 }}>
            {HOW_TO_MEASURE_STEPS.map((step, i) => (
              <li key={i} style={{ fontSize: '12px', color: '#555', lineHeight: 1.7, marginBottom: '8px' }}>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    )}

    <div className="w-full h-px bg-gray-100" />

    {/* Accessory Sections */}
    {ACCESSORY_SECTIONS.map((section) => (
      <button
        key={section}
        onClick={() => setExpandedAccessory(expandedAccessory === section ? null : section)}
        className="w-full flex items-center justify-between transition-colors hover:bg-gray-50"
        style={{
          padding: '0',
          fontSize: '14px',
          fontWeight: 600,
          color: '#1A1A1A',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span>{section}</span>
        <Plus size={16} color="#999" />
      </button>
    ))}
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
  const [expandedAccessory, setExpandedAccessory] = useState<string | null>(null);

  const handleReset = () => { setUnit('IN'); setShowHowTo(false); setExpandedAccessory(null); };

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
            <div>
              <h3 className="text-lg font-bold text-[#111111]">Size Guide</h3>
              <span style={{ fontSize: '12px', color: '#888888' }}>{category}</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2"
            >
              <X size={18} strokeWidth={3} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-6 hide-scrollbar" style={{ padding: '0 24px 24px 24px' }}>
            <SizeGuideContent
              unit={unit} setUnit={setUnit}
              showHowTo={showHowTo} setShowHowTo={setShowHowTo}
              expandedAccessory={expandedAccessory} setExpandedAccessory={setExpandedAccessory}
              guideData={guideData}
            />
          </div>

          {/* Footer */}
          <div className="shrink-0 flex items-center gap-3" style={{ padding: '16px 24px 24px 24px' }}>
            <button
              onClick={handleReset}
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
            className={`h-full w-[400px] bg-white rounded-[24px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] flex flex-col border border-gray-100 overflow-hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between shrink-0" style={{ padding: '24px 24px 20px 24px' }}>
              <div>
                <h3 className="text-lg font-bold text-[#111111]">Size Guide</h3>
                <span style={{ fontSize: '12px', color: '#888888' }}>{category}</span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-black transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2"
              >
                <X size={16} strokeWidth={3} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-8 hide-scrollbar" style={{ padding: '0 24px 24px 24px' }}>
              <SizeGuideContent
                unit={unit} setUnit={setUnit}
                showHowTo={showHowTo} setShowHowTo={setShowHowTo}
                expandedAccessory={expandedAccessory} setExpandedAccessory={setExpandedAccessory}
                guideData={guideData}
              />
            </div>

            {/* Footer */}
            <div className="shrink-0 flex items-center gap-3" style={{ padding: '16px 24px 24px 24px' }}>
              <button
                onClick={handleReset}
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
