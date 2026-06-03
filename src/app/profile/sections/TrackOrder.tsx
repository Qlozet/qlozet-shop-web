'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowLeft, Package, ClipboardCheck, Settings, Truck, PackageCheck, MapPin, Clock, Phone, RotateCcw, CheckCircle2, Box, RefreshCw, Wrench } from 'lucide-react';
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
    <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
      {/* Back Button (desktop) */}
      <button
        onClick={() => setActiveSection('order-item-detail')}
        className="hidden lg:flex items-center justify-center self-start transition-all active:scale-90"
        style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <ArrowLeft size={20} color="#1A1A1A" />
      </button>

      {/* Title */}
      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {isReturn ? 'Track Return' : 'Track Order'} {orderNum}
      </h3>

      {/* ─── Map Placeholder ─── */}
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <div className="relative" style={{ height: '220px', background: '#F0EDE8' }}>
          {/* Stylized map background */}
          <div className="absolute inset-0" style={{ background: 'url("data:image/svg+xml,%3Csvg width=\'400\' height=\'220\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect fill=\'%23F0EDE8\' width=\'400\' height=\'220\'/%3E%3Cpath d=\'M0 110 Q100 80 200 120 T400 100\' stroke=\'%23E0D8D0\' fill=\'none\' stroke-width=\'1.5\'/%3E%3Cpath d=\'M0 140 Q150 100 300 150 T400 130\' stroke=\'%23E0D8D0\' fill=\'none\' stroke-width=\'1\'/%3E%3Cpath d=\'M50 0 Q60 80 50 220\' stroke=\'%23E0D8D0\' fill=\'none\' stroke-width=\'1\'/%3E%3Cpath d=\'M150 0 Q140 100 160 220\' stroke=\'%23E0D8D0\' fill=\'none\' stroke-width=\'1\'/%3E%3Cpath d=\'M250 0 Q260 60 240 220\' stroke=\'%23E0D8D0\' fill=\'none\' stroke-width=\'1\'/%3E%3Cpath d=\'M350 0 Q340 120 360 220\' stroke=\'%23E0D8D0\' fill=\'none\' stroke-width=\'1\'/%3E%3C/svg%3E")', backgroundSize: 'cover' }} />

          {/* Route line */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 220" preserveAspectRatio="none">
            <path
              d="M120 170 Q200 130 280 80 T340 55"
              stroke="#8B7355"
              strokeWidth="2"
              fill="none"
              strokeDasharray="6,4"
              opacity="0.5"
            />
          </svg>

          {/* Delivery pin */}
          <div className="absolute flex items-center" style={{ top: '35px', right: '60px', gap: '8px' }}>
            <div className="flex items-center" style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '100px', padding: '6px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#1A1A1A' }}>Arrival ( 2 mins )</span>
            </div>
            <div className="flex items-center justify-center" style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#8B7355', border: '2px solid #FFF', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
          </div>

          {/* Current location indicator */}
          <div className="absolute flex items-center justify-center" style={{ bottom: '45px', left: '100px', width: '32px', height: '32px', borderRadius: '50%', background: '#2C1810' }}>
            <MapPin size={16} color="#FFF" fill="#FFF" style={{ transform: 'rotate(-30deg)' }} />
          </div>

          {/* Location target button */}
          <button className="absolute flex items-center justify-center" style={{ top: '12px', right: '12px', width: '32px', height: '32px', borderRadius: '50%', background: '#FFF', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', cursor: 'pointer' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #1A1A1A', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '4px', height: '4px', borderRadius: '50%', background: '#1A1A1A' }} />
            </div>
          </button>
        </div>
      </div>

      {/* ─── Order Info Bar ─── */}
      <div className="flex" style={{ gap: '12px' }}>
        <div className="flex-1 flex items-center" style={{ ...cardStyle, padding: '14px 16px', gap: '12px' }}>
          <div className="flex items-center justify-center flex-shrink-0" style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(44,24,16,0.06)' }}>
            <Package size={16} color="#2C1810" />
          </div>
          <div className="flex flex-col">
            <span style={{ fontSize: '10px', color: '#999' }}>Order ID</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>{orderNum}</span>
          </div>
        </div>
        <div className="flex-1 flex items-center" style={{ ...cardStyle, padding: '14px 16px', gap: '12px' }}>
          <div className="flex items-center justify-center flex-shrink-0" style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(44,24,16,0.06)' }}>
            <Clock size={16} color="#2C1810" />
          </div>
          <div className="flex flex-col">
            <span style={{ fontSize: '10px', color: '#999' }}>Est. timeline</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>3-5 days</span>
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
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#888' }}>
                      Feb 23, 10:30pm
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
