'use client';

import React, { useState, useRef, Suspense } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useBespokeDesigns } from '@/hooks/useBespokeDesigns';
import { DesignQuotesModal } from '@/components/studio/DesignQuotesModal';
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
  Loader2,
  ImagePlus,
} from 'lucide-react';
import { TokenIcon } from '@/components/icons/TokenIcon';
import { api } from '@/lib/api';
import { useUpload } from '@/hooks/useUpload';
import { pollJobStatus } from '@/lib/pollJobStatus';

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
type ModalStep = null | 'start' | 'name' | 'category' | 'upload';

const REFERENCE_ANALYSIS_COST = 15; // tokens

function NewDesignModal({ step, setStep }: { step: ModalStep; setStep: (s: ModalStep) => void }) {
  const router = useRouter();
  const [designMethod, setDesignMethod] = useState<'reference' | 'scratch'>('reference');
  const [styleName, setStyleName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Dresses');
  const [gender, setGender] = useState<'men' | 'women'>('women');
  const refFileInput = useRef<HTMLInputElement | null>(null);
  const { uploadOutfitImages } = useUpload();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  if (!step || typeof document === 'undefined') return null;

  const GARMENT_TYPES = gender === 'women'
    ? ['Tops', 'Dresses', 'Skirts', 'Pants', 'Jumpsuits', 'Sets']
    : ['Kaftan', 'Agbada', 'Pants', 'Shirts', 'Suits', 'Sets'];

  // ─── Shared step content (used in both mobile + desktop) ───
  const stepContent = (
    <>
      {step === 'start' && (
        <div className="flex flex-col" style={{ gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', lineHeight: 1.2 }}>
              Start Your Bespoke<br />Journey
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.6 }}>
              Use pictures of an existing product or design from scratch
            </p>
          </div>
          <div className="flex flex-col" style={{ gap: '10px' }}>
            <button
              onClick={() => setDesignMethod('reference')}
              className="w-full flex items-center justify-between transition-all"
              style={{ padding: '16px 20px', borderRadius: '16px', background: designMethod === 'reference' ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-elevated)', border: designMethod === 'reference' ? '1.5px solid var(--brand-fill)' : '1.5px solid transparent', cursor: 'pointer' }}
            >
              <div className="flex items-center" style={{ gap: '14px' }}>
                <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(139,90,43,0.08)' }}>
                  <Upload size={16} color="var(--brand-brown)" />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Upload Reference</span>
                <span className="inline-flex items-center" style={{ fontSize: '9px', fontWeight: 700, color: '#D4AF37', background: 'rgba(212,175,55,0.12)', padding: '2px 8px', borderRadius: '6px', marginLeft: '6px', gap: '3px' }}><TokenIcon size={10} color="#D4AF37" /> {REFERENCE_ANALYSIS_COST}</span>
              </div>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: designMethod === 'reference' ? '5px solid var(--brand-fill)' : '2px solid var(--border-glass)' }} />
            </button>
            <button
              onClick={() => setDesignMethod('scratch')}
              className="w-full flex items-center justify-between transition-all"
              style={{ padding: '16px 20px', borderRadius: '16px', background: designMethod === 'scratch' ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-elevated)', border: designMethod === 'scratch' ? '1.5px solid var(--brand-fill)' : '1.5px solid transparent', cursor: 'pointer' }}
            >
              <div className="flex items-center" style={{ gap: '14px' }}>
                <div className="flex items-center justify-center" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(212,175,55,0.08)' }}>
                  <Sparkles size={16} color="#D4AF37" />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Start from Scratch</span>
              </div>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: designMethod === 'scratch' ? '5px solid var(--brand-fill)' : '2px solid var(--border-glass)' }} />
            </button>
          </div>
          <div style={{ padding: '16px 18px', borderRadius: '14px', background: 'var(--bg-surface-elevated)' }}>
            <div className="flex items-center" style={{ gap: '10px', marginBottom: '8px' }}>
              <div className="flex items-center justify-center" style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(234,88,12,0.08)' }}>
                <Scissors size={12} color="#EA580C" />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Fabric Usage</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '8px' }}>
              We&apos;ll automatically calculate and apply the right amount of fabric you need for your custom or bespoke design.
            </p>
            <button className="flex items-center" style={{ gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Learn more</span>
              <ArrowRight size={12} color="var(--text-primary)" />
            </button>
          </div>
          <button
            onClick={() => setStep('name')}
            className="w-full transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ padding: '16px', borderRadius: '14px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', border: 'none', cursor: 'pointer' }}
          >
            Continue
          </button>
        </div>
      )}

      {step === 'name' && (
        <div className="flex flex-col" style={{ gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', lineHeight: 1.2 }}>
              Name Your<br />Masterpiece
            </h3>
          </div>
          <div>
            <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
              Style Name
            </label>
            <input
              type="text"
              value={styleName}
              onChange={(e) => setStyleName(e.target.value)}
              placeholder="e.g. My Wedding Agbada"
              style={{ width: '100%', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', background: 'none', border: 'none', borderBottom: '1.5px solid var(--border-glass)', outline: 'none', padding: '10px 0' }}
            />
          </div>
          <div style={{ padding: '16px 18px', borderRadius: '14px', background: 'var(--bg-surface-elevated)' }}>
            <div className="flex items-center" style={{ gap: '10px', marginBottom: '8px' }}>
              <div className="flex items-center justify-center" style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(234,88,12,0.08)' }}>
                <Scissors size={12} color="#EA580C" />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Fabric Usage</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              We&apos;ll automatically calculate and apply the right amount of fabric you need for your custom or bespoke design.
            </p>
          </div>
          <button
            onClick={() => setStep('category')}
            className="transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ padding: '16px', borderRadius: '14px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', border: 'none', cursor: 'pointer', maxWidth: '320px', margin: '0 auto', width: '100%' }}
          >
            Continue
          </button>
        </div>
      )}

      {step === 'category' && (
        <div className="flex flex-col" style={{ gap: '24px' }}>
          <div className="text-center">
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', lineHeight: 1.2 }}>
              Create Your Masterpiece
            </h3>
            <div className="flex items-center justify-center" style={{ gap: '16px', marginTop: '12px' }}>
              <button onClick={() => setGender('men')} style={{ fontSize: '12px', fontWeight: gender === 'men' ? 800 : 500, color: gender === 'men' ? 'var(--text-primary)' : 'var(--text-muted)', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', borderBottom: gender === 'men' ? '2px solid var(--text-primary)' : '2px solid transparent', padding: '4px 0' }}>
                Men
              </button>
              <button onClick={() => setGender('women')} style={{ fontSize: '12px', fontWeight: gender === 'women' ? 800 : 500, color: gender === 'women' ? 'var(--text-primary)' : 'var(--text-muted)', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', borderBottom: gender === 'women' ? '2px solid var(--text-primary)' : '2px solid transparent', padding: '4px 0' }}>
                Women
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {GARMENT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedCategory(type)}
                className="flex flex-col items-center transition-all"
                style={{
                  padding: '16px 8px', borderRadius: '16px',
                  background: selectedCategory === type ? 'rgba(107,114,128,0.12)' : 'var(--bg-surface-elevated)',
                  border: selectedCategory === type ? '2px solid var(--text-primary)' : '2px solid transparent',
                  cursor: 'pointer', gap: '8px',
                }}
              >
                <Scissors size={24} color={selectedCategory === type ? 'var(--text-primary)' : 'var(--text-muted)'} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: selectedCategory === type ? 'var(--text-primary)' : 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{type}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setStep(null);
              const name = encodeURIComponent(styleName || 'Untitled Design');
              if (designMethod === 'reference') {
                router.push(`/bespoke/studio?name=${name}&type=${selectedCategory}&gender=${gender}&method=reference`);
              } else {
                router.push(`/bespoke/studio?name=${name}&type=${selectedCategory}&gender=${gender}`);
              }
            }}
            className="w-full transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ padding: '16px', borderRadius: '14px', background: 'var(--brand-fill)', color: 'var(--brand-fill-text)', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', border: 'none', cursor: 'pointer' }}
          >
            Get Started
          </button>
        </div>
      )}
    </>
  );

  return createPortal(
    <>
      {/* ═══ MOBILE: Bottom Sheet ═══ */}
      <div className="lg:hidden">
        <div
          className="fixed inset-0 z-[100] bg-black/40 animate-fade-in"
          onClick={() => setStep(null)}
        />
        <div
          className="fixed left-3 right-3 bottom-3 z-[101] bg-[var(--bg-base)] rounded-[24px] flex flex-col"
          style={{ maxHeight: '85vh', boxShadow: '0 -4px 40px rgba(0,0,0,0.12), 0 8px 30px rgba(0,0,0,0.1)', animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)' }}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: 'var(--drag-handle)' }} />
          </div>
          <div className="flex-1 overflow-y-auto hide-scrollbar relative" style={{ padding: '20px 24px 24px' }}>
            <button
              onClick={() => setStep(null)}
              className="absolute top-0 right-0 z-10 flex items-center justify-center transition-all hover:bg-[var(--bg-surface-elevated)] active:scale-90"
              style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.08)', background: 'var(--bg-base)', cursor: 'pointer' }}
            >
              <X size={14} color="var(--text-secondary)" />
            </button>
            {stepContent}
          </div>
        </div>
      </div>

      {/* ═══ DESKTOP: Centered Modal ═══ */}
      <div className="hidden lg:flex fixed inset-0 z-[100] items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
        <div
          className="relative w-full animate-fade-in"
          style={{ maxWidth: '440px', margin: '20px', borderRadius: '24px', background: 'var(--bg-base)', boxShadow: '0 24px 80px rgba(0,0,0,0.15)', overflow: 'hidden' }}
        >
          <button
            onClick={() => setStep(null)}
            className="absolute top-4 right-4 z-10 flex items-center justify-center transition-all hover:bg-[var(--bg-surface-elevated)] active:scale-90"
            style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.08)', background: 'var(--bg-base)', cursor: 'pointer' }}
          >
            <X size={14} color="var(--text-secondary)" />
          </button>
          <div style={{ padding: '32px 28px' }}>
            {stepContent}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════
function BespokeContent() {
  const { wishlist, toggleWishlist, user } = useApp();
  const router = useRouter();
  const { designs: backendDesigns, isLoading: designsLoading, cancelDesign } = useBespokeDesigns();

  // Page tabs
  const [activeTab, setActiveTab] = useState<'designs' | 'templates' | 'community' | 'quotes'>('designs');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalStep, setModalStep] = useState<ModalStep>(null);
  const [quotesDesignId, setQuotesDesignId] = useState<string | null>(null);

  // Map backend designs to display format
  const STATUS_MAP: Record<string, DesignStatus> = {
    draft: 'Draft',
    requesting_quotes: 'Awaiting Price',
    quoting: 'Awaiting Price',
    quoted: 'Price Ready!',
    accepted: 'In Progress...',
    in_progress: 'In Progress...',
    in_production: 'In Progress...',
    completed: 'Outfit Ready!',
    cancelled: 'Draft',
  };

  const mappedDesigns: typeof DEMO_DESIGNS = backendDesigns.map((d) => ({
    id: d._id,
    image: d.design_images?.[0] || '/image/bespoke-agbada-green.webp',
    name: d.name,
    status: STATUS_MAP[d.status] || 'Draft',
    date: new Date(d.createdAt || d.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    category: d.category || 'Design',
  }));

  // Use backend designs only — no dummy fallback
  const displayDesigns = mappedDesigns;

  // Filter designs
  const filteredDesigns = displayDesigns.filter((d) => {
    const matchCat = activeCategory === 'All' || d.category === activeCategory;
    const matchSearch = !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col py-4 lg:py-6 animate-fade-in" style={{ gap: '28px' }}>

      {/* ─── Page Header ─── */}
      <h1
        className="text-left lg:text-center font-display font-extrabold uppercase tracking-[0.12em] text-[var(--text-primary)]"
        style={{ fontSize: '22px' }}
      >
        Bespoke
      </h1>

      {/* ─── Top Navigation Tabs (underline style) ─── */}
      <div className="flex items-end" style={{ gap: '16px' }}>
        {/* Tab rail — full-width bottom rule; active tab's border sits on it */}
        <div
          className="flex-1 min-w-0 overflow-x-auto overflow-y-hidden no-scrollbar"
          style={{ borderBottom: '1px solid var(--border-glass)', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex" style={{ gap: '24px', marginBottom: '-1px' }}>
            {([
              { id: 'designs', label: 'Designs', Icon: Scissors },
              { id: 'templates', label: 'Templates', Icon: Layout },
              { id: 'community', label: 'Community', Icon: Users },
              { id: 'quotes', label: 'Quotes', Icon: Quote },
            ] as const).map(({ id, label, Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className="flex items-center flex-shrink-0 transition-colors"
                  style={{
                    gap: '7px',
                    padding: '0 2px 10px',
                    fontSize: '13px',
                    fontWeight: active ? 700 : 500,
                    color: active ? 'var(--brand-brown)' : 'var(--text-muted)',
                    background: 'none',
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderBottom: active ? '2px solid var(--brand-brown)' : '2px solid transparent',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon size={15} strokeWidth={active ? 2.4 : 2} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ DESIGNS TAB ═══ */}
      {activeTab === 'designs' && (
        <div className="flex flex-col animate-fade-in" style={{ gap: '24px' }}>
          {!user ? (
            <div className="flex flex-col items-center justify-center text-center" style={{ padding: '60px 24px', gap: '20px' }}>
              <div
                className="flex items-center justify-center"
                style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(44,24,16,0.06)' }}
              >
                <AlertCircle size={32} color="var(--brand-brown)" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col" style={{ gap: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Sign In Required
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '400px' }}>
                  You must sign in first before being able to view, use, or create custom designs.
                  However, you can browse and open templates in the templates tab.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center" style={{ gap: '12px' }}>
                <Link
                  href="/auth/login"
                  className="flex items-center transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    padding: '14px 32px',
                    borderRadius: '100px',
                    background: 'var(--brand-fill)',
                    color: 'var(--brand-fill-text)',
                    fontSize: '12px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(44,24,16,0.2)',
                  }}
                >
                  Sign In
                </Link>
                <button
                  onClick={() => setActiveTab('templates')}
                  className="flex items-center transition-all hover:bg-[var(--bg-surface-elevated)] active:scale-[0.98]"
                  style={{
                    padding: '14px 32px',
                    borderRadius: '100px',
                    background: 'transparent',
                    color: 'var(--brand-brown)',
                    border: '1.5px solid var(--brand-brown)',
                    fontSize: '12px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    cursor: 'pointer',
                  }}
                >
                  Browse Templates
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Search + filter */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center" style={{ gap: '12px' }}>
                <div className="flex items-center w-full lg:w-auto" style={{ gap: '8px' }}>
                  <div className="flex items-center flex-1 lg:w-auto" style={{ padding: '3px 14px', borderRadius: '100px', background: 'var(--bg-surface-elevated)', gap: '8px', maxWidth: '300px' }}>
                    <Search size={14} color="var(--text-muted)" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search bespoke"
                      className="flex-1 bg-transparent border-none outline-none"
                      style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', background: 'transparent', border: 'none', outline: 'none' }}
                    />
                  </div>

                  {/* Mobile New Design button */}
                  <button
                    onClick={() => {
                      if (!user) {
                        router.push('/auth/login');
                      } else {
                        setModalStep('start');
                      }
                    }}
                    className="flex sm:hidden items-center justify-center transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'var(--brand-fill)',
                      color: 'var(--brand-fill-text)',
                      border: 'none',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <Plus size={22} />
                  </button>
                </div>

                {/* Category chips */}
                <div className="flex items-center overflow-x-auto no-scrollbar w-full lg:flex-1 lg:w-auto min-w-0" style={{ gap: '8px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
                        color: activeCategory === cat ? 'var(--bg-base)' : 'var(--text-primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        background: activeCategory === cat ? 'var(--text-primary)' : 'var(--bg-surface-elevated)',
                        border: 'none',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* New Design button (desktop) — on the search + filter line */}
                <button
                  onClick={() => {
                    if (!user) return;
                    setModalStep('start');
                  }}
                  disabled={!user}
                  className="hidden sm:flex items-center flex-shrink-0 transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    background: 'var(--brand-fill)',
                    color: 'var(--brand-fill-text)',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    border: 'none',
                    cursor: !user ? 'not-allowed' : 'pointer',
                    gap: '6px',
                    opacity: !user ? 0.4 : 1,
                  }}
                >
                  <Plus size={14} />
                  New Design
                </button>
              </div>

              {/* Loading Skeleton */}
              {designsLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(214px,1fr))] gap-3 lg:gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex flex-col animate-pulse" style={{ gap: '8px' }}>
                      <div style={{ aspectRatio: '214/264', borderRadius: '20px', background: 'var(--bg-surface-elevated)' }} />
                      <div style={{ height: '12px', width: '70%', borderRadius: '6px', background: 'var(--bg-surface-elevated)' }} />
                      <div style={{ height: '10px', width: '40%', borderRadius: '6px', background: 'var(--bg-surface-elevated)' }} />
                    </div>
                  ))}
                </div>
              ) : filteredDesigns.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center text-center" style={{ padding: '60px 24px', gap: '20px' }}>
                  <div
                    className="flex items-center justify-center"
                    style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(44,24,16,0.06), rgba(44,24,16,0.02))' }}
                  >
                    <Scissors size={32} color="var(--brand-brown)" strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col" style={{ gap: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      No designs yet
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '320px' }}>
                      Start creating your first custom outfit. Choose your style, fabric, and let AI generate your perfect design.
                    </p>
                  </div>
                  <button
                    onClick={() => setModalStep('start')}
                    className="flex items-center transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{
                      padding: '14px 32px',
                      borderRadius: '100px',
                      background: 'var(--brand-fill)',
                      color: 'var(--brand-fill-text)',
                      fontSize: '12px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      border: 'none',
                      cursor: 'pointer',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(44,24,16,0.2)',
                    }}
                  >
                    <Plus size={16} />
                    Start Your First Design
                  </button>
                </div>
              ) : (
                /* Designs Grid */
                <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(214px,1fr))] gap-3 lg:gap-6">
                  {filteredDesigns.map((design) => {
                    const statusStyle = STATUS_COLORS[design.status];
                    return (
                      <Link href={`/bespoke/studio?name=${encodeURIComponent(design.name)}&type=${encodeURIComponent(design.category)}&designId=${design.id}`} key={design.id} className="group flex flex-col cursor-pointer transition-transform hover:-translate-y-1" style={{ gap: '8px', textDecoration: 'none' }}>
                        <div className="relative overflow-hidden bg-[var(--bg-surface-elevated)]" style={{ aspectRatio: '214/264', borderRadius: '20px' }}>
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
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(design.id); }}
                              className="flex items-center justify-center transition-all hover:scale-110"
                              style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer' }}
                            >
                              <Heart size={16} color="#FFF" fill={wishlist.includes(design.id) ? '#FFF' : 'none'} />
                            </button>
                          </div>
                        </div>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{design.name}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{design.date}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
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
              <Link href={`/bespoke/studio?name=${encodeURIComponent(t.name)}&type=${encodeURIComponent(t.category)}`} key={t.id} className="group flex flex-col cursor-pointer transition-transform hover:-translate-y-1" style={{ gap: '8px', textDecoration: 'none' }}>
                <div className="relative overflow-hidden bg-[var(--bg-surface-elevated)]" style={{ aspectRatio: '214/264', borderRadius: '20px' }}>
                  <Image src={t.image} alt={t.name} fill style={{ objectFit: 'cover' }} className="transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end" style={{ padding: '10px' }}>
                    <span
                      className="w-full flex items-center justify-center transition-all"
                      style={{ padding: '10px', borderRadius: '10px', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}
                    >
                      Use Template
                    </span>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{t.name}</p>
                  <div className="flex items-center" style={{ gap: '4px', marginTop: '2px' }}>
                    <TrendingUp size={12} color="#10B981" />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.uses.toLocaleString()} uses</span>
                  </div>
                </div>
              </Link>
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
              <Link href={`/bespoke/studio?name=${encodeURIComponent(item.name)}`} key={item.id} className="group flex flex-col cursor-pointer transition-transform hover:-translate-y-1" style={{ gap: '8px', textDecoration: 'none' }}>
                <div className="relative overflow-hidden bg-[var(--bg-surface-elevated)]" style={{ aspectRatio: '214/264', borderRadius: '20px' }}>
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
                    <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>by {item.designer}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ═══ QUOTES TAB ═══ */}
      {activeTab === 'quotes' && (
        <div className="flex flex-col animate-fade-in" style={{ gap: '20px' }}>
          {!user ? (
            <div className="flex flex-col items-center justify-center text-center" style={{ padding: '60px 24px', gap: '20px' }}>
              <div
                className="flex items-center justify-center"
                style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(44,24,16,0.06)' }}
              >
                <AlertCircle size={32} color="var(--brand-brown)" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col" style={{ gap: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Sign In Required
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '400px' }}>
                  You must sign in first before being able to view or manage your quotes.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="flex items-center transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  padding: '14px 32px',
                  borderRadius: '100px',
                  background: 'var(--brand-fill)',
                  color: 'var(--brand-fill-text)',
                  fontSize: '12px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(44,24,16,0.2)',
                  width: 'fit-content',
                  margin: '0 auto',
                }}
              >
                Sign In
              </Link>
            </div>
          ) : (
            <>
              {(() => {
                // Designs that have been sent out for quotes.
                const quotedDesigns = backendDesigns.filter((d) =>
                  ['quoting', 'requesting_quotes', 'quoted', 'accepted', 'in_progress', 'in_production', 'completed'].includes(
                    (d.status as string) || '',
                  ),
                );
                const statusLabel: Record<string, { text: string; bg: string; color: string }> = {
                  requesting_quotes: { text: 'Awaiting quotes', bg: 'rgba(245,158,11,0.1)', color: '#D97706' },
                  quoting: { text: 'Awaiting quotes', bg: 'rgba(245,158,11,0.1)', color: '#D97706' },
                  quoted: { text: 'Quotes ready', bg: 'rgba(16,185,129,0.1)', color: '#059669' },
                  accepted: { text: 'Accepted', bg: 'rgba(59,130,246,0.1)', color: '#2563EB' },
                  in_progress: { text: 'In production', bg: 'rgba(59,130,246,0.1)', color: '#2563EB' },
                  in_production: { text: 'In production', bg: 'rgba(59,130,246,0.1)', color: '#2563EB' },
                  completed: { text: 'Completed', bg: 'rgba(16,185,129,0.1)', color: '#059669' },
                };
                return (
                  <>
                    {/* Quotes header */}
                    <div
                      className="flex items-center justify-between"
                      style={{ padding: '24px 20px', borderRadius: '20px', background: 'var(--bg-base)', border: '1px solid rgba(0,0,0,0.06)' }}
                    >
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Your Quotes
                        </h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {quotedDesigns.length} design{quotedDesigns.length !== 1 ? 's' : ''} out for quotes
                        </p>
                      </div>
                      <div className="flex items-center justify-center" style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(212,175,55,0.08)' }}>
                        <Quote size={18} color="#D4AF37" />
                      </div>
                    </div>

                    {quotedDesigns.length === 0 ? (
                      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          No quote requests yet. Design an outfit and tap “Order Now” to request quotes from tailors.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col" style={{ gap: '0' }}>
                        {quotedDesigns.map((d, idx) => {
                          const s = statusLabel[(d.status as string) || ''] ?? { text: d.status, bg: 'rgba(0,0,0,0.05)', color: 'var(--text-secondary)' };
                          const isFirst = idx === 0;
                          const isLast = idx === quotedDesigns.length - 1;
                          return (
                            <button
                              key={d._id}
                              onClick={() => setQuotesDesignId(d._id)}
                              className="flex items-center justify-between transition-all hover:bg-[var(--bg-surface-elevated)]"
                              style={{
                                padding: '16px 20px', textAlign: 'left',
                                borderRadius: isFirst ? '16px 16px 0 0' : isLast ? '0 0 16px 16px' : '0',
                                border: '1px solid rgba(0,0,0,0.06)',
                                borderTop: isFirst ? undefined : 'none',
                                background: 'var(--bg-base)', cursor: 'pointer', width: '100%',
                              }}
                            >
                              <div className="flex items-center" style={{ gap: '12px' }}>
                                <div className="overflow-hidden" style={{ width: '44px', height: '52px', borderRadius: '10px', background: 'var(--bg-surface-elevated)', flexShrink: 0 }}>
                                  {d.design_images?.[0] && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={d.design_images[0]} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  )}
                                </div>
                                <div>
                                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{d.name}</p>
                                  <span style={{ fontSize: '9px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', background: s.bg, color: s.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    {s.text}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center" style={{ gap: '8px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>View quotes</span>
                                <ChevronRight size={16} color="var(--text-muted)" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          )}
        </div>
      )}

      {/* Design quotes modal (view + accept) */}
      <DesignQuotesModal
        isOpen={!!quotesDesignId}
        onClose={() => setQuotesDesignId(null)}
        designId={quotesDesignId}
      />

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
        <span className="w-8 h-8 rounded-full border-2 border-[var(--brand-fill)]/20 border-t-[var(--brand-fill)] animate-spin"></span>
      </div>
    }>
      <BespokeContent />
    </Suspense>
  );
}
