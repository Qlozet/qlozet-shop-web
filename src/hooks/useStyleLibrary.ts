'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

// ─── Types matching backend schema ───────────────────────────
export type StyleCategory = 'neckline' | 'sleeve' | 'collar' | 'skirt' | 'trouser' | 'full_body' | 'bodice' | 'hemline' | 'back';
export type StyleType = 'top' | 'bottom' | 'full_body' | 'accessory';
export type StyleGender = 'male' | 'female' | 'unisex';

export interface PlatformStyle {
  _id: string;
  name: string;
  style_code: string;
  category: StyleCategory;
  type: StyleType;
  gender: StyleGender;
  description?: string;
  image_url?: string;
  aliases: string[];
  attributes: string[];
  price_suggestion?: number;
  is_active: boolean;
}

// ─── Grouped result ─────────────────────────────────────────
export interface StyleLibrary {
  necklines: PlatformStyle[];
  sleeves: PlatformStyle[];
  collars: PlatformStyle[];
  skirts: PlatformStyle[];
  trousers: PlatformStyle[];
  fullBody: PlatformStyle[];
  all: PlatformStyle[];
}

// ─── Module-level cache (shared across hook instances) ───────
let _cache: { data: PlatformStyle[]; ts: number } = { data: [], ts: 0 };
let _fetchPromise: Promise<void> | null = null;
const CACHE_TTL = 600_000; // 10 minutes
const _listeners = new Set<() => void>();

function notifyListeners() {
  _listeners.forEach((fn) => fn());
}

function groupStyles(styles: PlatformStyle[]): StyleLibrary {
  return {
    necklines: styles.filter((s) => s.category === 'neckline'),
    sleeves: styles.filter((s) => s.category === 'sleeve'),
    collars: styles.filter((s) => s.category === 'collar'),
    skirts: styles.filter((s) => s.category === 'skirt'),
    trousers: styles.filter((s) => s.category === 'trouser'),
    fullBody: styles.filter((s) => s.category === 'full_body'),
    all: styles,
  };
}

async function _doFetch() {
  try {
    console.log('[StyleLibrary] fetching /style-library ...');
    const res = await api.get('/style-library');
    console.log('[StyleLibrary] raw response:', res?.status, JSON.stringify(res?.data).slice(0, 300));
    const raw = res?.data?.data || res?.data;
    const items = Array.isArray(raw) ? raw : raw?.styles || raw?.items || [];
    _cache = { data: items, ts: Date.now() };
    console.log('[StyleLibrary] loaded', items.length, 'styles');
    if (items.length > 0) {
      console.log('[StyleLibrary] sample:', items[0].name, items[0].category, items[0].image_url ? 'has image' : 'no image');
    }
    notifyListeners();
  } catch (err: any) {
    console.error('[StyleLibrary] fetch error:', err?.response?.status, err?.response?.data || err?.message);
  }
}

async function fetchAll(force = false) {
  if (!force && Date.now() - _cache.ts < CACHE_TTL && _cache.data.length > 0) return;
  if (_fetchPromise) return _fetchPromise;
  _fetchPromise = _doFetch().finally(() => { _fetchPromise = null; });
  return _fetchPromise;
}

// ─── Filter helpers ─────────────────────────────────────────
function matchesGender(style: PlatformStyle, gender?: StyleGender): boolean {
  if (!gender) return true;
  return style.gender === gender || style.gender === 'unisex';
}

function filterByGender(styles: PlatformStyle[], gender?: StyleGender): PlatformStyle[] {
  return styles.filter((s) => matchesGender(s, gender));
}

// ─── Hook ───────────────────────────────────────────────────
export function useStyleLibrary(gender?: StyleGender) {
  const [, forceUpdate] = useState(0);
  const [isLoading, setIsLoading] = useState(_cache.ts === 0);

  // Subscribe to cache updates
  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1);
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);

  // Fetch on mount
  useEffect(() => {
    setIsLoading(_cache.ts === 0);
    fetchAll().then(() => setIsLoading(false));
  }, []);

  // Get styles filtered by gender and grouped
  const getGrouped = useCallback((): StyleLibrary => {
    const filtered = filterByGender(_cache.data, gender);
    return groupStyles(filtered);
  }, [gender]);

  // Get styles for a specific clothing type
  const getForType = useCallback((clothingType: StyleType): StyleLibrary => {
    const filtered = filterByGender(_cache.data, gender);
    const byType = filtered.filter((s) => s.type === clothingType || s.type === 'full_body' && clothingType === 'full_body');
    return groupStyles(byType);
  }, [gender]);

  // Get a specific category
  const getCategory = useCallback((category: StyleCategory): PlatformStyle[] => {
    return filterByGender(
      _cache.data.filter((s) => s.category === category),
      gender,
    );
  }, [gender]);

  const grouped = getGrouped();

  return {
    ...grouped,
    isLoading,
    getForType,
    getCategory,
    refresh: () => fetchAll(true),
  };
}
