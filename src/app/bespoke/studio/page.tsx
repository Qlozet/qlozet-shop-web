'use client';

import React, { useState, useCallback, useRef, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  ArrowLeft,
  MessageSquare,
  Bookmark,
  Layers,
  FlipHorizontal,
  User,
  Trash2,
  Shirt,
  Scissors,
  Plus,
  Gem,
  Palette,
  ChevronDown,
  ChevronRight,
  Upload,
  X,
  RotateCcw,
  SlidersHorizontal,
  Check,
  ShoppingCart,
  Sparkles,
  Loader2,
  ImageIcon,
  Ruler,
  MoreVertical,
  ArrowDownUp,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
//  DATA — Style/Fabric/Accessory/Fit Options
// ═══════════════════════════════════════════════════════════════

interface StyleOption {
  id: string;
  label: string;
  emoji: string;
  extraCost?: number;
}

interface FabricOption {
  id: string;
  name: string;
  image: string;
  extraCost?: number;
}

interface AccessoryOption {
  id: string;
  name: string;
  emoji: string;
  extraCost?: number;
}

interface FitOption {
  id: string;
  label: string;
  desc: string;
}

// ── Silhouettes ─────────────────────────────────
const SILHOUETTES: StyleOption[] = [
  { id: 's1', label: 'Balanced & Timeless', emoji: '👗' },
  { id: 's2', label: 'A-Line Flare', emoji: '👘' },
  { id: 's3', label: 'Bodycon Fitted', emoji: '🩱' },
  { id: 's4', label: 'Empire Waist', emoji: '👚' },
  { id: 's5', label: 'Draped Wrap', emoji: '🧣', extraCost: 5000 },
  { id: 's6', label: 'Peplum Shape', emoji: '👙', extraCost: 5000 },
];

// ── Necklines ───────────────────────────────────
const NECKLINES: StyleOption[] = [
  { id: 'n1', label: 'V-Neck Classic', emoji: '👗' },
  { id: 'n2', label: 'Sweetheart', emoji: '💕' },
  { id: 'n3', label: 'Off-Shoulder', emoji: '👘' },
  { id: 'n4', label: 'High Neck', emoji: '🧣' },
  { id: 'n5', label: 'Boat Neck', emoji: '⛵' },
  { id: 'n6', label: 'Square Neck', emoji: '⬜' },
];

// ── Sleeves ─────────────────────────────────────
const SLEEVES: StyleOption[] = [
  { id: 'sl1', label: 'Puff Sleeve', emoji: '🎈' },
  { id: 'sl2', label: 'Bell Sleeve', emoji: '🔔' },
  { id: 'sl3', label: 'Cap Sleeve', emoji: '🧢' },
  { id: 'sl4', label: 'Long Fitted', emoji: '🧤' },
  { id: 'sl5', label: 'Sleeveless', emoji: '💪' },
  { id: 'sl6', label: 'Bishop Sleeve', emoji: '✝️', extraCost: 3000 },
];

// ── Fabrics ──────────────────────────────────────
const FABRICS: FabricOption[] = [
  { id: 'f1', name: 'Ankara Wax Print', image: '/image/fabric-swatch-1.jpg' },
  { id: 'f2', name: 'French Lace', image: '/image/fabric-swatch-2.jpg', extraCost: 8000 },
  { id: 'f3', name: 'Aso-Oke Weave', image: '/image/fabric-swatch-3.jpg', extraCost: 12000 },
  { id: 'f4', name: 'Cotton Poplin', image: '/image/cotton.jpeg' },
  { id: 'f5', name: 'Premium Silk', image: '/image/fabric-1.jpg', extraCost: 15000 },
  { id: 'f6', name: 'Leather Accent', image: '/image/leather.jpg', extraCost: 10000 },
];

const FABRIC_COLORS = [
  '#1B2A4A', '#8B4513', '#2C1810', '#D4AF37',
  '#800020', '#F5F0E8', '#3B5998', '#228B22',
  '#FF6347', '#4B0082', '#E8D5B7', '#1A1A1A',
];

// ── Accessories ─────────────────────────────────
const ACCESSORIES: AccessoryOption[] = [
  { id: 'a1', name: 'Gold Buttons', emoji: '🔘', extraCost: 2000 },
  { id: 'a2', name: 'Waist Belt', emoji: '🪢', extraCost: 3500 },
  { id: 'a3', name: 'Embroidery', emoji: '🧵', extraCost: 8000 },
  { id: 'a4', name: 'Beadwork', emoji: '📿', extraCost: 12000 },
  { id: 'a5', name: 'Sequin Detail', emoji: '✨', extraCost: 6000 },
  { id: 'a6', name: 'Lace Trim', emoji: '🎀', extraCost: 4000 },
];

// ── Fit Options ─────────────────────────────────
const FIT_OPTIONS: FitOption[] = [
  { id: 'fit1', label: 'Regular', desc: 'Standard comfortable fit' },
  { id: 'fit2', label: 'Slim Fit', desc: 'Tailored close to body' },
  { id: 'fit3', label: 'Relaxed', desc: 'Easy, slightly oversized' },
  { id: 'fit4', label: 'Oversized', desc: 'Deliberately loose & roomy' },
];

// ── Generated outfit pool ───────────────────────
const OUTFIT_POOL = [
  '/image/bespoke-dress-1.png',
  '/image/bespoke-dress-2.png',
  '/image/bespoke-outfit-2.png',
  '/image/bespoke-ankara-1.png',
  '/image/bespoke-kaftan-brown-1.png',
  '/image/bespoke-kaftan-brown-2.png',
  '/image/bespoke-kaftan-milk-1.png',
  '/image/bespoke-kaftan-milk-2.png',
  '/image/orange-bespoke-1.png',
  '/image/blue-bespoke-1.png',
  '/image/red-bespoke-1.png',
  '/image/black-bespoke-1.png',
  '/image/custom-outfit-1.png',
];

const GENERATION_COST = 42;

// ═══════════════════════════════════════════════════════════════
//  STUDIO CONTENT (uses useSearchParams)
// ═══════════════════════════════════════════════════════════════

function StudioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, deductTokens } = useApp();

  const designName = searchParams.get('name') || 'Untitled Design';
  const garmentType = searchParams.get('type') || 'Dresses';
  const gender = (searchParams.get('gender') as 'men' | 'women') || 'women';

  // ── State ───────────────────────────────────────────
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Selections
  const [selectedSilhouette, setSelectedSilhouette] = useState<string | null>('s1');
  const [selectedNeckline, setSelectedNeckline] = useState<string | null>('n1');
  const [selectedSleeve, setSelectedSleeve] = useState<string | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>('#1B2A4A');
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [selectedFit, setSelectedFit] = useState<string | null>('fit1');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);

  // Panel sections
  const [expandedSection, setExpandedSection] = useState<string>('styles');

  // Mobile bottom sheet drag state
  const [sheetHeight, setSheetHeight] = useState(35); // percentage of viewport
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true;
    dragStartY.current = e.touches[0].clientY;
    dragStartHeight.current = sheetHeight;
  }, [sheetHeight]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const deltaY = dragStartY.current - e.touches[0].clientY;
    const deltaPercent = (deltaY / window.innerHeight) * 100;
    const newHeight = Math.min(92, Math.max(20, dragStartHeight.current + deltaPercent));
    setSheetHeight(newHeight);
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    // Snap to nearest stop: 35% (collapsed), 60% (half), 92% (full)
    setSheetHeight(prev => {
      if (prev < 28) return 20;
      if (prev < 48) return 35;
      if (prev < 78) return 60;
      return 92;
    });
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const tokenBalance = user?.tokenBalance ?? 1000;

  // ── Handlers ────────────────────────────────────────

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? '' : section);
  };

  const toggleAccessory = (id: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setReferenceImages((prev) => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }, []);

  const removeReference = (index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    const success = deductTokens(GENERATION_COST);
    if (!success) return;

    setIsGenerating(true);

    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const randomImage = OUTFIT_POOL[Math.floor(Math.random() * OUTFIT_POOL.length)];
    setGeneratedImages((prev) => [...prev, randomImage]);
    setActiveImageIndex(generatedImages.length); // Select newly generated
    setIsGenerating(false);
  };

  const currentImage = generatedImages[activeImageIndex] ?? null;

  // ── Render ──────────────────────────────────────────
  return (
    <div 
      className="relative w-full h-full overflow-hidden flex flex-col lg:flex-row" 
      style={{ 
        backgroundColor: '#F9F9F9',
        backgroundImage: 'radial-gradient(#E5E5E5 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px',
        minHeight: 'calc(100vh - 130px)'
      }}
    >
      {/* ═══ FLOATING TOP HEADER (Desktop) ═══ */}
      {/* Left: Back + Title */}
      <div className="absolute top-6 left-6 z-40 hidden lg:flex items-center" style={{ gap: '14px' }}>
          <Link href="/bespoke" className="flex items-center justify-center transition-all hover:bg-white/80 backdrop-blur-md shadow-sm" style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.9)' }}>
            <ArrowLeft size={20} color="#1A1A1A" />
          </Link>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Bespoke Studio
            </p>
            <p className="truncate" style={{ fontSize: '13px', color: '#1A1A1A', fontWeight: 600, maxWidth: '200px' }}>
              {designName}
            </p>
          </div>
        </div>
      {/* Right: Action icons */}
      <div className="absolute top-6 right-6 z-40 hidden lg:flex items-center" style={{ gap: '12px' }}>
        {[
          { icon: MessageSquare, label: 'AI Chat', dot: true },
          { icon: Bookmark, label: 'Save' },
          { icon: Layers, label: 'Layers' },
          { icon: FlipHorizontal, label: 'Mirror' },
          { icon: User, label: 'Mannequin' },
          { icon: Trash2, label: 'Delete', color: '#EF4444' },
        ].map(({ icon: Icon, label, color, dot }, idx) => (
          <button
            key={label}
            title={label}
            className="relative flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
            style={{ width: '44px', height: '44px', borderRadius: '50%', border: 'none', background: '#FFFFFF', cursor: 'pointer' }}
          >
            <Icon size={18} color={color || '#1A1A1A'} />
            {dot && <div className="absolute top-0 right-0 w-[12px] h-[12px] rounded-full bg-[#FF2E63] border-2 border-white" />}
          </button>
        ))}
      </div>

      {/* ═══ FLOATING TOP HEADER (Mobile) ═══ */}
      <div className="absolute top-0 left-0 right-0 z-40 flex lg:hidden items-center justify-between bg-white border-b border-gray-100" style={{ height: '72px', padding: '0 20px' }}>
        {/* Left: Back + Title */}
        <div className="flex items-center" style={{ gap: '14px' }}>
          <Link href="/bespoke" className="flex items-center justify-center transition-all" style={{ width: '36px', height: '36px' }}>
            <ArrowLeft size={22} color="#1A1A1A" />
          </Link>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              DESIGN STUDIO
            </p>
            <p className="truncate" style={{ fontSize: '14px', color: '#1A1A1A', fontWeight: 600, maxWidth: '180px' }}>
              {designName}
            </p>
          </div>
        </div>

        {/* Right: Mobile Token Pill & 3-dots */}
        <div className="flex items-center" style={{ gap: '12px' }}>
          <div className="flex items-center rounded-full" style={{ background: '#FFF7E6', gap: '6px', border: '1px solid #F5E6C8', padding: '6px 12px' }}>
            <span style={{ fontSize: '13px' }}>🪙</span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#1A1A1A' }}>{tokenBalance}</span>
          </div>
          <button className="flex items-center justify-center" style={{ width: '36px', height: '36px' }}>
            <MoreVertical size={22} color="#1A1A1A" />
          </button>
        </div>
      </div>

      {/* ─── CANVAS (Background layer) ─── */}
      <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pt-[72px] pb-4 px-4 lg:pt-0 lg:pb-0 lg:px-0">
        
        {/* Mobile Card Wrapper (transparent - shows dotted bg) */}
        <div className="relative w-full h-full lg:w-full lg:h-full lg:max-w-none lg:max-h-none max-w-[500px] max-h-[800px] flex items-center justify-center lg:bg-transparent rounded-[32px] lg:rounded-none">
          
          {/* Mobile Order Now (Cart Icon) */}
          {(currentImage || referenceImages.length > 0) && !isGenerating && (
            <button className="absolute top-4 right-4 z-10 lg:hidden flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#065F46', border: 'none', cursor: 'pointer' }}>
              <ShoppingCart size={18} color="#FFF" />
            </button>
          )}

          {/* Canvas content */}
          {isGenerating ? (
            // Generating state
            <div className="flex flex-col items-center animate-pulse" style={{ gap: '16px' }}>
              <div className="flex items-center justify-center" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(124,58,237,0.08)' }}>
                <Loader2 size={32} color="#7C3AED" className="animate-spin" />
              </div>
              <div className="text-center">
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A' }}>Generating your outfit...</p>
                <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>This may take a moment</p>
              </div>
            </div>
          ) : currentImage ? (
            // Generated image
            <div className="relative animate-fade-in w-full h-full lg:max-w-[500px] lg:max-h-[90%]">
              <Image src={currentImage} alt="Generated outfit" fill style={{ objectFit: 'contain', padding: '16px' }} />
            </div>
          ) : (
            // Empty state
            <div className="flex flex-col items-center" style={{ gap: '16px' }}>
              <div className="relative w-[120px] h-[160px] opacity-20">
                <svg viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M80 10 L60 40 L40 40 L30 80 L25 140 L45 180 L80 190 L115 180 L135 140 L130 80 L120 40 L100 40 Z" stroke="#1A1A1A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M60 40 Q80 60 100 40" stroke="#1A1A1A" strokeWidth="4" />
                  <path d="M30 80 L25 140" stroke="#1A1A1A" strokeWidth="4" />
                  <path d="M130 80 L135 140" stroke="#1A1A1A" strokeWidth="4" />
                </svg>
              </div>
              <div className="text-center px-6">
                <p style={{ fontSize: '20px', fontWeight: 900, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>NO DESIGN YET?</p>
                <p style={{ fontSize: '13px', color: '#666', marginTop: '8px', lineHeight: 1.5, maxWidth: '280px' }}>
                  Select a style, fabric, and details — then tap Generate to preview your outfit.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── RIGHT PANEL & TOOLBAR (Floating) ─── */}
          <div className="absolute right-6 top-[90px] bottom-6 z-20 hidden lg:flex items-start gap-4">
            
            {/* ─── Floating Toolbar (Section Navigation & Selected Overview) ─── */}
            <div className="flex flex-col gap-4 mt-4 px-4 lg:px-6 overflow-y-auto hide-scrollbar items-center" style={{ paddingBottom: '20px', maxHeight: '100%' }}>
              
              {/* 1. Styles Capsule */}
              <div className="flex flex-col items-center bg-white rounded-[24px] shadow-sm border border-gray-100" style={{ gap: '8px', padding: '12px' }}>
                {[selectedSilhouette, selectedNeckline, selectedSleeve].filter(Boolean).map((styleId, idx) => (
                  <button
                    key={`style-${idx}`}
                    onClick={() => setExpandedSection('styles')}
                    className={`flex items-center justify-center transition-all hover:bg-gray-50 active:scale-95 overflow-hidden ${expandedSection === 'styles' ? 'bg-gray-100 ring-1 ring-gray-200' : ''}`}
                    style={{
                      width: '48px', height: '48px', borderRadius: '16px',
                      border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', position: 'relative'
                    }}
                    title="Styles"
                  >
                    <span style={{ fontSize: '28px' }}>
                      {SILHOUETTES.find(s => s.id === styleId)?.emoji || NECKLINES.find(n => n.id === styleId)?.emoji || SLEEVES.find(sl => sl.id === styleId)?.emoji || '👗'}
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => setExpandedSection('styles')}
                  className="flex items-center justify-center transition-all hover:bg-gray-50 active:scale-95 overflow-hidden"
                  style={{
                    width: '48px', height: '48px', borderRadius: '16px',
                    border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer'
                  }}
                >
                  <Plus size={24} color="#555" strokeWidth={1.5} />
                </button>
              </div>

              {/* 2. Accessories Capsule */}
              <div className="flex flex-col items-center bg-white rounded-[24px] shadow-sm border border-gray-100" style={{ gap: '8px', padding: '12px' }}>
                {selectedAccessories.map((accId, idx) => (
                  <button
                    key={`acc-${idx}`}
                    onClick={() => setExpandedSection('accessories')}
                    className={`flex items-center justify-center transition-all hover:bg-gray-50 active:scale-95 overflow-hidden ${expandedSection === 'accessories' ? 'bg-gray-100 ring-1 ring-gray-200' : ''}`}
                    style={{
                      width: '48px', height: '48px', borderRadius: '16px',
                      border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer',
                    }}
                    title="Accessories"
                  >
                    <span style={{ fontSize: '24px' }}>{ACCESSORIES.find(a => a.id === accId)?.emoji || '💎'}</span>
                  </button>
                ))}
                <button
                  onClick={() => setExpandedSection('accessories')}
                  className="flex items-center justify-center transition-all hover:bg-gray-50 active:scale-95 overflow-hidden"
                  style={{
                    width: '48px', height: '48px', borderRadius: '16px',
                    border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer',
                  }}
                >
                  <Plus size={24} color="#555" strokeWidth={1.5} />
                </button>
              </div>

              {/* 3. Standalone Color/Fabric Swatch */}
              <button
                onClick={() => setExpandedSection('fabric')}
                className="flex items-center justify-center transition-all active:scale-95 bg-white shadow-sm border border-gray-100"
                style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  cursor: 'pointer', alignSelf: 'center'
                }}
                title="Color"
              >
                {selectedColor ? (
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: selectedColor, border: '3px solid #FFF', boxShadow: '0 0 0 1px rgba(0,0,0,0.1)' }} />
                ) : (
                  <Palette size={26} color="#555" strokeWidth={1.5} />
                )}
              </button>

              {/* 4. Standalone Reference Image */}
              <button
                onClick={() => setExpandedSection('reference')}
                className={`flex items-center justify-center transition-all active:scale-95 bg-white shadow-sm border ${expandedSection === 'reference' ? 'border-[#2C1810]' : 'border-gray-100'} hover:bg-gray-50 overflow-hidden relative`}
                style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  cursor: 'pointer', alignSelf: 'center'
                }}
                title="Reference"
              >
                {referenceImages.length > 0 ? (
                  <Image src={referenceImages[0]} alt="Reference" fill style={{ objectFit: 'cover' }} />
                ) : (
                  <ImageIcon size={26} color="#555" strokeWidth={1.5} />
                )}
              </button>

              {/* 5. Standalone Fit/Ruler */}
              <button
                onClick={() => setExpandedSection('fit')}
                className={`flex items-center justify-center transition-all active:scale-95 bg-white shadow-sm border ${expandedSection === 'fit' ? 'border-[#2C1810]' : 'border-gray-100'} hover:bg-gray-50 overflow-hidden relative`}
                style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  cursor: 'pointer', alignSelf: 'center'
                }}
                title="Fit & Measurements"
              >
                <Ruler size={26} color="#555" strokeWidth={1.5} />
              </button>
            </div>

          </div> {/* <--- Closes RIGHT PANEL & TOOLBAR (Desktop only) */}

          {/* ─── MOBILE BOTTOM SHEET (outside desktop wrapper) ─── */}
          {/* Outer wrapper: positions handle + sheet together */}
          <div 
            ref={sheetRef}
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center lg:hidden"
            style={{ height: `${sheetHeight}vh`, transition: isDragging.current ? 'none' : 'height 0.35s cubic-bezier(0.32, 0.72, 0, 1)' }}
          >
            {/* Drag Handle (above the drawer) */}
            <div 
              className="flex justify-center w-full shrink-0 cursor-grab active:cursor-grabbing touch-none z-10"
              style={{ paddingBottom: '10px' }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="w-10 h-[5px] bg-white rounded-full" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
            </div>

            {/* Sheet Body */}
            <div className="flex-1 flex flex-col bg-white rounded-t-[28px] shadow-[0_-8px_40px_rgba(0,0,0,0.12)] w-full overflow-hidden relative">

            {/* Sheet Header (STYLES title + Icons) */}
            <div className="flex items-center justify-between shrink-0" style={{ padding: '16px 24px 12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {expandedSection === 'styles' && 'STYLES'}
                {expandedSection === 'fabric' && 'FABRIC'}
                {expandedSection === 'accessories' && 'ACCESSORIES'}
                {expandedSection === 'fit' && 'FIT'}
                {expandedSection === 'details' && 'DETAILS'}
                {expandedSection === 'reference' && 'PHOTO'}
              </h2>
              <div className="flex items-center gap-4">
                <ArrowDownUp size={20} color="#1A1A1A" />
                <RotateCcw size={20} color="#1A1A1A" />
              </div>
            </div>

            {/* Scrollable Tabs */}
            <div className="flex items-center overflow-x-auto hide-scrollbar shrink-0" style={{ gap: '24px', padding: '0 24px 14px', borderBottom: '1px solid #F0F0F0', marginTop: '8px' }}>
              {[
                { id: 'styles', label: 'STYLE' },
                { id: 'fabric', label: 'FABRIC' },
                { id: 'accessories', label: 'ACCESSORIES' },
                { id: 'fit', label: 'FIT' },
                { id: 'details', label: 'DETAILS' },
                { id: 'reference', label: 'PHOTO' },
              ].map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => setExpandedSection(tab.id)}
                  className="flex flex-col items-center gap-1 shrink-0 relative transition-all" 
                  style={{ padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
                >
                  <span style={{ fontSize: '12px', fontWeight: expandedSection === tab.id ? 800 : 500, color: expandedSection === tab.id ? '#1A1A1A' : '#999', letterSpacing: '0.04em' }}>{tab.label}</span>
                  {expandedSection === tab.id && (
                    <div className="absolute -bottom-[14px] w-full h-[2px] rounded-full" style={{ background: '#1A1A1A' }} />
                  )}
                </button>
              ))}
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ paddingBottom: '100px' }}>

              {/* ═══ STYLES SECTION (Mobile) ═══ */}
              {expandedSection === 'styles' && (
                <div style={{ padding: '20px' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Silhouette</span>
                      <button className="transition-all hover:underline" style={{ fontSize: '11px', fontWeight: 600, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>See all</button>
                    </div>
                    <div className="grid grid-cols-2" style={{ gap: '8px', marginBottom: '24px' }}>
                      {SILHOUETTES.map((opt) => (
                        <button key={opt.id} onClick={() => setSelectedSilhouette(opt.id)} className="flex items-center transition-all hover:opacity-90" style={{ padding: '8px 12px', borderRadius: '16px', border: selectedSilhouette === opt.id ? '1px solid #2C1810' : '1px solid transparent', background: selectedSilhouette === opt.id ? '#FAF6F1' : '#F5F5F5', cursor: 'pointer', gap: '12px' }}>
                          <div className="flex items-center justify-center bg-white shadow-sm" style={{ width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0 }}><span style={{ fontSize: '24px' }}>{opt.emoji}</span></div>
                          <div className="flex-1 text-left flex flex-col justify-center">
                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3 }}>{opt.label}</p>
                            {opt.extraCost && <p style={{ fontSize: '10px', fontWeight: 800, color: '#1A1A1A', marginTop: '4px' }}>+${(opt.extraCost / 1000).toFixed(0)}000</p>}
                          </div>
                          <div className="flex items-center justify-center" style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, border: selectedSilhouette === opt.id ? '1.5px solid #2C1810' : 'none', background: selectedSilhouette === opt.id ? 'transparent' : '#D1D5DB' }}>
                            {selectedSilhouette === opt.id && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2C1810' }} />}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Neckline</span>
                      <button className="transition-all hover:underline" style={{ fontSize: '11px', fontWeight: 600, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>See all</button>
                    </div>
                    <div className="grid grid-cols-2" style={{ gap: '8px', marginBottom: '24px' }}>
                      {NECKLINES.map((opt) => (
                        <button key={opt.id} onClick={() => setSelectedNeckline(opt.id)} className="flex items-center transition-all hover:opacity-90" style={{ padding: '8px 12px', borderRadius: '16px', border: selectedNeckline === opt.id ? '1px solid #2C1810' : '1px solid transparent', background: selectedNeckline === opt.id ? '#FAF6F1' : '#F5F5F5', cursor: 'pointer', gap: '12px' }}>
                          <div className="flex items-center justify-center bg-white shadow-sm" style={{ width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0 }}><span style={{ fontSize: '24px' }}>{opt.emoji}</span></div>
                          <div className="flex-1 text-left flex flex-col justify-center"><p style={{ fontSize: '11px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3 }}>{opt.label}</p></div>
                          <div className="flex items-center justify-center" style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, border: selectedNeckline === opt.id ? '1.5px solid #2C1810' : 'none', background: selectedNeckline === opt.id ? 'transparent' : '#D1D5DB' }}>
                            {selectedNeckline === opt.id && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2C1810' }} />}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sleeves</span>
                      <button className="transition-all hover:underline" style={{ fontSize: '11px', fontWeight: 600, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>See all</button>
                    </div>
                    <div className="grid grid-cols-2" style={{ gap: '8px' }}>
                      {SLEEVES.map((opt) => (
                        <button key={opt.id} onClick={() => setSelectedSleeve(opt.id)} className="flex items-center transition-all hover:opacity-90" style={{ padding: '8px 12px', borderRadius: '16px', border: selectedSleeve === opt.id ? '1px solid #2C1810' : '1px solid transparent', background: selectedSleeve === opt.id ? '#FAF6F1' : '#F5F5F5', cursor: 'pointer', gap: '12px' }}>
                          <div className="flex items-center justify-center bg-white shadow-sm" style={{ width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0 }}><span style={{ fontSize: '24px' }}>{opt.emoji}</span></div>
                          <div className="flex-1 text-left flex flex-col justify-center">
                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3 }}>{opt.label}</p>
                            {opt.extraCost && <p style={{ fontSize: '10px', fontWeight: 800, color: '#1A1A1A', marginTop: '4px' }}>+${(opt.extraCost / 1000).toFixed(0)}000</p>}
                          </div>
                          <div className="flex items-center justify-center" style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, border: selectedSleeve === opt.id ? '1.5px solid #2C1810' : 'none', background: selectedSleeve === opt.id ? 'transparent' : '#D1D5DB' }}>
                            {selectedSleeve === opt.id && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2C1810' }} />}
                          </div>
                        </button>
                      ))}
                    </div>
                </div>
              )}

              {/* ═══ FABRIC SECTION (Mobile) ═══ */}
              {expandedSection === 'fabric' && (
                <div style={{ padding: '20px' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Material</span>
                    </div>
                    <div className="grid grid-cols-2" style={{ gap: '8px', marginBottom: '24px' }}>
                      {FABRICS.map((fab) => (
                        <button key={fab.id} onClick={() => setSelectedFabric(fab.id)} className="flex flex-col items-center overflow-hidden transition-all hover:opacity-90" style={{ borderRadius: '16px', border: selectedFabric === fab.id ? '2px solid #2C1810' : '1.5px solid rgba(0,0,0,0.06)', background: '#FFF', cursor: 'pointer', padding: 0 }}>
                          <div className="relative w-full" style={{ height: '80px' }}><Image src={fab.image} alt={fab.name} fill style={{ objectFit: 'cover' }} /></div>
                          <div className="w-full flex items-center justify-between" style={{ padding: '8px 10px' }}>
                            <p style={{ fontSize: '10px', fontWeight: 700, color: '#1A1A1A' }}>{fab.name}</p>
                            {fab.extraCost && <p style={{ fontSize: '9px', fontWeight: 800, color: '#888' }}>+${(fab.extraCost / 1000).toFixed(0)}k</p>}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Colour</span>
                    </div>
                    <div className="flex flex-wrap" style={{ gap: '10px' }}>
                      {FABRIC_COLORS.map((color) => (
                        <button key={color} onClick={() => setSelectedColor(color)} className="transition-all hover:scale-110 active:scale-95" style={{ width: '36px', height: '36px', borderRadius: '50%', background: color, border: selectedColor === color ? '3px solid #FFF' : '2px solid transparent', boxShadow: selectedColor === color ? `0 0 0 2px #2C1810` : '0 0 0 1px rgba(0,0,0,0.08)', cursor: 'pointer', padding: 0 }} />
                      ))}
                    </div>
                </div>
              )}

              {/* ═══ ACCESSORIES SECTION (Mobile) ═══ */}
              {expandedSection === 'accessories' && (
                <div style={{ padding: '20px' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Embellishments</span>
                    </div>
                    <div className="grid grid-cols-2" style={{ gap: '8px' }}>
                      {ACCESSORIES.map((acc) => (
                        <button key={acc.id} onClick={() => toggleAccessory(acc.id)} className="flex items-center transition-all hover:opacity-90" style={{ padding: '10px 12px', borderRadius: '16px', border: selectedAccessories.includes(acc.id) ? '1px solid #2C1810' : '1px solid transparent', background: selectedAccessories.includes(acc.id) ? '#FAF6F1' : '#F5F5F5', cursor: 'pointer', gap: '12px' }}>
                          <span style={{ fontSize: '24px' }}>{acc.emoji}</span>
                          <div className="flex-1 text-left">
                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#1A1A1A' }}>{acc.name}</p>
                            {acc.extraCost && <p style={{ fontSize: '10px', fontWeight: 800, color: '#888', marginTop: '2px' }}>+${(acc.extraCost / 1000).toFixed(0)}k</p>}
                          </div>
                          <div className="flex items-center justify-center" style={{ width: '20px', height: '20px', borderRadius: '6px', border: selectedAccessories.includes(acc.id) ? 'none' : '1.5px solid #CCC', background: selectedAccessories.includes(acc.id) ? '#2C1810' : 'transparent' }}>
                            {selectedAccessories.includes(acc.id) && <Check size={12} color="#FFF" strokeWidth={3} />}
                          </div>
                        </button>
                      ))}
                    </div>
                </div>
              )}

              {/* ═══ FIT SECTION (Mobile) ═══ */}
              {expandedSection === 'fit' && (
                <div style={{ padding: '20px' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Preference</span>
                    </div>
                    <div className="grid grid-cols-2" style={{ gap: '8px', marginBottom: '20px' }}>
                      {FIT_OPTIONS.map((fit) => (
                        <button key={fit.id} onClick={() => setSelectedFit(fit.id)} className="flex flex-col transition-all hover:bg-gray-50" style={{ padding: '14px', borderRadius: '14px', border: selectedFit === fit.id ? '2px solid #2C1810' : '1.5px solid rgba(0,0,0,0.08)', background: selectedFit === fit.id ? '#FAF6F1' : '#FAFAFA', cursor: 'pointer', gap: '4px', textAlign: 'left' }}>
                          <div className="flex items-center justify-between w-full">
                            <p style={{ fontSize: '11px', fontWeight: 800, color: '#1A1A1A' }}>{fit.label}</p>
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0, border: selectedFit === fit.id ? '4px solid #2C1810' : '2px solid #CCC', background: selectedFit === fit.id ? '#FFF' : 'transparent' }} />
                          </div>
                          <p style={{ fontSize: '9px', color: '#888', lineHeight: 1.4 }}>{fit.desc}</p>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between transition-all hover:bg-gray-50" style={{ padding: '14px', borderRadius: '14px', border: '1.5px solid rgba(0,0,0,0.08)', cursor: 'pointer' }}>
                      <div>
                        <p style={{ fontSize: '11px', fontWeight: 800, color: '#1A1A1A' }}>Your Measurements</p>
                        <p style={{ fontSize: '9px', color: '#888', marginTop: '2px' }}>Tap to set or edit your body measurements</p>
                      </div>
                      <ChevronRight size={16} color="#888" />
                    </div>
                </div>
              )}

              {/* ═══ REFERENCE SECTION (Mobile) ═══ */}
              {expandedSection === 'reference' && (
                <div style={{ padding: '20px' }}>
                    <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center transition-all hover:border-[#2C1810] cursor-pointer" style={{ padding: '28px 16px', borderRadius: '16px', border: '2px dashed rgba(0,0,0,0.15)', background: '#FAFAFA', marginBottom: '16px' }}>
                      <Upload size={28} color="#999" style={{ marginBottom: '10px' }} />
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#666', textAlign: 'center' }}>Drag or drop your images here or <span style={{ color: '#2C1810', textDecoration: 'underline' }}>choose a file</span></p>
                      <p style={{ fontSize: '10px', color: '#AAA', marginTop: '4px' }}>PNG, JPG up to 10MB</p>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} style={{ display: 'none' }} />
                    {referenceImages.length > 0 && (
                      <div className="flex flex-col" style={{ gap: '8px' }}>
                        {referenceImages.map((img, idx) => (
                          <div key={idx} className="flex items-center justify-between" style={{ padding: '10px 12px', borderRadius: '12px', background: '#F5F5F5' }}>
                            <div className="flex items-center" style={{ gap: '10px' }}>
                              <div className="relative overflow-hidden flex-shrink-0" style={{ width: '40px', height: '40px', borderRadius: '8px' }}><Image src={img} alt={`Ref ${idx + 1}`} fill style={{ objectFit: 'cover' }} /></div>
                              <p style={{ fontSize: '11px', fontWeight: 600, color: '#1A1A1A' }}>Reference {idx + 1}</p>
                            </div>
                            <button onClick={() => removeReference(idx)} className="flex items-center justify-center transition-all hover:bg-gray-200 active:scale-90" style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer' }}><X size={14} color="#888" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}

            </div>

            {/* Mobile Generate Button (Sticky at bottom with gradient fade) */}
            <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none" style={{ paddingBottom: '0' }}>
              <div style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 30%, rgba(255,255,255,1) 60%)', padding: '40px 20px 20px' }}>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 shadow-lg pointer-events-auto"
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    background: '#9B51E0',
                    color: '#FFF',
                    fontSize: '14px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    border: 'none',
                    cursor: isGenerating ? 'wait' : 'pointer',
                    gap: '10px',
                  }}
                >
                  {isGenerating ? (
                    <><Loader2 size={16} className="animate-spin" /><span>Generating...</span></>
                  ) : (
                    <>
                      <span>GENERATE STYLE</span>
                      <div className="flex items-center gap-1" style={{ opacity: 0.85 }}>
                        <span style={{ fontSize: '15px' }}>🪙</span>
                        <span>{GENERATION_COST}</span>
                      </div>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          </div>

          {/* Desktop Config Panel & CTAs (inside its own wrapper) */}
          <div className="absolute right-6 top-[90px] bottom-6 z-20 hidden lg:flex flex-col" style={{ width: '380px', gap: '16px' }}>
            <div 
              className="flex-1 flex flex-col bg-white shadow-lg overflow-hidden border border-gray-100 rounded-[24px]"
            >
                {/* Dynamic Context Header */}
                <div className="flex items-center justify-between shrink-0" style={{ padding: '20px 20px 8px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <span style={{ fontSize: '14px', fontWeight: 900, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {expandedSection === 'styles' && 'Styles'}
                    {expandedSection === 'fabric' && 'Fabric'}
                    {expandedSection === 'accessories' && 'Accessories'}
                    {expandedSection === 'fit' && 'Fit'}
                    {expandedSection === 'reference' && 'Reference'}
                  </span>
                  <div className="flex items-center" style={{ gap: '4px' }}>
                    <span style={{ fontSize: '12px' }}>🪙</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#D4AF37' }}>{tokenBalance.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto" style={{ padding: '0' }}>

              {/* ═══ STYLES SECTION ═══ */}
              {expandedSection === 'styles' && (
                <div style={{ padding: '20px' }}>


                    {/* SILHOUETTE */}
                    <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Silhouette</span>
                      <button className="transition-all hover:underline" style={{ fontSize: '11px', fontWeight: 600, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>See all</button>
                    </div>
                    <div className="grid grid-cols-2" style={{ gap: '8px', marginBottom: '24px' }}>
                      {SILHOUETTES.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setSelectedSilhouette(opt.id)}
                          className="flex items-center transition-all hover:opacity-90"
                          style={{
                            padding: '8px 12px',
                            borderRadius: '16px',
                            border: selectedSilhouette === opt.id ? '1px solid #2C1810' : '1px solid transparent',
                            background: selectedSilhouette === opt.id ? '#FAF6F1' : '#F5F5F5',
                            cursor: 'pointer',
                            gap: '12px',
                          }}
                        >
                          <div className="flex items-center justify-center bg-white shadow-sm" style={{ width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0 }}>
                            <span style={{ fontSize: '24px' }}>{opt.emoji}</span>
                          </div>
                          <div className="flex-1 text-left flex flex-col justify-center">
                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3 }}>{opt.label}</p>
                            {opt.extraCost && (
                              <p style={{ fontSize: '10px', fontWeight: 800, color: '#1A1A1A', marginTop: '4px' }}>+${(opt.extraCost / 1000).toFixed(0)}000</p>
                            )}
                          </div>
                          <div className="flex items-center justify-center" style={{
                            width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                            border: selectedSilhouette === opt.id ? '1.5px solid #2C1810' : 'none',
                            background: selectedSilhouette === opt.id ? 'transparent' : '#D1D5DB',
                          }}>
                            {selectedSilhouette === opt.id && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2C1810' }} />}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* NECKLINE */}
                    <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Neckline</span>
                      <button className="transition-all hover:underline" style={{ fontSize: '11px', fontWeight: 600, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>See all</button>
                    </div>
                    <div className="grid grid-cols-2" style={{ gap: '8px', marginBottom: '24px' }}>
                      {NECKLINES.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setSelectedNeckline(opt.id)}
                          className="flex items-center transition-all hover:opacity-90"
                          style={{
                            padding: '8px 12px',
                            borderRadius: '16px',
                            border: selectedNeckline === opt.id ? '1px solid #2C1810' : '1px solid transparent',
                            background: selectedNeckline === opt.id ? '#FAF6F1' : '#F5F5F5',
                            cursor: 'pointer',
                            gap: '12px',
                          }}
                        >
                          <div className="flex items-center justify-center bg-white shadow-sm" style={{ width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0 }}>
                            <span style={{ fontSize: '24px' }}>{opt.emoji}</span>
                          </div>
                          <div className="flex-1 text-left flex flex-col justify-center">
                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3 }}>{opt.label}</p>
                          </div>
                          <div className="flex items-center justify-center" style={{
                            width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                            border: selectedNeckline === opt.id ? '1.5px solid #2C1810' : 'none',
                            background: selectedNeckline === opt.id ? 'transparent' : '#D1D5DB',
                          }}>
                            {selectedNeckline === opt.id && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2C1810' }} />}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* SLEEVES */}
                    <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sleeves</span>
                      <button className="transition-all hover:underline" style={{ fontSize: '11px', fontWeight: 600, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>See all</button>
                    </div>
                    <div className="grid grid-cols-2" style={{ gap: '8px' }}>
                      {SLEEVES.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setSelectedSleeve(opt.id)}
                          className="flex items-center transition-all hover:opacity-90"
                          style={{
                            padding: '8px 12px',
                            borderRadius: '16px',
                            border: selectedSleeve === opt.id ? '1px solid #2C1810' : '1px solid transparent',
                            background: selectedSleeve === opt.id ? '#FAF6F1' : '#F5F5F5',
                            cursor: 'pointer',
                            gap: '12px',
                          }}
                        >
                          <div className="flex items-center justify-center bg-white shadow-sm" style={{ width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0 }}>
                            <span style={{ fontSize: '24px' }}>{opt.emoji}</span>
                          </div>
                          <div className="flex-1 text-left flex flex-col justify-center">
                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3 }}>{opt.label}</p>
                            {opt.extraCost && (
                              <p style={{ fontSize: '10px', fontWeight: 800, color: '#1A1A1A', marginTop: '4px' }}>+${(opt.extraCost / 1000).toFixed(0)}000</p>
                            )}
                          </div>
                          <div className="flex items-center justify-center" style={{
                            width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                            border: selectedSleeve === opt.id ? '1.5px solid #2C1810' : 'none',
                            background: selectedSleeve === opt.id ? 'transparent' : '#D1D5DB',
                          }}>
                            {selectedSleeve === opt.id && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2C1810' }} />}
                          </div>
                        </button>
                      ))}
                    </div>
                </div>
              )}

              {/* ═══ FABRIC SECTION ═══ */}
              {expandedSection === 'fabric' && (
                <div style={{ padding: '20px' }}>
                    {/* Material */}
                    <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Material</span>
                      <button className="transition-all hover:underline" style={{ fontSize: '11px', fontWeight: 600, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>See all</button>
                    </div>
                    <div className="grid grid-cols-2" style={{ gap: '8px', marginBottom: '20px' }}>
                      {FABRICS.map((fab) => (
                        <button
                          key={fab.id}
                          onClick={() => setSelectedFabric(fab.id)}
                          className="flex items-center transition-all hover:bg-gray-50"
                          style={{
                            padding: '10px',
                            borderRadius: '14px',
                            border: selectedFabric === fab.id ? '2px solid #2C1810' : '1.5px solid rgba(0,0,0,0.08)',
                            background: selectedFabric === fab.id ? '#FAF6F1' : '#FAFAFA',
                            cursor: 'pointer',
                            gap: '10px',
                          }}
                        >
                          <div className="relative flex-shrink-0 overflow-hidden" style={{ width: '40px', height: '40px', borderRadius: '10px' }}>
                            <Image src={fab.image} alt={fab.name} fill style={{ objectFit: 'cover' }} />
                          </div>
                          <div className="flex-1 text-left">
                            <p style={{ fontSize: '10px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3 }}>{fab.name}</p>
                            {fab.extraCost && (
                              <p style={{ fontSize: '9px', color: '#888', marginTop: '2px' }}>+₦{fab.extraCost.toLocaleString()}</p>
                            )}
                          </div>
                          <div style={{
                            width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                            border: selectedFabric === fab.id ? '4px solid #2C1810' : '2px solid #CCC',
                            background: selectedFabric === fab.id ? '#FFF' : 'transparent',
                          }} />
                        </button>
                      ))}
                    </div>

                    {/* Color */}
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '12px' }}>Color</span>
                    <div className="flex flex-wrap" style={{ gap: '8px' }}>
                      {FABRIC_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className="transition-all hover:scale-110"
                          style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: color,
                            border: selectedColor === color ? '3px solid #2C1810' : '2px solid rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            boxShadow: selectedColor === color ? '0 0 0 2px #FFF, 0 0 0 4px #2C1810' : 'none',
                          }}
                        />
                      ))}
                    </div>
                </div>
              )}

              {/* ═══ ACCESSORIES SECTION ═══ */}
              {expandedSection === 'accessories' && (
                <div style={{ padding: '20px' }}>
                    <div className="grid grid-cols-2" style={{ gap: '8px' }}>
                      {ACCESSORIES.map((acc) => (
                        <button
                          key={acc.id}
                          onClick={() => toggleAccessory(acc.id)}
                          className="flex items-center transition-all hover:opacity-90"
                          style={{
                            padding: '8px 12px',
                            borderRadius: '16px',
                            border: selectedAccessories.includes(acc.id) ? '1px solid #2C1810' : '1px solid transparent',
                            background: selectedAccessories.includes(acc.id) ? '#FAF6F1' : '#F5F5F5',
                            cursor: 'pointer',
                            gap: '12px',
                          }}
                        >
                          <div className="flex items-center justify-center bg-white shadow-sm" style={{ width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0 }}>
                            <span style={{ fontSize: '24px' }}>{acc.emoji}</span>
                          </div>
                          <div className="flex-1 text-left flex flex-col justify-center">
                            <p style={{ fontSize: '11px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.3 }}>{acc.name}</p>
                            {acc.extraCost && (
                              <p style={{ fontSize: '10px', fontWeight: 800, color: '#1A1A1A', marginTop: '4px' }}>+${(acc.extraCost / 1000).toFixed(0)}000</p>
                            )}
                          </div>
                          <div style={{
                            width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                            border: selectedAccessories.includes(acc.id) ? 'none' : 'none',
                            background: selectedAccessories.includes(acc.id) ? '#2C1810' : '#D1D5DB',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {selectedAccessories.includes(acc.id) && <Check size={12} color="#FFF" strokeWidth={3} />}
                          </div>
                        </button>
                      ))}
                    </div>
                </div>
              )}

              {/* ═══ FIT SECTION ═══ */}
              {expandedSection === 'fit' && (
                <div style={{ padding: '20px' }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Preference</span>
                    </div>
                    <div className="grid grid-cols-2" style={{ gap: '8px', marginBottom: '20px' }}>
                      {FIT_OPTIONS.map((fit) => (
                        <button
                          key={fit.id}
                          onClick={() => setSelectedFit(fit.id)}
                          className="flex flex-col transition-all hover:bg-gray-50"
                          style={{
                            padding: '14px',
                            borderRadius: '14px',
                            border: selectedFit === fit.id ? '2px solid #2C1810' : '1.5px solid rgba(0,0,0,0.08)',
                            background: selectedFit === fit.id ? '#FAF6F1' : '#FAFAFA',
                            cursor: 'pointer',
                            gap: '4px',
                            textAlign: 'left',
                          }}
                        >
                          <div className="flex items-center justify-between w-full">
                            <p style={{ fontSize: '11px', fontWeight: 800, color: '#1A1A1A' }}>{fit.label}</p>
                            <div style={{
                              width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                              border: selectedFit === fit.id ? '4px solid #2C1810' : '2px solid #CCC',
                              background: selectedFit === fit.id ? '#FFF' : 'transparent',
                            }} />
                          </div>
                          <p style={{ fontSize: '9px', color: '#888', lineHeight: 1.4 }}>{fit.desc}</p>
                        </button>
                      ))}
                    </div>

                    {/* Measurements link */}
                    <div
                      className="flex items-center justify-between transition-all hover:bg-gray-50"
                      style={{ padding: '14px', borderRadius: '14px', border: '1.5px solid rgba(0,0,0,0.08)', cursor: 'pointer' }}
                    >
                      <div>
                        <p style={{ fontSize: '11px', fontWeight: 800, color: '#1A1A1A' }}>Your Measurements</p>
                        <p style={{ fontSize: '9px', color: '#888', marginTop: '2px' }}>Tap to set or edit your body measurements</p>
                      </div>
                      <ChevronRight size={16} color="#888" />
                    </div>
                  </div>
              )}

              {/* ═══ REFERENCE SECTION ═══ */}
              {expandedSection === 'reference' && (
                <div style={{ padding: '20px' }}>
                  {/* Upload zone */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center transition-all hover:border-[#2C1810] cursor-pointer"
                      style={{
                        padding: '28px 16px',
                        borderRadius: '16px',
                        border: '2px dashed rgba(0,0,0,0.15)',
                        background: '#FAFAFA',
                        marginBottom: '16px',
                      }}
                    >
                      <Upload size={28} color="#999" style={{ marginBottom: '10px' }} />
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#666', textAlign: 'center' }}>
                        Drag or drop your images here or <span style={{ color: '#2C1810', textDecoration: 'underline' }}>choose a file</span>
                      </p>
                      <p style={{ fontSize: '10px', color: '#AAA', marginTop: '4px' }}>PNG, JPG up to 10MB</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />

                    {/* Uploaded references */}
                    {referenceImages.length > 0 && (
                      <div className="flex flex-col" style={{ gap: '8px' }}>
                        {referenceImages.map((img, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between"
                            style={{ padding: '10px 12px', borderRadius: '12px', background: '#F5F5F5' }}
                          >
                            <div className="flex items-center" style={{ gap: '10px' }}>
                              <div className="relative overflow-hidden flex-shrink-0" style={{ width: '40px', height: '40px', borderRadius: '8px' }}>
                                <Image src={img} alt={`Ref ${idx + 1}`} fill style={{ objectFit: 'cover' }} />
                              </div>
                              <p style={{ fontSize: '11px', fontWeight: 600, color: '#1A1A1A' }}>Reference {idx + 1}</p>
                            </div>
                            <button
                              onClick={() => removeReference(idx)}
                              className="flex items-center justify-center transition-all hover:bg-gray-200 active:scale-90"
                              style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                            >
                              <X size={14} color="#888" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
              )}
            </div>
          </div> {/* <--- Closes Desktop Scrollable Config Panel */}

          {/* ═══ Desktop BOTTOM CTAs ═══ */}
            <div className="flex-shrink-0 flex flex-col w-full" style={{ gap: '10px' }}>
              {/* Generate */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 shadow-lg"
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  background: '#9B51E0',
                  color: '#FFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  border: 'none',
                  cursor: isGenerating ? 'wait' : 'pointer',
                  gap: '8px',
                }}
              >
                {isGenerating ? (
                  <><Loader2 size={16} className="animate-spin" /><span>Generating...</span></>
                ) : (
                  <>
                    <span>GENERATE STYLE</span>
                    <div className="flex items-center gap-1" style={{ opacity: 0.8 }}>
                      <span style={{ fontSize: '14px' }}>🪙</span>
                      <span>{GENERATION_COST}</span>
                    </div>
                  </>
                )}
              </button>

              {/* Order Now */}
              <button
                className="w-full flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98] shadow-md"
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  background: '#065F46',
                  color: '#FFF',
                  fontSize: '12px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  border: 'none',
                  cursor: 'pointer',
                  gap: '8px',
                }}
              >
                <ShoppingCart size={16} />
                <span>Order Now</span>
              </button>
            </div>
          </div>
      </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PAGE EXPORT
// ═══════════════════════════════════════════════════════════════

export default function BespokeStudioPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <span className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-[#2C1810] animate-spin" />
      </div>
    }>
      <StudioContent />
    </Suspense>
  );
}
