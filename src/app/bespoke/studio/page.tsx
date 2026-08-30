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
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { pollJobStatus } from '@/lib/pollJobStatus';
import { useBespokeDesigns, type CreateDesignPayload } from '@/hooks/useBespokeDesigns';

import { type ClothingType, type DesignGender, enrichSelections } from '@/data/studio-options';

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

  // The bespoke "apply fabric to one of your designs" path passes the chosen
  // design's image as ?design=<url>. Seed it as a reference image so generation
  // is based on that design (together with the applied fabric above) instead of
  // starting from a blank studio.
  const appliedDesignImage = searchParams.get('design');
  useEffect(() => {
    if (!appliedDesignImage) return;
    customization.setReferenceImages([appliedDesignImage]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedDesignImage]);

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

  // ─── Header actions: Save / Duplicate / Share / Delete ───────
  const { createDesign, saveDesign, cancelDesign } = useBespokeDesigns();
  const [duplicating, setDuplicating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // The saved design this studio session points at. Starts as the URL param;
  // set after the first Save so subsequent saves update instead of duplicating.
  const [savedId, setSavedId] = useState<string | null>(designId);

  const buildPayload = useCallback(
    (name: string): CreateDesignPayload => {
      const categoryMap: Record<string, string> = {
        top: 'Tops', full_body: 'Dresses', bottom: 'Pants',
      };
      return {
        name,
        category: customization.clothingType
          ? categoryMap[customization.clothingType] || customization.clothingType
          : 'Design',
        gender: customization.designGender === 'male' ? 'men' : 'women',
        design_images: [...customization.generatedImages].reverse(),
        reference_images: customization.referenceImages.length
          ? customization.referenceImages
          : undefined,
        description: JSON.stringify({
          notes: '',
          selections: enrichSelections({
            neckline: customization.selectedNeckline,
            sleeve: customization.selectedSleeve,
            silhouette: customization.selectedSilhouette,
            collar: customization.selectedCollar,
            fabric: customization.selectedFabric,
            color: customization.selectedColor,
            fit: customization.selectedFit,
            userPrompt: customization.userPrompt,
          }),
        }),
      };
    },
    [customization],
  );

  const handleSave = useCallback(async () => {
    if (saving) return;
    if (customization.generatedImages.length === 0) {
      toast.error('Generate a design first — there is nothing to save yet.');
      return;
    }
    setSaving(true);
    try {
      const baseName = (customization.designName || designName || 'My design').trim();
      const wasUpdate = !!savedId;
      const result = await saveDesign(buildPayload(baseName), savedId);
      if (result?._id) {
        if (!savedId) {
          setSavedId(result._id);
          // Point the URL at the saved design so a refresh reloads it.
          const url = new URL(window.location.href);
          url.searchParams.set('designId', result._id);
          window.history.replaceState(null, '', url.toString());
        }
        toast.success(wasUpdate ? 'Design updated' : 'Design saved', {
          description: baseName,
        });
      } else {
        toast.error('Could not save the design. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  }, [saving, savedId, customization, designName, saveDesign, buildPayload]);

  const handleShare = useCallback(async () => {
    const img = customization.currentImage || customization.generatedImages[0];
    if (!img) {
      toast.error('Generate a design first — there is nothing to share yet.');
      return;
    }
    const name = (customization.designName || designName || 'My Qlozet design').trim();
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: name,
          text: `${name} — designed in Qlozet Bespoke Studio`,
          url: img,
        });
        return;
      }
      await navigator.clipboard.writeText(img);
      toast.success('Image link copied', { description: 'Paste it anywhere to share.' });
    } catch (e: any) {
      if (e?.name === 'AbortError') return; // user closed the share sheet
      try {
        await navigator.clipboard.writeText(img);
        toast.success('Image link copied', { description: 'Paste it anywhere to share.' });
      } catch {
        toast.error('Could not share the design.');
      }
    }
  }, [customization, designName]);

  const handleDelete = useCallback(async () => {
    if (!savedId || deleting) return;
    const sure = window.confirm(
      'Delete this design? Any open quote requests will be declined.',
    );
    if (!sure) return;
    setDeleting(true);
    const ok = await cancelDesign(savedId);
    if (ok) {
      toast.success('Design deleted');
      setTimeout(() => {
        window.location.href = '/bespoke';
      }, 600);
    } else {
      toast.error('Could not delete — designs already in production can’t be removed.');
      setDeleting(false);
    }
  }, [savedId, deleting, cancelDesign]);

  const handleDuplicate = useCallback(async () => {
    if (duplicating || customization.generatedImages.length === 0) return;
    setDuplicating(true);
    try {
      const baseName = (customization.designName || designName || 'My design').trim();
      const created = await createDesign(buildPayload(`${baseName} (Copy)`));
      if (created?._id) {
        toast.success('Design duplicated', {
          description: `“${baseName} (Copy)” is in My Designs — opening it…`,
        });
        // Brief pause so the toast lands before the hard navigation (which the
        // studio needs to re-initialise cleanly on the copy).
        setTimeout(() => {
          window.location.href = `/bespoke/studio?designId=${created._id}&name=${encodeURIComponent(`${baseName} (Copy)`)}`;
        }, 900);
        return;
      }
      toast.error('Could not duplicate the design. Please try again.');
      setDuplicating(false);
    } catch {
      toast.error('Could not duplicate the design. Please try again.');
      setDuplicating(false);
    }
  }, [duplicating, customization, createDesign, designName, buildPayload]);

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
        backgroundColor: 'var(--bg-surface)',
        backgroundImage: 'radial-gradient(var(--border-glass) 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px',
        minHeight: 'calc(100vh - 130px)',
      }}
    >
      {/* Floating Headers (Desktop + Mobile) */}
      <StudioHeader
        designName={designName}
        tokenBalance={customization.tokenBalance}
        hasImages={customization.generatedImages.length > 0}
        onSave={handleSave}
        saving={saving}
        onDuplicate={handleDuplicate}
        duplicating={duplicating}
        onShare={handleShare}
        onDelete={handleDelete}
        deleting={deleting}
        canDelete={!!savedId}
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
            style={{ maxWidth: '440px', margin: '20px', borderRadius: '24px', background: 'var(--bg-base)', boxShadow: '0 24px 80px rgba(0,0,0,0.2)', overflow: 'hidden' }}
          >
            {/* Close */}
            <button
              onClick={() => setShowRefOverlay(false)}
              className="absolute top-4 right-4 z-10 flex items-center justify-center transition-all hover:bg-[var(--bg-surface-elevated)] active:scale-90"
              style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border-glass)', background: 'var(--bg-surface-elevated)', cursor: 'pointer' }}
            >
              <X size={14} color="var(--text-secondary)" />
            </button>

            <div style={{ padding: '32px 28px' }}>
              {/* Detected styles success */}
              {detectedStyles.length > 0 && !isAnalyzing ? (
                <div className="flex flex-col items-center" style={{ gap: '16px', padding: '20px 0' }}>
                  <Sparkles size={40} color="#D4AF37" />
                  <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', textAlign: 'center' }}>
                    Styles Detected!
                  </h3>
                  <div className="flex flex-wrap justify-center" style={{ gap: '8px' }}>
                    {detectedStyles.map((s, i) => (
                      <span key={i} style={{
                        padding: '6px 14px', borderRadius: '100px',
                        background: 'rgba(44,24,16,0.06)', fontSize: '11px',
                        fontWeight: 700, color: 'var(--brand-brown)',
                      }}>
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Auto-applied to your design</p>
                </div>
              ) : (
                <div className="flex flex-col" style={{ gap: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', textTransform: 'uppercase', lineHeight: 1.2 }}>
                      Upload Your<br />Reference
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.6 }}>
                      Our AI will analyze your photo and auto-select matching styles
                    </p>
                  </div>

                  {/* Upload zone */}
                  <div
                    onClick={!isAnalyzing ? () => refFileInput.current?.click() : undefined}
                    className={`flex flex-col items-center justify-center transition-all ${
                      isAnalyzing ? 'opacity-60 cursor-not-allowed' : 'hover:border-[var(--brand-fill)] cursor-pointer'
                    }`}
                    style={{
                      padding: '40px 20px', borderRadius: '16px',
                      border: '2px dashed var(--border-glass)', background: 'var(--bg-surface-elevated)',
                    }}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 size={32} color="var(--brand-brown)" className="animate-spin" style={{ marginBottom: '12px' }} />
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brand-brown)', textAlign: 'center' }}>
                          {analyzeStatus || 'Analyzing...'}
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>
                          Drop your reference photo here or{' '}
                          <span style={{ color: 'var(--brand-brown)', textDecoration: 'underline' }}>browse</span>
                        </p>
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
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
                      color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600,
                      border: '1px solid var(--border-glass)', cursor: 'pointer',
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
          <span className="w-8 h-8 rounded-full border-2 border-[var(--border-glass)] border-t-[var(--brand-fill)] animate-spin" />
        </div>
      }
    >
      <StudioContent />
    </Suspense>
  );
}

