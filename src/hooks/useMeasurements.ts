'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { trackEventDirect } from '@/hooks/useTrackEvent';
import { useApp } from '@/context/AppContext';
import type { MeasurementProfile, MeasurementValues } from '@/app/profile/types';
import { EMPTY_MEASUREMENTS } from '@/app/profile/types';

// ─── Backend response shape ───────────────────────────────────
interface BackendMeasurementSet {
  _id?: string;
  name: string;
  unit: 'cm' | 'inch';
  active?: boolean;
  is_active?: boolean;
  measurements: Record<string, number>;
}

// ─── Gradio DataFrame label → MeasurementValues key mapping ───
const GRADIO_LABEL_MAP: Record<string, keyof MeasurementValues> = {
  'chest': 'chest',
  'waist': 'waist',
  'hips': 'hip',
  'hip': 'hip',
  'shoulder width': 'shoulder_breadth',
  'shoulder breadth': 'shoulder_breadth',
  'shoulder_breadth': 'shoulder_breadth',
  'shoulder-breadth': 'shoulder_breadth',
  'arm length': 'arm_length',
  'arm_length': 'arm_length',
  'arm-length': 'arm_length',
  'leg length': 'leg_length',
  'leg_length': 'leg_length',
  'leg-length': 'leg_length',
  'upper arm': 'bicep',
  'bicep': 'bicep',
  'forearm': 'forearm',
  'upper leg': 'thigh',
  'thigh': 'thigh',
  'calf': 'calf',
  'wrist': 'wrist',
  'ankle': 'ankle',
  'height': 'height',
  'torso length': 'shoulder_to_crotch',
  'shoulder to crotch': 'shoulder_to_crotch',
  'shoulder_to_crotch': 'shoulder_to_crotch',
  'shoulder-to-crotch': 'shoulder_to_crotch',
};

// ─── Normalize a label: lowercase, trim, hyphens→underscores ──
function normalizeLabel(raw: string): string {
  return raw.toLowerCase().trim().replace(/-/g, '_');
}

// ─── Parse Gradio DataFrame into MeasurementValues ────────────
function parseDataFrame(data: any): MeasurementValues {
  const result: MeasurementValues = { ...EMPTY_MEASUREMENTS };

  // Format: { headers: ["Measurement", "cm", "inches"], data: [["Chest", 95.2, 37.5], ...] }
  if (data?.headers && data?.data && Array.isArray(data.data)) {
    const cmIndex = data.headers.findIndex((h: string) =>
      h.toLowerCase() === 'cm' || h.toLowerCase() === 'centimeters'
    );
    const valueCol = cmIndex >= 0 ? cmIndex : 1;

    for (const row of data.data) {
      if (!Array.isArray(row) || row.length < 2) continue;
      const label = normalizeLabel(String(row[0]));
      const key = GRADIO_LABEL_MAP[label] || (label in result ? label as keyof MeasurementValues : undefined);
      if (key && typeof row[valueCol] === 'number') {
        (result as unknown as Record<string, number>)[key] = Math.round(row[valueCol] * 100) / 100;
      }
    }
    return result;
  }

  // Fallback: direct key-value object (e.g. { chest: 95.2, waist: 78.1 })
  if (typeof data === 'object' && data !== null) {
    for (const [key, val] of Object.entries(data)) {
      const normalized = normalizeLabel(key);
      const mappedKey = GRADIO_LABEL_MAP[normalized] || (normalized in result ? normalized as keyof MeasurementValues : null);
      if (mappedKey && typeof val === 'number') {
        (result as unknown as Record<string, number>)[mappedKey] = Math.round(val * 100) / 100;
      }
    }
  }

  return result;
}

// ─── Map backend data to frontend type ────────────────────────
function mapToProfile(set: BackendMeasurementSet, index: number): MeasurementProfile {
  const values: MeasurementValues = { ...EMPTY_MEASUREMENTS };

  if (set.measurements) {
    for (const [key, val] of Object.entries(set.measurements)) {
      if (key in values) {
        (values as unknown as Record<string, number>)[key] = val;
      }
    }
  }

  return {
    id: set._id || `set_${index}`,
    name: set.name || `Measurement ${index + 1}`,
    isDefault: set.active || set.is_active || false,
    unit: set.unit || 'cm',
    values,
  };
}

