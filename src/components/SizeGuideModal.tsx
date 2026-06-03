'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, ChevronDown, Minus, Plus } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string; // e.g. "Men / Kaftan"
}

const MEASUREMENT_DATA = [
  { size: 'XS', chest: '31.5 - 35.0', hip: '31.5 - 35.0', waist: '31.5 - 35.0', leg: '31.5 - 35.0' },
  { size: 'S',  chest: '31.5 - 35.0', hip: '31.5 - 35.0', waist: '31.5 - 35.0', leg: '31.5 - 35.0' },
  { size: 'M',  chest: '31.5 - 35.0', hip: '31.5 - 35.0', waist: '31.5 - 35.0', leg: '31.5 - 35.0' },
  { size: 'L',  chest: '31.5 - 35.0', hip: '31.5 - 35.0', waist: '31.5 - 35.0', leg: '31.5 - 35.0' },
  { size: 'XL', chest: '31.5 - 35.0', hip: '31.5 - 35.0', waist: '31.5 - 35.0', leg: '31.5 - 35.0' },
  { size: 'XXL',chest: '31.5 - 35.0', hip: '31.5 - 35.0', waist: '31.5 - 35.0', leg: '31.5 - 35.0' },
];

const HOW_TO_MEASURE_STEPS = [
  'Neck – Measure around neck base where shirt fits.',
  'Chest – Measure the around fullest part with arms lowered for the most accurate measurement. Make sure the tape is flat across the back.',
  'Waist – Measure around the narrowest point on the waistline.',
  'Hips – Feet together, measure the around the fullest part.',
  'Inside Leg – Measure from the highest point at crotch to ankle bone.',
];

const ACCESSORY_SECTIONS = ['Footing', 'Rings', 'Hats', 'Bags'];

// ─── Shared Size Guide Content ────────────────────────────────────
const SizeGuideContent: React.FC<{
  unit: 'CM' | 'IN';
  setUnit: (u: 'CM' | 'IN') => void;
  showHowTo: boolean;
  setShowHowTo: (v: boolean) => void;
  expandedAccessory: string | null;
  setExpandedAccessory: (v: string | null) => void;
}> = ({ unit, setUnit, showHowTo, setShowHowTo, expandedAccessory, setExpandedAccessory }) => (
  <>
    {/* BODY MEASUREMENT header */}
    <h4 className="text-sm font-bold text-[#111111]" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      Body Measurement
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
      <div className="flex items-center gap-1.5" style={{ fontSize: '13px', color: '#666' }}>
        <span>Regular fit</span>
        <ChevronDown size={14} />
      </div>
    </div>

    {/* Measurement Table */}
    <div>
      {/* Table Header */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: '50px 1fr 1fr 1fr 1fr',
          padding: '10px 0',
          borderBottom: '2px solid #E5E5E5',
        }}
      >
        {['SIZE', 'CHEST', 'HIP', 'WAIST', 'LEG'].map((h) => (
          <span key={h} style={{ fontSize: '10px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {h}
          </span>
        ))}
      </div>

      {/* Table Rows */}
      {MEASUREMENT_DATA.map((row, idx) => (
        <div
          key={row.size}
          className="grid"
          style={{
            gridTemplateColumns: '50px 1fr 1fr 1fr 1fr',
            padding: '14px 0',
            borderBottom: '1px solid #F0F0F0',
            backgroundColor: idx === 0 ? '#FAFAFA' : 'transparent',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>{row.size}</span>
          <span style={{ fontSize: '12px', color: '#555' }}>{row.chest}</span>
          <span style={{ fontSize: '12px', color: '#555' }}>{row.hip}</span>
          <span style={{ fontSize: '12px', color: '#555' }}>{row.waist}</span>
          <span style={{ fontSize: '12px', color: '#555' }}>{row.leg}</span>
        </div>
      ))}
    </div>

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

// ─── SizeGuideModal Component ─────────────────────────────────────
export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  category = 'Men / Kaftan',
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
            />
          </div>

          {/* Footer */}
          <div className="shrink-0 flex items-center gap-4" style={{ padding: '16px 24px 24px 24px' }}>
            <button
              onClick={handleReset}
              className="flex-1 py-3.5 bg-[#F4F4F4] hover:bg-gray-200 text-black text-[14px] font-bold rounded-full transition-colors"
            >
              Reset
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3.5 bg-black hover:bg-gray-800 text-white text-[14px] font-bold rounded-full transition-colors"
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
              />
            </div>

            {/* Footer */}
            <div className="shrink-0 flex items-center gap-4" style={{ padding: '16px 24px 24px 24px' }}>
              <button
                onClick={handleReset}
                className="flex-1 py-3 bg-[#F4F4F4] hover:bg-gray-200 text-black text-[13px] font-bold rounded-full transition-colors"
              >
                Reset
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-black hover:bg-gray-800 text-white text-[13px] font-bold rounded-full transition-colors"
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
