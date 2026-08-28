'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api } from '@/lib/api';

// ─── Display currency (multi-currency plan, Phase 2) ─────────────
// Customers can browse prices in their own currency. This is DISPLAY-side
// only: catalogue prices are ₦ (vendor settlement currency), converted with a
// live mid-market rate for rendering. Checkout still charges ₦ via Paystack —
// charging in the selected currency arrives with Stripe (Phase 3), which is
// why fmt() is centralised here: the charge switch later is a context change,
// not another sweep of the UI.

export type DisplayCurrency = 'NGN' | 'USD';

const SUPPORTED: { code: DisplayCurrency; label: string; symbol: string }[] = [
  { code: 'NGN', label: 'Nigeria · ₦ NGN', symbol: '₦' },
  { code: 'USD', label: 'International · $ USD', symbol: '$' },
];

const STORAGE_KEY = 'qlozet_display_currency';

interface CurrencyContextValue {
  currency: DisplayCurrency;
  setCurrency: (c: DisplayCurrency) => void;
  supported: typeof SUPPORTED;
  /** NGN → selected-currency mid-market rate (1 when NGN). */
  rate: number | null;
  /** Format an ₦ amount in the selected display currency. */
  fmt: (amountNgn: number) => string;
  /** True when prices are shown in a currency other than the charge currency. */
  isConverted: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'NGN',
  setCurrency: () => {},
  supported: SUPPORTED,
  rate: 1,
  fmt: (n) => `₦${Math.round(n).toLocaleString()}`,
  isConverted: false,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<DisplayCurrency>('NGN');
  const [rate, setRate] = useState<number | null>(1);

  // Restore the saved choice.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as DisplayCurrency | null;
      if (saved && SUPPORTED.some((s) => s.code === saved)) {
        setCurrencyState(saved);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Fetch the NGN→X rate whenever a non-NGN currency is active.
  useEffect(() => {
    let cancelled = false;
    if (currency === 'NGN') {
      setRate(1);
      return;
    }
    setRate(null); // unknown while loading — fmt falls back to ₦
    api
      .get('/currency/rates', {
        params: { base: 'NGN', symbols: currency },
      })
      .then((res) => {
        const body = res.data?.data ?? res.data;
        const r = body?.rates?.[currency];
        if (!cancelled && typeof r === 'number' && r > 0) setRate(r);
      })
      .catch(() => {
        /* keep null — prices fall back to ₦ rather than showing wrong numbers */
      });
    return () => {
      cancelled = true;
    };
  }, [currency]);

  const setCurrency = useCallback((c: DisplayCurrency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* ignore */
    }
  }, []);

  const fmt = useCallback(
    (amountNgn: number) => {
      if (currency === 'NGN' || rate === null) {
        return `₦${Math.round(amountNgn).toLocaleString()}`;
      }
      const symbol = SUPPORTED.find((s) => s.code === currency)?.symbol ?? '';
      const converted = amountNgn * rate;
      return `${symbol}${converted.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    [currency, rate]
  );

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      supported: SUPPORTED,
      rate,
      fmt,
      isConverted: currency !== 'NGN' && rate !== null,
    }),
    [currency, setCurrency, rate, fmt]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
