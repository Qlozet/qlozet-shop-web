'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// "You have unsaved work — leave?" for one page at a time (the studio, with
// a design it hasn't saved). Next's App Router has no way to block a
// navigation, so the guard catches each way out itself:
//   - link clicks (caught before Next's <Link> sees them),
//   - code that navigates on its own, through guardedLeave (the shell search),
//   - the Back button, via one extra same-URL history entry,
//   - refresh / closing the tab, which only the browser's own box can stop.

type Guard = (go: () => void) => boolean;
let current: Guard | null = null;

/**
 * Navigate unless a page wants to ask first; if it does, `go` runs once the
 * shopper chooses to leave.
 */
export function guardedLeave(go: () => void): void {
  if (current?.(go)) return;
  go();
}

const TRAP = 'qlozetLeaveTrap';

const pushTrap = () => {
  // Keep Next's own state on the entry so stepping back onto the page's real
  // entry restores it in place (no reload, no remount).
  window.history.pushState({ ...(window.history.state ?? {}), [TRAP]: true }, '', window.location.href);
};

/**
 * Guard leaving while `dirty`. `ask(go)` shows the page's own prompt and calls
 * `go` to leave. Returns `allowLeave`, for the page's own exits that keep the
 * work (duplicate, delete) so they are not asked about.
 */
export function useLeaveGuard(enabled: boolean, dirty: boolean, ask: (go: () => void) => void) {
  const router = useRouter();
  const dirtyRef = useRef(dirty);
  const askRef = useRef(ask);
  const bypass = useRef(false);
  const trapped = useRef(false);

  useEffect(() => {
    dirtyRef.current = dirty;
    askRef.current = ask;
  });

  // Back button: once there is something to lose, put a same-URL entry on
  // top, so Back lands on it first and we can ask.
  useEffect(() => {
    if (!enabled || !dirty || trapped.current) return;
    pushTrap();
    trapped.current = true;
  }, [enabled, dirty]);

  useEffect(() => {
    if (!enabled) return;
    const shouldAsk = () => !bypass.current && dirtyRef.current;
    const askThen = (go: () => void) =>
      askRef.current(() => {
        bypass.current = true;
        go();
      });

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (!/^https?:$/.test(url.protocol)) return; // mailto:, tel:
      const here = window.location;
      if (url.origin === here.origin && url.pathname === here.pathname && url.search === here.search) return; // same page
      if (!shouldAsk()) return;
      e.preventDefault();
      e.stopPropagation(); // Next's <Link> never sees it
      askThen(() => {
        // Another studio URL remounts the studio anyway; a hard load is the
        // reliable way there (a same-route push can hang).
        if (url.origin !== here.origin || url.pathname === here.pathname) window.location.assign(url.href);
        else router.push(url.pathname + url.search + url.hash);
      });
    };

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!shouldAsk()) return;
      e.preventDefault();
      e.returnValue = '';
    };

    const onPopState = () => {
      if (!trapped.current) return;
      // Back just stepped off the trap onto the page's own entry.
      trapped.current = false;
      if (bypass.current) return;
      if (dirtyRef.current) {
        pushTrap();
        trapped.current = true;
        askThen(() => window.history.go(-2));
      } else {
        // Saved since the trap went in: carry on where Back was going.
        window.history.back();
      }
    };

    current = (go) => {
      if (!shouldAsk()) return false;
      askThen(go);
      return true;
    };
    window.addEventListener('click', onClick, true);
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('popstate', onPopState);
    return () => {
      current = null;
      window.removeEventListener('click', onClick, true);
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('popstate', onPopState);
    };
  }, [enabled, router]);

  return {
    allowLeave: () => {
      bypass.current = true;
    },
  };
}
