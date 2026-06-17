'use client';

import { useCallback } from 'react';
import { api } from '@/lib/api';
import { useApp } from '@/context/AppContext';

// ─── Event Types (mirrors backend EventType enum) ────────────
export type EventType =
  | 'view_item'
  | 'click_item'
  | 'save_item'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'purchase'
  | 'search'
  | 'generate_design'
  | 'edit_design'
  | 'save_design'
  | 'measurement_created'
  | 'measurement_updated'
  | 'rate_item'
  | 'return_item'
  | 'feed_impression_batch'
  | 'not_interested'
  | 'hide_business'
  | 'wishlist_add'
  | 'wishlist_remove'
  | 'preferred_aesthetic';

// ─── Event Payload Types ─────────────────────────────────────
export interface EventContext {
  /** Where the event happened: "home_feed", "discover", "product_page", "search_results", etc. */
  surface?: string;
  /** Recommendation request ID for tracing */
  requestId?: string;
  /** Position in a feed list (0-indexed) */
  position?: number;
  /** Feed stream name: "trending", "new_arrivals", "for_you" */
  stream?: string;
}

export interface EventMetadata {
  /** Reason codes for why something was shown */
  reasonCodes?: string[];
  /** Product IDs seen on screen (for impression batches) */
  seenIds?: string[];
  /** Search query text */
  query?: string;
  /** Active filters */
  filters?: Record<string, any>;
  /** User's max budget */
  budgetMax?: number;
  /** Deadline in days */
  deadlineDays?: number;
  /** Time spent viewing in milliseconds */
  dwellMs?: number;
}

export interface TrackEventParams {
  eventType: EventType;
  /** Arbitrary event-specific properties: { itemId, price, vendorId, ... } */
  properties?: Record<string, any>;
  /** Where in the UI the event occurred */
  context?: EventContext;
  /** Extra metadata for the recommendation engine */
  metadata?: EventMetadata;
}

// ─── Standalone tracking function (for use outside React components) ──
export function trackEventDirect(userId: string, params: TrackEventParams): void {
  if (!userId) return;

  api.post('/recommendations/events', {
    userId,
    eventType: params.eventType,
    properties: params.properties,
    context: params.context,
    metadata: params.metadata,
    timestamp: new Date().toISOString(),
  }).catch(() => {
    // Fire-and-forget — never break the UI for analytics
  });
}

// ─── React Hook ──────────────────────────────────────────────
/**
 * Returns a `trackEvent` function that automatically injects the
 * current user's ID and timestamp. No-ops when the user is not logged in.
 *
 * Usage:
 * ```tsx
 * const trackEvent = useTrackEvent();
 * trackEvent({ eventType: 'view_item', properties: { itemId: '123' } });
 * ```
 */
export function useTrackEvent() {
  const { user } = useApp();

  const trackEvent = useCallback(
    (params: TrackEventParams) => {
      const userId = user?.id;
      if (!userId) return; // silently skip when logged out

      trackEventDirect(userId, params);
    },
    [user?.id]
  );

  return trackEvent;
}
