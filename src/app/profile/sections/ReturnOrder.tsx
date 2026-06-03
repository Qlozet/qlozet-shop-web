'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Upload } from 'lucide-react';
import { cardStyle } from '../styles';
import { conditionOptions, reasonOptions, returnShipOptions, returnPayOptions } from '../data';
import type { ActiveSection, Order } from '../types';

interface ReturnOrderProps {
  setActiveSection: (s: ActiveSection) => void;
  selectedOrder: Order | null;
  selectedItemIdx: number;
  returnStep: number;
  setReturnStep: (s: number) => void;
}

export default function ReturnOrder({ setActiveSection, selectedOrder, selectedItemIdx, returnStep, setReturnStep }: ReturnOrderProps) {
  const [returnCondition, setReturnCondition] = useState('');
  const [returnReasons, setReturnReasons] = useState<string[]>([]);
  const [returnShipMethod, setReturnShipMethod] = useState('standard');
  const [returnPayMethod, setReturnPayMethod] = useState('voucher');

  const order = selectedOrder;
  if (!order) return null;
  const item = order.items[selectedItemIdx] || order.items[0];

  const ReturnProductCard = () => (
    <div style={cardStyle}>
      <div className="flex" style={{ padding: '20px', gap: '16px' }}>
        <div className="flex-shrink-0 overflow-hidden" style={{ width: '100px', height: '120px', borderRadius: '12px', background: '#F5F5F5' }}>
          <Image src={item.image} alt={item.name} width={100} height={120} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
        </div>
        <div className="flex-1 flex flex-col" style={{ gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#999' }}>{item.vendor || 'Miskay Boutique'}</span>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#1A1A1A', fontFamily: 'var(--font-display), serif' }}>{item.name}</span>
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A' }}>₦{item.price.toLocaleString()}</span>
          <div className="flex flex-col" style={{ marginTop: '8px', gap: '4px', padding: '10px 14px', background: '#FAFAFA', borderRadius: '10px' }}>
            {[['Order:', order.orderNumber], ['Placed on:', '12 Oct, 2023'], ['No of Items:', String(item.qty)]].map(([l, v]) => (
              <div key={l} className="flex items-center justify-between">
                <span style={{ fontSize: '11px', color: '#999' }}>{l}</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#1A1A1A' }}>{v}</span>
              </div>
            ))}
            <div className="flex items-center justify-between" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase' }}>Total Cost:</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A' }}>₦{item.price.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ContinueButton = ({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled} className="w-full transition-all hover:opacity-90 active:scale-[0.98]" style={{ padding: '16px', borderRadius: '12px', background: disabled ? '#CCC' : '#462814', color: '#FFF', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', border: 'none', cursor: disabled ? 'default' : 'pointer' }}>
      Continue
    </button>
  );

  return (
    <div className="animate-fade-in flex flex-col" style={{ gap: '20px' }}>
      <button onClick={() => { if (returnStep > 1) setReturnStep(returnStep - 1); else setActiveSection('order-item-detail'); }} className="hidden lg:flex items-center justify-center self-start transition-all active:scale-90" style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer' }}>
        <ArrowLeft size={20} color="#1A1A1A" />
      </button>
      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Return Order</h3>

      <ReturnProductCard />

      {/* Step 1: Select Reason */}
      {returnStep === 1 && (
        <div className="flex flex-col" style={{ gap: '20px' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Select The Reason For Your Return</h4>
            <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.6 }}>To help us process your request quickly, please answer the following questions.</p>
          </div>
          <div style={cardStyle}>
            <div className="flex flex-col" style={{ padding: '20px', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.5 }}>What is the product&apos;s current condition?</span>
              {conditionOptions.map((opt) => (
                <label key={opt} className="flex items-center cursor-pointer" style={{ gap: '10px' }}>
                  <div onClick={() => setReturnCondition(opt)} className="flex-shrink-0 flex items-center justify-center transition-all" style={{ width: '18px', height: '18px', borderRadius: '50%', border: returnCondition === opt ? '2px solid #462814' : '2px solid #DDD', cursor: 'pointer' }}>
                    {returnCondition === opt && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#462814' }} />}
                  </div>
                  <span style={{ fontSize: '12px', color: '#555' }}>{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div style={cardStyle}>
            <div className="flex flex-col" style={{ padding: '20px', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.5 }}>What is the primary reason for returning the product?</span>
              {reasonOptions.map((opt) => {
                const checked = returnReasons.includes(opt);
                return (
                  <label key={opt} className="flex items-center cursor-pointer" style={{ gap: '10px' }}>
                    <div onClick={() => setReturnReasons(prev => checked ? prev.filter(r => r !== opt) : [...prev, opt])} className="flex-shrink-0 flex items-center justify-center transition-all" style={{ width: '18px', height: '18px', borderRadius: '4px', border: checked ? 'none' : '2px solid #DDD', background: checked ? '#462814' : 'none', cursor: 'pointer' }}>
                      {checked && <span style={{ color: '#FFF', fontSize: '11px', fontWeight: 800, lineHeight: 1 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: '12px', color: '#555' }}>{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <ContinueButton onClick={() => setReturnStep(2)} disabled={!returnCondition || returnReasons.length === 0} />
        </div>
      )}

      {/* Step 2: Upload Evidence */}
      {returnStep === 2 && (
        <div className="flex flex-col" style={{ gap: '20px' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Upload Your Photo/Video Evidence</h4>
            <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.6 }}>To help us process your request quickly, please upload image or video proof.</p>
          </div>
          <div style={cardStyle}>
            <div className="flex flex-col" style={{ padding: '20px', gap: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A' }}>Upload Default Images/Videos</span>
              <div className="flex flex-wrap" style={{ gap: '8px' }}>
                {['/image/product-1.png', '/image/product-2.png', '/image/product-3.png', '/image/product-4.png'].map((img, i) => (
                  <div key={i} className="overflow-hidden" style={{ width: '72px', height: '72px', borderRadius: '10px', background: '#F5F5F5' }}>
                    <Image src={img} alt="" width={72} height={72} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                  </div>
                ))}
                <button className="flex flex-col items-center justify-center transition-all hover:border-[#462814]" style={{ width: '72px', height: '72px', borderRadius: '10px', border: '2px dashed #DDD', background: 'none', cursor: 'pointer', gap: '4px' }}>
                  <Upload size={16} color="#999" />
                  <span style={{ fontSize: '8px', fontWeight: 600, color: '#999', lineHeight: 1.2, textAlign: 'center' }}>Add image/<br/>video</span>
                </button>
              </div>
              <button style={{ fontSize: '11px', fontWeight: 600, color: '#462814', background: 'none', border: 'none', cursor: 'pointer', padding: 0, alignSelf: 'flex-start', textDecoration: 'underline' }}>Add from URL</button>
            </div>
          </div>
          <ContinueButton onClick={() => setReturnStep(3)} />
        </div>
      )}

      {/* Step 3: Choose Return Method */}
      {returnStep === 3 && (
        <div className="flex flex-col" style={{ gap: '20px' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Choose Your Preferred Method of Return</h4>
            <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.6 }}>To help us process your request quickly, please select a shipping method.</p>
          </div>
          <div className="flex flex-col" style={{ gap: '10px' }}>
            {returnShipOptions.map((opt) => {
              const selected = returnShipMethod === opt.id;
              return (
                <button key={opt.id} onClick={() => setReturnShipMethod(opt.id)} className="flex items-center w-full transition-all" style={{ ...cardStyle, padding: '16px 20px', gap: '14px', cursor: 'pointer', textAlign: 'left', border: selected ? '2px solid #462814' : '1px solid rgba(0,0,0,0.06)' }}>
                  <div className="flex items-center justify-center flex-shrink-0" style={{ width: '36px', height: '36px', borderRadius: '10px', background: selected ? 'rgba(70,40,20,0.08)' : '#F5F5F5' }}>
                    <opt.icon size={18} color={selected ? '#462814' : '#999'} />
                  </div>
                  <div className="flex-1 flex flex-col" style={{ gap: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>{opt.title}</span>
                    <span style={{ fontSize: '11px', color: '#AAA' }}>{opt.desc}</span>
                  </div>
                  <div className="flex-shrink-0" style={{ width: '18px', height: '18px', borderRadius: '50%', border: selected ? '2px solid #462814' : '2px solid #DDD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#462814' }} />}
                  </div>
                </button>
              );
            })}
          </div>
          <ContinueButton onClick={() => setReturnStep(4)} />
        </div>
      )}

      {/* Step 4: Choose Payment Method */}
      {returnStep === 4 && (
        <div className="flex flex-col" style={{ gap: '20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Choose The Method For Receiving Payment</h4>
          <div className="flex flex-col" style={{ gap: '10px' }}>
            {returnPayOptions.map((opt) => {
              const selected = returnPayMethod === opt.id;
              return (
                <button key={opt.id} onClick={() => setReturnPayMethod(opt.id)} className="flex items-center w-full transition-all" style={{ ...cardStyle, padding: '16px 20px', gap: '14px', cursor: 'pointer', textAlign: 'left', border: selected ? '2px solid #462814' : '1px solid rgba(0,0,0,0.06)' }}>
                  <div className="flex-1 flex flex-col" style={{ gap: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A' }}>{opt.title}</span>
                    <span style={{ fontSize: '11px', color: '#AAA' }}>{opt.desc}</span>
                  </div>
                  <div className="flex-shrink-0" style={{ width: '18px', height: '18px', borderRadius: '50%', border: selected ? '2px solid #462814' : '2px solid #DDD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#462814' }} />}
                  </div>
                </button>
              );
            })}
          </div>
          <ContinueButton onClick={() => setReturnStep(5)} />
        </div>
      )}

      {/* Step 5: Return Summary */}
      {returnStep === 5 && (
        <div className="flex flex-col" style={{ gap: '20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Return Summary</h4>
          <div style={cardStyle}>
            <div className="flex flex-col" style={{ padding: '20px', gap: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase' }}>Return Details</span>
              <div className="flex flex-col" style={{ gap: '4px' }}>
                <span style={{ fontSize: '11px', color: '#999' }}>• Current state of the product:</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A', paddingLeft: '12px' }}>{returnCondition}</span>
              </div>
              <div className="flex flex-col" style={{ gap: '4px' }}>
                <span style={{ fontSize: '11px', color: '#999' }}>• Main reason for returning the product:</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A', paddingLeft: '12px' }}>{returnReasons[0] || '-'}</span>
              </div>
              <div className="flex flex-col" style={{ gap: '4px' }}>
                <span style={{ fontSize: '11px', color: '#999' }}>• Method for returning the product:</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A', paddingLeft: '12px' }}>{returnShipMethod === 'standard' ? 'Standard Shipping - ₦10,000' : 'In-store pickup - Free'}</span>
              </div>
              <div className="flex flex-col" style={{ gap: '4px' }}>
                <span style={{ fontSize: '11px', color: '#999' }}>• Method for receiving the product:</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1A1A', paddingLeft: '12px' }}>{returnPayOptions.find(o => o.id === returnPayMethod)?.title}</span>
              </div>
            </div>
          </div>
          <ContinueButton onClick={() => { setActiveSection('order-item-detail'); }} />
        </div>
      )}
    </div>
  );
}
