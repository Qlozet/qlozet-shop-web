'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Plus,
  Search,
  Scissors,
  Heart,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Upload,
  ArrowRight,
  X,
  Quote,
  Users,
  Layout,
  Star,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════════════════════════

type DesignStatus = 'Awaiting Price' | 'Outfit Ready!' | 'Price Ready!' | 'In Progress...' | 'Draft';

interface BespokeDesign {
  id: string;
  image: string;
  name: string;
  status: DesignStatus;
  date: string;
  category: string;
}

const STATUS_COLORS: Record<DesignStatus, { bg: string; text: string }> = {
  'Awaiting Price': { bg: 'rgba(217,119,6,0.85)', text: '#FFFFFF' },
  'Outfit Ready!': { bg: 'rgba(5,150,105,0.85)', text: '#FFFFFF' },
  'Price Ready!': { bg: 'rgba(37,99,235,0.85)', text: '#FFFFFF' },
  'In Progress...': { bg: 'rgba(124,58,237,0.85)', text: '#FFFFFF' },
  'Draft': { bg: 'rgba(107,114,128,0.75)', text: '#FFFFFF' },
};

const CATEGORIES = ['All', 'Dresses', 'Tops', 'Skirts', 'Jumpsuits', 'Agbada', 'Kaftan', 'Sets'];

const DEMO_DESIGNS: BespokeDesign[] = [
  { id: 'b1', image: '/image/bespoke-dress-1.png', name: 'Ankara Flare Dress', status: 'Awaiting Price', date: 'May 28', category: 'Dresses' },
  { id: 'b2', image: '/image/bespoke-dress-2.png', name: 'Ankara Midi Wrap', status: 'Outfit Ready!', date: 'May 25', category: 'Dresses' },
  { id: 'b3', image: '/image/bespoke-outfit-1.webp', name: 'Striped Pencil Dress', status: 'Price Ready!', date: 'May 22', category: 'Dresses' },
  { id: 'b4', image: '/image/bespoke-ankara-1.png', name: 'Blue Ankara Blazer', status: 'In Progress...', date: 'May 20', category: 'Tops' },
  { id: 'b5', image: '/image/bespoke-ankara-2.png', name: 'Ankara Print Coat', status: 'In Progress...', date: 'May 18', category: 'Tops' },
  { id: 'b6', image: '/image/pattern-bespoke-1.png', name: 'Bold Pattern Tunic', status: 'Awaiting Price', date: 'May 15', category: 'Tops' },
  { id: 'b7', image: '/image/bespoke-kaftan-brown-1.png', name: 'Chocolate Silk Kaftan', status: 'Outfit Ready!', date: 'May 12', category: 'Kaftan' },
  { id: 'b8', image: '/image/bespoke-kaftan-milk-1.png', name: 'Cream Crepe Kaftan', status: 'Price Ready!', date: 'May 10', category: 'Kaftan' },
  { id: 'b9', image: '/image/bespoke-agbada-orange.webp', name: 'Royal Orange Agbada', status: 'Outfit Ready!', date: 'May 8', category: 'Agbada' },
  { id: 'b10', image: '/image/bespoke-agbada-lime.webp', name: 'Lime Grand Agbada', status: 'Draft', date: 'May 5', category: 'Agbada' },
];

// Templates
interface Template {
  id: string;
  image: string;
  name: string;
  uses: number;
  category: string;
}

const TEMPLATES: Template[] = [
  { id: 't1', image: '/image/bespoke-kaftan-brown-1.png', name: 'Classic Kaftan', uses: 2400, category: 'Kaftan' },
  { id: 't2', image: '/image/bespoke-dress-1.png', name: 'Ankara Flare', uses: 1800, category: 'Dresses' },
  { id: 't3', image: '/image/bespoke-agbada-orange.webp', name: 'Royal Agbada', uses: 3100, category: 'Agbada' },
  { id: 't4', image: '/image/bespoke-outfit-1.webp', name: 'Modern Pencil', uses: 950, category: 'Dresses' },
  { id: 't5', image: '/image/bespoke-kaftan-milk-1.png', name: 'Crepe Minimal', uses: 1200, category: 'Kaftan' },
  { id: 't6', image: '/image/bespoke-ankara-1.png', name: 'Ankara Blazer', uses: 780, category: 'Tops' },
];

// Community showcase
interface CommunityDesign {
  id: string;
  image: string;
  designer: string;
  avatar: string;
  name: string;
  likes: number;
}

