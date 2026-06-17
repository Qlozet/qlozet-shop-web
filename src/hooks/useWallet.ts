'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { useApp } from '@/context/AppContext';

// ─── Backend types ────────────────────────────────────────────
export interface WalletTransaction {
  _id: string;
  reference: string;
  amount: number;
  type: 'fund' | 'credit' | 'debit' | 'refund';
  status: 'pending' | 'success' | 'failed' | 'reversed';
  description: string;
  currency: string;
  channel: string;
  payment_method: string;
  createdAt: string;
}

export interface TokenPrice {
  tokens: number;
  currency: string;
  amount: number;
}

// ─── Module-level cache (shared across all hook instances) ────
let _cache = {
  walletBalance: 0,
  tokenBalance: 0,
  transactions: [] as WalletTransaction[],
  lastFetched: 0,
};
let _fetchPromise: Promise<void> | null = null;
const CACHE_TTL = 15_000; // 15 seconds — don't re-fetch within this window
const _listeners = new Set<() => void>();

// Token price cache (5 min TTL)
let _priceCache: { key: string; data: TokenPrice; ts: number } | null = null;
const PRICE_TTL = 300_000; // 5 minutes

function notifyListeners() {
  _listeners.forEach((fn) => fn());
}

// Helper: recursively search for a key in a nested object
function findKey(obj: any, key: string, depth = 0): any {
  if (!obj || typeof obj !== 'object' || depth > 8) return undefined;
  if (obj[key] !== undefined) return obj[key];
  for (const v of Object.values(obj)) {
    const found = findKey(v, key, depth + 1);
    if (found !== undefined) return found;
  }
  return undefined;
}

// Core fetch (module-level, deduplicated)
async function _doFetch() {
  const [walletRes, tokenRes, txRes] = await Promise.allSettled([
    api.get('/wallets/balance'),
    api.get('/token/balance'),
    api.get('/transactions/customer', { params: { page: 1, size: 50 } }),
  ]);

  if (walletRes.status === 'fulfilled') {
    const balance = findKey(walletRes.value?.data, 'balance') ?? 0;
    _cache.walletBalance = typeof balance === 'number' ? balance : 0;
    console.log('[Wallet] balance:', _cache.walletBalance);
  }

  if (tokenRes.status === 'fulfilled') {
    const tokens = findKey(tokenRes.value?.data, 'tokens') ?? 0;
    _cache.tokenBalance = tokens;
    console.log('[Wallet] tokens:', _cache.tokenBalance);
  }

  if (txRes.status === 'fulfilled') {
    const raw = txRes.value?.data;
    console.log('[Wallet] transactions raw:', JSON.stringify(raw).slice(0, 500));
    const data = raw?.data || raw;
    // Handle: array, { items: [] }, { data: [] }, { data: { items: [] } }
    const items = Array.isArray(data)
      ? data
      : data?.items || (Array.isArray(data?.data) ? data.data : data?.data?.items || []);
    _cache.transactions = items;
    console.log('[Wallet] transactions parsed:', _cache.transactions.length);
  }

  _cache.lastFetched = Date.now();
  notifyListeners();
}

// Deduplicated fetch — if one is in-flight, reuse it
async function fetchAll(force = false) {
  if (!force && Date.now() - _cache.lastFetched < CACHE_TTL) return;
  if (_fetchPromise) return _fetchPromise;
  _fetchPromise = _doFetch().finally(() => { _fetchPromise = null; });
  return _fetchPromise;
}

