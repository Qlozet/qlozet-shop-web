'use client';

import React, { useState } from 'react';
import { ArrowLeft, Ruler, ChevronRight, ChevronDown, Plus, Minus, Trash2, Sparkles, ArrowRight } from 'lucide-react';
import { cardStyle } from '../styles';
import type { ActiveSection, MeasurementProfile } from '../types';

// ─── Demo Data ─────────────────────────────────────────────
const MEASUREMENT_FIELDS = ['Bust:', 'Waist', 'Hips', 'Arm length', 'Leg length', 'Upper arm', 'Upper leg'];

const DEMO_PROFILES: MeasurementProfile[] = [
  { id: '1', name: "Ciroma's measurement", isDefault: true, values: { 'Bust:': 26, 'Waist': 22, 'Hips': 36, 'Arm length': 24, 'Leg length': 26, 'Upper arm': 5, 'Upper leg': 8 } },
  { id: '2', name: "Toni's measurement", isDefault: false, values: { 'Bust:': 30, 'Waist': 26, 'Hips': 38, 'Arm length': 25, 'Leg length': 28, 'Upper arm': 6, 'Upper leg': 9 } },
  { id: '3', name: "Sola's measurement", isDefault: false, values: { 'Bust:': 34, 'Waist': 28, 'Hips': 40, 'Arm length': 26, 'Leg length': 30, 'Upper arm': 7, 'Upper leg': 10 } },
];

// ─── Props ─────────────────────────────────────────────────
interface MeasurementsSectionProps {
  activeSection: ActiveSection;
  setActiveSection: (s: ActiveSection) => void;
}

type MeasurementMethod = 'scan' | 'no-scan' | 'manual';

