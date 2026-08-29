'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowLeft, Package, ClipboardCheck, Settings, Truck, PackageCheck, Clock, Phone, RotateCcw, CheckCircle2, Box, RefreshCw, Wrench } from 'lucide-react';
import { cardStyle } from '../styles';
import type { ActiveSection, Order } from '../types';
import { useCustomerReturns, findReturnFor, RETURN_STATUS_LABELS, type CustomerReturn } from '@/hooks/useCustomerReturns';

// ─── Step definitions ────────────────────────────────────
const ORDER_STEPS = [
  { label: 'Order Placed', icon: Package, key: 'placed' },
  { label: 'Order Confirmed', icon: ClipboardCheck, key: 'confirmed' },
  { label: 'Order Processed', icon: Settings, key: 'processed' },
  { label: 'Ready to Ship', icon: Box, key: 'ready' },
  { label: 'Order shipped', icon: Truck, key: 'shipped' },
  { label: 'Delivered', icon: PackageCheck, key: 'delivered' },
];

// Mirrors the backend ReturnStatus lifecycle exactly — earlier versions showed
// fictional "adjustment" stages that don't exist.
const RETURN_STEPS = [
  { label: 'Return Requested', icon: RotateCcw, key: 'requested' },
  { label: 'Vendor Approved', icon: CheckCircle2, key: 'vendor_approved' },
  { label: 'Shipped Back', icon: Box, key: 'return_shipped' },
  { label: 'Items Received', icon: Settings, key: 'received' },
  { label: 'Refund Processed', icon: RefreshCw, key: 'refund_processed' },
];

const RETURN_STEP_INDEX: Record<string, number> = {
  requested: 0,
  vendor_approved: 1,
  return_shipped: 2,
  received: 3,
  refund_processed: 4,
  closed: 4,
};

// ─── Compute which step is "active" based on order status ─
function getActiveStep(status: string): number {
  if (status === 'Delivered' || status === 'Returned') return 5;
  if (status === 'Shipped') return 4;
  if (status === 'Processing') return 2; // Order Processed (paid / vendor confirmed)
  if (status === 'Pending') return 0;
  return 1; // Confirmed by default (Refused shows a terminal banner instead)
}

// ─── Component ────────────────────────────────────────────
interface TrackOrderProps {
  activeSection: ActiveSection;
  setActiveSection: (s: ActiveSection) => void;
  selectedOrder: Order | null;
}

