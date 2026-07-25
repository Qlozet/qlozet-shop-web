'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { ProductCard } from '@/components/ProductCard';
import { SizeGuideModal } from '@/components/SizeGuideModal';
import { ReviewsSection } from '@/components/ReviewsSection';
import { useProduct } from '@/hooks/useProducts';
import { useVendorProducts } from '@/hooks/useVendors';
import {
  getProductName,
  getProductPrice,
  getProductOriginalPrice,
  getProductImage,
  getProductImages,
  getProductDescription,
  getProductColors,
  getProductSizes,
  getProductTag,
  getTurnaroundDays,
  hasDiscount,
  type ApiSizeGuide,
  type ApiSizeRecommendation,
} from '@/lib/api-types';
import type { ApiProduct, ApiFeedItem, CartSelections } from '@/lib/api-types';
import { api } from '@/lib/api';
import { useCustomization } from '@/hooks/useCustomization';
import { useTrackEvent } from '@/hooks/useTrackEvent';
import { useBoughtTogether, useCompleteTheLook } from '@/hooks/useRecommendations';
import { SILHOUETTES, NECKLINES, SLEEVES, FABRICS, ACCESSORIES } from '@/data/studio-options';
import { useStyleLibrary } from '@/hooks/useStyleLibrary';
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
  Loader2,
  X,
} from 'lucide-react';

