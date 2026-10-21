// Where a notification takes the shopper when they tap it: the exact order,
// delivery timeline, chat, design's quotes or ticket it is about, not a list.
//
// Worked out from the notification's metadata (order_reference, design_id,
// quote_id, ticket_id) rather than its action_url, which the server sets to
// a general page ("/orders", "/bespoke"). That way notifications already in
// the inbox open the right thing too. Keep in step with the backend's
// customer notifications (and the mobile Profile guide).

export interface NotificationLike {
  _id?: string;
  type: string;
  category?: string;
  action_url?: string;
  metadata?: Record<string, unknown> | null;
}

const str = (v: unknown): string | null =>
  typeof v === 'string' && v.trim() ? v.trim() : v != null && typeof v === 'object' && 'toString' in v ? String(v) : null;

/** Updates about the parcel itself open the delivery timeline. */
const TRACKING_TYPES = new Set(['order_shipped', 'order_status_changed']);

export function notificationTarget(n: NotificationLike): string | null {
  const m = n.metadata ?? {};
  // A fresh nonce per notification, so tapping it again reopens the thing
  // even when the page already carries the same link.
  const nonce = n._id ? `&n=${encodeURIComponent(n._id)}` : '';
  const orderRef = str(m.order_reference);

  if (n.type === 'bespoke_quote_received') {
    const design = str(m.design_id);
    if (design) return `/bespoke?quotes=${encodeURIComponent(design)}${nonce}`;
    const quote = str(m.quote_id);
    if (quote) return `/bespoke?quote=${encodeURIComponent(quote)}${nonce}`;
    return '/bespoke';
  }

  if (n.type === 'ticket_reply') {
    const ticket = str(m.ticket_id);
    return ticket ? `/help/tickets?ticket=${encodeURIComponent(ticket)}` : '/help/tickets';
  }

  if (orderRef) {
    const base = `/profile?tab=orders&order=${encodeURIComponent(orderRef)}`;
    if (n.type === 'new_message') return `${base}&view=chat${nonce}`;
    if (n.category === 'shipping' && TRACKING_TYPES.has(n.type)) {
      return `${base}&view=track${nonce}`;
    }
    // Everything else about an order (confirmed, cancelled and refunded,
    // delivered, a return or dispute decision, a tailor's measurement
    // question, pre-ship photos) is answered on the order itself.
    return `${base}${nonce}`;
  }

  return n.action_url && n.action_url.startsWith('/') ? n.action_url : null;
}
