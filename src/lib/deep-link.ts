// Links that open one thing on a page (an order, a design's quotes, a
// ticket) — mostly from notifications. Each link opens its thing once per
// visit to the page, so closing it and moving around doesn't reopen it while
// the URL still carries the link. A fresh click adds a new `n`, so it opens
// again.

const opened = new Set<string>();

/** True the first time a link key is seen this session. */
export function consumeDeepLink(key: string): boolean {
  if (opened.has(key)) return false;
  opened.add(key);
  return true;
}