// ─── Hook ─────────────────────────────────────────────────────
export function useMeasurements() {
  const { user } = useApp();
  const [profiles, setProfiles] = useState<MeasurementProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prediction state
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<MeasurementValues | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  // ─── Fetch all profiles ─────────────────────────────────────
  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/measurements/users/sets');
      console.log('[Measurements] fetchProfiles raw response:', JSON.stringify(res?.data));
      const wrapper = res?.data?.data || res?.data || {};
      // Backend returns { sets: [...], total, full_name, ... } — extract the sets array
      const setsArray = wrapper?.sets || (Array.isArray(wrapper) ? wrapper : []);
      const list: BackendMeasurementSet[] = Array.isArray(setsArray) ? setsArray : [];
      console.log('[Measurements] fetchProfiles parsed list:', list.length, 'profiles');
      setProfiles(list.map((s, i) => mapToProfile(s, i)));
    } catch (err: any) {
      console.error('[Measurements] fetchProfiles error:', err);
      setError('Failed to load measurements');
      setProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // ─── AI Prediction (synchronous — no polling) ───────────────
  const runPrediction = useCallback(async (
    height_cm: number,
    weight: number,
    gender: 'male' | 'female',
    notes?: string,
  ): Promise<MeasurementValues | null> => {
    setIsPredicting(true);
    setPredictionError(null);
    setPredictionResult(null);

    try {
      const res = await api.post('/measurements/run-prediction', {
        height_cm,
        weight,
        gender,
        notes: notes || '',
      });

      const data = res?.data?.data || res?.data;
      console.log('[Measurements] run-prediction response:', JSON.stringify(data));

      const result = parseDataFrame(data);
      setPredictionResult(result);

      // Track event
      if (user?.id) {
        trackEventDirect(user.id, {
          eventType: 'measurement_created',
          properties: { method: 'ai_prediction', height_cm, weight, gender },
        });
      }

      return result;
    } catch (err: any) {
      const status = err?.response?.status;
      let msg = err?.response?.data?.message || err?.message || 'Prediction failed';
      if (status === 400) msg = 'Insufficient tokens or invalid input. Please check and try again.';
      if (status === 500) msg = 'The AI prediction service is temporarily unavailable. Please try again later.';
      console.error('[Measurements] runPrediction error:', msg);
      setPredictionError(msg);
      return null;
    } finally {
      setIsPredicting(false);
    }
  }, [user?.id]);

  // ─── Save a measurement set ─────────────────────────────────
  const saveMeasurement = useCallback(async (
    name: string,
    unit: 'cm' | 'inch',
    values: MeasurementValues,
  ): Promise<boolean> => {
    try {
      const body = { name, unit, measurements: values };
      console.log('[Measurements] saveMeasurement request:', JSON.stringify(body));
      const res = await api.post('/measurements/users', body);
      console.log('[Measurements] saveMeasurement response:', res?.status, JSON.stringify(res?.data));

      if (user?.id) {
        trackEventDirect(user.id, {
          eventType: 'measurement_created',
          properties: { method: 'manual', name },
        });
      }

      await fetchProfiles();
      return true;
    } catch (err: any) {
      console.error('[Measurements] saveMeasurement error:', err);
      setError(err?.response?.data?.message || 'Failed to save measurement');
      return false;
    }
  }, [fetchProfiles, user?.id]);

  // ─── Update an existing measurement set ─────────────────────
  const updateMeasurement = useCallback(async (
    name: string,
    unit: 'cm' | 'inch',
    values: MeasurementValues,
  ): Promise<boolean> => {
    try {
      const body = { unit, measurements: values };
      console.log('[Measurements] updateMeasurement request:', name, JSON.stringify(body));
      const res = await api.patch(`/measurements/users/sets/${encodeURIComponent(name)}`, body);
      console.log('[Measurements] updateMeasurement response:', res?.status, JSON.stringify(res?.data));

      if (user?.id) {
        trackEventDirect(user.id, {
          eventType: 'measurement_updated',
          properties: { name },
        });
      }

      await fetchProfiles();
      return true;
    } catch (err: any) {
      console.error('[Measurements] updateMeasurement error:', err);
      setError(err?.response?.data?.message || 'Failed to update measurement');
      return false;
    }
  }, [fetchProfiles, user?.id]);

  // ─── Delete a measurement set ───────────────────────────────
  const deleteProfile = useCallback(async (name: string): Promise<boolean> => {
    try {
      await api.delete(`/measurements/users/sets/${encodeURIComponent(name)}`);
      setProfiles(prev => prev.filter(p => p.name !== name));
      return true;
    } catch (err: any) {
      console.error('[Measurements] deleteProfile error:', err);
      setError('Failed to delete measurement');
      return false;
    }
  }, []);

  // ─── Set a profile as default/active ────────────────────────
  const setDefault = useCallback(async (name: string): Promise<boolean> => {
    // Optimistic update
    setProfiles(prev => prev.map(p => ({ ...p, isDefault: p.name === name })));

    try {
      await api.patch(`/measurements/users/sets/${encodeURIComponent(name)}/activate`);
      return true;
    } catch (err: any) {
      console.error('[Measurements] setDefault error:', err);
      setError('Failed to set default');
      await fetchProfiles(); // revert
      return false;
    }
  }, [fetchProfiles]);

  return {
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
  };
}