// ─── Hook ─────────────────────────────────────────────────────
export function useWallet() {
  const { user } = useApp();
  const [, forceUpdate] = useState(0);
  const [isLoading, setIsLoading] = useState(_cache.lastFetched === 0);
  const [error, setError] = useState<string | null>(null);
  const [isFunding, setIsFunding] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Subscribe to cache updates
  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1);
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);

  // Fetch on mount (deduplicated across instances)
  useEffect(() => {
    if (!user?.id) return;
    setIsLoading(_cache.lastFetched === 0);
    fetchAll().then(() => setIsLoading(false));
  }, [user?.id]);

  // ─── Refresh (force re-fetch) ───────────────────────────────
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await fetchAll(true);
    setIsLoading(false);
  }, []);

  // Silent refresh (no loading skeleton)
  const silentRefresh = useCallback(async () => {
    await fetchAll(true);
  }, []);

  // ─── Get token price in NGN (cached + retry) ────────────────
  const getTokenPrice = useCallback(async (
    tokens: number,
    currency: string = 'NGN',
  ): Promise<TokenPrice | null> => {
    const cacheKey = `${tokens}_${currency}`;

    // Return cached if fresh
    if (_priceCache && _priceCache.key === cacheKey && Date.now() - _priceCache.ts < PRICE_TTL) {
      return _priceCache.data;
    }

    // Try up to 2 times with delay
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (attempt > 0) await new Promise(r => setTimeout(r, 2000));
        const res = await api.get('/wallets/price', { params: { tokens, currency } });
        const data = res?.data?.data || res?.data;
        if (data?.amount != null) {
          _priceCache = { key: cacheKey, data: data as TokenPrice, ts: Date.now() };
          return data as TokenPrice;
        }
      } catch (err: any) {
        console.warn(`[Wallet] getTokenPrice attempt ${attempt + 1} failed:`, err?.response?.status);
      }
    }

    // Return stale cache as fallback
    if (_priceCache && _priceCache.key === cacheKey) return _priceCache.data;
    console.error('[Wallet] getTokenPrice: all attempts failed');
    return null;
  }, []);

  // ─── Fund wallet via Paystack (new tab) ─────────────────────
  const fundWallet = useCallback(async (
    amount: number,
  ): Promise<{ success: boolean; authorization_url?: string; reference?: string }> => {
    setIsFunding(true);
    setError(null);
    try {
      const res = await api.post('/wallets/fund', { amount });
      console.log('[Wallet] fund RAW response:', JSON.stringify(res?.data));

      const authUrl = findKey(res?.data, 'authorization_url');
      const reference = findKey(res?.data, 'reference');
      console.log('[Wallet] fund parsed → authUrl:', authUrl, 'reference:', reference);

      if (authUrl) {
        window.open(authUrl, '_blank', 'noopener,noreferrer');
        return { success: true, authorization_url: authUrl, reference };
      }

      throw new Error('No authorization URL in response');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to initialize payment';
      console.error('[Wallet] fundWallet error:', msg);
      setError(msg);
      return { success: false };
    } finally {
      setIsFunding(false);
    }
  }, []);

  // ─── Poll transaction status ────────────────────────────────
  const pollTransaction = useCallback(async (
    reference: string,
    maxAttempts = 30,
  ): Promise<'success' | 'failed' | 'pending'> => {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      try {
        const res = await api.get(`/transactions/reference/${reference}`);
        const data = res?.data?.data || res?.data;
        console.log(`[Wallet] poll ${i + 1}:`, data?.status);

        if (data?.status === 'success') {
          await fetchAll(true);
          return 'success';
        }
        if (data?.status === 'failed' || data?.status === 'reversed') {
          return 'failed';
        }
      } catch {
        // Network error — keep polling
      }
    }
    return 'pending';
  }, []);

  // ─── Purchase tokens from wallet balance ────────────────────
  const purchaseTokens = useCallback(async (
    amount: number,
  ): Promise<boolean> => {
    setIsPurchasing(true);
    setError(null);
    try {
      const res = await api.post('/token/customer/purchase', { amount });
      console.log('[Wallet] purchaseTokens response:', res?.status, JSON.stringify(res?.data));
      await fetchAll(true);
      return true;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to purchase tokens';
      console.error('[Wallet] purchaseTokens error:', msg);
      setError(msg);
      return false;
    } finally {
      setIsPurchasing(false);
    }
  }, []);

  return {
    walletBalance: _cache.walletBalance,
    tokenBalance: _cache.tokenBalance,
    transactions: _cache.transactions,
    isLoading,
    error,
    isFunding,
    isPurchasing,
    refresh,
    silentRefresh,
    getTokenPrice,
    fundWallet,
    pollTransaction,
    purchaseTokens,
  };
}
