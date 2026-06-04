'use client';

import React, { useState } from 'react';
import { Bell, Tag, Package, ShoppingCart, MessageSquare, MapPin } from 'lucide-react';
import { cardStyle } from '../styles';

// ─── Notification items ──────────────────────────────────────
interface NotifItem {
  id: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

const NOTIF_ITEMS: NotifItem[] = [
  {
    id: 'installments',
    icon: Bell,
    iconBg: 'rgba(139,90,43,0.10)',
    iconColor: '#8B5A2B',
    title: 'Installments',
    description: 'Notifications for upcoming payments, successful transactions, and payments issues',
  },
  {
    id: 'price-drop',
    icon: Tag,
    iconBg: 'rgba(234,88,12,0.08)',
    iconColor: '#EA580C',
    title: 'Price drop',
    description: 'Know when your saved items drop in price',
  },
  {
    id: 'back-in-stock',
    icon: Package,
    iconBg: 'rgba(16,185,129,0.08)',
    iconColor: '#10B981',
    title: 'Back in stock',
    description: 'Know when your saved items are back in stock',
  },
  {
    id: 'cart-reminder',
    icon: ShoppingCart,
    iconBg: 'rgba(139,90,43,0.10)',
    iconColor: '#8B5A2B',
    title: 'Cart reminder',
    description: 'Reminders that there are items in your cart',
  },
  {
    id: 'product-reviews',
    icon: MessageSquare,
    iconBg: 'rgba(239,68,68,0.08)',
    iconColor: '#EF4444',
    title: 'Product reviews',
    description: 'Reminder to review products after receiving them',
  },
  {
    id: 'order-tracking',
    icon: MapPin,
    iconBg: 'rgba(59,130,246,0.08)',
    iconColor: '#3B82F6',
    title: 'Order Tracking',
    description: "Stay updated on your order's journey from shipment to delivery",
  },
];

export default function Notifications() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    'installments': false,
    'price-drop': false,
    'back-in-stock': false,
    'cart-reminder': false,
    'product-reviews': false,
    'order-tracking': false,
  });

  const toggle = (id: string) => {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
      {/* Header card */}
      <div style={cardStyle}>
        <div style={{ padding: '24px 20px' }}>
          <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.08)', marginBottom: '14px' }}>
            <Bell size={18} color="#1A1A1A" />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Notifications
          </h3>
        </div>
      </div>

      {/* Notification toggles */}
      <div className="flex flex-col" style={{ gap: '0' }}>
        {NOTIF_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          const isFirst = idx === 0;
          const isLast = idx === NOTIF_ITEMS.length - 1;

          return (
            <div
              key={item.id}
              className="flex items-center justify-between"
              style={{
                padding: '18px 20px',
                borderRadius: isFirst ? '16px 16px 0 0' : isLast ? '0 0 16px 16px' : '0',
                border: '1px solid rgba(0,0,0,0.06)',
                borderTop: isFirst ? undefined : 'none',
                background: '#FFFFFF',
              }}
            >
              {/* Icon + text */}
              <div className="flex items-start" style={{ gap: '14px', flex: 1, minWidth: 0 }}>
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: '36px', height: '36px', borderRadius: '10px', background: item.iconBg }}
                >
                  <Icon size={16} color={item.iconColor} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', marginBottom: '4px' }}>{item.title}</p>
                  <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.5 }}>{item.description}</p>
                </div>
              </div>

              {/* Toggle */}
              <button
                onClick={() => toggle(item.id)}
                className="relative transition-all flex-shrink-0"
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '100px',
                  background: toggles[item.id] ? '#2C1810' : '#E5E5E5',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  marginLeft: '16px',
                }}
              >
                <div
                  className="absolute transition-all"
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    top: '2px',
                    left: toggles[item.id] ? '22px' : '2px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
