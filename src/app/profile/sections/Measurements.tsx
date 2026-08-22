'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Ruler, ChevronRight, ChevronDown, Plus, Minus, Trash2, Sparkles, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { cardStyle } from '../styles';
import type { ActiveSection, MeasurementProfile, MeasurementValues } from '../types';
import { MEASUREMENT_LABELS, EMPTY_MEASUREMENTS } from '../types';
import { useMeasurements } from '@/hooks/useMeasurements';
import { MeasurementSkeleton } from '../components/Skeleton';
import { useApp } from '@/context/AppContext';

// ─── Field keys for iteration ──────────────────────────────────
const MEASUREMENT_KEYS = Object.keys(MEASUREMENT_LABELS) as (keyof MeasurementValues)[];

// ─── Unit conversion helpers ────────────────────────────────────
const CM_PER_INCH = 2.54;
/** Convert a cm value to the display unit, rounded to 1 decimal */
const toDisplay = (cmValue: number, displayUnit: 'cm' | 'inch'): number =>
  displayUnit === 'inch'
    ? Math.round((cmValue / CM_PER_INCH) * 10) / 10
    : Math.round(cmValue * 10) / 10;
/** Convert a display-unit value back to cm */
const toCm = (displayValue: number, displayUnit: 'cm' | 'inch'): number =>
  displayUnit === 'inch'
    ? Math.round(displayValue * CM_PER_INCH * 100) / 100
    : displayValue;

// ─── Props ─────────────────────────────────────────────────────
interface MeasurementsSectionProps {
  activeSection: ActiveSection;
  setActiveSection: (s: ActiveSection) => void;
}

type MeasurementMethod = 'scan' | 'no-scan' | 'manual';