const COMMUNITY: CommunityDesign[] = [
  { id: 'c1', image: '/image/bespoke-outfit-3.webp', designer: 'Amara', avatar: '🇳🇬', name: 'Wedding Reception Look', likes: 342 },
  { id: 'c2', image: '/image/bespoke-outfit-4.webp', designer: 'Chioma', avatar: '✨', name: 'Corporate Ankara Set', likes: 218 },
  { id: 'c3', image: '/image/custom-outfit-1.webp', designer: 'Ngozi', avatar: '👗', name: 'Date Night Kaftan', likes: 567 },
  { id: 'c4', image: '/image/custom-outfit-2.webp', designer: 'Fatima', avatar: '💎', name: 'Traditional Lace Gown', likes: 189 },
  { id: 'c5', image: '/image/bespoke-kaftan-brown-1.png', designer: 'Tunde', avatar: '👔', name: 'Classic Brown Kaftan', likes: 421 },
  { id: 'c6', image: '/image/bespoke-agbada-orange.webp', designer: 'Yemi', avatar: '🔥', name: 'Royal Orange Agbada', likes: 734 },
  { id: 'c7', image: '/image/bespoke-dress-1.png', designer: 'Adaeze', avatar: '🌸', name: 'Ankara Flare Party', likes: 156 },
  { id: 'c8', image: '/image/bespoke-kaftan-milk-1.png', designer: 'Bola', avatar: '🤍', name: 'Minimalist Cream Look', likes: 298 },
  { id: 'c9', image: '/image/bespoke-outfit-2.png', designer: 'Kemi', avatar: '✂️', name: 'Pencil Dress Remix', likes: 445 },
  { id: 'c10', image: '/image/bespoke-ankara-1.png', designer: 'Ore', avatar: '💙', name: 'Blue Blazer Statement', likes: 312 },
];

// Quotes
interface BespokeQuote {
  id: string;
  vendor: string;
  items: number;
  total: string;
  status: 'pending' | 'accepted' | 'expired';
  date: string;
}

const DEMO_QUOTES: BespokeQuote[] = [
  { id: 'q1', vendor: 'Africana Couture', items: 2, total: '₦380,000', status: 'pending', date: 'Jun 1' },
  { id: 'q2', vendor: 'Garm Island', items: 1, total: '₦185,000', status: 'accepted', date: 'May 28' },
  { id: 'q3', vendor: 'Fruché', items: 3, total: '₦520,000', status: 'expired', date: 'May 15' },
];

const QUOTE_STATUS_MAP = {
  pending: { bg: 'rgba(245,158,11,0.1)', text: '#D97706', label: 'Awaiting Response' },
  accepted: { bg: 'rgba(16,185,129,0.1)', text: '#059669', label: 'Accepted' },
  expired: { bg: 'rgba(239,68,68,0.06)', text: '#EF4444', label: 'Expired' },
};

// ═══════════════════════════════════════════════════════════════
//  NEW DESIGN MODAL FLOW
// ═══════════════════════════════════════════════════════════════
type ModalStep = null | 'start' | 'name' | 'category';

