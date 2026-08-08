'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Package, ChevronRight, ArrowLeft, MessageCircle, Ruler, Truck,
  RotateCcw, Loader2, Store, ShoppingBag,
} from 'lucide-react';
import { cardStyle, statusColors } from '../styles';
import { useCustomerOrders } from '../useCustomerOrders';
import type { ActiveSection, Order, OrderStatus, ProductType } from '../types';

// ─── Tokens ──────────────────────────────────────────────────
const INK = '#1A1A1A';
const ESPRESSO = '#2C1810';
const BROWN = '#462814';
const MUTE = '#8A7A6C';
const FAINT = '#A79A8C';

const TYPE_META: Record<ProductType, { label: string; bg: string; text: string }> = {
  'custom': { label: 'Custom', bg: 'rgba(249,115,22,0.1)', text: '#EA6A0E' },
  'ready-to-wear': { label: 'Ready to Wear', bg: 'rgba(34,197,94,0.1)', text: '#16A34A' },
  'fabric': { label: 'Fabric', bg: 'rgba(139,69,19,0.1)', text: '#8B4513' },
  'accessories': { label: 'Accessory', bg: 'rgba(184,148,31,0.12)', text: '#B8941F' },
  'bespoke': { label: 'Bespoke', bg: 'rgba(99,102,241,0.1)', text: '#5B5FD6' },
};

const ngn = (n?: number) => `₦${Math.round(n || 0).toLocaleString()}`;

// ─── Atoms ───────────────────────────────────────────────────
function Thumb({ src, alt, w, h, radius = 12, icon = 18 }: {
  src?: string; alt: string; w: number; h: number; radius?: number; icon?: number;
}) {
  return (
    <div className="flex-shrink-0 overflow-hidden flex items-center justify-center"
      style={{ width: w, height: h, borderRadius: radius, background: '#F4F1ED' }}>
      {src
        ? <Image src={src} alt={alt} width={w} height={h} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
        : <Package size={icon} color="#C9BEB2" />}
    </div>
  );
}

