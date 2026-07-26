'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Package, ChevronRight, ChevronDown, ArrowLeft, Scissors, User, MessageCircle, Ruler, Truck, RotateCcw, Loader2 } from 'lucide-react';
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
    const nextStepConfig: Partial<Record<ProductType, { title: string; desc: string; cta: string }>> = {
      'custom': { title: 'Approve the vendor quote', desc: 'Your vendor is preparing a quote based on your design + measurements. Approving locks the timeline and starts production.', cta: 'Review & Approve' },
      'bespoke': { title: 'Schedule fitting appointment', desc: 'Your bespoke piece requires an in-person or virtual fitting. Book your session to confirm measurements and fabric draping.', cta: 'Book Fitting' },
    };
    const nextStep = nextStepConfig[t];
    const demoPaymentBreakdown: Record<ProductType, [string, string][]> = {
      'custom': [['Base Tailoring', '₦250,000'], ['Fabric', '₦18,500'], ['Accessories', '₦3,600'], ['Add-ons', '₦3,500'], ['Delivery fees:', '₦4,500']],
      'bespoke': [['Design & Consultation', '₦120,000'], ['Premium Fabric', '₦85,000'], ['Master Tailoring', '₦150,000'], ['Embroidery', '₦15,000'], ['Delivery fees:', '₦10,000']],
      'ready-to-wear': [['Item price', `₦${item.price.toLocaleString()}`], ['Delivery fees:', '₦3,500']],
      'fabric': [['Fabric (6 yards)', `₦${item.price.toLocaleString()}`], ['Cutting fee:', '₦1,500'], ['Delivery fees:', '₦2,000']],
      'accessories': [['Item price', `₦${item.price.toLocaleString()}`], ['Gift wrapping:', '₦500'], ['Delivery fees:', '₦1,500']],
    };
    // Prefer the real frozen pricing snapshot; fall back to the demo layout only
    // when an order predates the snapshot.
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
    const breakdownRows =
      realBreakdown && realBreakdown.length > 0 ? realBreakdown : demoPaymentBreakdown[t];

    return (
      <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
        <button onClick={() => setActiveSection('order-detail')} className="hidden lg:flex items-center justify-center self-start transition-all active:scale-90" style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={20} color="#1A1A1A" />
        </button>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Order {order.orderNumber}</h3>
        <span style={{ fontSize: '10px', fontWeight: 700, color: typeBadgeColors[t].text, background: typeBadgeColors[t].bg, padding: '4px 12px', borderRadius: '6px', alignSelf: 'flex-start', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{typeLabel[t]}</span>

        {nextStep && (
          <div style={{ background: '#FAFAF8', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.05)', padding: '20px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>Next Step</h4>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#888', marginBottom: '4px' }}>{nextStep.title}</p>
            <p style={{ fontSize: '11px', color: '#AAA', lineHeight: 1.6, marginBottom: '14px' }}>{nextStep.desc}</p>
            <button className="flex items-center transition-all hover:opacity-90 active:scale-95" style={{ gap: '8px', padding: '10px 20px', borderRadius: '8px', background: '#462814', color: '#FFF', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', border: 'none', cursor: 'pointer' }}>
              {nextStep.cta} <ChevronRight size={14} />
            </button>
          </div>
        )}

        {isRTW && (
          <div style={cardStyle}>
            <div className="flex flex-col" style={{ padding: '20px', gap: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Shipping Tracker</span>
              <div className="flex items-center" style={{ gap: '0' }}>
                {(() => {
                  // Furthest step reached, from the real order status.
                  const reachedIdx =
                    order.status === 'Delivered' ? 3 :
                    order.status === 'Shipped' ? 2 :
                    order.status === 'Refused' ? 0 : 1;
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
          <div className="flex" style={{ padding: '20px', gap: '16px' }}>
            <div className="flex-shrink-0 overflow-hidden" style={{ width: '120px', height: '140px', borderRadius: '12px', background: '#F5F5F5' }}>
              <Image src={item.image} alt={item.name} width={120} height={140} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            </div>
            <div className="flex-1 flex flex-col" style={{ gap: '12px' }}>
              <div className="flex items-start justify-between">
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A' }}>{item.name}</span>
                <span style={{ fontSize: '9px', fontWeight: 700, color: statusColors[order.status].text, background: statusColors[order.status].bg, padding: '3px 10px', borderRadius: '4px', textTransform: 'uppercase' }}>{order.status}</span>
              </div>

              {hasTailoring && (
                <div className="flex flex-col lg:flex-row" style={{ gap: '12px' }}>
                  {(isBespoke ? ['Design', 'Embroidery', 'Finishing'] : ['Styles', 'Add-ons', 'Accessories']).map((cat, ci) => (
                    <div key={cat} className="flex-1 flex flex-col" style={{ gap: '8px', padding: ci > 0 ? '12px 0 0 0' : '0', borderTop: ci > 0 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{cat}</span>
                      <div className="flex flex-wrap" style={{ gap: '4px' }}>
                        {[Package, Scissors, User, Package, Scissors, User].slice(0, ci === 2 ? 4 : 6).map((Ic, j) => (
                          <div key={j} className="flex items-center justify-center" style={{ width: '24px', height: '24px', borderRadius: '5px', background: '#F5F5F5' }}>
                            <Ic size={11} color="#888" />
                          </div>
                        ))}
                      </div>
                    </div>
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
                <div className="overflow-hidden" style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F5F5F5', flexShrink: 0 }}>
                  <Image src={item.vendorLogo || item.image} alt={item.vendor || ''} width={32} height={32} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                </div>
                <div className="flex flex-col">
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A', textTransform: 'uppercase' }}>{item.vendor}</span>
                  <div className="flex items-center" style={{ gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#D4AF37' }}>★</span>
                    <span style={{ fontSize: '10px', color: '#999' }}>{item.vendorRating}</span>
                  </div>
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
            {(isCustom || isBespoke || isFabric) && (
              <div style={cardStyle}>
                <div className="flex flex-col" style={{ padding: '16px 20px', gap: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Fabric</span>
                  <div className="flex items-start" style={{ gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: item.fabric, flexShrink: 0, border: '1px solid rgba(0,0,0,0.06)' }} />
                    <div className="flex flex-col" style={{ gap: '2px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>{isFabric ? '6 yards' : '6.25 yards'} <span style={{ fontWeight: 500, color: '#999' }}>({isFabric ? '5.49m' : '5.75m'})</span></span>
                      <span style={{ fontSize: '10px', color: '#AAA', lineHeight: 1.4 }}>Includes shrinkage & cutting allowances</span>
                    </div>
                  </div>
                  {[['Fabric Source:', isFabric ? 'Direct from weaver' : 'Marketplace - Grass Field'], ['ETA:', isFabric ? '5-7 days' : '3 days']].map(([l, v]) => (
                    <div key={l} className="flex items-center justify-between" style={{ borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#999' }}>{l}</span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#1A1A1A' }}>{v}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between" style={{ borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#999' }}>Status:</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: order.status === 'Delivered' ? '#22C55E' : '#F97316' }}>{order.status === 'Delivered' ? 'Delivered' : 'Waiting'}</span>
                  </div>
                  <button className="w-full transition-all hover:opacity-90" style={{ marginTop: '4px', padding: '10px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', background: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>View Fabric</button>
                </div>
              </div>
            )}

            {hasTailoring && (
              <div style={cardStyle}>
                <div className="flex flex-col" style={{ padding: '16px 20px', gap: '12px' }}>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Measurements</span>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#1A1A1A', background: '#F0F0F0', padding: '3px 10px', borderRadius: '4px', textTransform: 'uppercase' }}>Locked</span>
                  </div>
                  <div className="flex items-center" style={{ gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#462814', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Ruler size={16} color="#FFF" />
                    </div>
                    <div className="flex flex-col">
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A' }}>Chioma&apos;s measur...</span>
                      <span style={{ fontSize: '10px', color: '#999' }}>Updated Feb 12, 2026</span>
                    </div>
                  </div>
                  <button className="w-full transition-all hover:opacity-90" style={{ padding: '10px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', background: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>View Measurements</button>
                </div>
              </div>
            )}

            {isBespoke && (
              <div style={cardStyle}>
                <div className="flex flex-col" style={{ padding: '16px 20px', gap: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Production Timeline</span>
                  {[['Consultation', 'Completed', true], ['Fabric Sourcing', 'In Progress', false], ['Cutting & Sewing', 'Pending', false], ['Fitting', 'Pending', false], ['Final Delivery', 'Pending', false]].map(([step, status, done]) => (
                    <div key={step as string} className="flex items-center justify-between" style={{ padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                      <div className="flex items-center" style={{ gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: done ? '#22C55E' : status === 'In Progress' ? '#F97316' : '#E5E5E5' }} />
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#1A1A1A' }}>{step as string}</span>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: done ? '#22C55E' : status === 'In Progress' ? '#F97316' : '#BBB' }}>{status as string}</span>
                    </div>
                  ))}
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

            {isAccessory && (
              <div style={cardStyle}>
                <div className="flex flex-col" style={{ padding: '16px 20px', gap: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Product Specifications</span>
                  {[['Material:', 'Gold-plated brass'], ['Weight:', '12g per piece'], ['Care:', 'Avoid water contact'], ['Warranty:', '6 months']].map(([l, v]) => (
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
              <div className="flex-shrink-0 overflow-hidden" style={{ width: '60px', height: '72px', borderRadius: '10px', background: '#F5F5F5' }}>
                <Image src={item.image} alt={item.name} width={60} height={72} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
              </div>
              <div className="flex-1 min-w-0 flex flex-col" style={{ gap: '8px' }}>
                <div className="flex items-start justify-between">
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>{item.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedItemIdx(i); setActiveSection('order-item-detail'); }} style={{ fontSize: '10px', fontWeight: 600, color: '#462814', cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: '8px', background: 'none', border: 'none', padding: 0 }}>See details &gt;</button>
                </div>
                <div className="flex items-center flex-wrap" style={{ gap: '16px' }}>
                  <div className="flex flex-col" style={{ gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#AAA' }}>Fabric</span>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: item.fabric, border: '1px solid rgba(0,0,0,0.08)' }} />
                  </div>
                  <div className="flex flex-col" style={{ gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#AAA' }}>Size</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A', padding: '4px 10px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '6px' }}>{item.size}</span>
                  </div>
                  <div className="flex flex-col" style={{ gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#AAA' }}>Styles</span>
                    <div className="flex items-center" style={{ gap: '4px' }}>
                      {[Package, Scissors, User].map((Ic, j) => (
                        <div key={j} className="flex items-center justify-center" style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#F5F5F5' }}>
                          <Ic size={14} color="#888" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between" style={{ marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#AAA' }}>{item.qty} Item</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>₦{item.price.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div style={cardStyle}>
          <div className="flex items-center justify-between" style={{ padding: '16px 20px' }}>
            <div className="flex flex-col" style={{ gap: '2px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase' }}>Payment Method</span>
              <span style={{ fontSize: '12px', color: '#888' }}>Bank card</span>
            </div>
            <div className="flex items-center justify-center" style={{ width: '40px', height: '26px', borderRadius: '6px', background: 'linear-gradient(135deg, #EB001B 50%, #F79E1B 50%)', opacity: 0.8 }} />
          </div>
        </div>

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
              {(['All', 'Shipped', 'Refused', 'Delivered', 'Pending'] as const).map((f) => (
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