function NewDesignModal({ step, setStep }: { step: ModalStep; setStep: (s: ModalStep) => void }) {
  const router = useRouter();
  const [designMethod, setDesignMethod] = useState<'reference' | 'scratch'>('reference');
  const [styleName, setStyleName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Dresses');
  const [gender, setGender] = useState<'men' | 'women'>('women');

  if (!step) return null;

  const GARMENT_TYPES = gender === 'women'
    ? ['Tops', 'Dresses', 'Skirts', 'Pants', 'Jumpsuits', 'Sets']
    : ['Kaftan', 'Agbada', 'Pants', 'Shirts', 'Suits', 'Sets'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div
        className="relative w-full animate-fade-in"
        style={{ maxWidth: '440px', margin: '20px', borderRadius: '24px', background: '#FFFFFF', boxShadow: '0 24px 80px rgba(0,0,0,0.15)', overflow: 'hidden' }}
      >
        {/* Close */}
        <button
          onClick={() => setStep(null)}
          className="absolute top-4 right-4 z-10 flex items-center justify-center transition-all hover:bg-gray-100 active:scale-90"
          style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.08)', background: '#FFF', cursor: 'pointer' }}
        >
          <X size={14} color="#666" />
        </button>

        <div style={{ padding: '32px 28px' }}>
          {/* ─── Step 1: Start Journey ─── */}
          {step === 'start' && (
            <div className="flex flex-col" style={{ gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#1A1A1A', textTransform: 'uppercase', lineHeight: 1.2 }}>
                  Start Your Bespoke<br />Journey
                </h3>
                <p style={{ fontSize: '13px', color: '#888', marginTop: '8px', lineHeight: 1.6 }}>
                  Use pictures of an existing product or design from scratch
                </p>
              </div>

              {/* Options */}
              <div className="flex flex-col" style={{ gap: '10px' }}>
                <button
                  onClick={() => setDesignMethod('reference')}
                  className="w-full flex items-center justify-between transition-all"
                  style={{ padding: '16px 20px', borderRadius: '16px', background: designMethod === 'reference' ? '#F9F6F1' : '#F9F9F9', border: designMethod === 'reference' ? '1.5px solid #2C1810' : '1.5px solid transparent', cursor: 'pointer' }}
                >
                  <div className="flex items-center" style={{ gap: '14px' }}>
                    <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(139,90,43,0.08)' }}>
                      <Upload size={16} color="#8B5A2B" />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Upload Reference</span>
                  </div>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: designMethod === 'reference' ? '5px solid #2C1810' : '2px solid #CCC' }} />
                </button>

                <button
                  onClick={() => setDesignMethod('scratch')}
                  className="w-full flex items-center justify-between transition-all"
                  style={{ padding: '16px 20px', borderRadius: '16px', background: designMethod === 'scratch' ? '#F9F6F1' : '#F9F9F9', border: designMethod === 'scratch' ? '1.5px solid #2C1810' : '1.5px solid transparent', cursor: 'pointer' }}
                >
                  <div className="flex items-center" style={{ gap: '14px' }}>
                    <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(212,175,55,0.08)' }}>
                      <Sparkles size={16} color="#D4AF37" />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Start from Scratch</span>
                  </div>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: designMethod === 'scratch' ? '5px solid #2C1810' : '2px solid #CCC' }} />
                </button>
              </div>

              {/* Fabric usage info */}
              <div style={{ padding: '16px 18px', borderRadius: '14px', background: '#F9F7F4' }}>
                <div className="flex items-center" style={{ gap: '10px', marginBottom: '8px' }}>
                  <div className="flex items-center justify-center" style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(234,88,12,0.08)' }}>
                    <Scissors size={12} color="#EA580C" />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>Fabric Usage</span>
                </div>
                <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.6, marginBottom: '8px' }}>
                  We&apos;ll automatically calculate and apply the right amount of fabric you need for your custom or bespoke design.
                </p>
                <button className="flex items-center" style={{ gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1A1A1A' }}>Learn more</span>
                  <ArrowRight size={12} color="#1A1A1A" />
                </button>
              </div>

              <button
                onClick={() => setStep('name')}
                className="w-full transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ padding: '16px', borderRadius: '14px', background: '#2C1810', color: '#FFF', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', border: 'none', cursor: 'pointer' }}
              >
                Continue
              </button>
            </div>
          )}

          {/* ─── Step 2: Name Masterpiece ─── */}
          {step === 'name' && (
            <div className="flex flex-col" style={{ gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#1A1A1A', textTransform: 'uppercase', lineHeight: 1.2 }}>
                  Name Your<br />Masterpiece
                </h3>
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
                  Style Name
                </label>
                <input
                  type="text"
                  value={styleName}
                  onChange={(e) => setStyleName(e.target.value)}
                  placeholder="e.g. My Wedding Agbada"
                  style={{ width: '100%', fontSize: '15px', fontWeight: 600, color: '#1A1A1A', background: 'none', border: 'none', borderBottom: '1.5px solid #E5E5E5', outline: 'none', padding: '10px 0' }}
                />
              </div>

              {/* Fabric usage info */}
              <div style={{ padding: '16px 18px', borderRadius: '14px', background: '#F9F7F4' }}>
                <div className="flex items-center" style={{ gap: '10px', marginBottom: '8px' }}>
                  <div className="flex items-center justify-center" style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(234,88,12,0.08)' }}>
                    <Scissors size={12} color="#EA580C" />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>Fabric Usage</span>
                </div>
                <p style={{ fontSize: '12px', color: '#888', lineHeight: 1.6 }}>
                  We&apos;ll automatically calculate and apply the right amount of fabric you need for your custom or bespoke design.
                </p>
              </div>

              <button
                onClick={() => setStep('category')}
                className="transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ padding: '16px', borderRadius: '14px', background: '#2C1810', color: '#FFF', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', border: 'none', cursor: 'pointer', maxWidth: '320px', margin: '0 auto', width: '100%' }}
              >
                Continue
              </button>
            </div>
          )}

          {/* ─── Step 3: Category / Garment Type ─── */}
          {step === 'category' && (
            <div className="flex flex-col" style={{ gap: '24px' }}>
              <div className="text-center">
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#1A1A1A', textTransform: 'uppercase', lineHeight: 1.2 }}>
                  Create Your Masterpiece
                </h3>
                {/* Gender toggle */}
                <div className="flex items-center justify-center" style={{ gap: '16px', marginTop: '12px' }}>
                  <button onClick={() => setGender('men')} style={{ fontSize: '12px', fontWeight: gender === 'men' ? 800 : 500, color: gender === 'men' ? '#1A1A1A' : '#999', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', borderBottom: gender === 'men' ? '2px solid #1A1A1A' : '2px solid transparent', padding: '4px 0' }}>
                    Men
                  </button>
                  <button onClick={() => setGender('women')} style={{ fontSize: '12px', fontWeight: gender === 'women' ? 800 : 500, color: gender === 'women' ? '#1A1A1A' : '#999', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', borderBottom: gender === 'women' ? '2px solid #1A1A1A' : '2px solid transparent', padding: '4px 0' }}>
                    Women
                  </button>
                </div>
              </div>

              {/* Garment grid */}
              <div className="grid grid-cols-3 gap-3">
                {GARMENT_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedCategory(type)}
                    className="flex flex-col items-center transition-all"
                    style={{
                      padding: '16px 8px',
                      borderRadius: '16px',
                      background: selectedCategory === type ? 'rgba(107,114,128,0.12)' : '#F9F9F9',
                      border: selectedCategory === type ? '2px solid #1A1A1A' : '2px solid transparent',
                      cursor: 'pointer',
                      gap: '8px',
                    }}
                  >
                    <Scissors size={24} color={selectedCategory === type ? '#1A1A1A' : '#999'} />
                    <span style={{ fontSize: '10px', fontWeight: 700, color: selectedCategory === type ? '#1A1A1A' : '#666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{type}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setStep(null);
                  const name = encodeURIComponent(styleName || 'Untitled Design');
                  router.push(`/bespoke/studio?name=${name}&type=${selectedCategory}&gender=${gender}`);
                }}
                className="w-full transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ padding: '16px', borderRadius: '14px', background: '#2C1810', color: '#FFF', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', border: 'none', cursor: 'pointer' }}
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════
function BespokeContent() {
  const { wishlist, toggleWishlist } = useApp();

  // Page tabs
  const [activeTab, setActiveTab] = useState<'designs' | 'templates' | 'community' | 'quotes'>('designs');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalStep, setModalStep] = useState<ModalStep>(null);

  // Filter designs
  const filteredDesigns = DEMO_DESIGNS.filter((d) => {
    const matchCat = activeCategory === 'All' || d.category === activeCategory;
    const matchSearch = !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col py-4 lg:py-6 animate-fade-in" style={{ gap: '28px' }}>

      {/* ─── Page Header ─── */}
      <h1
        className="text-center font-display font-extrabold uppercase tracking-[0.12em] text-[#1A1A1A]"
        style={{ fontSize: '22px' }}
      >
        Bespoke
      </h1>

      {/* ─── Top Navigation Tabs ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ gap: '12px' }}>
        <div className="flex items-center overflow-x-auto no-scrollbar" style={{ gap: '2px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {(['designs', 'templates', 'community', 'quotes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="transition-all flex-shrink-0"
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: activeTab === tab ? 800 : 600,
                color: activeTab === tab ? '#1A1A1A' : '#999',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                background: activeTab === tab ? 'rgba(44,24,16,0.06)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* New Design button */}
        <button
          onClick={() => setModalStep('start')}
          className="flex items-center transition-all hover:opacity-90 active:scale-[0.98] w-full sm:w-auto justify-center sm:justify-start"
          style={{ padding: '10px 20px', borderRadius: '10px', background: '#2C1810', color: '#FFF', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', border: 'none', cursor: 'pointer', gap: '6px' }}
        >
          <Plus size={14} />
          New Design
        </button>
      </div>

      {/* ═══ DESIGNS TAB ═══ */}
      {activeTab === 'designs' && (
        <div className="flex flex-col animate-fade-in" style={{ gap: '24px' }}>
          {/* Search + filter */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center" style={{ gap: '12px' }}>
            <div className="flex items-center w-full lg:w-auto" style={{ padding: '5px 14px', borderRadius: '100px', background: '#F5F5F5', gap: '8px', maxWidth: '300px' }}>
              <Search size={14} color="#999" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bespoke"
                className="flex-1 bg-transparent border-none outline-none"
                style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A', background: 'transparent', border: 'none', outline: 'none' }}
              />
            </div>

            {/* Category chips */}
            <div className="flex items-center overflow-x-auto no-scrollbar w-full" style={{ gap: '8px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="transition-all"
                  style={{
                    height: '36px',
                    padding: '0 16px',
                    borderRadius: '100px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: activeCategory === cat ? '#FFFFFF' : '#1A1A1A',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background: activeCategory === cat ? '#1A1A1A' : '#F4F4F4',
                    border: 'none',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Designs Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(214px,1fr))] gap-3 lg:gap-6">
            {filteredDesigns.map((design) => {
              const statusStyle = STATUS_COLORS[design.status];
              return (
                <div key={design.id} className="group flex flex-col cursor-pointer transition-transform hover:-translate-y-1" style={{ gap: '8px' }}>
                  <div className="relative overflow-hidden bg-[#F7F7F7]" style={{ aspectRatio: '214/264', borderRadius: '20px' }}>
                    <Image src={design.image} alt={design.name} fill style={{ objectFit: 'cover' }} className="transition-transform duration-700 group-hover:scale-105" />
                    {/* Status badge */}
                    <div
                      className="absolute"
                      style={{ top: '10px', left: '10px', padding: '4px 10px', borderRadius: '6px', fontSize: '9px', fontWeight: 700, background: statusStyle.bg, color: statusStyle.text }}
                    >
                      {design.status}
                    </div>
                    {/* Action buttons */}
                    <div className="absolute bottom-3 right-3 flex flex-col" style={{ gap: '6px' }}>
                      <button
                        className="flex items-center justify-center transition-all hover:scale-110"
                        style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer' }}
                      >
                        <Eye size={16} color="#FFF" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(design.id); }}
                        className="flex items-center justify-center transition-all hover:scale-110"
                        style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer' }}
                      >
                        <Heart size={16} color="#FFF" fill={wishlist.includes(design.id) ? '#FFF' : 'none'} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A', marginBottom: '2px' }}>{design.name}</p>
                    <p style={{ fontSize: '11px', color: '#999' }}>{design.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ TEMPLATES TAB ═══ */}
      {activeTab === 'templates' && (
        <div className="flex flex-col animate-fade-in" style={{ gap: '28px' }}>
          {/* Featured template hero */}
          <div
            className="relative overflow-hidden flex flex-col justify-end"
            style={{ borderRadius: '20px', padding: '24px 20px', minHeight: '160px', background: 'linear-gradient(135deg, #2C1810 0%, #462814 100%)' }}
          >
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(212,175,55,0.06)' }} />
            <Layout size={28} color="rgba(212,175,55,0.4)" style={{ marginBottom: '10px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF', textTransform: 'uppercase', lineHeight: 1.2, marginBottom: '4px' }}>
              Design Templates
            </h3>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', maxWidth: '400px', lineHeight: 1.5 }}>
              Start with a professionally crafted template. Customize fabric, fit, and finishing to make it uniquely yours.
            </p>
          </div>

          {/* Template grid */}
          <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(214px,1fr))] gap-3 lg:gap-6">
            {TEMPLATES.map((t) => (
              <div key={t.id} className="group flex flex-col cursor-pointer transition-transform hover:-translate-y-1" style={{ gap: '8px' }}>
                <div className="relative overflow-hidden bg-[#F7F7F7]" style={{ aspectRatio: '214/264', borderRadius: '20px' }}>
                  <Image src={t.image} alt={t.name} fill style={{ objectFit: 'cover' }} className="transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end" style={{ padding: '10px' }}>
                    <button
                      className="w-full transition-all active:scale-[0.98]"
                      style={{ padding: '10px', borderRadius: '10px', background: '#FFFFFF', color: '#1A1A1A', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', border: 'none', cursor: 'pointer' }}
                    >
                      Use Template
                    </button>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>{t.name}</p>
                  <div className="flex items-center" style={{ gap: '4px', marginTop: '2px' }}>
                    <TrendingUp size={12} color="#10B981" />
                    <span style={{ fontSize: '11px', color: '#888' }}>{t.uses.toLocaleString()} uses</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ COMMUNITY TAB ═══ */}
      {activeTab === 'community' && (
        <div className="flex flex-col animate-fade-in" style={{ gap: '28px' }}>
          {/* Community hero */}
          <div
            className="relative overflow-hidden flex flex-col justify-end"
            style={{ borderRadius: '20px', padding: '24px 20px', minHeight: '160px', background: 'linear-gradient(135deg, #0F4C3A 0%, #1A7A5E 100%)' }}
          >
            <div style={{ position: 'absolute', top: '-30px', right: '-10px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
            <Users size={28} color="rgba(255,255,255,0.4)" style={{ marginBottom: '10px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF', textTransform: 'uppercase', lineHeight: 1.2, marginBottom: '4px' }}>
              Community Showcase
            </h3>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', maxWidth: '400px', lineHeight: 1.5 }}>
              Get inspired by what other designers and customers are creating. Share your own bespoke creations.
            </p>
          </div>

          {/* Pinterest-style grid */}
          <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(214px,1fr))] gap-3 lg:gap-6">
            {COMMUNITY.map((item) => (
              <div key={item.id} className="group flex flex-col cursor-pointer transition-transform hover:-translate-y-1" style={{ gap: '8px' }}>
                <div className="relative overflow-hidden bg-[#F7F7F7]" style={{ aspectRatio: '214/264', borderRadius: '20px' }}>
                  <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} className="transition-transform duration-700 group-hover:scale-105" />
                  {/* Like overlay */}
                  <div className="absolute bottom-3 left-3 flex items-center" style={{ gap: '6px', padding: '6px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
                    <Heart size={16} color="#FFF" fill="#FFF" />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFF' }}>{item.likes}</span>
                  </div>
                </div>
                <div className="flex items-center" style={{ gap: '6px' }}>
                  <span style={{ fontSize: '13px' }}>{item.avatar}</span>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>{item.name}</p>
                    <p style={{ fontSize: '11px', color: '#888' }}>by {item.designer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ QUOTES TAB ═══ */}
      {activeTab === 'quotes' && (
        <div className="flex flex-col animate-fade-in" style={{ gap: '20px' }}>
          {/* Quotes header */}
          <div
            className="flex items-center justify-between"
            style={{ padding: '24px 20px', borderRadius: '20px', background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)' }}
          >
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Your Quotes
              </h3>
              <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                {DEMO_QUOTES.length} quote{DEMO_QUOTES.length !== 1 ? 's' : ''} from vendors
              </p>
            </div>
            <div className="flex items-center justify-center" style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(212,175,55,0.08)' }}>
              <Quote size={18} color="#D4AF37" />
            </div>
          </div>

          {/* Quote list */}
          <div className="flex flex-col" style={{ gap: '0' }}>
            {DEMO_QUOTES.map((q, idx) => {
              const status = QUOTE_STATUS_MAP[q.status];
              const isFirst = idx === 0;
              const isLast = idx === DEMO_QUOTES.length - 1;
              return (
                <div
                  key={q.id}
                  className="flex items-center justify-between transition-all hover:bg-gray-50"
                  style={{
                    padding: '18px 20px',
                    borderRadius: isFirst ? '16px 16px 0 0' : isLast ? '0 0 16px 16px' : '0',
                    border: '1px solid rgba(0,0,0,0.06)',
                    borderTop: isFirst ? undefined : 'none',
                    background: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', marginBottom: '4px' }}>{q.vendor}</p>
                    <div className="flex items-center" style={{ gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#888' }}>{q.items} item{q.items > 1 ? 's' : ''}</span>
                      <span style={{ fontSize: '11px', color: '#888' }}>·</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#1A1A1A' }}>{q.total}</span>
                      <span style={{ fontSize: '11px', color: '#888' }}>·</span>
                      <span style={{ fontSize: '11px', color: '#888' }}>{q.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center" style={{ gap: '10px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', background: status.bg, color: status.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {status.label}
                    </span>
                    <ChevronRight size={16} color="#CCC" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Modal ─── */}
      <NewDesignModal step={modalStep} setStep={setModalStep} />
    </div>
  );
}

// ─── Page Export ──────────────────────────────────────────────
export default function BespokePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <span className="w-8 h-8 rounded-full border-2 border-[#2C1810]/20 border-t-[#2C1810] animate-spin"></span>
      </div>
    }>
      <BespokeContent />
    </Suspense>
  );
}