// ─── Loading Skeleton ─────────────────────────────────────────
function ProductDetailSkeleton() {
  return (
    <div className="flex flex-col animate-pulse" style={{ padding: '8px 0 48px', gap: '32px' }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 w-full" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Image placeholder */}
        <div className="rounded-[20px] bg-[#F0EBE4]" style={{ aspectRatio: '3/4' }} />
        {/* Info panel */}
        <div className="flex flex-col" style={{ gap: '20px' }}>
          <div className="h-3 w-20 bg-[#E5E5E5] rounded" />
          <div className="h-6 w-48 bg-[#E5E5E5] rounded" />
          <div className="h-4 w-64 bg-[#E5E5E5] rounded" />
          <div className="h-7 w-32 bg-[#E5E5E5] rounded" />
          <div className="flex" style={{ gap: '8px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-[#E5E5E5]" />
            ))}
          </div>
          <div className="flex" style={{ gap: '8px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-[10px] bg-[#E5E5E5]" style={{ width: '42px', height: '42px' }} />
            ))}
          </div>
          <div className="h-12 w-full bg-[#E5E5E5] rounded-[14px]" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { wishlist, toggleWishlist, addToCart, addRecentlyViewed, user } = useApp();
  const trackEvent = useTrackEvent();

  const productId = params.id as string;

  // ── External fabric applied via the "Use Fabric" flow ──────────
  // UseFabricModal navigates to /products/:id?fabric=<fabricProductId>&customize=true.
  // This is the cross-vendor fabric that must ship to the tailor (FABRIC_TRANSFER),
  // so it goes to /cart/add as appliedFabricId + appliedFabricYards.
  const searchParams = useSearchParams();
  const appliedFabricId = searchParams.get('fabric') || undefined;
  const [appliedFabricMinCut, setAppliedFabricMinCut] = useState<number>(1);
  const [appliedFabricYards, setAppliedFabricYards] = useState<number | undefined>(undefined);

  // ── Fetch product from API ─────────────────────────────────────
  const { product, loading: productLoading, error: productError } = useProduct(productId);

  // Load the applied fabric's min_cut so the yardage defaults to a valid amount
  // (the backend rejects appliedFabricYards < fabric.min_cut).
  useEffect(() => {
    if (!appliedFabricId) return;
    let cancelled = false;
    api
      .get(`/products/${appliedFabricId}`)
      .then((res) => {
        const fab = res.data?.data ?? res.data;
        const minCut = Number(fab?.fabric?.min_cut) || 1;
        if (!cancelled) {
          setAppliedFabricMinCut(minCut);
          // Leave appliedFabricYards unset so it defaults to the garment's
          // requirement (resolveGarmentYards) at use time; the input still lets
          // the customer override.
        }
      })
      .catch(() => {
        /* non-fatal: keep the default minimum */
      });
    return () => {
      cancelled = true;
    };
  }, [appliedFabricId]);

  // ── Derived display values ─────────────────────────────────────
  const productName = product ? getProductName(product) : '';
  const productPrice = product ? getProductPrice(product) : 0;
  const productImage = product ? getProductImage(product) : '';
  const productDesc = product ? getProductDescription(product) : '';
  const colors = product ? getProductColors(product) : [];
  const tag = product ? getProductTag(product) : '';
  const turnaroundDays = product ? getTurnaroundDays(product) : null;
  const isCustomizable = tag === 'CUSTOMIZABLE';
  const isFabric = product?.kind === 'fabric';
  const rating = product?.average_rating ?? 0;
  const totalReviews = product?.total_ratings ?? 0;

  // Vendor info from populated business field
  const vendorName = typeof product?.business === 'object' ? product.business?.business_name ?? '' : '';
  const vendorId = typeof product?.business === 'object' ? product.business?._id : (product?.business as string | undefined);
  const vendorLogoUrl = typeof product?.business === 'object' ? product.business?.business_logo_url : undefined;

  // ── Fetch "more from this vendor" ──────────────────────────────
  const { products: vendorProducts } = useVendorProducts(vendorId, { size: 8 });
  const recommendedProducts = useMemo(() => {
    const others = vendorProducts.filter((p) => p._id !== product?._id);
    return others.length >= 2 ? others : vendorProducts.slice(0, 6);
  }, [vendorProducts, product?._id]);

  // ── Recommendation engine: bought-together + complete-look ─────
  const { items: boughtTogetherItems } = useBoughtTogether(product?._id, 6);
  const { items: completeTheLookItems } = useCompleteTheLook(
    product?._id ? [product._id] : [],
    6
  );

  // Helper: extract ApiProduct[] from feed items
  const feedToProducts = (items: ApiFeedItem[]): ApiProduct[] =>
    items.map(i => i.product).filter((p): p is ApiProduct => !!p && p._id !== product?._id);

  // Track product view on mount
  useEffect(() => {
    if (product) {
      addRecentlyViewed({ id: product._id, image: productImage, href: `/products/${product._id}` });
      trackEvent({
        eventType: 'view_item',
        properties: {
          itemId: product._id,
          price: productPrice,
          brand: vendorName,
          kind: product.kind,
        },
        context: { surface: 'product_page' },
      });
    }
  }, [product?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // UI States
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const [sizeGuideData, setSizeGuideData] = useState<ApiSizeGuide | null>(null);
  const [sizeGuideLoading, setSizeGuideLoading] = useState(true);

  useEffect(() => {
    if (!product?._id) {
      setSizeGuideData(null);
      setSizeGuideLoading(false);
      return;
    }
    const fetchSizeGuide = async () => {
      try {
        setSizeGuideLoading(true);
        // Public endpoint — looks up the size guide assigned to this product
        const res = await api.get(`/size-guides/product/${product._id}`);
        const actualData = res.data?.data ?? res.data;
        setSizeGuideData(actualData);
      } catch {
        // 404 means no size guide is assigned — that's fine
        setSizeGuideData(null);
      } finally {
        setSizeGuideLoading(false);
      }
    };
    fetchSizeGuide();
  }, [product?._id]);

  let galleryObjects: import('@/lib/api-types').ApiProductImage[] = [];
  if (product?.kind === 'clothing' && product.clothing?.images) {
    galleryObjects = product.clothing.images;
  } else if (product?.kind === 'fabric' && product.fabric?.images) {
    galleryObjects = product.fabric.images;
  } else if (product?.kind === 'accessory' && product.accessory?.images) {
    galleryObjects = product.accessory.images;
  }

  let gallery = galleryObjects.map(img => img.url).filter(Boolean);
  let sizes = product ? getProductSizes(product) : [];

  if (product?.kind === 'clothing' && selectedColor) {
    const cv = product.clothing?.color_variants?.find(c => (c.name || c.color_name) === selectedColor);
    if (cv) {
      const cvSizes = cv.variants?.map(v => v.size).filter(Boolean) as string[];
      if (cvSizes && cvSizes.length > 0) {
        sizes = cvSizes;
      }
      
      let cvImagesObj: import('@/lib/api-types').ApiProductImage[] = [];
      if (cv.images && cv.images.length > 0) {
        cvImagesObj = cv.images;
      } else if (cv.variants && cv.variants.length > 0) {
        const vWithImages = cv.variants.find(v => v.images && v.images.length > 0);
        if (vWithImages && vWithImages.images) {
          cvImagesObj = vWithImages.images;
        }
      }
      if (cvImagesObj.length > 0) {
        galleryObjects = cvImagesObj;
        gallery = cvImagesObj.map(img => img.url).filter(Boolean);
      }
    }
  }

  // (activeImageIdx is clamped in an effect below, against the combined gallery
  // that also includes AI-generated previews.)

  const [showDetails, setShowDetails] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showUseFabric, setShowUseFabric] = useState(false);
  const [showReserve, setShowReserve] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  // AI Size Recommendation
  const [sizeRec, setSizeRec] = useState<ApiSizeRecommendation | null>(null);
  const [sizeRecLoading, setSizeRecLoading] = useState(false);
  const [sizeRecError, setSizeRecError] = useState<string | null>(null);
  const [showSizeRecPopover, setShowSizeRecPopover] = useState(false);
  const aiButtonRef = useRef<HTMLDivElement>(null);
  const [aiPopoverAlign, setAiPopoverAlign] = useState<'left' | 'right'>('right');

  // Initialize size/color when product loads
  useEffect(() => {
    if (colors.length > 0 && !selectedColor) setSelectedColor(colors[0].name);
    // If selectedColor is set, sizes will be filtered for that color.
    // If selectedSize is not in the new sizes list, select the first size.
    if (sizes.length > 0 && (!selectedSize || !sizes.includes(selectedSize))) {
      setSelectedSize(sizes[0]);
    }
  }, [sizes, colors, selectedColor, selectedSize]); // eslint-disable-line react-hooks/exhaustive-deps

  // Zoom state
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const lastTapTime = useRef(0);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const getRelativePos = useCallback((clientX: number, clientY: number) => {
    if (!imageContainerRef.current) return { x: 50, y: 50 };
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    return { x, y };
  }, []);

  // Desktop: double-click to toggle zoom
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!isZoomed) {
      setZoomPos(getRelativePos(e.clientX, e.clientY));
    }
    setIsZoomed(prev => !prev);
  }, [isZoomed, getRelativePos]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isZoomed) return;
    setZoomPos(getRelativePos(e.clientX, e.clientY));
  }, [isZoomed, getRelativePos]);

  // Mobile: double-tap to toggle zoom, OR long-press to zoom (release exits)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressActive = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const pos = getRelativePos(touch.clientX, touch.clientY);
    longPressActive.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressActive.current = true;
      setZoomPos(pos);
      setIsZoomed(true);
    }, 400);
  }, [getRelativePos]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);

    // If it was a long-press zoom, just exit on release
    if (longPressActive.current) {
      longPressActive.current = false;
      setIsZoomed(false);
      return;
    }

    // Otherwise check for double-tap
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapTime.current < DOUBLE_TAP_DELAY) {
      e.preventDefault();
      const touch = e.changedTouches[0];
      if (!isZoomed) {
        setZoomPos(getRelativePos(touch.clientX, touch.clientY));
      }
      setIsZoomed(prev => !prev);
      lastTapTime.current = 0;
    } else {
      lastTapTime.current = now;
    }
  }, [isZoomed, getRelativePos]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isZoomed) {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      return;
    }
    const touch = e.touches[0];
    setZoomPos(getRelativePos(touch.clientX, touch.clientY));
  }, [isZoomed, getRelativePos]);

  // Lock page scroll while zoomed & attach non-passive touchmove to prevent scroll
  useEffect(() => {
    if (!isZoomed) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const container = imageContainerRef.current;
    const nativeTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };
    if (container) {
      container.addEventListener('touchmove', nativeTouchMove, { passive: false });
    }

    return () => {
      document.body.style.overflow = prev;
      if (container) {
        container.removeEventListener('touchmove', nativeTouchMove);
      }
    };
  }, [isZoomed]);

  const customization = useCustomization({ mode: 'product', defaultSection: 'styles' });

  // Sync color selection between main product details and Fabric panel
  useEffect(() => {
    if (selectedColor && selectedColor !== customization.selectedColor) {
      customization.setSelectedColor(selectedColor);
    }
  }, [selectedColor]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (customization.selectedColor && customization.selectedColor !== '#1B2A4A' && customization.selectedColor !== selectedColor) {
      setSelectedColor(customization.selectedColor);
    }
  }, [customization.selectedColor]); // eslint-disable-line react-hooks/exhaustive-deps

  // Look up selected styles from API cache or hardcoded fallback
  const { all: apiStyles } = useStyleLibrary();

  // ── Dynamic price: base price + all extras ──────────────────────
  // Garment fabric requirement (yards) for a given size — the bill of materials
  // that drives fabric pricing (embedded + external) and the yardage sent to cart.
  const resolveGarmentYards = useCallback((size: string | null): number | undefined => {
    const list = (product?.clothing as { yardage_per_size?: Array<{ size?: string; yards?: number }> } | undefined)?.yardage_per_size;
    const gy = list?.find((y) => (y.size ?? '').toLowerCase() === (size ?? '').toLowerCase());
    return gy?.yards;
  }, [product]);

  const customizationExtra = useMemo(() => {
    if (!product || product.kind !== 'clothing') return 0;
    const clothing = product.clothing;
    if (!clothing) return 0;

    let extras = 0;
    const hasFabrics = (clothing.fabrics?.length ?? 0) > 0;

    // Ready-to-wear / no embedded fabrics: price the chosen color variant.
    // Customize garments with embedded fabrics price the FABRIC by yardage
    // instead (below), so skip the color-variant price to avoid double-count.
    if (!hasFabrics && selectedColor && selectedSize) {
      const cv = clothing.color_variants?.find(c => (c.name || c.color_name) === selectedColor);
      if (cv?.variants) {
        const variant = cv.variants.find(v => v.size === selectedSize);
        if (variant?.price) extras += variant.price;
      }
    }

    // Fabric priced by yardage (yards × price_per_yard) for customize garments.
    // Yards come from the GARMENT's per-size requirement (bill of materials),
    // falling back to the fabric's min_cut.
    if (hasFabrics && customization.selectedFabric) {
      const fab = clothing.fabrics?.find((f: { _id?: string }) => f._id === customization.selectedFabric);
      if (fab?.price_per_yard) {
        const yards = resolveGarmentYards(selectedSize) || fab.min_cut || 1;
        extras += fab.price_per_yard * yards;
      }
    }

    // ── Helper: resolve extra cost for a selected style ID ──
    const resolveStyleCost = (id: string | null): number => {
      if (!id) return 0;
      // 1. Check product-level styles first
      const productStyle = clothing.styles?.find(
        (s: any) => s._id === id || s.style_code === id || s.name === id,
      );
      if (productStyle?.price) return productStyle.price;
      // 2. Check platform style library
      const apiMatch = apiStyles.find((s) => s._id === id);
      if (apiMatch?.price_suggestion) return apiMatch.price_suggestion;
      // 3. Hardcoded fallback
      const hardcoded = [...SILHOUETTES, ...NECKLINES, ...SLEEVES].find((s) => s.id === id);
      if (hardcoded?.extraCost) return hardcoded.extraCost;
      return 0;
    };

    // Sum prices of selected style options
    extras += resolveStyleCost(customization.selectedNeckline);
    extras += resolveStyleCost(customization.selectedSleeve);
    extras += resolveStyleCost(customization.selectedCollar);
    extras += resolveStyleCost(customization.selectedSilhouette);
    extras += resolveStyleCost(customization.selectedSkirt);
    extras += resolveStyleCost(customization.selectedTrouser);
    extras += resolveStyleCost(customization.selectedFullBody);

    // Sum prices of selected accessories
    for (const accId of customization.selectedAccessories) {
      const acc = clothing.accessories?.find(a => a._id === accId);
      if (acc?.price) extras += acc.price;
    }

    // Sum prices of selected add-on variants (selectedAddons is keyed by NAME → variant NAME)
    for (const [addonName, variantName] of Object.entries(customization.selectedAddons)) {
      const addon = clothing.addons?.find(a => a.name === addonName);
      const variant = addon?.variants?.find(v => v.name === variantName);
      if (variant?.price) extras += variant.price;
    }

    return extras;
  }, [
    product, productPrice, selectedColor, selectedSize, apiStyles,
    customization.selectedAccessories,
    customization.selectedAddons,
    customization.selectedFabric,
    customization.selectedNeckline,
    customization.selectedSleeve,
    customization.selectedCollar,
    customization.selectedSilhouette,
    customization.selectedSkirt,
    customization.selectedTrouser,
    customization.selectedFullBody,
  ]);

  // Authoritative price from the server (same math as cart/order). The local
  // productPrice + customizationExtra is only a fallback while it loads / for guests.
  const [serverPrice, setServerPrice] = useState<number | null>(null);
  const [serverBreakdown, setServerBreakdown] = useState<{ base: number; before_discount: number; discount: number; final: number } | null>(null);
  const displayPrice = serverPrice ?? productPrice + customizationExtra;
  // Cost of the customizations shown next to the price. Prefer the server
  // breakdown (before-discount extras = everything above base) so it stays
  // consistent with the discounted final; fall back to the local estimate.
  const extrasCost = serverBreakdown
    ? Math.max(0, serverBreakdown.before_discount - serverBreakdown.base)
    : customizationExtra;

  // Two prices shown on the PDP, both reflecting the chosen customizations:
  //  • discountedPrice — the final price the customer pays (after discount).
  //  • originalPrice   — base + customizations BEFORE discount (struck through).
  // Both come from the server breakdown so the discount is applied to the
  // customization costs too; the local estimate is only a pre-load fallback.
  const discountedPrice = displayPrice;
  const originalPrice = serverBreakdown
    ? serverBreakdown.before_discount
    : (product && hasDiscount(product)
        ? getProductOriginalPrice(product)
        : productPrice) + customizationExtra;
  const showOriginalPrice = serverBreakdown
    ? serverBreakdown.discount > 0
    : product
      ? hasDiscount(product)
      : false;

  // Look up selected styles from hardcoded fallback
  const findApiStyle = (id: string | null) => {
    if (!id) return null;
    const apiMatch = apiStyles.find((s) => s._id === id);
    if (apiMatch) return { label: apiMatch.name, emoji: '✂️', imageUrl: apiMatch.image_url, extraCost: apiMatch.price_suggestion };
    const hardcoded = [...SILHOUETTES, ...NECKLINES, ...SLEEVES].find((s) => s.id === id);
    if (hardcoded) return { label: hardcoded.label, emoji: hardcoded.emoji, imageUrl: undefined, extraCost: hardcoded.extraCost };
    return null;
  };

  const isWish = product ? wishlist.includes(product._id) : false;

  // Build the selections payload from the current configuration. Shared by
  // add-to-cart and the server price preview so both send the exact same thing.
  const buildSelections = useCallback((): CartSelections => {
    const selections: CartSelections = {};
    if (!product) return selections;

    if (product.kind === 'clothing' && product.clothing) {
      const clothing = product.clothing;
      const hasFabrics = (clothing.fabrics?.length ?? 0) > 0;

      // Fabric priced by yardage (customize garments with embedded fabrics).
      if (hasFabrics && customization.selectedFabric) {
        const fab = clothing.fabrics?.find(
          (f: { _id?: string }) => f._id === customization.selectedFabric,
        ) as { _id?: string; min_cut?: number } | undefined;
        if (fab?._id) {
          const yardage = resolveGarmentYards(selectedSize) || fab.min_cut || 1;
          selections.fabric_selections = [{ fabric_id: fab._id, yardage, size: selectedSize || undefined, quantity: 1 }];
        }
      }

      // Color variant — only when NOT pricing via fabric yardage (avoid double-count).
      if (!(hasFabrics && customization.selectedFabric) && selectedColor) {
        const cv = clothing.color_variants?.find(
          (c: any) => (c.name || c.color_name) === selectedColor,
        );
        if (cv?._id) {
          selections.color_variant_selections = [{ color_variant_id: cv._id, size: selectedSize || undefined, quantity: 1 }];
        }
      }

      const styleIds = [
        customization.selectedSilhouette, customization.selectedNeckline,
        customization.selectedSleeve, customization.selectedCollar,
        customization.selectedSkirt, customization.selectedTrouser,
        customization.selectedFullBody,
      ].filter(Boolean) as string[];
      if (styleIds.length > 0) {
        selections.style_selections = styleIds.map((id) => ({ style_id: id }));
      }

      if (customization.selectedAccessories.length > 0 && clothing.accessories) {
        selections.accessory_selections = customization.selectedAccessories
          .map((accId) => {
            const acc = clothing.accessories?.find((a: any) => a._id === accId);
            if (!acc?._id) return null;
            const firstVariant = acc.variants?.[0];
            // Send the variant when one exists (it pins stock), but never drop
            // the accessory for lacking one — that made the PDP price an
            // accessory that then never reached the cart/order.
            return firstVariant?._id
              ? { accessory_id: acc._id, variant_id: firstVariant._id, quantity: 1 }
              : { accessory_id: acc._id, quantity: 1 };
          })
          .filter(Boolean) as CartSelections['accessory_selections'];
      }

      if (Object.keys(customization.selectedAddons).length > 0) {
        selections.addon_selections = Object.entries(customization.selectedAddons)
          .map(([addonName, variantName]) => {
            const addonObj = product.clothing?.addons?.find(a => a.name === addonName);
            const variantObj = addonObj?.variants?.find(v => v.name === variantName);
            return addonObj?._id && variantObj?._id
              ? { addon_id: addonObj._id, variant_id: variantObj._id, quantity: 1 }
              : null;
          })
          .filter(Boolean) as any;
      }
    } else if (product.kind === 'fabric') {
      selections.fabric_selections = [{
        fabric_id: product._id,
        yardage: product.fabric?.min_cut || 1,
        size: selectedSize || undefined,
        quantity: 1,
      }];
    } else if (product.kind === 'accessory' && product.accessory) {
      const firstVariant = product.accessory.variants?.[0];
      selections.accessory_selections = [{
        accessory_id: product.accessory._id,
        variant_id: firstVariant?._id || product.accessory._id,
        quantity: 1,
      }];
    }
    return selections;
  }, [product, selectedColor, selectedSize, resolveGarmentYards,
    customization.selectedFabric, customization.selectedSilhouette,
    customization.selectedNeckline, customization.selectedSleeve,
    customization.selectedCollar, customization.selectedSkirt,
    customization.selectedTrouser, customization.selectedFullBody,
    customization.selectedAccessories, customization.selectedAddons]);

  // Debounced authoritative price preview from the server (one pricing brain).
  useEffect(() => {
    if (!product) return;
    const selections = buildSelections();
    const hasSelections = Object.values(selections).some(
      (arr) => Array.isArray(arr) && arr.length > 0,
    );
    if (!hasSelections && !appliedFabricId) {
      setServerPrice(null);
      setServerBreakdown(null);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(() => {
      api
        .post(
          '/orders/price-item',
          {
            product_id: product._id,
            quantity: 1,
            selections,
            ...(appliedFabricId
              ? {
                  applied_fabric_id: appliedFabricId,
                  applied_fabric_yards:
                    appliedFabricYards ?? resolveGarmentYards(selectedSize) ?? appliedFabricMinCut,
                }
              : {}),
          },
          { signal: controller.signal },
        )
        .then((res) => {
          // The API response wrapper nests the service's { data: {...} } under
          // its own `data`, so the real payload is res.data.data.data.
          const payload = res.data?.data?.data ?? res.data?.data ?? res.data;
          const p = payload?.price;
          if (typeof p === 'number') setServerPrice(p);
          const b = payload?.breakdown;
          if (b) setServerBreakdown(b);
        })
        .catch(() => {
          /* keep the local estimate on failure / for guests */
        });
    }, 400);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [
    product, buildSelections, appliedFabricId, appliedFabricYards,
    appliedFabricMinCut, resolveGarmentYards, selectedSize,
  ]);

  const handleAddToCart = () => {
    if (!product) return;
    const selections = buildSelections();

    addToCart({
      id: product._id,
      title: productName,
      price: displayPrice,
      // Show the customer's AI preview on the cart when they generated one; the
      // real product photo otherwise. This is customer-facing only — the order
      // sends selections, not this image, so the vendor still sees the actual
      // product photo (an AI approximation would mislead the tailor).
      image: customization.currentImage || productImage,
      kind: product.kind,
      size: selectedSize,
      color: selectedColor,
      selections,
      // External fabric applied to this garment (cross-vendor) — only meaningful
      // for clothing; the backend ships it to the tailor via a fabric transfer.
      ...(appliedFabricId && product.kind === 'clothing'
        ? {
            applied_fabric_id: appliedFabricId,
            // How many yards of the external fabric this garment needs (its
            // bill of materials), unless the customer overrode it.
            applied_fabric_yards:
              appliedFabricYards ?? resolveGarmentYards(selectedSize) ?? appliedFabricMinCut,
          }
        : {}),
    });
  };

  const handleCustomize = () => {
    router.push(
      `/bespoke?tryOnImg=${encodeURIComponent(productImage)}&title=${encodeURIComponent(productName)}`
    );
  };

  const handleAIRecommend = async () => {
    if (aiButtonRef.current) {
      const rect = aiButtonRef.current.getBoundingClientRect();
      // If button is on the left half of screen, align popover to left edge (extending right).
      // Otherwise align to right edge (extending left).
      if (rect.left < window.innerWidth / 2) {
        setAiPopoverAlign('left');
      } else {
        setAiPopoverAlign('right');
      }
    }

    if (!user) {
      setSizeRecError('Please sign in to get AI size recommendations');
      setShowSizeRecPopover(true);
      return;
    }
    if (!sizeGuideData?._id) {
      setSizeRecError('No size guide available for this product');
      setShowSizeRecPopover(true);
      return;
    }
    try {
      setSizeRecLoading(true);
      setSizeRecError(null);
      setShowSizeRecPopover(true);
      const res = await api.post(`/size-guides/${sizeGuideData._id}/recommend`, {
        preferred_unit: 'cm',
      });
      const data = res.data?.data ?? res.data;
      setSizeRec(data);
      // Auto-select the recommended size
      if (data.recommended_size) {
        setSelectedSize(data.recommended_size);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('400') || msg.includes('measurement')) {
        setSizeRecError('Please add your body measurements in your profile first');
      } else {
        setSizeRecError('Unable to get recommendation. Please try again.');
      }
      setSizeRec(null);
    } finally {
      setSizeRecLoading(false);
    }
  };

  // Product photos + any AI previews generated this session (from the Apply
  // button). The generated previews become extra thumbnails the user can flip
  // between, alongside the real product photos.
  const combinedGallery = [...gallery, ...customization.generatedImages];
  const firstGeneratedIdx = gallery.length;

  const prevImage = () =>
    setActiveImageIdx((i) => (i === 0 ? Math.max(combinedGallery.length - 1, 0) : i - 1));
  const nextImage = () =>
    setActiveImageIdx((i) => (i === combinedGallery.length - 1 ? 0 : i + 1));

  const kindLabel =
    product?.kind === 'clothing'
      ? 'Clothing'
      : product?.kind === 'fabric'
        ? 'Fabrics'
        : 'Accessories';

  // Current gallery image (with fallback). Follows the selected thumbnail across
  // both product photos and AI previews.
  const currentImage = combinedGallery[activeImageIdx] || productImage || '/image/bespoke-agbada-orange.webp';

  // When a new AI preview finishes, jump the viewer to it; also clamp the index
  // if the gallery shrinks (e.g. a colour change removes photos).
  const prevGenCountRef = useRef(0);
  useEffect(() => {
    const genCount = customization.generatedImages.length;
    if (genCount > prevGenCountRef.current) {
      setActiveImageIdx(gallery.length + genCount - 1);
    } else if (combinedGallery.length > 0 && activeImageIdx >= combinedGallery.length) {
      setActiveImageIdx(combinedGallery.length - 1);
    }
    prevGenCountRef.current = genCount;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customization.generatedImages.length, gallery.length, combinedGallery.length]);

  // Color hex map from API colors
  const colorHexMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of colors) {
      map[c.name] = c.hex;
    }
    return map;
  }, [colors]);

  // ── Loading & Error States ──────────────────────────────────
  if (productLoading) return <ProductDetailSkeleton />;

  if (productError || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in" style={{ gap: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1A1A1A' }}>Product Not Found</h2>
        <p style={{ fontSize: '14px', color: '#888' }}>{productError || 'This product may have been removed or is no longer available.'}</p>
        <button
          onClick={() => router.push('/products')}
          className="btn-primary"
          style={{ padding: '12px 24px', fontSize: '13px' }}
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Floating Size Guide — rendered outside animated div to escape stacking context */}
      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        category={`Men / ${kindLabel}`}
        guideData={sizeGuideData}
      />
      <div
        className="flex flex-col animate-fade-in relative lg:overflow-x-clip"
        style={{ padding: '8px 0 48px', gap: '32px' }}
      >
        {/* ─── Back Button (sticky, matches studio style) ─────────── */}
        <button
          onClick={() => router.back()}
          className="sticky top-4 z-40 flex items-center justify-center transition-all hover:bg-white/80 backdrop-blur-md shadow-sm"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.9)',
            border: '1px solid #F0F0F0',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={20} color="#1A1A1A" />
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
              ref={imageContainerRef}
              className="relative overflow-hidden select-none"
              style={{
                aspectRatio: '3 / 4',
                borderRadius: '20px',
                background: '#F5F5F5',
                cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                touchAction: isZoomed ? 'none' : 'auto',
              }}
              onDoubleClick={handleDoubleClick}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Normal Image */}
              {currentImage && (
                <Image
                  src={currentImage}
                  alt={productName}
                  fill
                  style={{
                    objectFit: 'cover',
                    opacity: isZoomed ? 0 : 1,
                    transition: 'opacity 0.2s',
                  }}
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  draggable={false}
                />
              )}

              {/* Zoomed Image Layer */}
              <div
                className="absolute inset-0 transition-opacity duration-200"
                style={{
                  opacity: isZoomed ? 1 : 0,
                  pointerEvents: isZoomed ? 'auto' : 'none',
                  backgroundImage: `url(${currentImage})`,
                  backgroundSize: '250%',
                  backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                  backgroundRepeat: 'no-repeat',
                }}
              />

              {/* Zoom indicator badge */}
              <div
                className="absolute flex items-center justify-center transition-all duration-300"
                style={{
                  bottom: '14px',
                  left: '14px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: isZoomed ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(6px)',
                  gap: '6px',
                  opacity: isZoomed ? 1 : 0.7,
                  zIndex: 20,
                  pointerEvents: 'none',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  {isZoomed ? (
                    <line x1="8" y1="11" x2="14" y2="11" />
                  ) : (
                    <>
                      <line x1="11" y1="8" x2="11" y2="14" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </>
                  )}
                </svg>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.04em' }}>
                  {isZoomed ? 'ZOOMED' : 'DOUBLE TAP TO ZOOM'}
                </span>
              </div>

              {/* ── Customization Hotspots ── */}
              {isCustomizable && !isZoomed && (() => {
                const productStyles = product?.clothing?.styles || [];

                // Look up a style selection by its ID
                const findSelectedStyle = (id: string | null) => {
                  if (!id) return null;
                  const s = productStyles.find(st => st._id === id || st.style_code === id || st.name === id);
                  if (s) return { label: s.name, emoji: '✂️', imageUrl: s.images?.[0]?.url, extraCost: s.price || 0 };
                  return findApiStyle(id);
                };

                // Map field_key → which customization selection to display
                const FIELD_KEY_MAP: Record<string, {
                  getSelected: () => ReturnType<typeof findSelectedStyle>;
                  section: string;
                  emoji: string;
                  fallbackLabel: string;
                }> = {
                  neckline: { getSelected: () => findSelectedStyle(customization.selectedNeckline), section: 'styles', emoji: '👗', fallbackLabel: 'Neckline' },
                  collar: { getSelected: () => findSelectedStyle(customization.selectedCollar), section: 'styles', emoji: '👔', fallbackLabel: 'Collar' },
                  sleeve: { getSelected: () => findSelectedStyle(customization.selectedSleeve), section: 'styles', emoji: '🧤', fallbackLabel: 'Sleeves' },
                  trouser: { getSelected: () => findSelectedStyle(customization.selectedTrouser), section: 'styles', emoji: '👖', fallbackLabel: 'Trouser' },
                  skirt: { getSelected: () => findSelectedStyle(customization.selectedSkirt), section: 'styles', emoji: '👗', fallbackLabel: 'Skirt' },
                  full_body: { getSelected: () => findSelectedStyle(customization.selectedFullBody), section: 'styles', emoji: '👘', fallbackLabel: 'Silhouette' },
                  fabric: { getSelected: () => null, section: 'fabric', emoji: '🧵', fallbackLabel: 'Fabric' },
                  accessories: { getSelected: () => null, section: 'accessories', emoji: '✨', fallbackLabel: 'Accessories' },
                };

                const openSection = (section: string) => {
                  setShowCustomize(true);
                  customization.setExpandedSection(section);
                };

                const Hotspot = ({ name, top, left, transform, delay, section, children }: {
                  name: string; top: string; left: string; transform?: string; delay?: string; section: string;
                  children: React.ReactNode;
                }) => (
                  <div
                    className="absolute z-10 flex items-center transition-all duration-500 ease-out cursor-pointer"
                    style={{ top, left, transform }}
                    onMouseEnter={() => setActiveHotspot(name)}
                    onMouseLeave={() => setActiveHotspot(null)}
                    onClick={(e) => { e.stopPropagation(); openSection(section); }}
                  >
                    <div className="relative flex items-center">
                      <div
                        className="hotspot-dot rounded-full bg-white border-[3px] border-white shadow-md flex-shrink-0 w-[24px] h-[24px] lg:w-[14px] lg:h-[14px]"
                        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.25)', animationDelay: delay }}
                      />
                      <div
                        className={`absolute left-full top-1/2 -translate-y-1/2 items-center overflow-hidden transition-all duration-500 ease-out hidden lg:flex ${activeHotspot === name || showCustomize ? 'max-w-[220px] opacity-100 ml-2' : 'max-w-0 opacity-0 ml-0'}`}
                        style={{ transitionDelay: delay }}
                      >
                        {children}
                      </div>
                    </div>
                  </div>
                );

                const imageHotspots = galleryObjects[activeImageIdx]?.hotspots || [];
                if (imageHotspots.length === 0) return null;

                return (
                  <>
                    {imageHotspots.map((hs, idx) => {
                      const fieldKey = hs.field_key || hs.label.toLowerCase();
                      const mapping = FIELD_KEY_MAP[fieldKey];
                      const selected = mapping?.getSelected();
                      const section = mapping?.section || 'styles';
                      const fallbackEmoji = mapping?.emoji || '✨';
                      const fallbackLabel = mapping?.fallbackLabel || fieldKey;

                      const displayName = selected?.label || fallbackLabel;
                      const displayCost = selected?.extraCost || 0;
                      const displayEmoji = selected?.emoji || fallbackEmoji;
                      const displayImage = selected?.imageUrl;

                      return (
                        <Hotspot
                          key={idx}
                          name={`${fieldKey}-${idx}`}
                          top={`${hs.y * 100}%`}
                          left={`${hs.x * 100}%`}
                          transform="translate(-50%, -50%)"
                          section={section}
                          delay={`${idx * 0.3}s`}
                        >
                          <div className="flex items-center bg-[#333]/85 backdrop-blur-sm rounded-[12px] shadow-lg" style={{ padding: '8px 10px', gap: '8px', maxWidth: '200px' }}>
                            <div className="flex-1" style={{ overflow: 'hidden', minWidth: 0 }}>
                              <p className="text-white whitespace-nowrap" style={{ fontSize: '13px', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</p>
                              <p className="text-white/70 whitespace-nowrap" style={{ fontSize: '10px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {displayCost > 0 ? `+ ₦${displayCost.toLocaleString()}` : 'Included'}
                              </p>
                            </div>
                            <div className="flex items-center justify-center bg-white rounded-[8px] flex-shrink-0 overflow-hidden" style={{ width: '32px', height: '32px' }}>
                              {displayImage ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={displayImage} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <span style={{ fontSize: '18px' }}>{displayEmoji}</span>
                              )}
                            </div>
                          </div>
                        </Hotspot>
                      );
                    })}
                  </>
                );
              })()}

              {/* Carousel Arrows */}
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute flex items-center justify-center hover:bg-white transition-colors"
                    style={{
                      left: '16px', top: '50%', transform: 'translateY(-50%)',
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: 'rgba(255,255,255,0.85)', border: 'none',
                      cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                  >
                    <ChevronLeft size={20} color="#333" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute flex items-center justify-center hover:bg-white transition-colors"
                    style={{
                      right: '16px', top: '50%', transform: 'translateY(-50%)',
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: 'rgba(255,255,255,0.85)', border: 'none',
                      cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                  >
                    <ChevronRight size={20} color="#333" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip — product photos + AI previews from this session */}
            {combinedGallery.length > 1 && (
              <div className="flex overflow-x-auto hide-scrollbar" style={{ gap: '10px' }}>
                {combinedGallery.map((img, idx) => {
                  const isGenerated = idx >= firstGeneratedIdx;
                  return (
                    <button
                      key={`${idx}-${img}`}
                      onClick={() => setActiveImageIdx(idx)}
                      className="relative overflow-hidden transition-all"
                      style={{
                        width: '72px', height: '72px', borderRadius: '12px',
                        border: idx === activeImageIdx
                          ? '2px solid #1A1A1A'
                          : isGenerated ? '2px solid #C4B5FD' : '2px solid #E5E5E5',
                        background: '#F5F5F5', cursor: 'pointer',
                        opacity: idx === activeImageIdx ? 1 : 0.7, flexShrink: 0,
                      }}
                    >
                      <Image src={img} alt={`${productName} view ${idx + 1}`} fill style={{ objectFit: 'cover' }} sizes="72px" />
                      {isGenerated && (
                        <span
                          className="absolute"
                          style={{
                            top: '3px', left: '3px',
                            padding: '1px 5px', borderRadius: '5px',
                            background: '#4C1D95', color: '#FFF',
                            fontSize: '8px', fontWeight: 800, letterSpacing: '0.04em',
                          }}
                        >
                          AI
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Mobile Category Pills (visible on mobile only) ── */}
            {isCustomizable && (
              <div className="flex lg:hidden overflow-x-auto" style={{ gap: '8px', paddingBottom: '4px' }}>
                {[
                  { id: customization.selectedNeckline, cat: 'Neckline', section: 'styles', fallbackEmoji: '👗' },
                  { id: customization.selectedSleeve, cat: 'Sleeves', section: 'styles', fallbackEmoji: '💪' },
                  { id: customization.selectedCollar, cat: 'Collar', section: 'styles', fallbackEmoji: '👔' },
                  { id: customization.selectedSkirt, cat: 'Skirt', section: 'styles', fallbackEmoji: '👗' },
                  { id: customization.selectedTrouser, cat: 'Trouser', section: 'styles', fallbackEmoji: '👖' },
                  { id: customization.selectedFullBody, cat: 'Style', section: 'styles', fallbackEmoji: '👘' },
                ].map(({ id, cat, section, fallbackEmoji }) => {
                  const style = findApiStyle(id);
                  return (
                    <button
                      key={cat}
                      onClick={() => { setShowCustomize(true); customization.setExpandedSection(section); }}
                      className="flex items-center flex-shrink-0 transition-all active:scale-95"
                      style={{
                        padding: '6px 12px 6px 6px', borderRadius: '24px',
                        border: style ? '1.5px solid #2C1810' : '1.5px dashed #CCC',
                        background: style ? '#FAF6F1' : '#FAFAFA',
                        cursor: 'pointer', gap: '8px',
                      }}
                    >
                      <div className="flex items-center justify-center overflow-hidden" style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F5F5F5', flexShrink: 0 }}>
                        {style?.imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={style.imageUrl} alt={style.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '14px' }}>{fallbackEmoji}</span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: style ? '#2C1810' : '#999', whiteSpace: 'nowrap' }}>
                        {style?.label || cat}
                      </span>
                    </button>
                  );
                })}
                {/* Fabric pill */}
                {(() => {
                  const selFab = FABRICS.find((f) => f.id === customization.selectedFabric);
                  return (
                    <button
                      onClick={() => { setShowCustomize(true); customization.setExpandedSection('fabric'); }}
                      className="flex items-center flex-shrink-0 transition-all active:scale-95"
                      style={{
                        padding: '6px 12px 6px 6px', borderRadius: '24px',
                        border: selFab ? '1.5px solid #2C1810' : '1.5px dashed #CCC',
                        background: selFab ? '#FAF6F1' : '#FAFAFA',
                        cursor: 'pointer', gap: '8px',
                      }}
                    >
                      <div className="relative overflow-hidden flex-shrink-0" style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F5F5F5' }}>
                        {selFab ? (
                          <Image src={selFab.image} alt={selFab.name} fill style={{ objectFit: 'cover' }} sizes="28px" />
                        ) : (
                          <span className="flex items-center justify-center w-full h-full" style={{ fontSize: '14px' }}>🧵</span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: selFab ? '#2C1810' : '#999', whiteSpace: 'nowrap' }}>
                        {selFab?.name || 'Fabric'}
                      </span>
                    </button>
                  );
                })()}
                {/* Accessories pill */}
                {(() => {
                  const selAccCount = customization.selectedAccessories.length;
                  return (
                    <button
                      onClick={() => { setShowCustomize(true); customization.setExpandedSection('accessories'); }}
                      className="flex items-center flex-shrink-0 transition-all active:scale-95"
                      style={{
                        padding: '6px 12px 6px 6px', borderRadius: '24px',
                        border: selAccCount > 0 ? '1.5px solid #7C3AED' : '1.5px dashed #CCC',
                        background: selAccCount > 0 ? '#F0EDFF' : '#FAFAFA',
                        cursor: 'pointer', gap: '8px',
                      }}
                    >
                      <div className="flex items-center justify-center" style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F5F5F5', flexShrink: 0 }}>
                        <span style={{ fontSize: '14px' }}>🪢</span>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: selAccCount > 0 ? '#5B21B6' : '#999', whiteSpace: 'nowrap' }}>
                        {selAccCount > 0 ? `${selAccCount} selected` : 'Accessories'}
                      </span>
                    </button>
                  );
                })()}
              </div>
            )}
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
                    <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill={s <= Math.round(rating) ? '#F5A623' : 'none'} stroke={s <= Math.round(rating) ? '#F5A623' : '#D0D0D0'} strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1A' }}>{rating.toFixed(1)}</span>
                {totalReviews > 0 && (
                  <span style={{ fontSize: '12px', color: '#888' }}>({totalReviews})</span>
                )}
              </div>
              <button
                onClick={() => toggleWishlist(product._id)}
                className="flex items-center justify-center transition-all hover:scale-110"
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  border: '1px solid #E5E5E5', background: 'white', cursor: 'pointer',
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
            {vendorId ? (
              <Link href={`/vendor/${vendorId}`} style={{ textDecoration: 'none' }}>
                <h2
                  className="hover:opacity-70 transition-opacity"
                  style={{
                    fontSize: '16px', fontWeight: 800, color: '#1A1A1A',
                    textTransform: 'uppercase', letterSpacing: '0.15em',
                    margin: 0, lineHeight: 1.2, cursor: 'pointer',
                  }}
                >
                  {vendorName}
                </h2>
              </Link>
            ) : (
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0, lineHeight: 1.2 }}>
                {vendorName}
              </h2>
            )}

            {/* Title */}
            <p style={{ fontSize: '14px', color: '#666', margin: 0, lineHeight: 1.4 }}>
              {productName}
            </p>

            {/* Price — discounted (paid) + original (before discount), both
                reflecting the chosen customizations. */}
            <div className="flex items-center flex-wrap" style={{ gap: '8px' }}>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.02em' }}>
                ₦{discountedPrice.toLocaleString()}
              </span>
              {showOriginalPrice && originalPrice > discountedPrice + 0.5 && (
                <span style={{ fontSize: '15px', fontWeight: 500, color: '#AAA', textDecoration: 'line-through' }}>
                  ₦{originalPrice.toLocaleString()}
                </span>
              )}
              {extrasCost > 0 && (
                <span style={{
                  fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px',
                  background: '#EDE9FE', color: '#6D28D9',
                }}>
                  +₦{extrasCost.toLocaleString()} styling
                </span>
              )}
            </div>

            {/* Delivery Estimate */}
            <div
              className="flex items-center"
              style={{
                gap: '8px', padding: '10px 14px', borderRadius: '10px',
                background: '#FAFAFA', border: '1px solid #F0F0F0',
              }}
            >
              <Clock size={14} color="#999" />
              <span style={{ fontSize: '12px', color: '#888' }}>
                {turnaroundDays != null ? (
                  <>If you order within the next hour, you will get it in <strong style={{ color: '#1A1A1A' }}>{turnaroundDays} days</strong>.</>
                ) : (
                  <>If you order within the next hour, you will get it in <strong style={{ color: '#1A1A1A' }}>2 weeks</strong>.</>
                )}
              </span>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: '#F0F0F0' }} />

            {/* Colour Swatches */}
            {colors.length > 0 && (
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', marginBottom: '10px', display: 'block' }}>
                  Colour: <span style={{ fontWeight: 400, color: '#666' }}>{selectedColor}</span>
                </span>
                <div className="flex items-center" style={{ gap: '8px' }}>
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className="transition-all"
                      style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: color.hex || '#CCC',
                        border: color.name === selectedColor ? '3px solid #1A1A1A' : '2px solid #E5E5E5',
                        cursor: 'pointer',
                        outline: color.name === selectedColor ? '2px solid white' : 'none',
                        outlineOffset: '-4px',
                      }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Selected Customizations Summary — only for customizable clothing */}
            {isCustomizable && (
              <div className="flex flex-col" style={{ gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Selected Customizations
                </span>
                <div className="flex flex-wrap" style={{ gap: '8px' }}>
                  {[
                    { id: customization.selectedNeckline, cat: 'Neckline' },
                    { id: customization.selectedSleeve, cat: 'Sleeve' },
                    { id: customization.selectedCollar, cat: 'Collar' },
                    { id: customization.selectedSkirt, cat: 'Skirt' },
                    { id: customization.selectedTrouser, cat: 'Trouser' },
                    { id: customization.selectedFullBody, cat: 'Style' },
                    { id: customization.selectedSilhouette, cat: 'Silhouette' },
                  ].map(({ id, cat }) => {
                    const style = findApiStyle(id);
                    if (!style) return null;
                    return (
                      <div key={`${cat}-${id}`} className="flex flex-col items-center" style={{ gap: '4px' }}>
                        <div
                          className="flex items-center justify-center overflow-hidden"
                          style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#F5F5F5', border: '2px solid #1A1A1A' }}
                        >
                          {style.imageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={style.imageUrl} alt={style.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '22px' }}>{style.emoji}</span>
                          )}
                        </div>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#666', textAlign: 'center', maxWidth: '56px', lineHeight: 1.2 }}>{style.label}</span>
                      </div>
                    );
                  })}

                  {/* Selected Accessories */}
                  {customization.selectedAccessories.map((accId) => {
                    // Prefer the product's real accessory (selections are keyed
                    // by _id now); fall back to static studio options.
                    const prodAcc = product?.clothing?.accessories?.find(
                      (a: { _id?: string }) => a._id === accId,
                    ) as { name?: string } | undefined;
                    const acc = prodAcc
                      ? { id: accId, name: prodAcc.name ?? 'Accessory', emoji: '✨' }
                      : ACCESSORIES.find((a) => a.id === accId);
                    return acc ? (
                      <div key={accId} className="flex flex-col items-center" style={{ gap: '4px' }}>
                        <div className="flex items-center justify-center" style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#F0EDFF', border: '2px solid #7C3AED' }}>
                          <span style={{ fontSize: '22px' }}>{acc.emoji}</span>
                        </div>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#5B21B6', textAlign: 'center', maxWidth: '56px', lineHeight: 1.2 }}>{acc.name}</span>
                      </div>
                    ) : null;
                  })}

                  {/* Empty state */}
                  {!customization.selectedSilhouette && !customization.selectedNeckline && !customization.selectedSleeve && !customization.selectedCollar && !customization.selectedSkirt && !customization.selectedTrouser && !customization.selectedFullBody && customization.selectedAccessories.length === 0 && (
                    <span style={{ fontSize: '12px', color: '#AAA', fontStyle: 'italic' }}>
                      Tap &quot;Customize Outfit&quot; to select styles
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Size Guide Link — only shown when a real size guide is assigned */}
            {product.kind === 'clothing' && sizeGuideData && (
              <button
                onClick={() => setShowSizeGuide(true)}
                className="flex items-center self-start hover:text-gray-800 transition-colors"
                style={{
                  gap: '6px', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 600, color: '#1A1A1A',
                  textDecoration: 'underline', textUnderlineOffset: '3px', padding: 0,
                }}
              >
                <Ruler size={14} />
                Size Guide
              </button>
            )}

            {/* Size Selector Pills */}
            {sizes.length > 0 && (
              <div className="flex flex-wrap" style={{ gap: '8px' }}>
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className="flex items-center justify-center transition-all"
                    style={{
                      minWidth: '42px', height: '42px', padding: '0 14px',
                      borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                      background: size === selectedSize ? '#1A1A1A' : '#FFFFFF',
                      color: size === selectedSize ? '#FFFFFF' : '#1A1A1A',
                      border: size === selectedSize ? '2px solid #1A1A1A' : '1px solid #E0E0E0',
                    }}
                  >
                    {size}
                  </button>
                ))}

                {/* AI Size Recommendation Button */}
                {product.kind === 'clothing' && (
                  <div style={{ position: 'relative' }} ref={aiButtonRef}>
                    <button
                      onClick={handleAIRecommend}
                      disabled={sizeRecLoading}
                      className="flex items-center justify-center transition-all hover:bg-gray-100"
                      style={{
                        minWidth: '42px', height: '42px', padding: '0 12px',
                        borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                        background: sizeRec ? 'linear-gradient(135deg, #7C3AED, #4F46E5)' : '#F5F5F5',
                        color: sizeRec ? '#FFF' : '#666',
                        border: sizeRec ? '2px solid #7C3AED' : '1px solid #E0E0E0', gap: '4px',
                        opacity: sizeRecLoading ? 0.6 : 1,
                      }}
                      title="AI-powered size recommendation"
                    >
                      {sizeRecLoading ? (
                        <span className="animate-spin" style={{ width: 13, height: 13, border: '2px solid #999', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} />
                      ) : (
                        <Sparkles size={13} />
                      )}
                      AI
                    </button>

                    {/* AI Recommendation Popover */}
                    {showSizeRecPopover && (
                      <div
                        className="animate-fade-in"
                        style={{
                          position: 'absolute', top: '100%', marginTop: '8px',
                          background: 'white', borderRadius: '16px', border: '1px solid #E5E5E5',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 50,
                          minWidth: '280px', maxWidth: '320px', overflow: 'hidden',
                          ...(aiPopoverAlign === 'right' ? { right: 0 } : { left: 0 }),
                        }}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between" style={{ padding: '14px 16px 10px', borderBottom: '1px solid #F0F0F0' }}>
                          <div className="flex items-center gap-2">
                            <Sparkles size={14} color="#7C3AED" />
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1A1A' }}>AI Size Recommendation</span>
                          </div>
                          <button onClick={() => setShowSizeRecPopover(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                            <X size={14} color="#999" />
                          </button>
                        </div>

                        <div style={{ padding: '14px 16px' }}>
                          {/* Error State */}
                          {sizeRecError && (
                            <div style={{ fontSize: '12px', color: '#DC2626', lineHeight: 1.5 }}>
                              {sizeRecError}
                              {sizeRecError.includes('measurements') && (
                                <button
                                  onClick={() => router.push('/profile?tab=measurements')}
                                  style={{ display: 'block', marginTop: '8px', fontSize: '12px', fontWeight: 600, color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                                >
                                  Add Measurements →
                                </button>
                              )}
                              {sizeRecError.includes('sign in') && (
                                <button
                                  onClick={() => router.push('/profile')}
                                  style={{ display: 'block', marginTop: '8px', fontSize: '12px', fontWeight: 600, color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                                >
                                  Sign In →
                                </button>
                              )}
                            </div>
                          )}

                          {/* Loading State */}
                          {sizeRecLoading && !sizeRecError && (
                            <div className="flex items-center gap-2" style={{ fontSize: '12px', color: '#888' }}>
                              <span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid #E5E5E5', borderTopColor: '#7C3AED', borderRadius: '50%', display: 'inline-block' }} />
                              Analyzing your measurements…
                            </div>
                          )}

                          {/* Results */}
                          {sizeRec && !sizeRecLoading && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {/* Recommended Size */}
                              <div className="flex items-center justify-between">
                                <span style={{ fontSize: '12px', color: '#666' }}>Your size</span>
                                <div className="flex items-center gap-2">
                                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#1A1A1A' }}>{sizeRec.recommended_size}</span>
                                  <span style={{
                                    fontSize: '10px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px',
                                    background: sizeRec.confidence >= 0.8 ? '#DCFCE7' : sizeRec.confidence >= 0.6 ? '#FEF9C3' : '#FEE2E2',
                                    color: sizeRec.confidence >= 0.8 ? '#166534' : sizeRec.confidence >= 0.6 ? '#854D0E' : '#991B1B',
                                  }}>
                                    {Math.round(sizeRec.confidence * 100)}% match
                                  </span>
                                </div>
                              </div>

                              {/* Breakdown */}
                              {sizeRec.breakdown && sizeRec.breakdown.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  {sizeRec.breakdown.map(b => (
                                    <div key={b.body_part} className="flex items-center justify-between" style={{ fontSize: '11px', padding: '6px 10px', borderRadius: '8px', background: '#FAFAFA' }}>
                                      <span style={{ color: '#555', textTransform: 'capitalize' }}>{b.body_part.replace(/_/g, ' ')}</span>
                                      <div className="flex items-center gap-2">
                                        <span style={{ color: '#888' }}>{b.customer_value} → {b.range}</span>
                                        <span style={{ fontSize: '10px', color: b.fits ? '#16A34A' : '#DC2626' }}>
                                          {b.fits ? '✓' : '✗'}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                )}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col" style={{ gap: '10px', marginTop: '8px' }}>
              {isCustomizable && (
                <button
                  onClick={() => setShowCustomize(!showCustomize)}
                  className="w-full flex items-center justify-center transition-all hover:opacity-90"
                  style={{
                    padding: '15px', borderRadius: '14px',
                    background: showCustomize ? '#3B0764' : '#4C1D95',
                    color: '#FFFFFF', border: 'none', fontSize: '13px', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', gap: '8px',
                  }}
                >
                  <Pen size={15} />
                  {showCustomize ? 'Hide Customization' : 'Customize Outfit'}
                </button>
              )}

              {appliedFabricId && product?.kind === 'clothing' && (
                <div
                  style={{
                    display: 'flex', flexDirection: 'column', gap: '6px',
                    padding: '12px 14px', borderRadius: '12px',
                    background: '#F5F3FF', border: '1px solid #DDD6FE',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#4C1D95', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Applied fabric
                  </span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#3B0764' }}>
                    Yards
                    <input
                      type="number"
                      min={appliedFabricMinCut}
                      step={0.5}
                      value={appliedFabricYards ?? resolveGarmentYards(selectedSize) ?? appliedFabricMinCut}
                      onChange={(e) =>
                        setAppliedFabricYards(
                          Math.max(appliedFabricMinCut, Number(e.target.value) || appliedFabricMinCut)
                        )
                      }
                      style={{ width: '90px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #C4B5FD', fontSize: '13px' }}
                    />
                    <span style={{ fontSize: '12px', color: '#7C6BA0' }}>min {appliedFabricMinCut} yd</span>
                  </label>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center transition-all hover:opacity-90"
                style={{
                  padding: '15px', borderRadius: '14px',
                  background: '#064E3B', color: '#FFFFFF', border: 'none',
                  fontSize: '13px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', cursor: 'pointer', gap: '8px',
                }}
              >
                <ShoppingCart size={15} />
                Add to Cart
              </button>

              {isFabric && (
                <button
                  onClick={() => setShowUseFabric(true)}
                  className="w-full flex items-center justify-center transition-all hover:opacity-90"
                  style={{
                    padding: '15px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, #3B0764 0%, #4C1D95 100%)',
                    color: '#FFFFFF', border: 'none', fontSize: '13px', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', gap: '8px',
                  }}
                >
                  <Scissors size={15} />
                  Use Fabric
                </button>
              )}

              {isFabric && (
                <button
                  onClick={() => setShowReserve(true)}
                  className="w-full flex items-center justify-center transition-all hover:opacity-90"
                  style={{
                    padding: '15px', borderRadius: '14px',
                    background: '#2C1810', color: '#FFFFFF', border: 'none',
                    fontSize: '13px', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', cursor: 'pointer', gap: '8px',
                  }}
                >
                  <CalendarDays size={15} />
                  Reserve for Event
                </button>
              )}
            </div>

            {/* Customization Panel */}
            {isCustomizable && (
              <ProductCustomizePanel
                isOpen={showCustomize}
                customization={customization}
                onClose={() => setShowCustomize(false)}
                product={product}
                selectedSize={selectedSize}
              />
            )}

            {/* Use Fabric Modal */}
            {isFabric && (
              <UseFabricModal
                isOpen={showUseFabric}
                onClose={() => setShowUseFabric(false)}
                fabricImage={productImage}
                fabricName={productName}
                fabricId={product._id}
              />
            )}

            {/* Reserve Fabric Modal */}
            {isFabric && (
              <ReserveFabricModal
                isOpen={showReserve}
                onClose={() => setShowReserve(false)}
                fabricId={product._id}
                fabricName={productName}
                fabricImage={productImage}
                fabricPrice={productPrice}
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
                  background: 'none', border: 'none', fontSize: '12px', color: '#999',
                  cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px',
                }}
              >
                View our Delivery &amp; Return Policy
              </button>
            </div>

            {/* Product Details Accordion */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between transition-colors hover:bg-gray-50"
              style={{
                padding: '16px 0',
                background: 'transparent', border: 'none',
                borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: '#F0F0F0',
                borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: '#F0F0F0',
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
                {productDesc && (
                  <div 
                    className="prose"
                    style={{ fontSize: '13px', color: '#666', lineHeight: 1.7, marginBottom: '16px' }}
                    dangerouslySetInnerHTML={{ __html: productDesc }}
                  />
                )}
              </div>
            )}
          </div>
        </section>

        {/* ─── More from this Vendor ───────────────────────────────── */}
        {recommendedProducts.length > 0 && (
          <section>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>
              More from this Vendor
            </h3>
            <div className="flex overflow-x-auto hide-scrollbar" style={{ gap: '12px', paddingBottom: '8px' }}>
              {recommendedProducts.map((p) => (
                <div key={p._id} style={{ minWidth: '160px', maxWidth: '214px', flexShrink: 0 }}>
                  <ProductCard
                    id={p._id}
                    imageUrl={getProductImage(p)}
                    title={getProductName(p)}
                    brand={typeof p.business === 'object' ? p.business?.business_name ?? '' : ''}
                    price={getProductPrice(p)}
                    originalPrice={hasDiscount(p) ? getProductOriginalPrice(p) : undefined}
                    tag={getProductTag(p)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Bought Together (Recommendation Engine) ──────────── */}
        {feedToProducts(boughtTogetherItems).length > 0 && (
          <section>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>
              Frequently Bought Together
            </h3>
            <div className="flex overflow-x-auto hide-scrollbar" style={{ gap: '12px', paddingBottom: '8px' }}>
              {feedToProducts(boughtTogetherItems).map((p) => (
                <div key={p._id} style={{ minWidth: '160px', maxWidth: '214px', flexShrink: 0 }}>
                  <ProductCard
                    id={p._id}
                    imageUrl={getProductImage(p)}
                    title={getProductName(p)}
                    brand={typeof p.business === 'object' ? p.business?.business_name ?? '' : ''}
                    price={getProductPrice(p)}
                    originalPrice={hasDiscount(p) ? getProductOriginalPrice(p) : undefined}
                    tag={getProductTag(p)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Complete the Look (Recommendation Engine) ────────── */}
        {feedToProducts(completeTheLookItems).length > 0 && (
          <section>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>
              Complete the Look
            </h3>
            <div className="flex overflow-x-auto hide-scrollbar" style={{ gap: '12px', paddingBottom: '8px' }}>
              {feedToProducts(completeTheLookItems).map((p) => (
                <div key={p._id} style={{ minWidth: '160px', maxWidth: '214px', flexShrink: 0 }}>
                  <ProductCard
                    id={p._id}
                    imageUrl={getProductImage(p)}
                    title={getProductName(p)}
                    brand={typeof p.business === 'object' ? p.business?.business_name ?? '' : ''}
                    price={getProductPrice(p)}
                    originalPrice={hasDiscount(p) ? getProductOriginalPrice(p) : undefined}
                    tag={getProductTag(p)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Reviews ───────────────────────────────────────────── */}
        <ReviewsSection
          rating={rating}
          totalReviews={totalReviews}
          productId={product._id}
        />
      </div>
    </>
  );
}