function TypePill({ type }: { type: ProductType }) {
  const m = TYPE_META[type];
  return (
    <span style={{ fontSize: '9px', fontWeight: 800, color: m.text, background: m.bg, padding: '3px 9px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
      {m.label}
    </span>
  );
}

function StatusPill({ status, big }: { status: OrderStatus; big?: boolean }) {
  const c = statusColors[status] ?? { bg: '#EEE', text: '#666' };
  return (
    <span style={{ fontSize: big ? '11px' : '9px', fontWeight: 800, color: c.text, background: c.bg, padding: big ? '5px 12px' : '3px 10px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: '10px', fontWeight: 600, color: '#6B5D50', background: '#F4F1ED', padding: '4px 10px', borderRadius: '8px', textTransform: 'capitalize' }}>
      {children}
    </span>
  );
}

function KV({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between" style={{ gap: '12px' }}>
      <span style={{ fontSize: '12px', color: MUTE }}>{label}</span>
      <span style={{ fontSize: strong ? '13px' : '12px', fontWeight: strong ? 800 : 600, color: INK, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function Section({ title, right, children, pad = '16px 18px' }: {
  title?: string; right?: React.ReactNode; children: React.ReactNode; pad?: string;
}) {
  return (
    <div style={cardStyle}>
      <div className="flex flex-col" style={{ padding: pad, gap: '12px' }}>
        {title && (
          <div className="flex items-center justify-between">
            <span style={{ fontSize: '11px', fontWeight: 800, color: INK, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</span>
            {right}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// Ordered → Processing → Shipped → Delivered (from the real order status).
function Progress({ status }: { status: OrderStatus }) {
  const reached = status === 'Delivered' ? 3 : status === 'Shipped' ? 2 : status === 'Processing' ? 1 : 0;
  const refused = status === 'Refused';
  const steps = ['Ordered', 'Processing', 'Shipped', 'Delivered'];
  if (refused) {
    return (
      <div className="flex items-center" style={{ gap: '10px', padding: '4px 0' }}>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RotateCcw size={12} color="#EF4444" />
        </div>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#EF4444' }}>Order cancelled / refused</span>
      </div>
    );
  }
  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const done = i <= reached;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center" style={{ gap: '5px', flex: 'none', width: 56 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: done ? ESPRESSO : '#ECE6DF', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
                {done && <span style={{ color: '#FFF', fontSize: '10px', fontWeight: 800 }}>✓</span>}
              </div>
              <span style={{ fontSize: '9px', fontWeight: done ? 700 : 500, color: done ? INK : FAINT, textAlign: 'center' }}>{step}</span>
            </div>
            {i < 3 && <div style={{ flex: 1, height: 2, background: i < reached ? ESPRESSO : '#ECE6DF', marginBottom: 18, borderRadius: 2 }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="hidden lg:flex items-center justify-center self-start transition-all active:scale-90"
      style={{ width: 36, height: 36, borderRadius: '50%', background: '#F4F1ED', border: 'none', cursor: 'pointer' }}>
      <ArrowLeft size={18} color={INK} />
    </button>
  );
}

// ─── Component ───────────────────────────────────────────────
interface OrdersSectionProps {
  activeSection: ActiveSection;
  setActiveSection: (s: ActiveSection) => void;
  selectedOrder: Order | null;
  setSelectedOrder: (o: Order | null) => void;
  selectedItemIdx: number;
  setSelectedItemIdx: (i: number) => void;
  onRequestReturn: () => void;
}

export default function OrdersSection({
  activeSection, setActiveSection, selectedOrder, setSelectedOrder,
  selectedItemIdx, setSelectedItemIdx, onRequestReturn,
}: OrdersSectionProps) {
  const [orderFilter, setOrderFilter] = useState<'All' | OrderStatus>('All');
  const { orders, loading, error } = useCustomerOrders();
  const filtered = orderFilter === 'All' ? orders : orders.filter((o) => o.status === orderFilter);

  const paymentLabel = (o: Order) => {
    if (o.refundStatus === 'refunded') return { label: 'Refunded', ...statusColors['Refused'] };
    if (o.refundStatus === 'partial') return { label: 'Partially refunded', ...statusColors['Refused'] };
    if (o.paymentStatus === 'paid') return { label: 'Paid', ...statusColors['Delivered'] };
    return { label: 'Unpaid', ...statusColors['Pending'] };
  };

  // ═══════════════ ITEM DETAIL ═══════════════
  if (activeSection === 'order-item-detail' && selectedOrder) {
    const order = selectedOrder;
    const item = order.items[selectedItemIdx] || order.items[0];
    if (!item) { setActiveSection('order-detail'); return null; }
    const t = item.productType;
    const isBespoke = t === 'bespoke';
    const isCustom = t === 'custom';
    const isFabric = t === 'fabric';
    const hasTailoring = isCustom || isBespoke;

    // Real payment breakdown from the frozen snapshot; else just the item total.
    const p = item.pricing;
    const rows: [string, string][] = p
      ? ([
          p.base ? ['Base', ngn(p.base)] : null,
          p.variant_total ? ['Item', ngn(p.variant_total)] : null,
          p.fabric_total ? ['Fabric', ngn(p.fabric_total)] : null,
          p.styles_total ? ['Styles', ngn(p.styles_total)] : null,
          p.accessories_total ? ['Accessories', ngn(p.accessories_total)] : null,
          p.addons_total ? ['Add-ons', ngn(p.addons_total)] : null,
          p.discount ? ['Discount', `-${ngn(p.discount)}`] : null,
        ].filter(Boolean) as [string, string][])
      : [['Item total', ngn(item.price)]];

    return (
      <div className="animate-fade-in flex flex-col" style={{ gap: '16px' }}>
        <BackBtn onClick={() => setActiveSection('order-detail')} />

        {/* Hero */}
        <div style={cardStyle}>
          <div className="flex" style={{ padding: '16px', gap: '14px' }}>
            <Thumb src={item.image} alt={item.name} w={108} h={128} icon={24} />
            <div className="flex-1 min-w-0 flex flex-col" style={{ gap: '8px' }}>
              <div className="flex items-start justify-between" style={{ gap: '10px' }}>
                <span className="min-w-0" style={{ fontSize: '16px', fontWeight: 700, color: INK, lineHeight: 1.25 }}>{item.name}</span>
                <StatusPill status={order.status} />
              </div>
              <div className="flex items-center flex-wrap" style={{ gap: '6px' }}>
                <TypePill type={t} />
                {isBespoke && order.bespoke?.category && <Chip>{order.bespoke.category}</Chip>}
                {isBespoke && order.bespoke?.gender && <Chip>{order.bespoke.gender}</Chip>}
              </div>
              <div className="flex items-center flex-wrap" style={{ gap: '18px', marginTop: 'auto' }}>
                {item.size !== '—' && (
                  <div className="flex flex-col" style={{ gap: '2px' }}>
                    <span style={{ fontSize: '10px', color: FAINT }}>{isFabric ? 'Length' : 'Size'}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: INK }}>{item.size}</span>
                  </div>
                )}
                <div className="flex flex-col" style={{ gap: '2px' }}>
                  <span style={{ fontSize: '10px', color: FAINT }}>Qty</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: INK }}>{item.qty}</span>
                </div>
                <div className="flex flex-col" style={{ gap: '2px', marginLeft: 'auto' }}>
                  <span style={{ fontSize: '10px', color: FAINT }}>Price</span>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: INK }}>{ngn(item.price)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <Section title="Order Progress">
          <Progress status={order.status} />
          {(order.tracking || order.courier) && (
            <div className="flex items-center justify-between" style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '10px', gap: '12px' }}>
              <span style={{ fontSize: '11px', color: MUTE }}>{order.courier || 'Courier'}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: BROWN, fontFamily: 'monospace', wordBreak: 'break-all', textAlign: 'right' }}>{order.tracking || 'Pending'}</span>
            </div>
          )}
        </Section>

        {/* Two columns */}
        <div className="flex flex-col lg:flex-row" style={{ gap: '16px' }}>
          <div className="flex-1 flex flex-col min-w-0" style={{ gap: '16px' }}>
            {/* Bespoke design details */}
            {isBespoke && order.bespoke && (order.bespoke.images.length > 0 || order.bespoke.referenceImages.length > 0 || order.bespoke.description) && (
              <Section title="Design Details">
                {order.bespoke.description && (
                  <p style={{ fontSize: '12px', color: MUTE, lineHeight: 1.6 }}>{order.bespoke.description}</p>
                )}
                {([['Design', order.bespoke.images], ['References', order.bespoke.referenceImages]] as const)
                  .filter(([, imgs]) => imgs.length > 0)
                  .map(([label, imgs]) => (
                    <div key={label} className="flex flex-col" style={{ gap: '6px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: FAINT, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                      <div className="flex flex-wrap" style={{ gap: '8px' }}>
                        {imgs.map((img, i) => <Thumb key={i} src={img} alt={`${label} ${i + 1}`} w={66} h={82} radius={10} />)}
                      </div>
                    </div>
                  ))}
              </Section>
            )}

            {/* Measurements (tailoring) */}
            {hasTailoring && (
              <Section title="Measurements">
                <div className="flex items-center" style={{ gap: '10px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: ESPRESSO, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Ruler size={16} color="#FFF" />
                  </div>
                  <span style={{ fontSize: '11px', color: MUTE, lineHeight: 1.5 }}>The measurements saved to your profile are used to tailor this order.</span>
                </div>
                <button onClick={() => setActiveSection('measurements')} className="w-full transition-all hover:opacity-90"
                  style={{ padding: '10px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '10px', background: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: INK, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  View Measurements
                </button>
              </Section>
            )}

            {/* Fabric detail */}
            {isFabric && (
              <Section title="Fabric">
                <div className="flex items-start" style={{ gap: '12px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: item.fabric, flexShrink: 0, border: '1px solid rgba(0,0,0,0.06)' }} />
                  <div className="flex flex-col" style={{ gap: '2px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: INK }}>{item.size}</span>
                    <span style={{ fontSize: '10px', color: FAINT }}>Includes cutting allowance</span>
                  </div>
                </div>
              </Section>
            )}

            {/* Vendor */}
            {item.vendor && (
              <Section>
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0" style={{ gap: '10px' }}>
                    <div className="overflow-hidden flex items-center justify-center flex-shrink-0" style={{ width: 34, height: 34, borderRadius: '50%', background: '#F4F1ED' }}>
                      {item.vendorLogo
                        ? <Image src={item.vendorLogo} alt={item.vendor} width={34} height={34} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                        : <Store size={15} color={MUTE} />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span style={{ fontSize: '12px', fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.vendor}</span>
                      <span style={{ fontSize: '10px', color: FAINT }}>Vendor</span>
                    </div>
                  </div>
                  <button className="flex items-center transition-all hover:opacity-80 flex-shrink-0"
                    style={{ gap: '6px', padding: '7px 14px', borderRadius: '100px', border: '1px solid rgba(0,0,0,0.1)', background: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: INK }}>
                    <MessageCircle size={13} /> Message
                  </button>
                </div>
              </Section>
            )}
          </div>

          <div className="flex-1 flex flex-col min-w-0" style={{ gap: '16px' }}>
            <Section title="Payment">
              {rows.map(([l, v]) => <KV key={l} label={l} value={v} />)}
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '8px' }}>
                <KV label="Total" value={ngn(item.price)} strong />
              </div>
            </Section>

            <Section title="Support">
              <button className="w-full transition-all hover:opacity-90"
                style={{ padding: '10px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '10px', background: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: INK, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Report an Issue
              </button>
              {!hasTailoring && order.status !== 'Refused' && (
                <button onClick={onRequestReturn} className="w-full transition-all hover:opacity-90"
                  style={{ padding: '10px', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', background: 'rgba(239,68,68,0.04)', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Request Return
                </button>
              )}
            </Section>
          </div>
        </div>

        {/* Track button */}
        <button onClick={() => setActiveSection('track-order')}
          className="flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.99]"
          style={{ gap: '8px', padding: '14px', borderRadius: '14px', background: ESPRESSO, color: '#FFF', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', border: 'none', cursor: 'pointer' }}>
          <Truck size={16} /> Track Order
        </button>
      </div>
    );
  }

  // ═══════════════ ORDER DETAIL ═══════════════
  if (activeSection === 'order-detail' && selectedOrder) {
    const order = selectedOrder;
    const pay = paymentLabel(order);
    return (
      <div className="animate-fade-in flex flex-col" style={{ gap: '16px' }}>
        <BackBtn onClick={() => setActiveSection('orders')} />

        {/* Summary header */}
        <div style={cardStyle}>
          <div className="flex flex-col" style={{ padding: '18px', gap: '14px' }}>
            <div className="flex items-start justify-between" style={{ gap: '12px' }}>
              <div className="flex flex-col min-w-0" style={{ gap: '3px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.orderNumber}</span>
                <span style={{ fontSize: '12px', color: MUTE }}>Placed {order.date}</span>
              </div>
              <StatusPill status={order.status} big />
            </div>
            <div className="flex items-center justify-between" style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '12px' }}>
              <div className="flex items-center" style={{ gap: '6px' }}>
                <ShoppingBag size={14} color={MUTE} />
                <span style={{ fontSize: '12px', color: MUTE }}>{order.items.length} item{order.items.length === 1 ? '' : 's'}</span>
              </div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: INK }}>{ngn(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Items */}
        <span style={{ fontSize: '11px', fontWeight: 800, color: INK, textTransform: 'uppercase', letterSpacing: '0.08em', paddingLeft: '2px' }}>Items</span>
        {order.items.map((item, i) => (
          <button key={i} onClick={() => { setSelectedItemIdx(i); setActiveSection('order-item-detail'); }}
            className="w-full text-left transition-all hover:opacity-95 active:scale-[0.995]" style={{ ...cardStyle, cursor: 'pointer' }}>
            <div className="flex items-center" style={{ padding: '14px', gap: '14px' }}>
              <Thumb src={item.image} alt={item.name} w={58} h={70} />
              <div className="flex-1 min-w-0 flex flex-col" style={{ gap: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                <div className="flex items-center flex-wrap" style={{ gap: '6px' }}>
                  <TypePill type={item.productType} />
                  {item.size !== '—' && <span style={{ fontSize: '11px', color: MUTE }}>· {item.size}</span>}
                  <span style={{ fontSize: '11px', color: MUTE }}>· Qty {item.qty}</span>
                </div>
              </div>
              <div className="flex items-center flex-shrink-0" style={{ gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: INK }}>{ngn(item.price)}</span>
                <ChevronRight size={16} color="#CBBFB2" />
              </div>
            </div>
          </button>
        ))}

        {/* Payment */}
        <Section title="Payment" right={<span style={{ fontSize: '10px', fontWeight: 800, color: pay.text, background: pay.bg, padding: '3px 10px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{pay.label}</span>}>
          <KV label="Items total" value={ngn(order.subtotal ?? order.total)} />
          <KV label="Delivery fees" value={ngn(order.shippingFee ?? 0)} />
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '8px' }}>
            <KV label="Total" value={ngn(order.total)} strong />
          </div>
        </Section>

        <Section title="Support">
          <button className="w-full transition-all hover:opacity-90"
            style={{ padding: '10px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '10px', background: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: INK, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Report an Issue
          </button>
        </Section>
      </div>
    );
  }

  // ═══════════════ ORDERS LIST ═══════════════
  return (
    <div className="animate-fade-in flex flex-col" style={{ gap: '16px' }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ paddingLeft: '2px' }}>
        <div className="flex items-center" style={{ gap: '10px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: INK, textTransform: 'uppercase', letterSpacing: '0.04em' }}>My Orders</h3>
          {!loading && !error && (
            <span style={{ fontSize: '11px', fontWeight: 800, color: BROWN, background: 'rgba(70,40,20,0.08)', padding: '3px 9px', borderRadius: '100px' }}>{filtered.length}</span>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex items-center" style={{ gap: '8px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
        {(['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Refused'] as const).map((f) => {
          const active = f === orderFilter;
          return (
            <button key={f} onClick={() => setOrderFilter(f)}
              className="transition-all active:scale-95"
              style={{ flex: 'none', padding: '7px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                background: active ? ESPRESSO : '#FFF', color: active ? '#FFF' : MUTE,
                border: active ? 'none' : '1px solid rgba(0,0,0,0.08)' }}>
              {f}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="flex items-center justify-center" style={{ padding: '48px 0', gap: '10px' }}>
          <Loader2 size={20} color={BROWN} className="animate-spin" />
          <span style={{ fontSize: '13px', color: MUTE }}>Loading your orders…</span>
        </div>
      )}

      {!loading && error && (
        <div style={{ ...cardStyle, padding: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#EF4444', fontWeight: 600 }}>{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div style={{ ...cardStyle, padding: '52px 28px', textAlign: 'center' }}>
          <div className="flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: '50%', background: '#F4F1ED', margin: '0 auto 14px' }}>
            <Package size={24} color="#C9BEB2" />
          </div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: INK, marginBottom: '4px' }}>
            {orderFilter === 'All' ? 'No orders yet' : `No ${orderFilter.toLowerCase()} orders`}
          </p>
          <p style={{ fontSize: '12px', color: MUTE }}>
            {orderFilter === 'All' ? 'Your orders will appear here once you make a purchase.' : 'Try a different filter.'}
          </p>
        </div>
      )}

      {!loading && !error && filtered.map((order) => {
        const first = order.items[0];
        const cover = order.images[0] || first?.image;
        const more = order.items.length - 1;
        return (
          <button key={order.id} onClick={() => { setSelectedOrder(order); setActiveSection('order-detail'); }}
            className="w-full text-left transition-all hover:opacity-95 active:scale-[0.995]" style={{ ...cardStyle, cursor: 'pointer' }}>
            <div className="flex items-center" style={{ padding: '14px', gap: '14px' }}>
              <Thumb src={cover} alt={first?.name || 'Order'} w={60} h={72} />
              <div className="flex-1 min-w-0 flex flex-col" style={{ gap: '6px' }}>
                <div className="flex items-center" style={{ gap: '8px', minWidth: 0 }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{first?.name || 'Order'}</span>
                  {more > 0 && <span style={{ fontSize: '11px', color: FAINT, flexShrink: 0 }}>+{more}</span>}
                </div>
                <div className="flex items-center" style={{ gap: '8px', minWidth: 0 }}>
                  <StatusPill status={order.status} />
                  <span style={{ fontSize: '11px', color: MUTE, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.orderNumber} · {order.date}</span>
                </div>
              </div>
              <div className="flex flex-col items-end flex-shrink-0" style={{ gap: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: INK }}>{ngn(order.total)}</span>
                <ChevronRight size={16} color="#CBBFB2" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
