'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowLeft, Package, ClipboardCheck, Settings, Truck, PackageCheck, Clock, Phone, RotateCcw, CheckCircle2, Box, RefreshCw, Wrench } from 'lucide-react';
import { cardStyle } from '../styles';
import type { ActiveSection, Order } from '../types';

// ─── Step definitions ────────────────────────────────────
const ORDER_STEPS = [
  { label: 'Order Placed', icon: Package, key: 'placed' },
  { label: 'Order Confirmed', icon: ClipboardCheck, key: 'confirmed' },
  { label: 'Order Processed', icon: Settings, key: 'processed' },
  { label: 'Ready to Ship', icon: Box, key: 'ready' },
  { label: 'Order shipped', icon: Truck, key: 'shipped' },
  { label: 'Delivered', icon: PackageCheck, key: 'delivered' },
];

const RETURN_STEPS = [
  { label: 'Return Requested', icon: RotateCcw, key: 'requested' },
  { label: 'Return Approved', icon: CheckCircle2, key: 'approved' },
  { label: 'Items Picked', icon: Box, key: 'picked' },
  { label: 'Return Processing', icon: Settings, key: 'processing' },
  { label: 'Adjustment Initiated', icon: Wrench, key: 'adjustment' },
  { label: 'Adjustment Processed', icon: RefreshCw, key: 'adj-processed' },
  { label: 'Adjustment Delivered', icon: PackageCheck, key: 'adj-delivered' },
];

// ─── Compute which step is "active" based on order status ─
function getActiveStep(status: string, isReturn: boolean): number {
  if (isReturn) {
    if (status === 'Delivered') return 1; // Return Approved
    if (status === 'Shipped') return 1;
    if (status === 'Pending') return 0;
    return 1;
  }
  if (status === 'Delivered') return 5;
  if (status === 'Shipped') return 4;
  if (status === 'Processing') return 2; // Order Processed (paid / vendor confirmed)
  if (status === 'Pending') return 0;
  return 1; // Confirmed by default
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

  if (!order) return null;

  const steps = isReturn ? RETURN_STEPS : ORDER_STEPS;
  const activeStepIdx = getActiveStep(order.status, isReturn);
  const orderNum = order.orderNumber || '#1234567890';
  const item = order.items[0];

  return (
    <div className="animate-fade-in flex flex-col" style={{ gap: '16px' }}>
      {/* Back Button (desktop) */}
      <button
        onClick={() => setActiveSection('order-item-detail')}
        className="hidden lg:flex items-center justify-center self-start transition-all active:scale-90"
        style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F4F1ED', border: 'none', cursor: 'pointer' }}
      >
        <ArrowLeft size={18} color="#1A1A1A" />
      </button>

      {/* Title */}
      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {isReturn ? 'Track Return' : 'Track Order'}
      </h3>

      {/* ─── What you're tracking ─── */}
      {item && (
        <div style={cardStyle}>
          <div className="flex items-center" style={{ padding: '12px 14px', gap: '12px' }}>
            <div className="flex-shrink-0 overflow-hidden flex items-center justify-center" style={{ width: '48px', height: '58px', borderRadius: '10px', background: '#F4F1ED' }}>
              {item.image
                ? <Image src={item.image} alt={item.name} width={48} height={58} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                : <Package size={18} color="#C9BEB2" />}
            </div>
            <div className="flex-1 min-w-0 flex flex-col" style={{ gap: '3px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
              <span style={{ fontSize: '11px', color: '#8A7A6C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{orderNum}</span>
            </div>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#8A7A6C', flexShrink: 0 }}>{order.items.length > 1 ? `+${order.items.length - 1} more` : ''}</span>
          </div>
        </div>
      )}

      {/* ─── Shipment summary (real) ─── */}
      <div style={cardStyle}>
        <div className="flex flex-col" style={{ padding: '20px', gap: '14px' }}>
          <div className="flex items-center" style={{ gap: '12px' }}>
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#2C1810' }}>
              <Truck size={20} color="#FFF" />
            </div>
            <div className="flex flex-col" style={{ minWidth: 0 }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>
                {isReturn ? 'Return in progress' : steps[activeStepIdx]?.label ?? 'Order Placed'}
              </span>
              <span style={{ fontSize: '12px', color: '#999' }}>
                {order.courier ? `Courier: ${order.courier}` : 'Awaiting courier assignment'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between" style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '12px', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: '#999' }}>Tracking number</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#2C1810', fontFamily: 'monospace', textAlign: 'right', wordBreak: 'break-all' }}>{order.tracking || 'Pending'}</span>
          </div>
        </div>
      </div>

      {/* ─── Order Info Bar (real) ─── */}
      <div className="flex" style={{ gap: '12px' }}>
        <div className="flex-1 flex items-center min-w-0" style={{ ...cardStyle, padding: '14px 16px', gap: '12px' }}>
          <div className="flex items-center justify-center flex-shrink-0" style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(44,24,16,0.06)' }}>
            <Package size={16} color="#2C1810" />
          </div>
          <div className="flex flex-col min-w-0">
            <span style={{ fontSize: '10px', color: '#999' }}>Order ID</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{orderNum}</span>
          </div>
        </div>
        <div className="flex-1 flex items-center min-w-0" style={{ ...cardStyle, padding: '14px 16px', gap: '12px' }}>
          <div className="flex items-center justify-center flex-shrink-0" style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(44,24,16,0.06)' }}>
            <Clock size={16} color="#2C1810" />
          </div>
          <div className="flex flex-col">
            <span style={{ fontSize: '10px', color: '#999' }}>Status</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>{order.status}</span>
          </div>
        </div>
      </div>

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
                      background: done ? '#2C1810' : '#F5F5F5',
                      border: done ? 'none' : '1px solid #E5E5E5',
                    }}
                  >
                    <StepIcon size={18} color={done ? '#FFFFFF' : '#CCCCCC'} strokeWidth={done ? 2 : 1.5} />
                  </div>
                  {!isLast && (
                    <div
                      style={{
                        width: '2px',
                        height: '32px',
                        background: idx < activeStepIdx ? '#2C1810' : '#E5E5E5',
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
                      color: done ? '#1A1A1A' : '#BBBBBB',
                    }}
                  >
                    {step.label}
                  </span>
                  {isActive && (
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#8B7355', background: 'rgba(139,115,85,0.1)', padding: '3px 10px', borderRadius: '100px' }}>
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
            <div className="overflow-hidden flex-shrink-0" style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F5F5F5' }}>
              <Image
                src={item?.vendorLogo || item?.image || '/image/product-1.png'}
                alt="Support"
                width={48}
                height={48}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>
            <div className="flex flex-col">
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1A' }}>
                {item?.vendor || 'Obus'}
              </span>
              <span style={{ fontSize: '12px', color: '#999' }}>Contact Support</span>
            </div>
          </div>
          <button
            className="flex items-center justify-center transition-all hover:opacity-80 active:scale-95"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#2C1810',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Phone size={18} color="#FFFFFF" />
          </button>
        </div>
      </div>
    </div>
  );
}
