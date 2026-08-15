'use client';

import React, { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { useCustomization } from '@/hooks/useCustomization';
import { StudioHeader } from '@/components/studio/StudioHeader';
import { StudioCanvas } from '@/components/studio/StudioCanvas';
import { FloatingToolbar } from '@/components/studio/FloatingToolbar';
import { MobileBottomSheet } from '@/components/studio/MobileBottomSheet';
import { DesktopConfigPanel } from '@/components/studio/DesktopConfigPanel';
import { Upload, Loader2, Sparkles, X } from 'lucide-react';
import { api } from '@/lib/api';
import { pollJobStatus } from '@/lib/pollJobStatus';

import { type ClothingType, type DesignGender } from '@/data/studio-options';

// ═══════════════════════════════════════════════════════════════
//  STUDIO CONTENT
// ═══════════════════════════════════════════════════════════════

function StudioContent() {
  const { user } = useApp();
  const searchParams = useSearchParams();

  const designName = searchParams.get('name') || 'Untitled Design';
  const rawType = searchParams.get('type');
  const rawGender = searchParams.get('gender');
  const method = searchParams.get('method');
  const designId = searchParams.get('designId');

  // Map garment categories from the modal to clothing types
  const typeMap: Record<string, ClothingType> = {
    tops: 'top', shirts: 'top', blouses: 'top',
    dresses: 'full_body', jumpsuits: 'full_body', kaftan: 'full_body', agbada: 'full_body', sets: 'full_body', suits: 'full_body',
    skirts: 'bottom', pants: 'bottom', trousers: 'bottom',
  };
  const clothingType = rawType ? (typeMap[rawType.toLowerCase()] || undefined) : undefined;

  // Map gender from modal (men/women) to API gender
  const genderMap: Record<string, DesignGender> = { men: 'male', women: 'female', male: 'male', female: 'female', unisex: 'unisex' };
  const designGender = rawGender ? (genderMap[rawGender.toLowerCase()] || undefined) : undefined;

  const customization = useCustomization({
    mode: 'studio',
    initialDesignName: designName,
    initialClothingType: clothingType,
    initialGender: designGender,
  });

  // ─── Applied "Use Fabric" fabric ─────────────────────────────
  // UseFabricModal routes here as /bespoke/studio?fabric=<id>&design=<img>.
  // Fetch the chosen fabric and feed it into the studio so it is pre-selected
  // in the fabric tool sheet AND used as the fabric for image generation
  // (previously this param was ignored, so generation used catalog fabrics only).
  const appliedFabricId = searchParams.get('fabric');
  useEffect(() => {
    if (!appliedFabricId) return;
    let cancelled = false;
    api
      .get(`/products/${appliedFabricId}`)
      .then((res) => {
        const fab = res.data?.data ?? res.data;
        const img = fab?.fabric?.images?.[0] ?? fab?.images?.[0];
        if (!cancelled) {
          customization.setAppliedFabric({
            id: appliedFabricId,
            image: typeof img === 'string' ? img : img?.url,
            name: fab?.fabric?.name ?? fab?.name,
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFabricId]);

  // ─── Load saved design when designId is present ─────────────
  const [designLoaded, setDesignLoaded] = useState(false);

  useEffect(() => {
    if (!designId || designLoaded) return;

    const loadDesign = async () => {
      try {
        const res = await api.get(`/bespoke/designs/${designId}`);
        const raw = res?.data;
        console.log('[Studio] Raw API response:', JSON.stringify(raw));

        // Unwrap NestJS response interceptor: { statusCode, message, data: { ... } }
        let payload = raw;
        if (payload?.statusCode && payload?.data) {
          payload = payload.data;
        }
        // payload is now either { design, quotes } or the design itself
        if (payload?.data && !payload?.design_images) {
          // Another wrapper level
          payload = payload.data;
        }

        const design = payload?.design || payload;
        console.log('[Studio] Resolved design:', design?.name, 'images:', design?.design_images?.length);

        // Load generated images onto the canvas
        if (design?.design_images?.length > 0) {
          customization.setGeneratedImages(design.design_images);
          customization.setActiveImageIndex(0);
        }

        // Load reference images
        if (design?.reference_images?.length > 0) {
          customization.setReferenceImages(design.reference_images);
        }

        // Restore selections from description JSON
        if (design?.description) {
          try {
            const parsed = JSON.parse(design.description);
            const sel = parsed?.selections;

            if (sel) {
              if (sel.neckline) customization.setSelectedNeckline(sel.neckline);
              if (sel.sleeve) customization.setSelectedSleeve(sel.sleeve);
              if (sel.silhouette) customization.setSelectedSilhouette(sel.silhouette);
              if (sel.collar) customization.setSelectedCollar(sel.collar);
              if (sel.fabric) customization.setSelectedFabric(sel.fabric);
              if (sel.color) customization.setSelectedColor(sel.color);
              if (sel.fit) customization.setSelectedFit(sel.fit);
              console.log('[Studio] Restored selections:', sel);
            }

            // Restore user prompt
            if (sel?.userPrompt) {
              customization.setUserPrompt(sel.userPrompt);
            } else if (parsed?.notes) {
              customization.setUserPrompt(parsed.notes);
            }
          } catch {
            // Not JSON — treat as plain text prompt
            customization.setUserPrompt(design.description);
          }
        }

        setDesignLoaded(true);
      } catch (err) {
        console.error('[Studio] Failed to load design:', err);
        setDesignLoaded(true); // Don't retry on error
      }
    };

    loadDesign();
  }, [designId, designLoaded, customization]);

  // ─── Reference Upload Overlay ────────────────────────────────
  const [showRefOverlay, setShowRefOverlay] = useState(method === 'reference');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState<string | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [detectedStyles, setDetectedStyles] = useState<string[]>([]);
  const refFileInput = useRef<HTMLInputElement | null>(null);

  // Upload a single file to Cloudinary via backend
  const uploadToCloudinary = useCallback(async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('files', file);
    const res = await api.post('/uploads/outfits', formData, {
      headers: { 'Content-Type': undefined as unknown as string },
    });
    const results = res.data?.data || res.data;
    return results?.[0]?.imageUrl || results?.[0]?.image_url || null;
  }, []);

  const handleReferenceUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setAnalyzeStatus('Uploading reference...');
    setAnalyzeError(null);

    try {
      // Upload to Cloudinary via the existing upload hook first
      const cloudinaryUrl = await uploadToCloudinary(file);
      if (!cloudinaryUrl) {
        throw new Error('Failed to upload reference image');
      }
      console.log('[Studio] Reference uploaded to Cloudinary:', cloudinaryUrl);

      setAnalyzeStatus('Analyzing your reference photo...');
      const res = await api.post('/measurements/analyze-reference', {
        image_url: cloudinaryUrl,
      });

      console.log('[Studio] Analyze response:', JSON.stringify(res?.data));
      const jobId = res?.data?.data?.jobId || res?.data?.jobId;

      if (jobId) {
        setAnalyzeStatus('AI is detecting styles...');
        const result = await pollJobStatus(jobId);

        if (result) {
          console.log('[Studio] Analysis result:', JSON.stringify(result));
          const matched = result.matched_styles || {};
          const detected: string[] = [];

          // Auto-select matched styles
          if (matched.neckline?.style_name) {
            customization.setSelectedNeckline(matched.neckline.style_id || matched.neckline.style_name);
            detected.push(matched.neckline.style_name);
          }
          if (matched.sleeve?.style_name) {
            customization.setSelectedSleeve(matched.sleeve.style_id || matched.sleeve.style_name);
            detected.push(matched.sleeve.style_name);
          }
          if (matched.silhouette?.style_name) {
            customization.setSelectedSilhouette(matched.silhouette.style_id || matched.silhouette.style_name);
            detected.push(matched.silhouette.style_name);
          }
          if (matched.collar?.style_name) {
            customization.setSelectedCollar(matched.collar.style_id || matched.collar.style_name);
            detected.push(matched.collar.style_name);
          }

          // Pre-fill the user prompt
          if (result.suggested_prompt) {
            customization.setUserPrompt(result.suggested_prompt);
          }

          setDetectedStyles(detected);
          setAnalyzeStatus(null);

          // Close overlay after showing detected styles briefly
          setTimeout(() => {
            setShowRefOverlay(false);
          }, 2500);
        }
      } else {
        // No jobId — might be a synchronous response
        setShowRefOverlay(false);
      }
    } catch (err: any) {
      console.error('[Studio] Reference analysis error:', err);
      setAnalyzeError(err?.response?.data?.message || err?.message || 'Analysis failed. You can still design from scratch.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [customization, uploadToCloudinary]);

  return (
    <div
      className="relative w-full h-full overflow-hidden flex flex-col lg:flex-row"
      style={{
        backgroundColor: '#F9F9F9',
        backgroundImage: 'radial-gradient(#E5E5E5 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px',
        minHeight: 'calc(100vh - 130px)',
      }}
    >
      {/* Floating Headers (Desktop + Mobile) */}
      <StudioHeader
        designName={designName}
        tokenBalance={customization.tokenBalance}
      />

      {/* Canvas Area */}
      <StudioCanvas
        currentImage={customization.currentImage}
        isGenerating={customization.isGenerating}
        referenceImages={customization.referenceImages}
        isLoading={!!designId && !designLoaded}
      />

      {/* Desktop Floating Toolbar */}
      <div style={!user ? { opacity: 0.4, pointerEvents: 'none', userSelect: 'none' } : undefined}>
        <FloatingToolbar customization={customization} />
      </div>

      {/* Mobile Bottom Sheet */}
      <div style={!user ? { opacity: 0.4, pointerEvents: 'none', userSelect: 'none' } : undefined}>
        <MobileBottomSheet customization={customization} designId={designId} />
      </div>

      {/* Desktop Config Panel & CTAs */}
      <div style={!user ? { opacity: 0.4, pointerEvents: 'none', userSelect: 'none' } : undefined}>
        <DesktopConfigPanel customization={customization} designId={designId} />
      </div>

      {/* ─── Sign In CTA for Guest Users ─── */}
      {!user && (
        <div
          className="fixed z-[100] flex flex-col sm:flex-row items-center justify-between shadow-xl animate-fade-in text-center sm:text-left"
          style={{
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: '520px',
            background: 'rgba(44, 24, 16, 0.96)',
            backdropFilter: 'blur(12px)',
            borderRadius: '20px',
            padding: '16px 24px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            fontFamily: 'Outfit, sans-serif',
            gap: '16px',
            pointerEvents: 'auto',
          }}
        >
          <div className="flex flex-col" style={{ gap: '4px' }}>
            <p style={{ fontSize: '13px', fontWeight: 800, color: '#FFF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Preview Mode
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.4 }}>
              You are viewing a design template. Sign in first to customize details, choose fabrics, and generate or save designs.
            </p>
          </div>
          <Link
            href="/auth/login"
            className="flex-shrink-0 transition-all hover:opacity-90 active:scale-[0.98] w-full sm:w-auto text-center"
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              background: '#FFFFFF',
              color: '#2C1810',
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Sign In
          </Link>
        </div>
      )}

      {/* ─── Reference Upload Overlay ─── */}
      {showRefOverlay && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
        >
          <div
            className="relative w-full animate-fade-in"
            style={{ maxWidth: '440px', margin: '20px', borderRadius: '24px', background: '#FFF', boxShadow: '0 24px 80px rgba(0,0,0,0.2)', overflow: 'hidden' }}
          >
            {/* Close */}
            <button
              onClick={() => setShowRefOverlay(false)}
              className="absolute top-4 right-4 z-10 flex items-center justify-center transition-all hover:bg-gray-100 active:scale-90"
              style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.08)', background: '#FFF', cursor: 'pointer' }}
            >
              <X size={14} color="#666" />
            </button>

            <div style={{ padding: '32px 28px' }}>
              {/* Detected styles success */}
              {detectedStyles.length > 0 && !isAnalyzing ? (
                <div className="flex flex-col items-center" style={{ gap: '16px', padding: '20px 0' }}>
                  <Sparkles size={40} color="#D4AF37" />
                  <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#1A1A1A', textAlign: 'center' }}>
                    Styles Detected!
                  </h3>
                  <div className="flex flex-wrap justify-center" style={{ gap: '8px' }}>
                    {detectedStyles.map((s, i) => (
                      <span key={i} style={{
                        padding: '6px 14px', borderRadius: '100px',
                        background: 'rgba(44,24,16,0.06)', fontSize: '11px',
                        fontWeight: 700, color: '#2C1810',
                      }}>
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                  <p style={{ fontSize: '12px', color: '#888' }}>Auto-applied to your design</p>
                </div>
              ) : (
                <div className="flex flex-col" style={{ gap: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#1A1A1A', textTransform: 'uppercase', lineHeight: 1.2 }}>
                      Upload Your<br />Reference
                    </h3>
                    <p style={{ fontSize: '13px', color: '#888', marginTop: '8px', lineHeight: 1.6 }}>
                      Our AI will analyze your photo and auto-select matching styles
                    </p>
                  </div>

                  {/* Upload zone */}
                  <div
                    onClick={!isAnalyzing ? () => refFileInput.current?.click() : undefined}
                    className={`flex flex-col items-center justify-center transition-all ${
                      isAnalyzing ? 'opacity-60 cursor-not-allowed' : 'hover:border-[#2C1810] cursor-pointer'
                    }`}
                    style={{
                      padding: '40px 20px', borderRadius: '16px',
                      border: '2px dashed rgba(0,0,0,0.15)', background: '#FAFAFA',
                    }}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 size={32} color="#2C1810" className="animate-spin" style={{ marginBottom: '12px' }} />
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#2C1810', textAlign: 'center' }}>
                          {analyzeStatus || 'Analyzing...'}
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload size={32} color="#999" style={{ marginBottom: '12px' }} />
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#666', textAlign: 'center' }}>
                          Drop your reference photo here or{' '}
                          <span style={{ color: '#2C1810', textDecoration: 'underline' }}>browse</span>
                        </p>
                        <p style={{ fontSize: '10px', color: '#AAA', marginTop: '6px' }}>
                          PNG, JPG up to 10MB
                        </p>
                      </>
                    )}
                  </div>

                  <input
                    ref={refFileInput}
                    type="file"
                    accept="image/*"
                    onChange={handleReferenceUpload}
                    style={{ display: 'none' }}
                  />

                  {/* Error */}
                  {analyzeError && (
                    <p style={{ fontSize: '11px', color: '#DC2626', padding: '0 4px' }}>
                      ⚠ {analyzeError}
                    </p>
                  )}

                  {/* Skip */}
                  <button
                    onClick={() => setShowRefOverlay(false)}
                    className="w-full transition-all hover:opacity-70"
                    style={{
                      padding: '12px', borderRadius: '14px', background: 'none',
                      color: '#888', fontSize: '12px', fontWeight: 600,
                      border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer',
                    }}
                  >
                    Skip — Design from Scratch
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PAGE EXPORT
// ═══════════════════════════════════════════════════════════════

export default function BespokeStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <span className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-[#2C1810] animate-spin" />
        </div>
      }
    >
      <StudioContent />
    </Suspense>
  );
}

