'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { ProductCard } from '@/components/ProductCard';
import { SizeGuideModal } from '@/components/SizeGuideModal';
import { ReviewsSection } from '@/components/ReviewsSection';
import { productCatalog } from '@/data/products';
import { useCustomization } from '@/hooks/useCustomization';
import { ProductCustomizePanel } from '@/components/studio/ProductCustomizePanel';
import { UseFabricModal } from '@/components/studio/UseFabricModal';
import { ReserveFabricModal } from '@/components/studio/ReserveFabricModal';
import {
  Heart,
  ShoppingCart,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  Truck,
  Pen,
  Ruler,
  ArrowLeft,
  Scissors,
  CalendarDays,
} from 'lucide-react';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { wishlist, toggleWishlist, addToCart } = useApp();

  const productId = params.id as string;
  const product = productCatalog.find((p) => p.id === productId) || productCatalog[0];

  // UI States
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showUseFabric, setShowUseFabric] = useState(false);
  const [showReserve, setShowReserve] = useState(false);

  const isCustomizable = product.tag === 'CUSTOMIZABLE';
  const isFabric = product.kind === 'fabric';
  const customization = useCustomization({ mode: 'product', defaultSection: 'styles' });

  const isWish = wishlist.includes(product.id);
  const gallery = product.gallery;

  // "More from this vendor" — same brand, excluding current product
  const vendorProducts = productCatalog.filter(
    (p) => p.brand === product.brand && p.id !== product.id
  );
  // If vendor has <2 products, show other products instead
  const recommendedProducts =
    vendorProducts.length >= 2
      ? vendorProducts
      : productCatalog.filter((p) => p.id !== product.id).slice(0, 6);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      kind: product.kind,
      size: selectedSize,
      color: selectedColor,
    });
  };

  const handleCustomize = () => {
    router.push(
      `/bespoke?tryOnImg=${encodeURIComponent(product.image)}&title=${encodeURIComponent(product.title)}`
    );
  };

  const prevImage = () =>
    setActiveImageIdx((i) => (i === 0 ? gallery.length - 1 : i - 1));
  const nextImage = () =>
    setActiveImageIdx((i) => (i === gallery.length - 1 ? 0 : i + 1));

  const kindLabel =
    product.kind === 'clothing'
      ? 'Clothing'
      : product.kind === 'fabric'
        ? 'Fabrics'
        : 'Accessories';

  return (
    <>
      {/* Floating Size Guide — rendered outside animated div to escape stacking context */}
      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        category={`Men / ${kindLabel}`}
      />
      <div
        className="flex flex-col animate-fade-in relative lg:overflow-x-clip"
        style={{ padding: '8px 0 48px', gap: '32px' }}
      >
        {/* ─── Back Button ────────────────────────────────────────── */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 hover:text-gray-600 transition-colors self-start"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#999',
            padding: 0,
          }}
        >
          <ArrowLeft size={18} />
        </button>

        {/* ─── Product Hero: Image + Info ──────────────────────────── */}
        <section
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 w-full"
          style={{ maxWidth: '1200px', margin: '0 auto' }}
        >
          {/* ── LEFT: Image Gallery ───────────────────────────────── */}
          <div className="flex flex-col" style={{ gap: '16px' }}>
            {/* Main Image */}
            <div
              className="relative overflow-hidden"
              style={{
                aspectRatio: '3 / 4',
                borderRadius: '20px',
                background: '#F5F5F5',
              }}
            >
              <Image
                src={gallery[activeImageIdx]}
                alt={product.title}
                fill
                style={{ objectFit: 'cover' }}
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* ── Customization Hotspots ── */}
              {isCustomizable && (
                <>
                  {/* Neckline hotspot — upper center */}
                  <div
                    className="absolute z-10 flex items-center transition-all duration-500 ease-out"
                    style={{ top: '22%', left: '50%', transform: 'translateX(-50%)' }}
                  >
                    <div className="relative flex items-center">
                      <div
                        className="hotspot-dot w-[14px] h-[14px] rounded-full bg-white border-[3px] border-white shadow-md flex-shrink-0"
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}
                      />
                      <div
                        className={`absolute left-full top-1/2 -translate-y-1/2 flex items-center overflow-hidden transition-all duration-500 ease-out ${showCustomize ? 'max-w-[220px] opacity-100 ml-2' : 'max-w-0 opacity-0 ml-0'}`}
                      >
                        <div className="flex items-center bg-[#333]/85 backdrop-blur-sm rounded-[12px] shadow-lg" style={{ padding: '8px 10px', gap: '8px' }}>
                          <div>
                            <p className="text-white whitespace-nowrap" style={{ fontSize: '13px', fontWeight: 800 }}>Neckline</p>
                            <p className="text-white/70 whitespace-nowrap" style={{ fontSize: '10px', fontWeight: 600 }}>+ ₦5,000</p>
                          </div>
                          <div className="flex items-center justify-center bg-white rounded-[8px] flex-shrink-0" style={{ width: '32px', height: '32px' }}>
                            <span style={{ fontSize: '18px' }}>👗</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sleeves hotspot — left center */}
                  <div
                    className="absolute z-10 flex items-center transition-all duration-500 ease-out"
                    style={{ top: '38%', left: '18%' }}
                  >
                    <div className="relative flex items-center">
                      <div
                        className="hotspot-dot w-[14px] h-[14px] rounded-full bg-white border-[3px] border-white shadow-md flex-shrink-0"
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.25)', animationDelay: '0.3s' }}
                      />
                      <div
                        className={`absolute left-full top-1/2 -translate-y-1/2 flex items-center overflow-hidden transition-all duration-500 ease-out ${showCustomize ? 'max-w-[220px] opacity-100 ml-2' : 'max-w-0 opacity-0 ml-0'}`}
                        style={{ transitionDelay: '0.1s' }}
                      >
                        <div className="flex items-center bg-[#333]/85 backdrop-blur-sm rounded-[12px] shadow-lg" style={{ padding: '8px 10px', gap: '8px' }}>
                          <div>
                            <p className="text-white whitespace-nowrap" style={{ fontSize: '13px', fontWeight: 800 }}>Sleeves</p>
                            <p className="text-white/70 whitespace-nowrap" style={{ fontSize: '10px', fontWeight: 600 }}>Included</p>
                          </div>
                          <div className="flex items-center justify-center bg-white rounded-[8px] flex-shrink-0" style={{ width: '32px', height: '32px' }}>
                            <span style={{ fontSize: '18px' }}>💪</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fabric hotspot — center body */}
                  <div
                    className="absolute z-10 flex items-center transition-all duration-500 ease-out"
                    style={{ top: '55%', left: '50%', transform: 'translateX(-50%)' }}
                  >
                    <div className="relative flex items-center">
                      <div
                        className="hotspot-dot w-[14px] h-[14px] rounded-full bg-white border-[3px] border-white shadow-md flex-shrink-0"
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.25)', animationDelay: '0.6s' }}
                      />
                      <div
                        className={`absolute left-full top-1/2 -translate-y-1/2 flex items-center overflow-hidden transition-all duration-500 ease-out ${showCustomize ? 'max-w-[220px] opacity-100 ml-2' : 'max-w-0 opacity-0 ml-0'}`}
                        style={{ transitionDelay: '0.2s' }}
                      >
                        <div className="flex items-center bg-[#333]/85 backdrop-blur-sm rounded-[12px] shadow-lg" style={{ padding: '8px 10px', gap: '8px' }}>
                          <div>
                            <p className="text-white whitespace-nowrap" style={{ fontSize: '13px', fontWeight: 800 }}>Fabric</p>
                            <p className="text-white/70 whitespace-nowrap" style={{ fontSize: '10px', fontWeight: 600 }}>+ ₦8,000</p>
                          </div>
                          <div className="flex items-center justify-center bg-white rounded-[8px] flex-shrink-0" style={{ width: '32px', height: '32px' }}>
                            <span style={{ fontSize: '18px' }}>🧵</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Accessories hotspot — waist area */}
                  <div
                    className="absolute z-10 flex items-center transition-all duration-500 ease-out"
                    style={{ top: '72%', left: '45%' }}
                  >
                    <div className="relative flex items-center">
                      <div
                        className="hotspot-dot w-[14px] h-[14px] rounded-full bg-white border-[3px] border-white shadow-md flex-shrink-0"
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.25)', animationDelay: '0.9s' }}
                      />
                      <div
                        className={`absolute left-full top-1/2 -translate-y-1/2 flex items-center overflow-hidden transition-all duration-500 ease-out ${showCustomize ? 'max-w-[220px] opacity-100 ml-2' : 'max-w-0 opacity-0 ml-0'}`}
                        style={{ transitionDelay: '0.3s' }}
                      >
                        <div className="flex items-center bg-[#333]/85 backdrop-blur-sm rounded-[12px] shadow-lg" style={{ padding: '8px 10px', gap: '8px' }}>
                          <div>
                            <p className="text-white whitespace-nowrap" style={{ fontSize: '13px', fontWeight: 800 }}>Accessories</p>
                            <p className="text-white/70 whitespace-nowrap" style={{ fontSize: '10px', fontWeight: 600 }}>+ ₦3,500</p>
                          </div>
                          <div className="flex items-center justify-center bg-white rounded-[8px] flex-shrink-0" style={{ width: '32px', height: '32px' }}>
                            <span style={{ fontSize: '18px' }}>🪢</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {/* Carousel Arrows */}
              <button
                onClick={prevImage}
                className="absolute flex items-center justify-center hover:bg-white transition-colors"
                style={{
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.85)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <ChevronLeft size={20} color="#333" />
              </button>
              <button
                onClick={nextImage}
                className="absolute flex items-center justify-center hover:bg-white transition-colors"
                style={{
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.85)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <ChevronRight size={20} color="#333" />
              </button>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex" style={{ gap: '10px' }}>
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className="relative overflow-hidden transition-all"
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '12px',
                    border:
                      idx === activeImageIdx
                        ? '2px solid #1A1A1A'
                        : '2px solid #E5E5E5',
                    background: '#F5F5F5',
                    cursor: 'pointer',
                    opacity: idx === activeImageIdx ? 1 : 0.7,
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={img}
                    alt={`${product.title} view ${idx + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="72px"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Product Info Panel ─────────────────────────── */}
          <div className="flex flex-col" style={{ gap: '20px' }}>
            {/* Breadcrumb */}
            <div className="flex items-center" style={{ gap: '6px', fontSize: '12px', color: '#AAA' }}>
              <Link href="/" className="hover:text-gray-600 transition-colors" style={{ color: '#AAA', textDecoration: 'none' }}>Home</Link>
              <span>/</span>
              <Link href="/products" className="hover:text-gray-600 transition-colors" style={{ color: '#AAA', textDecoration: 'none' }}>{kindLabel}</Link>
            </div>

            {/* Rating + Wishlist */}
            <div className="flex items-center justify-between">
              <div className="flex items-center" style={{ gap: '6px' }}>
                <div className="flex items-center" style={{ gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill={s <= Math.round(product.rating) ? '#F5A623' : 'none'} stroke={s <= Math.round(product.rating) ? '#F5A623' : '#D0D0D0'} strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A' }}>{product.rating}</span>
              </div>
              <button
                onClick={() => toggleWishlist(product.id)}
                className="flex items-center justify-center transition-all hover:scale-110"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '1px solid #E5E5E5',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                <Heart
                  size={18}
                  fill={isWish ? '#FF2E63' : 'none'}
                  stroke={isWish ? '#FF2E63' : '#999'}
                  strokeWidth={2}
                />
              </button>
            </div>

            {/* Brand */}
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 800,
                color: '#1A1A1A',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {product.brand}
            </h2>

            {/* Title */}
            <p style={{ fontSize: '14px', color: '#666', margin: 0, lineHeight: 1.4 }}>
              {product.title}
            </p>

            {/* Price */}
            <span
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#1A1A1A',
                letterSpacing: '-0.02em',
              }}
            >
              ₦{product.price.toLocaleString()}
            </span>

            {/* Delivery Estimate */}
            <div
              className="flex items-center"
              style={{
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '10px',
                background: '#FAFAFA',
                border: '1px solid #F0F0F0',
              }}
            >
              <Clock size={14} color="#999" />
              <span style={{ fontSize: '12px', color: '#888' }}>
                If you order within the next hour, you will get it in <strong style={{ color: '#1A1A1A' }}>2 weeks</strong>.
              </span>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: '#F0F0F0' }} />

            {/* Colour Swatches */}
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', marginBottom: '10px', display: 'block' }}>
                Colour: <span style={{ fontWeight: 400, color: '#666' }}>{selectedColor}</span>
              </span>
              <div className="flex items-center" style={{ gap: '8px' }}>
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className="transition-all"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: product.colorHexMap[color] || '#CCC',
                      border:
                        color === selectedColor
                          ? '3px solid #1A1A1A'
                          : '2px solid #E5E5E5',
                      cursor: 'pointer',
                      outline:
                        color === selectedColor
                          ? '2px solid white'
                          : 'none',
                      outlineOffset: '-4px',
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Product Variant Thumbnails */}
            <div className="flex" style={{ gap: '8px' }}>
              {gallery.slice(0, 5).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className="relative overflow-hidden transition-all"
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '10px',
                    border:
                      idx === activeImageIdx
                        ? '2px solid #1A1A1A'
                        : '1px solid #E5E5E5',
                    background: '#F5F5F5',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <Image
                    src={img}
                    alt={`Variant ${idx + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="52px"
                  />
                </button>
              ))}
            </div>

            {/* Size Guide Link */}
            {product.kind === 'clothing' && (
              <button
                onClick={() => setShowSizeGuide(true)}
                className="flex items-center self-start hover:text-gray-800 transition-colors"
                style={{
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1A1A1A',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                  padding: 0,
                }}
              >
                <Ruler size={14} />
                Size Guide
              </button>
            )}

            {/* Size Selector Pills */}
            <div className="flex flex-wrap" style={{ gap: '8px' }}>
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className="flex items-center justify-center transition-all"
                  style={{
                    minWidth: '42px',
                    height: '42px',
                    padding: '0 14px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: size === selectedSize ? '#1A1A1A' : '#FFFFFF',
                    color: size === selectedSize ? '#FFFFFF' : '#1A1A1A',
                    border: size === selectedSize ? '2px solid #1A1A1A' : '1px solid #E0E0E0',
                  }}
                >
                  {size}
                </button>
              ))}

              {/* AI Size Button */}
              {product.kind === 'clothing' && (
                <button
                  onClick={handleCustomize}
                  className="flex items-center justify-center transition-all hover:bg-gray-100"
                  style={{
                    minWidth: '42px',
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: '#F5F5F5',
                    color: '#666',
                    border: '1px solid #E0E0E0',
                    gap: '4px',
                  }}
                  title="AI-powered size recommendation"
                >
                  <Sparkles size={13} />
                  AI
                </button>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col" style={{ gap: '10px', marginTop: '8px' }}>
              {/* Customize Outfit — only for customizable products */}
              {isCustomizable && (
                <button
                  onClick={() => setShowCustomize(!showCustomize)}
                  className="w-full flex items-center justify-center transition-all hover:opacity-90"
                  style={{
                    padding: '15px',
                    borderRadius: '14px',
                    background: showCustomize ? '#5B21B6' : '#7C3AED',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                    gap: '8px',
                  }}
                >
                  <Pen size={15} />
                  {showCustomize ? 'Hide Customization' : 'Customize Outfit'}
                </button>
              )}

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center transition-all hover:opacity-90"
                style={{
                  padding: '15px',
                  borderRadius: '14px',
                  background: '#2D8A4E',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  gap: '8px',
                }}
              >
                <ShoppingCart size={15} />
                Add to Cart
              </button>

              {/* Use Fabric — only for fabric products */}
              {isFabric && (
                <button
                  onClick={() => setShowUseFabric(true)}
                  className="w-full flex items-center justify-center transition-all hover:opacity-90"
                  style={{
                    padding: '15px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #7C3AED 0%, #9B51E0 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                    gap: '8px',
                  }}
                >
                  <Scissors size={15} />
                  Use Fabric
                </button>
              )}

              {/* Reserve for Event — only for fabric products */}
              {isFabric && (
                <button
                  onClick={() => setShowReserve(true)}
                  className="w-full flex items-center justify-center transition-all hover:opacity-90"
                  style={{
                    padding: '15px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #065F46 0%, #059669 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                    gap: '8px',
                  }}
                >
                  <CalendarDays size={15} />
                  Reserve for Event
                </button>
              )}
            </div>

            {/* Customization Panel (side panel / bottom sheet, for CUSTOMIZABLE products) */}
            {isCustomizable && (
              <ProductCustomizePanel
                isOpen={showCustomize}
                customization={customization}
                onClose={() => setShowCustomize(false)}
              />
            )}

            {/* Use Fabric Modal (for fabric products) */}
            {isFabric && (
              <UseFabricModal
                isOpen={showUseFabric}
                onClose={() => setShowUseFabric(false)}
                fabricImage={product.image}
                fabricName={product.title}
                fabricId={product.id}
              />
            )}

            {/* Reserve Fabric Modal (for fabric products) */}
            {isFabric && (
              <ReserveFabricModal
                isOpen={showReserve}
                onClose={() => setShowReserve(false)}
                fabricId={product.id}
                fabricName={product.title}
                fabricImage={product.image}
                fabricPrice={product.price}
              />
            )}

            {/* Free Delivery Note */}
            <div className="flex flex-col items-center" style={{ gap: '6px', padding: '14px 0', borderTop: '1px solid #F0F0F0' }}>
              <div className="flex items-center" style={{ gap: '8px' }}>
                <Truck size={16} color="#666" />
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#444' }}>
                  Free delivery on qualifying orders
                </span>
              </div>
              <button
                className="hover:text-gray-800 transition-colors"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '12px',
                  color: '#999',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px',
                }}
              >
                View our Delivery & Return Policy
              </button>
            </div>

            {/* Product Details Accordion */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between transition-colors hover:bg-gray-50"
              style={{
                padding: '16px 0',
                borderTop: '1px solid #F0F0F0',
                borderBottom: '1px solid #F0F0F0',
                background: 'transparent',
                border: 'none',
                borderTopWidth: '1px',
                borderTopStyle: 'solid',
                borderTopColor: '#F0F0F0',
                borderBottomWidth: '1px',
                borderBottomStyle: 'solid',
                borderBottomColor: '#F0F0F0',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1A' }}>
                Product details
              </span>
              <ChevronDown
                size={18}
                color="#999"
                style={{
                  transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s',
                }}
              />
            </button>

            {showDetails && (
              <div className="animate-fade-in" style={{ paddingBottom: '8px' }}>
                <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.7, marginBottom: '16px' }}>
                  {product.desc}
                </p>
                <ul style={{ paddingLeft: '16px', margin: 0 }}>
                  {product.details.map((detail, idx) => (
                    <li
                      key={idx}
                      style={{
                        fontSize: '12px',
                        color: '#555',
                        lineHeight: 1.8,
                      }}
                    >
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* ─── More from this Vendor ───────────────────────────────── */}
        <section>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 800,
              color: '#1A1A1A',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '24px',
            }}
          >
            More from this Vendor
          </h3>

          <div
            className="flex overflow-x-auto hide-scrollbar"
            style={{
              gap: '12px',
              paddingBottom: '8px',
            }}
          >
            {recommendedProducts.map((p) => (
              <div key={p.id} style={{ minWidth: '160px', maxWidth: '214px', flexShrink: 0 }}>
                <ProductCard
                  id={p.id}
                  imageUrl={p.image}
                  title={p.title}
                  brand={p.brand}
                  price={p.price}
                  originalPrice={p.originalPrice}
                  tag={p.tag}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ─── Reviews ───────────────────────────────────────────── */}
        <ReviewsSection
          rating={product.rating}
          totalReviews={product.reviews}
          productId={product.id}
        />
      </div>
    </>
  );
}
