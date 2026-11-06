'use client';

import { useCallback, useEffect, useReducer, useRef, type Dispatch, type SetStateAction } from 'react';

// ═══════════════════════════════════════════════════════════════
//  REMEMBERED STATE
//  A useState that outlives the page. Each data hook keeps its last answer
//  here under a key built from its arguments, so going back to a page shows
//  what was there straight away (and the browser can put the scroll back)
//  while the hook quietly fetches a fresh copy.
//
//  Only lives in this tab's memory: a reload starts empty, which also keeps
//  the first render identical to the server's. Cleared at sign-in and
//  sign-out so one person's feed never shows to the next.
// ═══════════════════════════════════════════════════════════════

const MAX_ENTRIES = 150;
const store = new Map<string, unknown>();
const isClient = typeof window !== 'undefined';

export function forgetRemembered(): void {
  store.clear();
}

export function useRemembered<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  // Only read by the setter, which always runs after this effect.
  const initialRef = useRef(initial);
  useEffect(() => {
    initialRef.current = initial;
  });

  const value = (isClient && store.has(key) ? store.get(key) : initial) as T;

  // Bound to the key it was made for: an answer for the previous arguments
  // lands under their key, never on top of the current one.
  const set = useCallback<Dispatch<SetStateAction<T>>>(
    (next) => {
      if (!isClient) return;
      const prev = (store.has(key) ? store.get(key) : initialRef.current) as T;
      const value = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      store.delete(key); // re-insert so the most recent sits last
      store.set(key, value);
      if (store.size > MAX_ENTRIES) {
        const oldest = store.keys().next().value;
        if (oldest !== undefined) store.delete(oldest);
      }
      rerender();
    },
    [key],
  );

  return [value, set];
}
