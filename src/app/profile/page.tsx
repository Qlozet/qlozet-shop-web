'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  User, Wallet, Package, Ruler, CreditCard, ShieldCheck,
  Bell, Moon, ChevronRight, ChevronLeft,
  HelpCircle, BookOpen, FileText, Lock, Star, LogOut, Coins, Award,
} from 'lucide-react';

import type { ActiveSection, Order } from './types';
import { cardStyle, sectionTitle } from './styles';
import MenuRow from './components/MenuRow';
import Toggle from './components/Toggle';

// Section components
import PersonalInfo from './sections/PersonalInfo';
import AddressBook from './sections/AddressBook';
import WelcomeBanner from './sections/WelcomeBanner';
import WalletSection from './sections/Wallet';
import OrdersSection from './sections/Orders';
import ReturnOrder from './sections/ReturnOrder';
import TrackOrder from './sections/TrackOrder';
import MeasurementsSection from './sections/Measurements';
import AccountSecurity from './sections/AccountSecurity';

// ─── Section Title Map ──────────────────────────────────────
const sectionTitles: Record<ActiveSection, string> = {
  'welcome': 'My Account',
  'personal-info': 'Personal Information',
  'address-book': 'Address Book',
  'add-address': 'Add Address',
  'wallet': 'My Wallet',
  'wallet-detail': 'Transaction Details',
  'fund-wallet': 'Fund Wallet',
  'orders': 'My Orders',
  'order-detail': 'Order Details',
  'order-item-detail': 'Item Details',
  'return-order': 'Return Order',
  'track-order': 'Track Order',
  'track-return': 'Track Return',
  'measurements': 'My Measurement',
  'measurement-detail': 'Measurement Details',
  'add-measurement': 'Add Measurement',
  'measurement-form': 'Measurement Form',
  'account-security': 'Account Security',
  'change-password': 'Change Password',
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, demoLogin, logout } = useApp();

  // ─── Shared State ───────────────────────────────────────────
  const [activeSection, setActiveSection] = useState<ActiveSection>('welcome');
  const [pushNotif, setPushNotif] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedItemIdx, setSelectedItemIdx] = useState(0);
  const [returnStep, setReturnStep] = useState(1);

  const handleSignIn = () => demoLogin();
  const handleLogout = () => { logout(); router.push('/'); };
  const handleRequestReturn = () => {
    setReturnStep(1);
    setActiveSection('return-order');
  };

  const isSubSection = activeSection !== 'welcome';

  // ─── Mobile Back Navigation ─────────────────────────────────
  const handleMobileBack = () => {
    if (activeSection === 'wallet-detail' || activeSection === 'fund-wallet') setActiveSection('wallet');
    else if (activeSection === 'add-address') setActiveSection('address-book');
    else if (activeSection === 'return-order') {
      if (returnStep > 1) setReturnStep(returnStep - 1);
      else setActiveSection('order-item-detail');
    }
    else if (activeSection === 'track-order' || activeSection === 'track-return') setActiveSection('order-item-detail');
    else if (activeSection === 'order-item-detail') setActiveSection('order-detail');
    else if (activeSection === 'order-detail') setActiveSection('orders');
    else if (activeSection === 'measurement-form') setActiveSection('add-measurement');
    else if (activeSection === 'add-measurement') setActiveSection('measurements');
    else if (activeSection === 'measurement-detail') setActiveSection('measurements');
    else if (activeSection === 'change-password') setActiveSection('account-security');
    else setActiveSection('welcome');
  };

  // ─── Right Panel Router ─────────────────────────────────────
  const renderRightPanel = () => {
    switch (activeSection) {
      case 'personal-info':
        return <PersonalInfo userName={user?.name} />;
      case 'address-book':
      case 'add-address':
        return <AddressBook activeSection={activeSection} setActiveSection={setActiveSection} />;
      case 'wallet':
      case 'wallet-detail':
      case 'fund-wallet':
        return <WalletSection activeSection={activeSection} setActiveSection={setActiveSection} />;
      case 'orders':
      case 'order-detail':
      case 'order-item-detail':
        return (
          <OrdersSection
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            selectedOrder={selectedOrder}
            setSelectedOrder={setSelectedOrder}
            selectedItemIdx={selectedItemIdx}
            setSelectedItemIdx={setSelectedItemIdx}
            onRequestReturn={handleRequestReturn}
          />
        );
      case 'return-order':
        return (
          <ReturnOrder
            setActiveSection={setActiveSection}
            selectedOrder={selectedOrder}
            selectedItemIdx={selectedItemIdx}
            returnStep={returnStep}
            setReturnStep={setReturnStep}
          />
        );
      case 'track-order':
      case 'track-return':
        return (
          <TrackOrder
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            selectedOrder={selectedOrder}
          />
        );
      case 'measurements':
      case 'measurement-detail':
      case 'add-measurement':
      case 'measurement-form':
        return (
          <MeasurementsSection
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        );
      case 'account-security':
      case 'change-password':
        return (
          <AccountSecurity
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        );
      default:
        return <WelcomeBanner />;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col animate-fade-in" style={{ gap: '24px', paddingBottom: '32px' }}>

      {/* ─── Page Title (Desktop always, Mobile only when menu visible) ── */}
      <h1
        className={`text-center font-display font-extrabold uppercase tracking-[0.12em] text-[#1A1A1A] ${isSubSection ? 'hidden lg:block' : ''}`}
        style={{ fontSize: '22px' }}
      >
        My Account
      </h1>

      {/* ─── Mobile Sub-Section Header (back + title) ──────────── */}
      {isSubSection && (
        <div className="lg:hidden flex items-center" style={{ gap: '12px' }}>
          <button
            onClick={handleMobileBack}
            className="flex items-center justify-center transition-all active:scale-90"
            style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F5F5F5', border: 'none', cursor: 'pointer' }}
          >
            <ChevronLeft size={18} color="#1A1A1A" />
          </button>
          <h1 className="font-display font-extrabold uppercase tracking-[0.08em] text-[#1A1A1A]" style={{ fontSize: '18px' }}>
            {sectionTitles[activeSection]}
          </h1>
        </div>
      )}

      {/* ─── Mobile: Full-width section content (replaces menu) ── */}
      {isSubSection && (
        <div className="lg:hidden w-full">
          {renderRightPanel()}
        </div>
      )}

      {/* ─── Two-Column Layout (hidden on mobile when sub-section active) ── */}
      <div className={`flex flex-col lg:flex-row lg:items-start lg:justify-center gap-6 lg:gap-8 ${isSubSection ? 'hidden lg:flex' : ''} w-full`}>

        {/* ══════ LEFT COLUMN — Profile & Settings ══════ */}
        <div className="flex flex-col lg:flex-shrink-0 w-full lg:w-[380px]" style={{ gap: '16px' }}>

          {/* ── User Profile Card ──────────────────────────────── */}
          <div style={cardStyle}>
            <div className="flex items-center justify-between" style={{ padding: '20px' }}>
              <div className="flex items-center" style={{ gap: '14px' }}>
                <div className="relative flex-shrink-0 overflow-hidden" style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F0ECE8', border: '2px solid #E8E0D8' }}>
                  {user ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <span style={{ fontSize: '18px', fontWeight: 800, color: '#462814' }}>{user.name.charAt(0)}</span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={22} color="#A08C7B" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A' }}>{user?.name || 'Guest User'}</span>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#999' }}>@{user ? user.name.split(' ')[0].toLowerCase() : 'guest'}</span>
                </div>
              </div>

              {user && (
                <div className="flex flex-col items-end" style={{ gap: '4px' }}>
                  <div className="flex items-center" style={{ gap: '5px', padding: '4px 10px', borderRadius: '100px', background: 'rgba(45,106,79,0.08)' }}>
                    <Coins size={12} color="#2D6A4F" />
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#2D6A4F' }}>₦{(70000).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center" style={{ gap: '5px', padding: '4px 10px', borderRadius: '100px', background: 'rgba(212,175,55,0.1)' }}>
                    <Award size={12} color="#D4AF37" />
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#B8941F' }}>3,000.8pts</span>
                  </div>
                </div>
              )}

              {!user && (
                <button onClick={handleSignIn} className="transition-all hover:opacity-90 active:scale-95" style={{ padding: '8px 20px', borderRadius: '100px', background: '#462814', color: '#FFF', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', border: 'none', cursor: 'pointer' }}>
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* ── MY ACCOUNT Section ─────────────────────────────── */}
          <div style={cardStyle}>
            <h3 style={sectionTitle}>My Account</h3>
            <div className="flex flex-col">
              <MenuRow icon={User} label="Personal Information" iconBg="rgba(70,40,20,0.06)" iconColor="#8B5A2B"
                onClick={() => setActiveSection('personal-info')} isActive={activeSection === 'personal-info'} />
              <MenuRow icon={Wallet} label="Wallet" iconBg="rgba(45,106,79,0.08)" iconColor="#2D6A4F"
                onClick={() => setActiveSection('wallet')} isActive={activeSection === 'wallet' || activeSection === 'wallet-detail' || activeSection === 'fund-wallet'} />
              <MenuRow icon={Package} label="My Orders" iconBg="rgba(212,175,55,0.1)" iconColor="#B8941F"
                onClick={() => setActiveSection('orders')} isActive={activeSection === 'orders' || activeSection === 'order-detail'} />
              <MenuRow icon={Ruler} label="My Measurement" iconBg="rgba(99,102,241,0.08)" iconColor="#6366F1"
                onClick={() => setActiveSection('measurements')} isActive={activeSection === 'measurements' || activeSection === 'measurement-detail' || activeSection === 'add-measurement' || activeSection === 'measurement-form'} />
              <MenuRow icon={CreditCard} label="Payment Information" iconBg="rgba(239,68,68,0.06)" iconColor="#EF4444" />
              <MenuRow icon={ShieldCheck} label="Account Security" iconBg="rgba(16,185,129,0.08)" iconColor="#10B981"
                onClick={() => setActiveSection('account-security')} isActive={activeSection === 'account-security' || activeSection === 'change-password'} />
              <MenuRow icon={Bell} label="Push Notification" iconBg="rgba(245,158,11,0.08)" iconColor="#F59E0B"
                trailing={<Toggle value={pushNotif} onChange={setPushNotif} />} />
              <MenuRow icon={Moon} label="Dark Mode" iconBg="rgba(107,114,128,0.08)" iconColor="#6B7280"
                trailing={<Toggle value={darkMode} onChange={setDarkMode} />} />
            </div>
          </div>

          {/* ── SUPPORT AND LEGAL Section ──────────────────────── */}
          <div style={cardStyle}>
            <h3 style={sectionTitle}>Support and Legal</h3>
            <div className="flex flex-col">
              <MenuRow icon={HelpCircle} label="Help and support" iconBg="rgba(99,102,241,0.06)" iconColor="#6366F1" />
              <MenuRow icon={BookOpen} label="Your Guide to Qlozet FAQS" iconBg="rgba(212,175,55,0.08)" iconColor="#D4AF37" />
              <MenuRow icon={FileText} label="Terms of Use" iconBg="rgba(16,185,129,0.06)" iconColor="#10B981" />
              <MenuRow icon={Lock} label="Privacy Policy" iconBg="rgba(239,68,68,0.06)" iconColor="#EF4444" />
              <MenuRow icon={Star} label="Rate The Qlozet App" iconBg="rgba(245,158,11,0.06)" iconColor="#F59E0B" />
            </div>
          </div>

          {/* ── Log Out ───────────────────────────────────────── */}
          {user && (
            <div style={{ ...cardStyle, borderColor: 'rgba(239,68,68,0.08)' }}>
              <button onClick={handleLogout} className="w-full flex items-center justify-between transition-colors hover:bg-red-50/50" style={{ padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer' }}>
                <div className="flex items-center" style={{ gap: '14px' }}>
                  <span className="flex items-center justify-center flex-shrink-0" style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)' }}>
                    <LogOut size={16} color="#EF4444" strokeWidth={2} />
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#EF4444' }}>Log Out</span>
                </div>
                <ChevronRight size={16} color="#EF4444" />
              </button>
            </div>
          )}
        </div>

        {/* ══════ RIGHT COLUMN — Desktop Only ══════ */}
        <div className="hidden lg:flex flex-col min-w-0 lg:sticky lg:top-0" style={{ gap: '16px', width: '677px', maxWidth: '100%' }}>
          {renderRightPanel()}
        </div>
      </div>
    </div>
  );
}
