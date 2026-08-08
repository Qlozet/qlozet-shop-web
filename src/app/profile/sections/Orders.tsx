'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Package, ChevronRight, ChevronDown, ArrowLeft, MessageCircle, Ruler, Truck, RotateCcw, Loader2 } from 'lucide-react';
import { cardStyle, statusColors } from '../styles';
import { useCustomerOrders } from '../useCustomerOrders';
import type { ActiveSection, Order, OrderStatus, ProductType } from '../types';

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
  activeSection, setActiveSection, selectedOrder, setSelectedOrder, selectedItemIdx, setSelectedItemIdx, onRequestReturn,
}: OrdersSectionProps) {
  const [orderFilter, setOrderFilter] = useState<'All' | OrderStatus>('All');
  const [showFilterDrop, setShowFilterDrop] = useState(false);

  // Real orders for the logged-in customer.
  const { orders, loading: ordersLoading, error: ordersError } = useCustomerOrders();
  const filteredOrders = orderFilter === 'All' ? orders : orders.filter(o => o.status === orderFilter);

  // ─── Order Item Detail ───
  if (activeSection === 'order-item-detail') {
    const order = selectedOrder;
    if (!order) return <OrdersSection activeSection="orders" setActiveSection={setActiveSection} selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder} selectedItemIdx={selectedItemIdx} setSelectedItemIdx={setSelectedItemIdx} onRequestReturn={onRequestReturn} />;
    const item = order.items[selectedItemIdx] || order.items[0];
    const t = item.productType;
    const isCustom = t === 'custom';
    const isBespoke = t === 'bespoke';
    const isRTW = t === 'ready-to-wear';
    const isFabric = t === 'fabric';
    const isAccessory = t === 'accessories';
    const hasTailoring = isCustom || isBespoke;

    const typeLabel: Record<ProductType, string> = {
      'custom': 'Custom Tailoring', 'ready-to-wear': 'Ready to Wear', 'fabric': 'Fabric Order', 'accessories': 'Accessories', 'bespoke': 'Bespoke Outfit',
    };
    const typeBadgeColors: Record<ProductType, { bg: string; text: string }> = {
      'custom': { bg: 'rgba(249,115,22,0.1)', text: '#F97316' }, 'ready-to-wear': { bg: 'rgba(34,197,94,0.1)', text: '#22C55E' },
      'fabric': { bg: 'rgba(139,69,19,0.1)', text: '#8B4513' }, 'accessories': { bg: 'rgba(212,175,55,0.1)', text: '#B8941F' }, 'bespoke': { bg: 'rgba(99,102,241,0.1)', text: '#6366F1' },
    };
    // Payment breakdown from the REAL frozen pricing snapshot; if an order
    // predates the snapshot, show only the real item total — never fabricated lines.
    const ngn = (n: number) => `₦${Math.round(n).toLocaleString()}`;
    const p = item.pricing;
    const realBreakdown: [string, string][] | null = p
      ? ([
          p.base ? ['Base', ngn(p.base)] : null,
          p.variant_total ? ['Item', ngn(p.variant_total)] : null,
          p.fabric_total ? ['Fabric', ngn(p.fabric_total)] : null,
          p.styles_total ? ['Styles', ngn(p.styles_total)] : null,
          p.accessories_total ? ['Accessories', ngn(p.accessories_total)] : null,
          p.addons_total ? ['Add-ons', ngn(p.addons_total)] : null,
          p.discount ? ['Discount', `-${ngn(p.discount)}`] : null,
        ].filter(Boolean) as [string, string][])
      : null;
    const breakdownRows: [string, string][] =
      realBreakdown && realBreakdown.length > 0
        ? realBreakdown
        : [['Item total', ngn(item.price)]];

    return (
      <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
        <button onClick={() => setActiveSection('order-detail')} className="hidden lg:flex items-center justify-center self-start transition-all active:scale-90" style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={20} color="#1A1A1A" />
        </button>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Order {order.orderNumber}</h3>
        <span style={{ fontSize: '10px', fontWeight: 700, color: typeBadgeColors[t].text, background: typeBadgeColors[t].bg, padding: '4px 12px', borderRadius: '6px', alignSelf: 'flex-start', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{typeLabel[t]}</span>

        {(isRTW || hasTailoring) && (
          <div style={cardStyle}>
            <div className="flex flex-col" style={{ padding: '20px', gap: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Order Progress</span>
              <div className="flex items-center" style={{ gap: '0' }}>
                {(() => {
                  // Furthest step reached, from the real order status.
                  // Steps: 0 Ordered · 1 Processing · 2 Shipped · 3 Delivered.
                  const reachedIdx =
                    order.status === 'Delivered' ? 3 :
                    order.status === 'Shipped' ? 2 :
                    order.status === 'Processing' ? 1 :
                    0;
                  return ['Ordered', 'Processing', 'Shipped', 'Delivered'].map((step, si) => {
                    const done = si <= reachedIdx;
                    return (
                      <React.Fragment key={step}>
                        <div className="flex flex-col items-center" style={{ gap: '4px', flex: 1 }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: done ? '#22C55E' : '#E5E5E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {done && <span style={{ color: '#FFF', fontSize: '10px', fontWeight: 800 }}>✓</span>}
                          </div>
                          <span style={{ fontSize: '9px', fontWeight: done ? 700 : 500, color: done ? '#1A1A1A' : '#BBB', textAlign: 'center' }}>{step}</span>
                        </div>
                        {si < 3 && <div style={{ flex: 1, height: '2px', background: si < reachedIdx ? '#22C55E' : '#E5E5E5', marginBottom: '18px' }} />}
                      </React.Fragment>
                    );
                  });
                })()}
              </div>
              <div className="flex items-center justify-between" style={{ borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '10px' }}>
                <span style={{ fontSize: '11px', color: '#999' }}>Tracking ID:</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#462814' }}>{order.tracking || 'Pending'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Product Card */}
        <div style={cardStyle}>
          <div className="flex" style={{ padding: '16px', gap: '14px' }}>
            <div className="flex-shrink-0 overflow-hidden" style={{ width: '104px', height: '124px', borderRadius: '12px', background: '#F5F5F5' }}>
              {item.image ? (
                <Image src={item.image} alt={item.name} width={104} height={124} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Package size={22} color="#CCC" /></div>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col" style={{ gap: '12px' }}>
              <div className="flex items-start justify-between" style={{ gap: '10px' }}>
                <span className="min-w-0" style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A' }}>{item.name}</span>
                <span className="flex-shrink-0" style={{ fontSize: '9px', fontWeight: 700, color: statusColors[order.status].text, background: statusColors[order.status].bg, padding: '3px 10px', borderRadius: '4px', textTransform: 'uppercase' }}>{order.status}</span>
              </div>

              {isBespoke && order.bespoke?.description && (
                <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.6 }}>{order.bespoke.description}</p>
              )}
              {isBespoke && (order.bespoke?.category || order.bespoke?.gender) && (
                <div className="flex flex-wrap" style={{ gap: '6px' }}>
                  {[order.bespoke?.category, order.bespoke?.gender].filter(Boolean).map((c) => (
                    <span key={c as string} style={{ fontSize: '10px', fontWeight: 600, color: '#666', background: '#F5F5F5', padding: '4px 10px', borderRadius: '6px', textTransform: 'capitalize' }}>{c}</span>
                  ))}
                </div>
              )}

              {isRTW && (
                <div className="flex items-center flex-wrap" style={{ gap: '16px' }}>
                  <div className="flex flex-col" style={{ gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#AAA' }}>Color</span>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: item.fabric, border: '1px solid rgba(0,0,0,0.08)' }} />
                  </div>
                  <div className="flex flex-col" style={{ gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#AAA' }}>Size</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A', padding: '4px 10px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px' }}>{item.size}</span>
                  </div>
                  <div className="flex flex-col" style={{ gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#AAA' }}>Qty</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A' }}>{item.qty}</span>
                  </div>
                </div>
              )}

              {isFabric && (
                <div className="flex flex-col" style={{ gap: '6px' }}>
                  <div className="flex items-center" style={{ gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: item.fabric, border: '1px solid rgba(0,0,0,0.08)' }} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A' }}>{item.size}</span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#AAA' }}>Premium hand-woven • Includes shrinkage allowance</span>
                </div>
              )}

              {isAccessory && (
                <div className="flex items-center flex-wrap" style={{ gap: '12px' }}>
                  <div className="flex flex-col" style={{ gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#AAA' }}>Material</span>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: item.fabric, border: '1px solid rgba(0,0,0,0.08)' }} />
                  </div>
                  <div className="flex flex-col" style={{ gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#AAA' }}>Size</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A' }}>{item.size}</span>
                  </div>
                  <div className="flex flex-col" style={{ gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#AAA' }}>Qty</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A' }}>{item.qty}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {item.vendor && (
          <div style={cardStyle}>
            <div className="flex items-center justify-between" style={{ padding: '14px 20px' }}>
              <div className="flex items-center" style={{ gap: '10px' }}>
                <div className="overflow-hidden flex items-center justify-center" style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F5F5F5', flexShrink: 0 }}>
                  {(item.vendorLogo || item.image) ? (
                    <Image src={item.vendorLogo || item.image} alt={item.vendor || ''} width={32} height={32} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                  ) : (
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#999' }}>{(item.vendor || 'V').charAt(0)}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A', textTransform: 'uppercase' }}>{item.vendor}</span>
                  <span style={{ fontSize: '10px', color: '#999' }}>Vendor</span>
                </div>
              </div>
              <button className="flex items-center transition-all hover:opacity-80" style={{ gap: '6px', padding: '6px 14px', borderRadius: '100px', border: '1px solid rgba(0,0,0,0.1)', background: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#1A1A1A' }}>
                <MessageCircle size={12} /> Chat <ChevronRight size={12} color="#CCC" />
              </button>
            </div>
          </div>
        )}

        {/* Track Order / Track Return Buttons */}
        <div className="flex flex-col lg:flex-row" style={{ gap: '10px' }}>
          <button
            onClick={() => setActiveSection('track-order')}
            className="flex-1 flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ gap: '8px', padding: '14px 20px', borderRadius: '12px', background: '#2C1810', color: '#FFF', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', border: 'none', cursor: 'pointer' }}
          >
            <Truck size={16} /> Track Order
          </button>
          {!hasTailoring && (
            <button
              onClick={() => setActiveSection('track-return')}
              className="flex-1 flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ gap: '8px', padding: '14px 20px', borderRadius: '12px', background: 'none', color: '#1A1A1A', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }}
            >
              <RotateCcw size={16} /> Track Return
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row" style={{ gap: '16px' }}>
          <div className="flex-1 flex flex-col" style={{ gap: '16px' }}>
            {isBespoke && order.bespoke && (order.bespoke.images.length > 0 || order.bespoke.referenceImages.length > 0) && (
              <div style={cardStyle}>
                <div className="flex flex-col" style={{ padding: '16px 20px', gap: '14px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Design Details</span>
                  {order.bespoke.description && (
                    <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.6 }}>{order.bespoke.description}</p>
                  )}
                  {([['Design', order.bespoke.images], ['References', order.bespoke.referenceImages]] as const)
                    .filter(([, imgs]) => imgs.length > 0)
                    .map(([label, imgs]) => (
                      <div key={label} className="flex flex-col" style={{ gap: '6px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#AAA', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                        <div className="flex flex-wrap" style={{ gap: '8px' }}>
                          {imgs.map((img, i) => (
                            <div key={i} className="overflow-hidden" style={{ width: '68px', height: '84px', borderRadius: '8px', background: '#F5F5F5', flexShrink: 0 }}>
                              <Image src={img} alt={`${label} ${i + 1}`} width={68} height={84} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
            {isFabric && (
              <div style={cardStyle}>
                <div className="flex flex-col" style={{ padding: '16px 20px', gap: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Fabric</span>
                  <div className="flex items-start" style={{ gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: item.fabric, flexShrink: 0, border: '1px solid rgba(0,0,0,0.06)' }} />
                    <div className="flex flex-col" style={{ gap: '2px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>{item.size}</span>
                      <span style={{ fontSize: '10px', color: '#AAA', lineHeight: 1.4 }}>Includes cutting allowance</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between" style={{ borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#999' }}>Status:</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: order.status === 'Delivered' ? '#22C55E' : '#F97316' }}>{order.status}</span>
                  </div>
                </div>
              </div>
            )}

            {hasTailoring && (
              <div style={cardStyle}>
                <div className="flex flex-col" style={{ padding: '16px 20px', gap: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Measurements</span>
                  <div className="flex items-center" style={{ gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#462814', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Ruler size={16} color="#FFF" />
                    </div>
                    <span style={{ fontSize: '11px', color: '#888', lineHeight: 1.5 }}>The measurements saved to your profile are used to tailor this order.</span>
                  </div>
                  <button onClick={() => setActiveSection('measurements')} className="w-full transition-all hover:opacity-90" style={{ padding: '10px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', background: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>View Measurements</button>
                </div>
              </div>
            )}

            {isRTW && (
              <div style={cardStyle}>
                <div className="flex flex-col" style={{ padding: '16px 20px', gap: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Delivery Information</span>
                  {[['Carrier:', order.courier || 'To be assigned'], ['Tracking:', order.tracking || 'Pending']].map(([l, v]) => (
                    <div key={l} className="flex items-center justify-between">
                      <span style={{ fontSize: '11px', color: '#999' }}>{l}</span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#1A1A1A' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          <div className="flex-1 flex flex-col" style={{ gap: '16px' }}>
            <div style={cardStyle}>
              <div className="flex flex-col" style={{ padding: '16px 20px', gap: '8px' }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase' }}>Payment</span>
                  <MessageCircle size={14} color="#999" />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#888' }}>Summary</span>
                {breakdownRows.map(([l, v]) => (
                  <div key={l} className="flex items-center justify-between">
                    <span style={{ fontSize: '11px', color: '#888' }}>{l}</span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#1A1A1A' }}>{v}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#1A1A1A' }}>TOTAL:</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#1A1A1A' }}>₦{item.price.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <div className="flex flex-col" style={{ padding: '16px 20px', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase' }}>Support</span>
                <button className="w-full transition-all hover:opacity-90" style={{ padding: '10px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', background: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Report an Issue</button>
                {hasTailoring ? (
                  <button className="w-full" style={{ padding: '10px', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '8px', background: '#FAFAFA', cursor: 'default', fontSize: '11px', fontWeight: 600, color: '#BBB', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cancellation Locked</button>
                ) : (
                  <button onClick={onRequestReturn} className="w-full transition-all hover:opacity-90" style={{ padding: '10px', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', background: 'rgba(239,68,68,0.04)', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Request Return</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Order Detail ───
  if (activeSection === 'order-detail') {
    const order = selectedOrder;
    if (!order) return <OrdersSection activeSection="orders" setActiveSection={setActiveSection} selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder} selectedItemIdx={selectedItemIdx} setSelectedItemIdx={setSelectedItemIdx} onRequestReturn={onRequestReturn} />;
    return (
      <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
        <button onClick={() => setActiveSection('orders')} className="hidden lg:flex items-center justify-center self-start transition-all active:scale-90" style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={20} color="#1A1A1A" />
        </button>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Order {order.orderNumber}</h3>

        <div style={cardStyle}>
          <div className="flex flex-col" style={{ padding: '20px', gap: '10px' }}>
            {[['Order:', order.orderNumber], ['Placed on:', order.date], ['No of Items:', String(order.items.length)]].map(([label, val]) => (
              <div key={label} className="flex items-center justify-between">
                <span style={{ fontSize: '12px', color: '#999' }}>{label}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A' }}>{val}</span>
              </div>
            ))}
            <div className="flex items-center justify-between" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '10px', marginTop: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase' }}>Total Cost:</span>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#1A1A1A' }}>₦{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Order Items({order.items.length})</h4>

        {order.items.map((item, i) => (
          <div key={i} style={cardStyle}>
            <div className="flex items-start" style={{ padding: '16px', gap: '14px' }}>
              <div className="flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ width: '60px', height: '72px', borderRadius: '10px', background: '#F5F5F5' }}>
                {item.image ? (
                  <Image src={item.image} alt={item.name} width={60} height={72} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                ) : (
                  <Package size={18} color="#CCC" />
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col" style={{ gap: '8px' }}>
                <div className="flex items-start justify-between">
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>{item.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedItemIdx(i); setActiveSection('order-item-detail'); }} style={{ fontSize: '10px', fontWeight: 600, color: '#462814', cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: '8px', background: 'none', border: 'none', padding: 0 }}>See details &gt;</button>
                </div>
                <div className="flex items-center flex-wrap" style={{ gap: '16px' }}>
                  {item.size !== '—' && (
                    <div className="flex flex-col" style={{ gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: '#AAA' }}>Size</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A', padding: '4px 10px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px' }}>{item.size}</span>
                    </div>
                  )}
                  <div className="flex flex-col" style={{ gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#AAA' }}>Qty</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A' }}>{item.qty}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between" style={{ marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#AAA' }}>{item.qty} Item{item.qty === 1 ? '' : 's'}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>₦{item.price.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {(() => {
          const refunded = order.refundStatus === 'refunded';
          const partial = order.refundStatus === 'partial';
          const paid = order.paymentStatus === 'paid';
          const label = refunded ? 'Refunded' : partial ? 'Partially refunded' : paid ? 'Paid' : 'Unpaid';
          const colors = refunded || partial
            ? { bg: 'rgba(239,68,68,0.08)', text: '#EF4444' }
            : paid
              ? { bg: 'rgba(34,197,94,0.1)', text: '#22C55E' }
              : { bg: 'rgba(249,115,22,0.1)', text: '#F97316' };
          return (
            <div style={cardStyle}>
              <div className="flex items-center justify-between" style={{ padding: '16px 20px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase' }}>Payment Status</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: colors.text, background: colors.bg, padding: '4px 12px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
              </div>
            </div>
          );
        })()}

        <div style={cardStyle}>
          <div className="flex flex-col" style={{ padding: '16px 20px', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase' }}>Payment Details</span>
            {[
              ['Items total:', `₦${(order.subtotal ?? order.total).toLocaleString()}`],
              ['Delivery fees:', `₦${(order.shippingFee ?? 0).toLocaleString()}`],
            ].map(([label, val]) => (
              <div key={label} className="flex items-center justify-between">
                <span style={{ fontSize: '12px', color: '#888' }}>{label}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A' }}>{val}</span>
              </div>
            ))}
            <div className="flex items-center justify-between" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A' }}>TOTAL:</span>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#1A1A1A' }}>₦{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div className="flex flex-col" style={{ padding: '16px 20px', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase' }}>Support</span>
            <button className="w-full transition-all hover:opacity-90" style={{ padding: '10px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', background: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Report an Issue</button>
            <button className="w-full" style={{ padding: '10px', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '8px', background: '#FAFAFA', cursor: 'default', fontSize: '11px', fontWeight: 600, color: '#BBB', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cancellation Locked</button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Orders List ───
  return (
    <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
      <div style={{ ...cardStyle, padding: '28px' }}>
        <Package size={28} color="#462814" strokeWidth={1.5} />
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '12px' }}>My Orders</h3>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative">
          <button onClick={() => setShowFilterDrop(!showFilterDrop)} className="flex items-center transition-all hover:opacity-80" style={{ gap: '6px', padding: '8px 16px', background: 'none', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>
            {orderFilter} <ChevronDown size={14} color="#999" />
          </button>
          {showFilterDrop && (
            <div className="absolute top-full left-0" style={{ marginTop: '4px', zIndex: 10, background: '#FFF', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', overflow: 'hidden', minWidth: '140px' }}>
              {(['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Refused'] as const).map((f) => (
                <button key={f} onClick={() => { setOrderFilter(f); setShowFilterDrop(false); }} className="w-full text-left hover:bg-gray-50 transition-colors" style={{ padding: '10px 16px', fontSize: '13px', fontWeight: f === orderFilter ? 700 : 500, color: f === orderFilter ? '#462814' : '#666', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#999' }}>{filteredOrders.length} Items</span>
      </div>

      {ordersLoading && (
        <div className="flex items-center justify-center" style={{ padding: '48px 0', gap: '10px' }}>
          <Loader2 size={20} color="#462814" className="animate-spin" />
          <span style={{ fontSize: '13px', color: '#999' }}>Loading your orders…</span>
        </div>
      )}

      {!ordersLoading && ordersError && (
        <div style={{ ...cardStyle, padding: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#EF4444', fontWeight: 600 }}>{ordersError}</p>
        </div>
      )}

      {!ordersLoading && !ordersError && filteredOrders.length === 0 && (
        <div style={{ ...cardStyle, padding: '48px 28px', textAlign: 'center' }}>
          <Package size={28} color="#CCC" strokeWidth={1.5} style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', marginBottom: '4px' }}>
            {orderFilter === 'All' ? 'No orders yet' : `No ${orderFilter.toLowerCase()} orders`}
          </p>
          <p style={{ fontSize: '12px', color: '#999' }}>
            {orderFilter === 'All' ? 'Your orders will appear here once you make a purchase.' : 'Try a different filter.'}
          </p>
        </div>
      )}

      {!ordersLoading && !ordersError && filteredOrders.map((order) => (
        <button key={order.id} onClick={() => { setSelectedOrder(order); setActiveSection('order-detail'); }} className="w-full flex items-center justify-between hover:bg-gray-50/50 transition-colors" style={{ ...cardStyle, padding: '18px 20px', cursor: 'pointer', textAlign: 'left', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex flex-col" style={{ gap: '8px', flex: 1, minWidth: 0 }}>
            <div className="flex flex-wrap items-center" style={{ gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>{order.orderNumber}</span>
              <span style={{ fontSize: '11px', color: '#AAA' }}>Order Date:</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#666' }}>{order.date}</span>
              <span style={{ fontSize: '11px', color: '#AAA' }}>Total:</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#666' }}>₦{order.total.toLocaleString()}</span>
            </div>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: statusColors[order.status].text, background: statusColors[order.status].bg, padding: '3px 10px', borderRadius: '4px', alignSelf: 'flex-start' }}>{order.status}</span>
          </div>
          <div className="flex items-center flex-shrink-0" style={{ gap: '6px', marginLeft: '16px' }}>
            {order.images.slice(0, 3).map((img, i) => (
              <div key={i} className="overflow-hidden" style={{ width: '44px', height: '52px', borderRadius: '8px', background: '#F5F5F5' }}>
                <Image src={img} alt="" width={44} height={52} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
              </div>
            ))}
            <ChevronRight size={16} color="#CCC" />
          </div>
        </button>
      ))}
    </div>
  );
}