export default function MeasurementsSection({ activeSection, setActiveSection }: MeasurementsSectionProps) {
  const { gender } = useApp();
  const {
    profiles,
    isLoading,
    error,
    fetchProfiles,
    runPrediction,
    isPredicting,
    predictionResult,
    predictionError,
    setPredictionResult,
    saveMeasurement,
    updateMeasurement,
    deleteProfile,
    setDefault,
  } = useMeasurements();

  const [selectedProfile, setSelectedProfile] = useState<MeasurementProfile | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<MeasurementMethod>('no-scan');
  const [unit, setUnit] = useState<'cm' | 'inch'>('cm');
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<MeasurementValues>({ ...EMPTY_MEASUREMENTS });
  const [isSaving, setIsSaving] = useState(false);
  const [saveProfileName, setSaveProfileName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // No-scan form fields
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [heightCmValue, setHeightCmValue] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [formWeight, setFormWeight] = useState('');
  const [formGender, setFormGender] = useState<'male' | 'female'>(gender);

  // Sync gender from app context
  useEffect(() => { setFormGender(gender); }, [gender]);

  // ─── Helper: get height in cm from current inputs ───────────
  const getHeightCm = (): number => {
    if (heightUnit === 'cm') {
      return Math.round(parseFloat(heightCmValue) || 0);
    }
    const ft = parseInt(heightFt) || 0;
    const inches = parseInt(heightIn) || 0;
    return Math.round((ft * 30.48) + (inches * 2.54));
  };

  // ─── Shared: Fabric Usage info card ─────────────────────────
  const FabricUsageCard = () => (
    <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: '16px', padding: '16px 20px', border: '1px solid var(--border-glass)', maxWidth: '260px' }}>
      <div className="flex items-center" style={{ gap: '8px', marginBottom: '8px' }}>
        <div className="flex items-center justify-center" style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)' }}>
          <Sparkles size={10} color="#D4AF37" />
        </div>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Fabric Usage</span>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
        We&apos;ll automatically calculate and apply the right amount of fabric you need for your custom or bespoke design.
      </p>
    </div>
  );

  // ─── Shared: Measurement Header Card ────────────────────────
  const MeasurementHeaderCard = () => (
    <div style={cardStyle}>
      <div className="flex flex-col lg:flex-row lg:items-start" style={{ padding: '24px 20px', gap: '16px' }}>
        <div className="flex-1">
          <Ruler size={32} color="var(--text-primary)" strokeWidth={1.5} style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            My Measurement
          </h3>
        </div>
        <FabricUsageCard />
      </div>
    </div>
  );

  // ─── Shared: Stepper Row ────────────────────────────────────
  const StepperRow = ({ fieldKey, value, displayUnit, onChange }: {
    fieldKey: keyof MeasurementValues;
    value: number; // always stored in cm
    displayUnit: 'cm' | 'inch';
    onChange: (key: keyof MeasurementValues, cmVal: number) => void;
  }) => {
    const displayed = toDisplay(value, displayUnit);
    const step = displayUnit === 'inch' ? 0.25 : 0.5;
    return (
      <div className="flex items-center justify-between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-glass)' }}>
        <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{MEASUREMENT_LABELS[fieldKey]}</span>
        <div className="flex items-center" style={{ gap: '0' }}>
          <button
            onClick={() => onChange(fieldKey, toCm(Math.max(0, Math.round((displayed - step) * 100) / 100), displayUnit))}
            className="flex items-center justify-center transition-all active:scale-90"
            style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border-glass)', background: 'none', cursor: 'pointer' }}
          >
            <Minus size={14} color="var(--text-primary)" />
          </button>
          <span style={{ width: '56px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {displayed || 0}
          </span>
          <button
            onClick={() => onChange(fieldKey, toCm(Math.round((displayed + step) * 100) / 100, displayUnit))}
            className="flex items-center justify-center transition-all active:scale-90"
            style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border-glass)', background: 'none', cursor: 'pointer' }}
          >
            <Plus size={14} color="var(--text-primary)" />
          </button>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  //  ADD MEASUREMENT — Method Selection
  // ═══════════════════════════════════════════════════════════════
  if (activeSection === 'add-measurement') {
    return (
      <div className="animate-fade-in flex flex-col" style={{ gap: '24px' }}>
        <button
          onClick={() => setActiveSection('measurements')}
          className="hidden lg:flex items-center justify-center self-start transition-all active:scale-90"
          style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={20} color="var(--text-primary)" />
        </button>

        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.4 }}>
          What is your clothing size?
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '400px' }}>
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
                border: selectedMethod === opt.key ? '2px solid var(--brand-fill)' : '1px solid var(--border-glass)',
                background: 'var(--bg-base)',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{opt.label}</span>
              <div
                style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  border: selectedMethod === opt.key ? 'none' : '2px solid var(--border-glass)',
                  background: selectedMethod === opt.key ? 'var(--brand-fill)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {selectedMethod === opt.key && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="var(--brand-fill-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Feature info card */}
        <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border-glass)' }}>
          <div className="flex items-center" style={{ gap: '8px', marginBottom: '10px' }}>
            <div className="flex items-center justify-center" style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)' }}>
              <Sparkles size={12} color="#D4AF37" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>AI-Powered Sizing</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '10px' }}>
            Our AI analyzes your height, weight, and body type to predict accurate measurements across 14 body points — no tape measure needed.
          </p>
        </div>

        {/* Continue Button */}
        <button
          onClick={() => setActiveSection('measurement-form')}
          className="w-full transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ padding: '16px', borderRadius: '14px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', border: 'none', cursor: 'pointer' }}
        >
          Continue
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  MEASUREMENT FORM — Scan / No Scans / Manual
  // ═══════════════════════════════════════════════════════════════
  if (activeSection === 'measurement-form') {
    const isScan = selectedMethod === 'scan';
    const isManual = selectedMethod === 'manual';

    // ─── Scan → Download App ─────────────────────────────────
    if (isScan) {
      return (
        <div className="animate-fade-in flex flex-col" style={{ gap: '24px' }}>
          <button onClick={() => setActiveSection('add-measurement')} className="hidden lg:flex items-center justify-center self-start transition-all active:scale-90" style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={20} color="var(--text-primary)" />
          </button>
          <div className="relative overflow-hidden" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #1A1208 0%, #2C1810 40%, #3D2517 100%)', padding: '36px 32px', minHeight: '200px' }}>
            <div className="absolute inset-0" style={{ opacity: 0.15, background: 'repeating-linear-gradient(60deg, transparent, transparent 20px, rgba(212,175,55,0.3) 20px, rgba(212,175,55,0.3) 22px), repeating-linear-gradient(-60deg, transparent, transparent 20px, rgba(180,100,30,0.3) 20px, rgba(180,100,30,0.3) 22px)' }} />
            <div className="relative z-10 flex flex-col" style={{ gap: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.3 }}>
                Download the App
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: '380px' }}>
                Download the Qlozet app to use our Body Scanning feature.
              </p>
              <div className="flex flex-wrap" style={{ gap: '12px', marginTop: '8px' }}>
                <button className="flex items-center transition-all hover:opacity-90 active:scale-95" style={{ gap: '10px', padding: '12px 24px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>Get on Android</span>
                </button>
                <button className="flex items-center transition-all hover:opacity-90 active:scale-95" style={{ gap: '10px', padding: '12px 24px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>Get on iPhone</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ─── No-Scan Form (AI Prediction) ────────────────────────
    if (!isManual) {
      const handlePredict = async () => {
        const heightCm = getHeightCm();
        const weight = parseFloat(formWeight);
        if (!heightCm || !weight) return;

        const result = await runPrediction(heightCm, weight, formGender);
        if (result) {
          setEditValues(result);
          setActiveSection('measurement-results');
        }
      };

      return (
        <div className="animate-fade-in flex flex-col" style={{ gap: '24px' }}>
          <button onClick={() => setActiveSection('add-measurement')} className="hidden lg:flex items-center justify-center self-start transition-all active:scale-90" style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={20} color="var(--text-primary)" />
          </button>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.4 }}>
              Answer the questions below<br />to get your measurement.
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '12px', maxWidth: '420px' }}>
              Our AI will predict your body measurements from just your height, weight, and gender.
            </p>
          </div>

          {/* Height + Gender */}
          <div className="flex" style={{ gap: '12px' }}>
            <div className="flex-1 flex flex-col" style={{ gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Height</label>
              {/* Unit toggle */}
              <div className="flex" style={{ gap: '0', marginBottom: '6px' }}>
                {(['cm', 'ft'] as const).map(u => (
                  <button
                    key={u}
                    onClick={() => setHeightUnit(u)}
                    style={{
                      padding: '6px 14px', fontSize: '11px', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer',
                      border: '1px solid var(--border-glass)',
                      borderRadius: u === 'cm' ? '8px 0 0 8px' : '0 8px 8px 0',
                      background: heightUnit === u ? 'var(--brand-fill)' : 'var(--bg-surface-elevated)',
                      color: heightUnit === u ? 'var(--brand-fill-text)' : 'var(--text-muted)',
                    }}
                  >
                    {u === 'cm' ? 'CM' : 'FT / IN'}
                  </button>
                ))}
              </div>
              {/* Input fields */}
              {heightUnit === 'cm' ? (
                <input
                  type="number"
                  value={heightCmValue}
                  onChange={(e) => setHeightCmValue(e.target.value)}
                  placeholder="170"
                  className="w-full"
                  style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-glass)', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', background: 'var(--bg-surface-elevated)', outline: 'none' }}
                />
              ) : (
                <div className="flex" style={{ gap: '8px' }}>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={heightFt}
                      onChange={(e) => setHeightFt(e.target.value)}
                      placeholder="5"
                      className="w-full"
                      style={{ padding: '14px 16px', paddingRight: '32px', borderRadius: '12px', border: '1px solid var(--border-glass)', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', background: 'var(--bg-surface-elevated)', outline: 'none' }}
                    />
                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>ft</span>
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={heightIn}
                      onChange={(e) => setHeightIn(e.target.value)}
                      placeholder="7"
                      className="w-full"
                      style={{ padding: '14px 16px', paddingRight: '28px', borderRadius: '12px', border: '1px solid var(--border-glass)', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', background: 'var(--bg-surface-elevated)', outline: 'none' }}
                    />
                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>in</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col" style={{ gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gender</label>
              <div className="flex" style={{ gap: '8px' }}>
                {(['male', 'female'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setFormGender(g)}
                    className="flex-1 transition-all"
                    style={{
                      padding: '14px', borderRadius: '12px',
                      border: formGender === g ? '2px solid var(--brand-fill)' : '1px solid var(--border-glass)',
                      background: formGender === g ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-elevated)',
                      fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
                      cursor: 'pointer', textTransform: 'capitalize',
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Weight */}
          <div className="flex flex-col" style={{ gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Weight (kg)</label>
            <input
              type="number"
              value={formWeight}
              onChange={(e) => setFormWeight(e.target.value)}
              placeholder="70"
              className="w-full"
              style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-glass)', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', background: 'var(--bg-surface-elevated)', outline: 'none' }}
            />
          </div>

          {/* Error */}
          {predictionError && (
            <div className="flex items-center" style={{ gap: '8px', padding: '12px 16px', borderRadius: '12px', background: '#FEF2F2', border: '1px solid #FECACA' }}>
              <AlertCircle size={16} color="#DC2626" />
              <span style={{ fontSize: '13px', color: '#DC2626', fontWeight: 500 }}>{predictionError}</span>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handlePredict}
            disabled={isPredicting || !getHeightCm() || !formWeight}
            className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              padding: '16px', borderRadius: '14px',
              background: isPredicting || !getHeightCm() || !formWeight ? 'var(--bg-surface-elevated)' : 'var(--brand-fill)',
              color: 'var(--brand-fill-text)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.12em', border: 'none',
              cursor: isPredicting || !getHeightCm() || !formWeight ? 'not-allowed' : 'pointer',
              gap: '10px',
            }}
          >
            {isPredicting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analyzing your body...
              </>
            ) : (
              'Get Measurement'
            )}
          </button>
        </div>
      );
    }

    // ─── Manual Input Form ───────────────────────────────────
    return (
      <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
        <button onClick={() => setActiveSection('add-measurement')} className="hidden lg:flex items-center justify-center self-start transition-all active:scale-90" style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={20} color="var(--text-primary)" />
        </button>

        <MeasurementHeaderCard />

        {/* Title + Unit */}
        <div className="flex items-center justify-between">
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>New measurement</span>
        </div>

        {/* Unit selector */}
        <div className="relative" style={{ width: 'fit-content' }}>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as 'cm' | 'inch')}
            style={{ padding: '10px 36px 10px 14px', borderRadius: '10px', border: '1px solid var(--border-glass)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', background: 'var(--bg-surface-elevated)', appearance: 'none', cursor: 'pointer', outline: 'none' }}
          >
            <option value="cm">Centimeters</option>
            <option value="inch">Inches</option>
          </select>
          <ChevronDown size={14} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>

        {/* Stepper rows */}
        <div style={cardStyle}>
          <div className="flex flex-col">
            {MEASUREMENT_KEYS.map((key) => (
              <StepperRow
                key={key}
                fieldKey={key}
                value={editValues[key]}
                displayUnit={unit}
                onChange={(k, v) => setEditValues(prev => ({ ...prev, [k]: v }))}
              />
            ))}
          </div>
        </div>

        {/* Profile name */}
        <div className="flex flex-col" style={{ gap: '6px' }}>
          <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Profile Name</label>
          <input
            type="text"
            value={saveProfileName}
            onChange={(e) => setSaveProfileName(e.target.value)}
            placeholder="e.g. My measurements"
            className="w-full"
            style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-glass)', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', background: 'var(--bg-surface-elevated)', outline: 'none' }}
          />
        </div>

        {/* Save */}
        <button
          onClick={async () => {
            if (!saveProfileName.trim()) return;
            setIsSaving(true);
            const ok = await saveMeasurement(saveProfileName.trim(), unit, editValues);
            setIsSaving(false);
            if (ok) {
              setEditValues({ ...EMPTY_MEASUREMENTS });
              setSaveProfileName('');
              setActiveSection('measurements');
            }
          }}
          disabled={isSaving || !saveProfileName.trim()}
          className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
          style={{
            padding: '16px', borderRadius: '14px',
            background: isSaving || !saveProfileName.trim() ? 'var(--bg-surface-elevated)' : 'var(--brand-fill)',
            color: 'var(--brand-fill-text)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.12em', border: 'none',
            cursor: isSaving || !saveProfileName.trim() ? 'not-allowed' : 'pointer',
            gap: '10px',
          }}
        >
          {isSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Measurement'}
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  AI PREDICTION RESULTS — Review & Save
  // ═══════════════════════════════════════════════════════════════
  if (activeSection === 'measurement-results') {
    return (
      <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
        <button onClick={() => setActiveSection('measurement-form')} className="hidden lg:flex items-center justify-center self-start transition-all active:scale-90" style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={20} color="var(--text-primary)" />
        </button>

        {/* Success badge */}
        <div className="flex items-center" style={{ gap: '10px', padding: '14px 18px', borderRadius: '14px', background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <div className="flex items-center justify-center" style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#22C55E' }}>
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#166534', display: 'block' }}>AI Prediction Complete</span>
            <span style={{ fontSize: '12px', color: '#4ADE80' }}>Review and adjust your measurements below</span>
          </div>
        </div>

        <MeasurementHeaderCard />

        {/* Unit selector */}
        <div className="flex items-center justify-between">
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Your predicted measurements</span>
          <div className="relative" style={{ width: 'fit-content' }}>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as 'cm' | 'inch')}
              style={{ padding: '8px 32px 8px 12px', borderRadius: '10px', border: '1px solid var(--border-glass)', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', background: 'var(--bg-surface-elevated)', appearance: 'none', cursor: 'pointer', outline: 'none' }}
            >
              <option value="cm">cm</option>
              <option value="inch">inch</option>
            </select>
            <ChevronDown size={12} color="var(--text-muted)" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Editable measurement rows */}
        <div style={cardStyle}>
          <div className="flex flex-col">
            {MEASUREMENT_KEYS.map((key) => (
              <StepperRow
                key={key}
                fieldKey={key}
                value={editValues[key]}
                displayUnit={unit}
                onChange={(k, v) => setEditValues(prev => ({ ...prev, [k]: v }))}
              />
            ))}
          </div>
        </div>

        {/* Profile name input */}
        <div className="flex flex-col" style={{ gap: '6px' }}>
          <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Profile Name</label>
          <input
            type="text"
            value={saveProfileName}
            onChange={(e) => setSaveProfileName(e.target.value)}
            placeholder="e.g. My measurements"
            className="w-full"
            style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-glass)', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', background: 'var(--bg-surface-elevated)', outline: 'none' }}
          />
        </div>

        {/* Save button */}
        <button
          onClick={async () => {
            if (!saveProfileName.trim()) return;
            setIsSaving(true);
            const ok = await saveMeasurement(saveProfileName.trim(), unit, editValues);
            setIsSaving(false);
            if (ok) {
              setEditValues({ ...EMPTY_MEASUREMENTS });
              setSaveProfileName('');
              setPredictionResult(null);
              setActiveSection('measurements');
            }
          }}
          disabled={isSaving || !saveProfileName.trim()}
          className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
          style={{
            padding: '16px', borderRadius: '14px',
            background: isSaving || !saveProfileName.trim() ? 'var(--bg-surface-elevated)' : 'var(--brand-fill)',
            color: 'var(--brand-fill-text)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.12em', border: 'none',
            cursor: isSaving || !saveProfileName.trim() ? 'not-allowed' : 'pointer',
            gap: '10px',
          }}
        >
          {isSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Sparkles size={14} /> Save Measurement</>}
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  MEASUREMENT DETAIL — View / Edit a profile
  // ═══════════════════════════════════════════════════════════════
  if (activeSection === 'measurement-detail' && selectedProfile) {
    const profile = selectedProfile;

    return (
      <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
        <button
          onClick={() => { setIsEditing(false); setShowDeleteConfirm(false); setActiveSection('measurements'); }}
          className="hidden lg:flex items-center justify-center self-start transition-all active:scale-90"
          style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={20} color="var(--text-primary)" />
        </button>

        <MeasurementHeaderCard />

        {/* Profile name + Actions */}
        <div className="flex items-center justify-between">
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{profile.name}</span>
          <div className="flex items-center" style={{ gap: '8px' }}>
            {isEditing ? (
              <>
                {!profile.isDefault && (
                  <button
                    onClick={async () => { await setDefault(profile.name); setSelectedProfile({ ...profile, isDefault: true }); }}
                    className="transition-all hover:opacity-80 active:scale-95"
                    style={{ padding: '6px 14px', borderRadius: '6px', background: 'var(--bg-surface-elevated)', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center justify-center transition-all hover:opacity-80 active:scale-95"
                  style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'none', cursor: 'pointer' }}
                >
                  <Trash2 size={16} color="var(--text-muted)" />
                </button>
              </>
            ) : (
              <button
                onClick={() => { setIsEditing(true); setEditValues({ ...profile.values }); }}
                className="transition-all hover:opacity-80 active:scale-95"
                style={{ padding: '8px 20px', borderRadius: '8px', background: 'var(--brand-fill)', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: 700, color: 'var(--brand-fill-text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div style={{ padding: '16px', borderRadius: '14px', background: '#FEF2F2', border: '1px solid #FECACA' }}>
            <p style={{ fontSize: '13px', color: '#991B1B', fontWeight: 600, marginBottom: '12px' }}>
              Are you sure you want to delete &quot;{profile.name}&quot;?
            </p>
            <div className="flex" style={{ gap: '8px' }}>
              <button
                onClick={async () => {
                  const ok = await deleteProfile(profile.name);
                  if (ok) { setShowDeleteConfirm(false); setActiveSection('measurements'); }
                }}
                className="flex-1 transition-all hover:opacity-90"
                style={{ padding: '10px', borderRadius: '8px', background: '#DC2626', color: '#FFF', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 transition-all hover:opacity-90"
                style={{ padding: '10px', borderRadius: '8px', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Unit selector */}
        <div className="relative" style={{ width: 'fit-content' }}>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as 'cm' | 'inch')}
            style={{ padding: '10px 36px 10px 14px', borderRadius: '10px', border: '1px solid var(--border-glass)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', background: 'var(--bg-surface-elevated)', appearance: 'none', cursor: 'pointer', outline: 'none' }}
          >
            <option value="cm">Centimeters</option>
            <option value="inch">Inches</option>
          </select>
          <ChevronDown size={14} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>

        {/* Measurement table */}
        <div style={cardStyle}>
          <div className="flex flex-col">
            {MEASUREMENT_KEYS.map((key) => {
              const cmValue = isEditing ? editValues[key] : profile.values[key];
              return isEditing ? (
                <StepperRow
                  key={key}
                  fieldKey={key}
                  value={cmValue || 0}
                  displayUnit={unit}
                  onChange={(k, v) => setEditValues(prev => ({ ...prev, [k]: v }))}
                />
              ) : (
                <div
                  key={key}
                  className="flex items-center justify-between"
                  style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-glass)' }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{MEASUREMENT_LABELS[key]}</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{toDisplay(cmValue || 0, unit)} {unit === 'inch' ? 'in' : 'cm'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save edits */}
        {isEditing && (
          <button
            onClick={async () => {
              setIsSaving(true);
              const ok = await updateMeasurement(profile.name, unit, editValues);
              setIsSaving(false);
              if (ok) { setIsEditing(false); setActiveSection('measurements'); }
            }}
            disabled={isSaving}
            className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              padding: '16px', borderRadius: '14px',
              background: isSaving ? 'var(--bg-surface-elevated)' : 'var(--brand-fill)',
              color: 'var(--brand-fill-text)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.12em', border: 'none',
              cursor: isSaving ? 'not-allowed' : 'pointer', gap: '10px',
            }}
          >
            {isSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Changes'}
          </button>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  MEASUREMENTS LIST — Default view
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
      {/* Header card */}
      <div style={cardStyle}>
        <div className="flex flex-col lg:flex-row lg:items-start" style={{ padding: '24px 20px', gap: '16px' }}>
          <div className="flex-1">
            <Ruler size={32} color="var(--text-primary)" strokeWidth={1.5} style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '16px' }}>
              My Measurement
            </h3>
            <button
              onClick={() => setActiveSection('add-measurement')}
              className="transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ padding: '12px 24px', borderRadius: '10px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', border: 'none', cursor: 'pointer' }}
            >
              Add Measurement
            </button>
          </div>
          <FabricUsageCard />
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <MeasurementSkeleton />
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="flex items-center" style={{ gap: '8px', padding: '14px 16px', borderRadius: '12px', background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <AlertCircle size={16} color="#DC2626" />
          <span style={{ fontSize: '13px', color: '#DC2626', fontWeight: 500 }}>{error}</span>
          <button onClick={fetchProfiles} style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 700, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && profiles.length === 0 && (
        <div className="flex flex-col items-center" style={{ padding: '40px 20px', gap: '12px' }}>
          <Ruler size={40} color="var(--text-muted)" strokeWidth={1} />
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
            No measurements saved yet.<br />Add your first measurement to get started.
          </p>
        </div>
      )}

      {/* Saved profiles */}
      {!isLoading && profiles.length > 0 && (
        <div className="flex flex-col" style={{ gap: '10px' }}>
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => { setSelectedProfile(p); setIsEditing(false); setUnit(p.unit); setActiveSection('measurement-detail'); }}
              className="w-full flex items-center justify-between transition-all hover:bg-[var(--bg-surface-elevated)] active:scale-[0.99]"
              style={{ padding: '18px 20px', borderRadius: '16px', border: '1px solid var(--border-glass)', background: 'var(--bg-base)', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
              <div className="flex items-center" style={{ gap: '10px' }}>
                {p.isDefault && (
                  <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-primary)', background: 'var(--bg-surface-elevated)', padding: '4px 12px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Default
                  </span>
                )}
                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