export default function MeasurementsSection({ activeSection, setActiveSection }: MeasurementsSectionProps) {
  const [profiles] = useState<MeasurementProfile[]>(DEMO_PROFILES);
  const [selectedProfile, setSelectedProfile] = useState<MeasurementProfile | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<MeasurementMethod>('no-scan');
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, number>>({});
  const [formHeight, setFormHeight] = useState('6ft 1in');
  const [formGender, setFormGender] = useState('Male');
  const [formWeight, setFormWeight] = useState('92 Kg');

  // ═══════════════════════════════════════════════════════════
  //  ADD MEASUREMENT — Method Selection
  // ═══════════════════════════════════════════════════════════
  if (activeSection === 'add-measurement') {
    return (
      <div className="animate-fade-in flex flex-col" style={{ gap: '24px' }}>
        <button
          onClick={() => setActiveSection('measurements')}
          className="hidden lg:flex items-center justify-center self-start transition-all active:scale-90"
          style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={20} color="#1A1A1A" />
        </button>

        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.4 }}>
          What is your clothing size?
        </h3>
        <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, maxWidth: '400px' }}>
          We use a special customization feature to get the most accurate sizes
        </p>

        {/* Method Options */}
        <div className="flex flex-col" style={{ gap: '12px' }}>
          {[
            { key: 'scan' as MeasurementMethod, label: 'Get Scanned' },
            { key: 'no-scan' as MeasurementMethod, label: 'No Scans?' },
            { key: 'manual' as MeasurementMethod, label: 'Manually input your sizes' },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSelectedMethod(opt.key)}
              className="flex items-center justify-between w-full transition-all"
              style={{
                padding: '18px 20px',
                borderRadius: '16px',
                border: selectedMethod === opt.key ? '2px solid #1A1A1A' : '1px solid rgba(0,0,0,0.08)',
                background: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>{opt.label}</span>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: selectedMethod === opt.key ? 'none' : '2px solid #DDD',
                  background: selectedMethod === opt.key ? '#1A1A1A' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {selectedMethod === opt.key && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Feature info card */}
        <div style={{ background: '#F8F6F3', borderRadius: '16px', padding: '20px', border: '1px solid rgba(0,0,0,0.04)' }}>
          <div className="flex items-center" style={{ gap: '8px', marginBottom: '10px' }}>
            <div className="flex items-center justify-center" style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)' }}>
              <Sparkles size={12} color="#D4AF37" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>Our Customization feature</span>
          </div>
          <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.6, marginBottom: '10px' }}>
            Lorem ipsum dolor sit amet consectetur. Hendrerit mauris amet non commodo eu. At pharetra ornare faucibus consectetur donec nunc pellentesque.
          </p>
          <button className="flex items-center transition-all hover:opacity-70" style={{ gap: '4px', fontSize: '13px', fontWeight: 600, color: '#1A1A1A', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            Learn more <ArrowRight size={14} />
          </button>
        </div>

        {/* Continue Button */}
        <button
          onClick={() => setActiveSection('measurement-form')}
          className="w-full transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ padding: '16px', borderRadius: '14px', background: '#1A1A1A', color: '#FFF', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', border: 'none', cursor: 'pointer' }}
        >
          Continue
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  MEASUREMENT FORM — No Scans / Manual Input
  // ═══════════════════════════════════════════════════════════
  if (activeSection === 'measurement-form') {
    const isScan = selectedMethod === 'scan';
    const isManual = selectedMethod === 'manual';

    // ─── Scan method → Download App screen ───
    if (isScan) {
      return (
        <div className="animate-fade-in flex flex-col" style={{ gap: '24px' }}>
          <button
            onClick={() => setActiveSection('add-measurement')}
            className="hidden lg:flex items-center justify-center self-start transition-all active:scale-90"
            style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <ArrowLeft size={20} color="#1A1A1A" />
          </button>

          {/* Download App Banner */}
          <div
            className="relative overflow-hidden"
            style={{
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #1A1208 0%, #2C1810 40%, #3D2517 100%)',
              padding: '36px 32px',
              minHeight: '200px',
            }}
          >
            {/* African pattern overlay */}
            <div className="absolute inset-0" style={{ opacity: 0.15, background: 'repeating-linear-gradient(60deg, transparent, transparent 20px, rgba(212,175,55,0.3) 20px, rgba(212,175,55,0.3) 22px), repeating-linear-gradient(-60deg, transparent, transparent 20px, rgba(180,100,30,0.3) 20px, rgba(180,100,30,0.3) 22px), repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(139,69,19,0.2) 30px, rgba(139,69,19,0.2) 32px)' }} />

            <div className="relative z-10 flex flex-col" style={{ gap: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.3 }}>
                Download the App
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: '380px' }}>
                Download the Qlozet app to be able to use our Body Scanning feature.
              </p>

              {/* App store buttons */}
              <div className="flex flex-wrap" style={{ gap: '12px', marginTop: '8px' }}>
                <button
                  className="flex items-center transition-all hover:opacity-90 active:scale-95"
                  style={{ gap: '10px', padding: '12px 24px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}
                >
                  <svg width="16" height="18" viewBox="0 0 16 18" fill="none"><path d="M1 1L8.5 9L1 17" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M1 1L14 9L1 17" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>Get on Android</span>
                </button>
                <button
                  className="flex items-center transition-all hover:opacity-90 active:scale-95"
                  style={{ gap: '10px', padding: '12px 24px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}
                >
                  <svg width="16" height="18" viewBox="0 0 16 18" fill="none"><path d="M12.5 14C12 15 11 16.5 9.5 16.5C8 16.5 7.5 15.5 5.8 15.5C4.1 15.5 3.5 16.5 2 16.5C0.5 16.5 -0.5 14.5 0 13C1 10 4 8 5.5 8C6.8 8 7.5 9 9 9C10.5 9 11 8 13 8L12.5 14Z" fill="#FFFFFF"/><path d="M10 1C9 2 8 3.5 8.5 5C10 5 11.5 3.5 10 1Z" fill="#FFFFFF"/></svg>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>Get on iPhone</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!isManual) {
      // No-Scans form (height, gender, weight)
      return (
        <div className="animate-fade-in flex flex-col" style={{ gap: '24px' }}>
          <button
            onClick={() => setActiveSection('add-measurement')}
            className="hidden lg:flex items-center justify-center self-start transition-all active:scale-90"
            style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <ArrowLeft size={20} color="#1A1A1A" />
          </button>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.4 }}>
              Answer the questions below<br />to get your measurement.
            </h3>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, marginTop: '12px', maxWidth: '420px' }}>
              No need for scans you can get your measurement by giving us this information
            </p>
          </div>

          {/* Height + Gender row */}
          <div className="flex" style={{ gap: '12px' }}>
            <div className="flex-1 flex flex-col" style={{ gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Height</label>
              <input
                type="text"
                value={formHeight}
                onChange={(e) => setFormHeight(e.target.value)}
                className="w-full"
                style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)', fontSize: '14px', fontWeight: 500, color: '#999', background: '#FAFAFA', outline: 'none' }}
              />
            </div>
            <div className="flex-1 flex flex-col" style={{ gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gender</label>
              <input
                type="text"
                value={formGender}
                onChange={(e) => setFormGender(e.target.value)}
                className="w-full"
                style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)', fontSize: '14px', fontWeight: 500, color: '#999', background: '#FAFAFA', outline: 'none' }}
              />
            </div>
          </div>

          {/* Weight */}
          <div className="flex flex-col" style={{ gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Weight</label>
            <input
              type="text"
              value={formWeight}
              onChange={(e) => setFormWeight(e.target.value)}
              className="w-full"
              style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)', fontSize: '14px', fontWeight: 500, color: '#999', background: '#FAFAFA', outline: 'none' }}
            />
          </div>

          {/* Feature info */}
          <div style={{ background: '#F8F6F3', borderRadius: '16px', padding: '20px', border: '1px solid rgba(0,0,0,0.04)' }}>
            <div className="flex items-center" style={{ gap: '8px', marginBottom: '10px' }}>
              <div className="flex items-center justify-center" style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)' }}>
                <Sparkles size={12} color="#D4AF37" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>Our Customization feature</span>
            </div>
            <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.6, marginBottom: '10px' }}>
              Lorem ipsum dolor sit amet consectetur. Hendrerit mauris amet non commodo eu. At pharetra ornare faucibus consectetur donec nunc pellentesque.
            </p>
            <button className="flex items-center transition-all hover:opacity-70" style={{ gap: '4px', fontSize: '13px', fontWeight: 600, color: '#1A1A1A', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              Learn more <ArrowRight size={14} />
            </button>
          </div>

          {/* Submit */}
          <button
            onClick={() => setActiveSection('measurements')}
            className="w-full transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ padding: '16px', borderRadius: '14px', background: '#2C1810', color: '#FFF', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', border: 'none', cursor: 'pointer' }}
          >
            Get Measurement
          </button>
        </div>
      );
    }

    // Manual input form with stepper controls
    return (
      <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
        <button
          onClick={() => setActiveSection('add-measurement')}
          className="hidden lg:flex items-center justify-center self-start transition-all active:scale-90"
          style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={20} color="#1A1A1A" />
        </button>

        {/* Header with Fabric Usage */}
        <div style={cardStyle}>
          <div className="flex flex-col lg:flex-row lg:items-start" style={{ padding: '24px 20px', gap: '16px' }}>
            <div className="flex-1">
              <Ruler size={32} color="#1A1A1A" strokeWidth={1.5} style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                My Measurement
              </h3>
            </div>
            <div style={{ background: '#F8F6F3', borderRadius: '16px', padding: '16px 20px', border: '1px solid rgba(0,0,0,0.04)', maxWidth: '260px' }}>
              <div className="flex items-center" style={{ gap: '8px', marginBottom: '8px' }}>
                <div className="flex items-center justify-center" style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)' }}>
                  <Sparkles size={10} color="#D4AF37" />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>Fabric Usage</span>
              </div>
              <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.5 }}>
                We&apos;ll automatically calculate and apply the right amount of fabric you need for your custom or bespoke design.
              </p>
              <button className="flex items-center transition-all hover:opacity-70" style={{ gap: '4px', fontSize: '12px', fontWeight: 600, color: '#1A1A1A', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '8px' }}>
                Learn more <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Title + Unit dropdown */}
        <div className="flex items-center justify-between">
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A' }}>New measurement</span>
        </div>

        {/* Unit selector */}
        <div className="relative" style={{ width: 'fit-content' }}>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as 'inches' | 'cm')}
            style={{ padding: '10px 36px 10px 14px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.08)', fontSize: '13px', fontWeight: 600, color: '#1A1A1A', background: '#FAFAFA', appearance: 'none', cursor: 'pointer', outline: 'none' }}
          >
            <option value="inches">Inches</option>
            <option value="cm">Centimeters</option>
          </select>
          <ChevronDown size={14} color="#999" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>

        {/* Stepper measurement rows */}
        <div style={cardStyle}>
          <div className="flex flex-col">
            {MEASUREMENT_FIELDS.map((field) => (
              <div
                key={field}
                className="flex items-center justify-between"
                style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}
              >
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A' }}>{field}</span>
                <div className="flex items-center" style={{ gap: '0' }}>
                  <button
                    onClick={() => setEditValues(prev => ({ ...prev, [field]: Math.max(0, (prev[field] || 0) - 1) }))}
                    className="flex items-center justify-center transition-all active:scale-90"
                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.1)', background: 'none', cursor: 'pointer' }}
                  >
                    <Minus size={14} color="#1A1A1A" />
                  </button>
                  <span style={{ width: '40px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>
                    {editValues[field] || 0}
                  </span>
                  <button
                    onClick={() => setEditValues(prev => ({ ...prev, [field]: (prev[field] || 0) + 1 }))}
                    className="flex items-center justify-center transition-all active:scale-90"
                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.1)', background: 'none', cursor: 'pointer' }}
                  >
                    <Plus size={14} color="#1A1A1A" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Continue */}
        <button
          onClick={() => setActiveSection('measurements')}
          className="w-full transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ padding: '16px', borderRadius: '14px', background: '#2C1810', color: '#FFF', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', border: 'none', cursor: 'pointer' }}
        >
          Continue
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  MEASUREMENT DETAIL — View/Edit a profile
  // ═══════════════════════════════════════════════════════════
  if (activeSection === 'measurement-detail' && selectedProfile) {
    const profile = selectedProfile;

    return (
      <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
        <button
          onClick={() => { setIsEditing(false); setActiveSection('measurements'); }}
          className="hidden lg:flex items-center justify-center self-start transition-all active:scale-90"
          style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={20} color="#1A1A1A" />
        </button>

        {/* Header with Fabric Usage */}
        {/* Header with Fabric Usage */}
        <div style={cardStyle}>
          <div className="flex flex-col lg:flex-row lg:items-start" style={{ padding: '24px 20px', gap: '16px' }}>
            <div className="flex-1">
              <Ruler size={32} color="#1A1A1A" strokeWidth={1.5} style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                My Measurement
              </h3>
            </div>
            <div style={{ background: '#F8F6F3', borderRadius: '16px', padding: '16px 20px', border: '1px solid rgba(0,0,0,0.04)', maxWidth: '260px' }}>
              <div className="flex items-center" style={{ gap: '8px', marginBottom: '8px' }}>
                <div className="flex items-center justify-center" style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)' }}>
                  <Sparkles size={10} color="#D4AF37" />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>Fabric Usage</span>
              </div>
              <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.5 }}>
                We&apos;ll automatically calculate and apply the right amount of fabric you need for your custom or bespoke design.
              </p>
              <button className="flex items-center transition-all hover:opacity-70" style={{ gap: '4px', fontSize: '12px', fontWeight: 600, color: '#1A1A1A', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '8px' }}>
                Learn more <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Profile name + Edit/Actions */}
        <div className="flex items-center justify-between">
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A' }}>{profile.name}</span>
          <div className="flex items-center" style={{ gap: '8px' }}>
            {isEditing ? (
              <>
                {!profile.isDefault && (
                  <button
                    className="transition-all hover:opacity-80 active:scale-95"
                    style={{ padding: '6px 14px', borderRadius: '6px', background: '#F5F5F5', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: 700, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                  >
                    Set Default
                  </button>
                )}
                <button
                  className="flex items-center justify-center transition-all hover:opacity-80 active:scale-95"
                  style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', background: 'none', cursor: 'pointer' }}
                >
                  <Trash2 size={16} color="#999" />
                </button>
              </>
            ) : (
              <button
                onClick={() => { setIsEditing(true); setEditValues({ ...profile.values }); }}
                className="transition-all hover:opacity-80 active:scale-95"
                style={{ padding: '8px 20px', borderRadius: '8px', background: '#1A1A1A', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: 700, color: '#FFF', textTransform: 'uppercase', letterSpacing: '0.08em' }}
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Unit selector */}
        <div className="relative" style={{ width: 'fit-content' }}>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as 'inches' | 'cm')}
            style={{ padding: '10px 36px 10px 14px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.08)', fontSize: '13px', fontWeight: 600, color: '#1A1A1A', background: '#FAFAFA', appearance: 'none', cursor: 'pointer', outline: 'none' }}
          >
            <option value="inches">Inches</option>
            <option value="cm">Centimeters</option>
          </select>
          <ChevronDown size={14} color="#999" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>

        {/* Measurement table */}
        <div style={cardStyle}>
          <div className="flex flex-col">
            {MEASUREMENT_FIELDS.map((field) => {
              const value = isEditing ? (editValues[field] || 0) : (profile.values[field] || 0);
              return (
                <div
                  key={field}
                  className="flex items-center justify-between"
                  style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A' }}>{field}</span>
                  {isEditing ? (
                    <div className="flex items-center" style={{ gap: '0' }}>
                      <button
                        onClick={() => setEditValues(prev => ({ ...prev, [field]: Math.max(0, (prev[field] || 0) - 1) }))}
                        className="flex items-center justify-center transition-all active:scale-90"
                        style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.1)', background: 'none', cursor: 'pointer' }}
                      >
                        <Minus size={14} color="#1A1A1A" />
                      </button>
                      <span style={{ width: '40px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>
                        {value}
                      </span>
                      <button
                        onClick={() => setEditValues(prev => ({ ...prev, [field]: (prev[field] || 0) + 1 }))}
                        className="flex items-center justify-center transition-all active:scale-90"
                        style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.1)', background: 'none', cursor: 'pointer' }}
                      >
                        <Plus size={14} color="#1A1A1A" />
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>{value} {unit}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Continue button for edit mode */}
        {isEditing && (
          <button
            onClick={() => { setIsEditing(false); setActiveSection('measurements'); }}
            className="w-full transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ padding: '16px', borderRadius: '14px', background: '#2C1810', color: '#FFF', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', border: 'none', cursor: 'pointer' }}
          >
            Continue
          </button>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  //  MEASUREMENTS LIST — Default view
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
      {/* Header card with title, Fabric Usage, and Add button */}
      <div style={cardStyle}>
        <div className="flex flex-col lg:flex-row lg:items-start" style={{ padding: '24px 20px', gap: '16px' }}>
          <div className="flex-1">
            <Ruler size={32} color="#1A1A1A" strokeWidth={1.5} style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '16px' }}>
              My Measurement
            </h3>
            <button
              onClick={() => setActiveSection('add-measurement')}
              className="transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ padding: '12px 24px', borderRadius: '10px', background: '#2C1810', color: '#FFF', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', cursor: 'pointer' }}
            >
              Add Measurement
            </button>
          </div>

          {/* Fabric Usage info card */}
          <div style={{ background: '#F8F6F3', borderRadius: '16px', padding: '16px 20px', border: '1px solid rgba(0,0,0,0.04)', maxWidth: '260px' }}>
            <div className="flex items-center" style={{ gap: '8px', marginBottom: '8px' }}>
              <div className="flex items-center justify-center" style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)' }}>
                <Sparkles size={10} color="#D4AF37" />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>Fabric Usage</span>
            </div>
            <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.5 }}>
              We&apos;ll automatically calculate and apply the right amount of fabric you need for your custom or bespoke design.
            </p>
            <button className="flex items-center transition-all hover:opacity-70" style={{ gap: '4px', fontSize: '12px', fontWeight: 600, color: '#1A1A1A', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '8px' }}>
              Learn more <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Saved measurement profiles */}
      <div className="flex flex-col" style={{ gap: '10px' }}>
        {profiles.map((p) => (
          <button
            key={p.id}
            onClick={() => { setSelectedProfile(p); setIsEditing(false); setActiveSection('measurement-detail'); }}
            className="w-full flex items-center justify-between transition-all hover:bg-[#FAFAFA] active:scale-[0.99]"
            style={{ padding: '18px 20px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', background: '#FFFFFF', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>{p.name}</span>
            <div className="flex items-center" style={{ gap: '10px' }}>
              {p.isDefault && (
                <span style={{ fontSize: '9px', fontWeight: 800, color: '#1A1A1A', background: '#F0F0F0', padding: '4px 12px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Default
                </span>
              )}
              <ChevronRight size={16} color="#CCC" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