export default function TrackOrder({ activeSection, setActiveSection, selectedOrder }: TrackOrderProps) {
  const isReturn = activeSection === 'track-return';
  const order = selectedOrder;

  // Real return state from GET /returns/my (only fetched on the return view).
  const { returns } = useCustomerReturns(isReturn);
  const ret: CustomerReturn | undefined = order
    ? findReturnFor(returns, order.orderNumber)
    : undefined;

  if (!order) return null;

  const rejected = isReturn && ret?.status === 'vendor_rejected';
  const steps = isReturn ? RETURN_STEPS : ORDER_STEPS;
  const activeStepIdx = isReturn
    ? (ret ? (RETURN_STEP_INDEX[ret.status] ?? 0) : 0)
    : getActiveStep(order.status);
  const orderNum = order.orderNumber || '#1234567890';
  const item = order.items[0];

  return (
    <div className="animate-fade-in flex flex-col" style={{ gap: '16px' }}>
      {/* Back Button (desktop) */}
      <button
        onClick={() => setActiveSection('order-item-detail')}
        className="hidden lg:flex items-center justify-center self-start transition-all active:scale-90"
        style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-surface-elevated)', border: 'none', cursor: 'pointer' }}
      >
        <ArrowLeft size={18} color="var(--text-primary)" />
      </button>

      {/* Title */}
      <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {isReturn ? 'Track Return' : 'Track Order'}
      </h3>

      {/* ─── What you're tracking ─── */}
      {item && (
        <div style={cardStyle}>
          <div className="flex items-center" style={{ padding: '12px 14px', gap: '12px' }}>
            <div className="flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ width: '48px', height: '58px', borderRadius: '10px', background: 'var(--bg-surface-elevated)' }}>
              {item.image
                ? <Image src={item.image} alt={item.name} width={48} height={58} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                : <Package size={18} color="var(--text-muted)" />}
            </div>
            <div className="flex-1 min-w-0 flex flex-col" style={{ gap: '3px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{orderNum}</span>
            </div>
            <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-secondary)', flexShrink: 0 }}>{order.items.length > 1 ? `+${order.items.length - 1} more` : ''}</span>
          </div>
        </div>
      )}

      {/* ─── Shipment summary (real) ─── */}
      <div style={cardStyle}>
        <div className="flex flex-col" style={{ padding: '20px', gap: '14px' }}>
          <div className="flex items-center" style={{ gap: '12px' }}>
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--brand-fill)' }}>
              <Truck size={20} color="var(--brand-fill-text)" />
            </div>
            <div className="flex flex-col" style={{ minWidth: 0 }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {isReturn
                  ? (ret ? RETURN_STATUS_LABELS[ret.status] ?? 'Return in progress' : 'Return in progress')
                  : steps[activeStepIdx]?.label ?? 'Order Placed'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {order.courier ? `Courier: ${order.courier}` : 'Awaiting courier assignment'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '12px', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tracking number</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-brown)', fontFamily: 'monospace', textAlign: 'right', wordBreak: 'break-all' }}>{order.tracking || 'Pending'}</span>
          </div>
        </div>
      </div>

      {/* ─── Order Info Bar (real) ─── */}
      <div className="flex" style={{ gap: '12px' }}>
        <div className="flex-1 flex items-center min-w-0" style={{ ...cardStyle, padding: '14px 16px', gap: '12px' }}>
          <div className="flex items-center justify-center flex-shrink-0" style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(44,24,16,0.06)' }}>
            <Package size={16} color="var(--brand-brown)" />
          </div>
          <div className="flex flex-col min-w-0">
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Order ID</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{orderNum}</span>
          </div>
        </div>
        <div className="flex-1 flex items-center min-w-0" style={{ ...cardStyle, padding: '14px 16px', gap: '12px' }}>
          <div className="flex items-center justify-center flex-shrink-0" style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(44,24,16,0.06)' }}>
            <Clock size={16} color="var(--brand-brown)" />
          </div>
          <div className="flex flex-col">
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Status</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{order.status}</span>
          </div>
        </div>
      </div>

      {/* ─── Terminal-state banners ─── */}
      {rejected && (
        <div style={{ ...cardStyle, borderColor: 'rgba(239,68,68,0.25)' }}>
          <div style={{ padding: '14px 16px' }}>
            <p style={{ fontSize: '12.5px', fontWeight: 700, color: '#EF4444', margin: 0 }}>Return rejected by the vendor</p>
            {ret?.vendor_rejection_reason && (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Reason: {ret.vendor_rejection_reason}</p>
            )}
            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '6px 0 0' }}>If you disagree, you can report a problem on the item to open a dispute.</p>
          </div>
        </div>
      )}
      {!isReturn && order.status === 'Refused' && (
        <div style={{ ...cardStyle, borderColor: 'rgba(239,68,68,0.25)' }}>
          <p style={{ padding: '14px 16px', fontSize: '12.5px', fontWeight: 700, color: '#EF4444', margin: 0 }}>This order was cancelled — any payment has been refunded.</p>
        </div>
      )}
      {!isReturn && order.status === 'Returned' && (
        <div style={{ ...cardStyle, borderColor: 'rgba(168,85,247,0.25)' }}>
          <p style={{ padding: '14px 16px', fontSize: '12.5px', fontWeight: 700, color: '#A855F7', margin: 0 }}>This order was returned and refunded.</p>
        </div>
      )}

      {/* ─── Tracking Steps ─── */}
      <div style={cardStyle}>
        <div className="flex flex-col" style={{ padding: '24px 20px' }}>
          {steps.map((step, idx) => {
            const done = idx <= activeStepIdx;
            const isActive = idx === activeStepIdx;
            const isLast = idx === steps.length - 1;
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="flex" style={{ gap: '16px' }}>
                {/* Timeline column */}
                <div className="flex flex-col items-center" style={{ width: '40px', flexShrink: 0 }}>
                  <div
                    className="flex items-center justify-center transition-all"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: done ? 'var(--brand-fill)' : 'var(--bg-surface-elevated)',
                      border: done ? 'none' : '1px solid var(--border-glass)',
                    }}
                  >
                    <StepIcon size={18} color={done ? 'var(--brand-fill-text)' : 'var(--text-muted)'} strokeWidth={done ? 2 : 1.5} />
                  </div>
                  {!isLast && (
                    <div
                      style={{
                        width: '2px',
                        height: '32px',
                        background: idx < activeStepIdx ? 'var(--brand-fill)' : 'var(--border-glass)',
                        borderRadius: '1px',
                      }}
                    />
                  )}
                </div>

                {/* Label + timestamp */}
                <div className="flex items-center justify-between flex-1" style={{ paddingBottom: isLast ? 0 : '16px', minHeight: '40px' }}>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: done ? 700 : 500,
                      color: done ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}
                  >
                    {step.label}
                  </span>
                  {isActive && (
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brand-brown)', background: 'rgba(139,115,85,0.1)', padding: '3px 10px', borderRadius: '100px' }}>
                      In progress
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Contact Support Card ─── */}
      <div style={cardStyle}>
        <div className="flex items-center justify-between" style={{ padding: '16px 20px' }}>
          <div className="flex items-center" style={{ gap: '14px' }}>
            <div className="overflow-hidden flex-shrink-0" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-surface-elevated)' }}>
              <Image
                src={item?.vendorLogo || item?.image || '/image/product-1.png'}
                alt="Support"
                width={48}
                height={48}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {item?.vendor || 'Obus'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Contact Support</span>
            </div>
          </div>
          <button
            className="flex items-center justify-center transition-all hover:opacity-80 active:scale-95"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'var(--brand-fill)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Phone size={18} color="var(--brand-fill-text)" />
          </button>
        </div>
      </div>
    </div>
  );
}
