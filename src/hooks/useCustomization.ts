'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { useUpload } from '@/hooks/useUpload';
import { useStyleLibrary } from '@/hooks/useStyleLibrary';
import { useFabricLibrary } from '@/hooks/useFabricLibrary';
import { api } from '@/lib/api';
import { pollJobStatus } from '@/lib/pollJobStatus';
import {
  GENERATION_COST,
  ACCESSORIES,
  FIT_OPTIONS,
  type SectionId,
  type ClothingType,
  type DesignGender,
} from '@/data/studio-options';

// ═══════════════════════════════════════════════════════════════
//  useCustomization Hook
//  Shared state & handlers for bespoke studio and product customization.
// ═══════════════════════════════════════════════════════════════

export type CustomizationMode = 'studio' | 'product';

export interface UseCustomizationOptions {
  mode: CustomizationMode;
  defaultSection?: SectionId;
  initialDesignName?: string;
  initialClothingType?: ClothingType;
  initialGender?: DesignGender;
  /** The garment picked on the start screen ("Kaftan", "Skirts", "Pants"). */
  initialGarment?: string;
}

// A customer-supplied external fabric applied via "Use Fabric": its image drives
// image generation and it shows pre-selected in the fabric tool sheet.
export interface AppliedFabric {
  id?: string;
  image?: string;
  name?: string;
}

export interface EditGarmentPayload {
  base_image_url: string;
  fabric_image_url?: string;
  accessory_image_url?: string;
  addon_image_url?: string;
  garment_type?: string;
  base_color?: string;
  pattern?: string;
  fit?: string;
  style_notes?: string;
  metadata_json?: unknown;
  /** 'back' turns the base image round: the same garment from behind. */
  view?: 'front' | 'back';
}

export interface CustomizationState {
  // Design setup
  designName: string;
  setDesignName: (name: string) => void;
  designGender: DesignGender | null;
  setDesignGender: (gender: DesignGender) => void;
  clothingType: ClothingType | null;
  setClothingType: (type: ClothingType) => void;

  // Selections
  selectedSilhouette: string | null;
  setSelectedSilhouette: (id: string | null) => void;
  selectedNeckline: string | null;
  setSelectedNeckline: (id: string | null) => void;
  selectedSleeve: string | null;
  setSelectedSleeve: (id: string | null) => void;
  selectedCollar: string | null;
  setSelectedCollar: (id: string | null) => void;
  selectedSkirt: string | null;
  setSelectedSkirt: (id: string | null) => void;
  selectedTrouser: string | null;
  setSelectedTrouser: (id: string | null) => void;
  selectedFullBody: string | null;
  setSelectedFullBody: (id: string | null) => void;
  selectedFabric: string | null;
  setSelectedFabric: (id: string | null) => void;
  // Customer-supplied external fabric ("Use Fabric") — image drives generation,
  // shown pre-selected in the fabric tool sheet, overrides the catalog fabric.
  appliedFabric: AppliedFabric | null;
  setAppliedFabric: (fabric: AppliedFabric | null) => void;
  selectedColor: string | null;
  setSelectedColor: (id: string | null) => void;
  selectedAccessories: string[];
  toggleAccessory: (id: string) => void;
  setSelectedAccessories: (ids: string[]) => void;
  selectedAddons: Record<string, string>;
  selectAddon: (addonName: string, variantName: string) => void;
  selectedFit: string | null;
  setSelectedFit: (id: string | null) => void;
  // Whose body the garment is for — the NAME of one of the customer's saved
  // measurement sets (picked in the Fit section; null = active set).
  measurementSetName: string | null;
  setMeasurementSetName: (name: string | null) => void;
  referenceImages: string[];  // Cloudinary URLs (or blob URLs as preview fallback)
  setReferenceImages: (images: string[]) => void;
  removeReference: (index: number) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  uploadStatus: string | null;
  uploadError: string | null;
  userPrompt: string;
  setUserPrompt: (value: string) => void;
  suggestedPrompt: string | null;
  isAnalyzing: boolean;

  // Panel navigation
  expandedSection: string;
  setExpandedSection: (section: string) => void;
  toggleSection: (section: string) => void;

  // Generation (studio mode)
  generatedImages: string[];
  setGeneratedImages: (images: string[]) => void;
  activeImageIndex: number;
  setActiveImageIndex: (index: number) => void;
  isGenerating: boolean;
  handleGenerate: () => Promise<void>;
  // Product mode: generate a preview of the configured garment via the
  // edit-garment image API (distinct from studio's generate-outfit).
  generateProductPreview: (
    payload: EditGarmentPayload,
    onImage?: (url: string) => void,
  ) => Promise<void>;
  /** The front of the version on screen (what refines and saves work from). */
  currentImage: string | null;
  /** What the canvas shows: the back view when it's switched on, else the front. */
  displayImage: string | null;
  /** Back views by the front version they were made from. */
  backViews: Record<string, string>;
  setBackViews: (views: Record<string, string>) => void;
  showingBack: boolean;
  setShowingBack: (on: boolean) => void;
  /** Make (or remake) the back of the version on screen. */
  makeBackView: () => Promise<void>;
  isMakingBack: boolean;
  /** Delete a version (and its back view). It never reaches a tailor. */
  removeVersion: (index: number) => void;
  /** Back views of the versions being saved, for the design record. */
  backViewsForSave: { front: string; back: string }[];
  tokenBalance: number;
  editTokenCost: number; // real edit_garment_token_price from platform settings
  /** Real outfit_generation_token_price from platform settings (admin-set). */
  generationCost: number;
  /**
   * The versions to save or send to tailors, oldest first with the one on
   * screen LAST. Save and quote requests reverse this list, so the chosen
   * version becomes the design's cover (design_images[0]).
   */
  imagesForSave: string[];
  /** Change the version on screen in plain words ("make the sleeves longer"). */
  refineCurrent: (instruction: string) => Promise<void>;
  /** Run again whatever was last tried (Generate, a refine or a back view) —
   *  used after buying tokens, so a refine isn't replaced by a full Generate. */
  retryLast: () => void;
  /** True while a refine (not a fresh Generate) is running. */
  isRefining: boolean;
  /** Fill the style, fabric and fit choices at random for this garment. */
  surpriseMe: () => void;
  /** Plain names of what's picked (styles, fabric, fit), for the line above
   *  Generate, so nobody spends tokens on the wrong combination. */
  selectionSummary: string[];
  generationError: string | null;
  insufficientTokensInfo: { show: boolean; balance: number; cost: number };
  dismissInsufficientTokens: () => void;

  // Save modal
  showSaveModal: boolean;
  setShowSaveModal: (show: boolean) => void;

  // Mode
  mode: CustomizationMode;
}

// Marks "the last thing tried was a back view" for retryLast.
const BACK_VIEW = '\u0000back-view';

export function useCustomization({
  mode = 'studio',
  defaultSection = 'styles',
  initialDesignName = '',
  initialClothingType,
  initialGender,
  initialGarment,
}: UseCustomizationOptions): CustomizationState {
  const { user, deductTokens } = useApp();
  const { uploadOutfitImages, isUploading, uploadStatus, uploadError } = useUpload();
  const { all: styleLibrary } = useStyleLibrary();
  // Real fabrics vendors have for sale — the studio picks from these so
  // generation applies an actual, fetchable fabric.
  const { fabrics: fabricLibrary } = useFabricLibrary();

  // ── Design setup ────────────────────────────────────────────
  const [designName, setDesignName] = useState(initialDesignName);
  const [designGender, setDesignGender] = useState<DesignGender | null>(initialGender ?? null);
  const [clothingType, setClothingType] = useState<ClothingType | null>(initialClothingType ?? null);

  // ── Selections ──────────────────────────────────────────────
  const [selectedSilhouette, setSelectedSilhouette] = useState<string | null>(null);
  const [selectedNeckline, setSelectedNeckline] = useState<string | null>(null);
  const [selectedSleeve, setSelectedSleeve] = useState<string | null>(null);
  const [selectedCollar, setSelectedCollar] = useState<string | null>(null);
  const [selectedSkirt, setSelectedSkirt] = useState<string | null>(null);
  const [selectedTrouser, setSelectedTrouser] = useState<string | null>(null);
  const [selectedFullBody, setSelectedFullBody] = useState<string | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<string | null>(null);
  const [appliedFabric, setAppliedFabricState] = useState<AppliedFabric | null>(null);
  const setAppliedFabric = useCallback((fabric: AppliedFabric | null) => {
    setAppliedFabricState(fabric);
    // Pre-select it in the fabric tool sheet so the choice is reflected in the UI.
    if (fabric?.id) setSelectedFabric(fabric.id);
  }, []);
  const [selectedColor, setSelectedColor] = useState<string | null>('#1B2A4A');
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [selectedFit, setSelectedFit] = useState<string | null>('fit1');
  const [measurementSetName, setMeasurementSetName] = useState<string | null>(null);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, string>>({});
  const [userPrompt, setUserPrompt] = useState('');
  const [suggestedPrompt, setSuggestedPrompt] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ── Panel navigation ────────────────────────────────────────
  const [expandedSection, setExpandedSection] = useState<string>(defaultSection);

  // ── Generation (studio only) ────────────────────────────────
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [insufficientTokensInfo, setInsufficientTokensInfo] = useState<{ show: boolean; balance: number; cost: number }>({ show: false, balance: 0, cost: 0 });
  const [showSaveModal, setShowSaveModal] = useState(false);
  // The last refine asked for, so buying tokens mid-refine retries the refine.
  // BACK_VIEW means the last thing tried was a back view.
  const lastRefine = useRef<string | null>(null);
  const [backViews, setBackViews] = useState<Record<string, string>>({});
  const [showingBack, setShowingBack] = useState(false);
  const [isMakingBack, setIsMakingBack] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ── Live token balance from API ──────────────────────────────
  const [tokenBalance, setTokenBalance] = useState(user?.tokenBalance ?? 0);
  // Real edit-garment cost (default matches backend edit_garment_token_price).
  const [editTokenCost, setEditTokenCost] = useState(45);
  // Shown on the Generate button; the admin can change it, so never hard-code.
  const [generationCost, setGenerationCost] = useState(GENERATION_COST);

  useEffect(() => {
    api.get('/token/balance').then((res) => {
      const bal = res.data?.data?.tokens ?? res.data?.tokens ?? 0;
      setTokenBalance(bal);
    }).catch(() => {});
    api.get('/users/platform-settings').then((res) => {
      const c = res.data?.data?.edit_garment_token_price ?? res.data?.edit_garment_token_price;
      if (typeof c === 'number' && c > 0) setEditTokenCost(c);
      const g = res.data?.data?.outfit_generation_token_price ?? res.data?.outfit_generation_token_price;
      if (typeof g === 'number' && g > 0) setGenerationCost(g);
    }).catch(() => {});
  }, []);

  // ── Handlers ────────────────────────────────────────────────

  const toggleSection = useCallback((section: string) => {
    setExpandedSection((prev) => (prev === section ? '' : section));
  }, []);

  const toggleAccessory = useCallback((id: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }, []);

  const selectAddon = useCallback((addonName: string, variantName: string) => {
    setSelectedAddons((prev) => {
      // Toggle off if same variant selected again
      if (prev[addonName] === variantName) {
        const next = { ...prev };
        delete next[addonName];
        return next;
      }
      return { ...prev, [addonName]: variantName };
    });
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    // Check total count (max 3)
    const remaining = 3 - referenceImages.length;
    const toUpload = fileArray.slice(0, remaining);
    if (toUpload.length === 0) return;

    // Upload to Cloudinary via backend
    const results = await uploadOutfitImages(toUpload);
    if (results.length > 0) {
      const urls = results.map((r) => r.imageUrl);
      setReferenceImages((prev) => [...prev, ...urls]);

      // Auto-analyze first uploaded reference to get AI suggested prompt
      const firstUrl = urls[0];
      if (firstUrl && !suggestedPrompt) {
        setIsAnalyzing(true);
        try {
          const analyzeRes = await api.post('/measurements/analyze-reference', { image_url: firstUrl });
          const jobId = analyzeRes.data?.data?.jobId ?? analyzeRes.data?.jobId;
          if (jobId) {
            const result = await pollJobStatus(jobId);
            if (result?.suggested_prompt) {
              setSuggestedPrompt(result.suggested_prompt);
              console.log('[Analyze] AI suggested prompt:', result.suggested_prompt);
            }
          }
        } catch (err) {
          console.warn('[Analyze] Reference analysis failed (non-blocking):', err);
        } finally {
          setIsAnalyzing(false);
        }
      }
    }

    e.target.value = '';
  }, [referenceImages.length, uploadOutfitImages, suggestedPrompt]);

  const removeReference = useCallback((index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (isGenerating || mode !== 'studio') return;
    lastRefine.current = null;

    setGenerationError(null);

    // ── 1. Check token balance ──────────────────────────────────
    // What this generation costs, for the local balance shown after it.
    let spend = generationCost;
    try {
      const [balanceRes, settingsRes] = await Promise.all([
        api.get('/token/balance'),
        api.get('/users/platform-settings'),
      ]);
      const balance = balanceRes.data?.tokens ?? balanceRes.data?.data?.tokens ?? 0;
      const cost =
        settingsRes.data?.outfit_generation_token_price ??
        settingsRes.data?.data?.outfit_generation_token_price ??
        GENERATION_COST;
      if (typeof cost === 'number' && cost > 0) {
        setGenerationCost(cost);
        spend = cost;
      }

      console.log('[Generate] Token check — balance:', balance, 'cost:', cost, 'raw balance:', balanceRes.data, 'raw settings:', settingsRes.data);

      if (balance < cost) {
        setInsufficientTokensInfo({ show: true, balance, cost });
        return;
      }
    } catch {
      // If token check fails (e.g. not logged in), continue — the API will 400 anyway
    }

    // ── 2. Resolve style names + descriptions from API cache ────
    const findStyle = (id: string | null) => {
      if (!id) return undefined;
      return styleLibrary.find((s) => s._id === id);
    };

    // ── 3. Build construction metadata ──────────────────────────
    const construction: Record<string, string> = {};

    const silhouetteStyle = findStyle(selectedSilhouette);
    if (silhouetteStyle) construction.silhouette = silhouetteStyle.name;

    const neckStyle = findStyle(selectedNeckline);
    if (neckStyle) {
      construction.neckline = neckStyle.description
        ? `${neckStyle.name} — ${neckStyle.description}`
        : neckStyle.name;
    }

    const sleeveStyle = findStyle(selectedSleeve);
    if (sleeveStyle) {
      construction.sleeve = sleeveStyle.description
        ? `${sleeveStyle.name} — ${sleeveStyle.description}`
        : sleeveStyle.name;
    }

    const collarStyle = findStyle(selectedCollar);
    if (collarStyle) {
      construction.collar = collarStyle.description
        ? `${collarStyle.name} — ${collarStyle.description}`
        : collarStyle.name;
    }

    const skirtStyle = findStyle(selectedSkirt);
    if (skirtStyle) {
      construction.skirt_style = skirtStyle.description
        ? `${skirtStyle.name} — ${skirtStyle.description}`
        : skirtStyle.name;
    }

    const trouserStyle = findStyle(selectedTrouser);
    if (trouserStyle) {
      construction.trouser_style = trouserStyle.description
        ? `${trouserStyle.name} — ${trouserStyle.description}`
        : trouserStyle.name;
    }

    const fullBodyStyle = findStyle(selectedFullBody);
    if (fullBodyStyle) {
      construction.full_body_style = fullBodyStyle.description
        ? `${fullBodyStyle.name} — ${fullBodyStyle.description}`
        : fullBodyStyle.name;
    }

    // ── 4. Resolve fabric + accessory images for references ─────
    // Only real, fetchable URLs may be sent as references — the studio's
    // placeholder FABRICS use local /image/* paths the backend/Space can't load,
    // which made the generator hallucinate a fabric. Drop those.
    const isRemoteUrl = (u?: string) =>
      !!u && (/^https?:\/\//i.test(u) || u.startsWith('data:'));
    const configReferences: string[] = [];
    const selFabric = fabricLibrary.find((f) => f.id === selectedFabric);
    // A customer-supplied external ("Use Fabric") fabric image takes priority
    // over the catalog fabric, so the generated outfit is rendered with the
    // customer's own fabric.
    const fabricImageUrl =
      appliedFabric?.image && isRemoteUrl(appliedFabric.image)
        ? appliedFabric.image
        : selFabric?.image && isRemoteUrl(selFabric.image)
          ? selFabric.image
          : undefined;
    if (fabricImageUrl) configReferences.push(fabricImageUrl);
    const selAccs = selectedAccessories
      .map((id) => ACCESSORIES.find((a) => a.id === id))
      .filter(Boolean);

    // ── 5. Resolve fit ──────────────────────────────────────────
    const selFit = FIT_OPTIONS.find((f) => f.id === selectedFit);

    // ── 6. Build garment type string ────────────────────────────
    const genderPrefix = designGender === 'female' ? 'female' : 'male';
    const garmentType = clothingType
      ? `${genderPrefix}_${clothingType}`
      : genderPrefix;

    // ── 7. Assemble full config (must match GarmentConfigDto) ────
    // Backend reads: config.garmentType, config.constructionSelections, etc.
    const constructionSelections: Record<string, string> = {};

    // Map to CONSTRUCTION_SCHEMAS field keys
    if (silhouetteStyle) constructionSelections.silhouette = silhouetteStyle.name;
    if (neckStyle) constructionSelections.neckline = neckStyle.name;
    if (sleeveStyle) constructionSelections.sleeve_style = sleeveStyle.name;
    if (collarStyle) constructionSelections.collar = collarStyle.name;
    if (skirtStyle) constructionSelections.skirt_style = skirtStyle.name;
    if (trouserStyle) constructionSelections.trouser_style = trouserStyle.name;
    if (fullBodyStyle) constructionSelections.full_body_style = fullBodyStyle.name;

    const config: Record<string, unknown> = {
      garmentType: garmentType,
      gender: genderPrefix,
      view: 'front',
      constructionSelections,
    };

    if (selFit) {
      config.fit = selFit.label.toLowerCase();
      if (selFit.desc) config.fitNotes = selFit.desc;
    }

    // Fabric + accessory image URLs as inspiration (real URLs only)
    const inspirationUrls: string[] = [];
    if (fabricImageUrl) {
      config.fabricRefId = fabricImageUrl;
      inspirationUrls.push(fabricImageUrl);
    }

    if (inspirationUrls.length > 0 || configReferences.length > 0) {
      config.inspirationImageUrls = [...inspirationUrls, ...configReferences];
    }

    if (selAccs.length > 0) {
      // Add accessory names as aesthetic keywords for the AI
      config.aestheticKeywords = selAccs.map((a) => a!.name);
    }

    // ── 8. Call generate endpoint ────────────────────────────────
    setIsGenerating(true);

    // Debug: log the full config so you can verify every selection
    console.log('[Generate] Full config:', JSON.stringify(config, null, 2));
    console.log('[Generate] Reference images:', referenceImages);
    console.log('[Generate] User prompt:', userPrompt);

    // Send the picked fabric (and any config reference images) as ACTUAL
    // reference images too — otherwise the generator only sees the customer's
    // uploaded references and ignores the fabric.
    const combinedReferenceUrls = Array.from(
      new Set([...referenceImages, ...configReferences]),
    ).filter(isRemoteUrl);

    try {
      const genRes = await api.post('/measurements/generate-outfit', {
        config,
        userPrompt: userPrompt.trim() || undefined,
        reference_image_urls: combinedReferenceUrls.length > 0 ? combinedReferenceUrls : undefined,
      });

      const jobId = genRes.data?.data?.jobId ?? genRes.data?.jobId;
      if (!jobId) throw new Error('No job ID returned from generation');

      // ── 9. Poll for result ──────────────────────────────────────
      const result = await pollJobStatus(jobId);

      // ── 10. Add generated image ─────────────────────────────────
      if (result.image_url) {
        setGeneratedImages((prev) => {
          const updated = [...prev, result.image_url];
          setActiveImageIndex(updated.length - 1);
          return updated;
        });
        setShowingBack(false);
      }

      // Refresh token balance from API after generation
      api.get('/token/balance').then((res) => {
        const bal = res.data?.data?.tokens ?? res.data?.tokens ?? 0;
        setTokenBalance(bal);
      }).catch(() => {});
      deductTokens(spend); // Also update context for profile display
    } catch (err: any) {
      console.error('[Generate] Error:', err?.message);
      if (err?.response) {
        console.error('[Generate] HTTP Error:', err.response.status, JSON.stringify(err.response.data, null, 2));
      }
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Generation failed. Please try again.';
      setGenerationError(message);
    } finally {
      setIsGenerating(false);
    }
  }, [
    isGenerating, mode, designGender, clothingType, userPrompt,
    selectedSilhouette, selectedNeckline, selectedSleeve, selectedCollar,
    selectedSkirt, selectedTrouser, selectedFullBody,
    selectedFabric, selectedColor, selectedAccessories, selectedFit,
    referenceImages, styleLibrary, fabricLibrary, deductTokens, generationCost,
  ]);

  // Product-mode preview via the edit-garment image API. The caller (product
  // page / customize panel) builds the payload from the product + selections.
  const generateProductPreview = useCallback(async (
    payload: EditGarmentPayload,
    // Where the result goes; by default it becomes a new version.
    onImage?: (url: string) => void,
  ) => {
    if (isGenerating) return;
    setGenerationError(null);

    if (!payload.base_image_url) {
      setGenerationError('No base image to customize.');
      return;
    }

    // Token check (edit-garment is token-gated)
    try {
      const [balanceRes, settingsRes] = await Promise.all([
        api.get('/token/balance'),
        api.get('/users/platform-settings'),
      ]);
      const balance = balanceRes.data?.data?.tokens ?? balanceRes.data?.tokens ?? 0;
      const cost =
        settingsRes.data?.data?.edit_garment_token_price ??
        settingsRes.data?.edit_garment_token_price ??
        editTokenCost;
      if (balance < cost) {
        setInsufficientTokensInfo({ show: true, balance, cost });
        return;
      }
    } catch {
      // If the check fails (e.g. not logged in) continue — the API will 400.
    }

    setIsGenerating(true);
    try {
      const res = await api.post('/measurements/edit-garment-image', payload);
      const jobId = res.data?.data?.jobId ?? res.data?.jobId;
      if (!jobId) throw new Error('No job ID returned from edit-garment');

      const result = await pollJobStatus(jobId);
      if (result.image_url && onImage) {
        onImage(result.image_url);
      } else if (result.image_url) {
        setGeneratedImages((prev) => {
          const updated = [...prev, result.image_url];
          setActiveImageIndex(updated.length - 1);
          return updated;
        });
        setShowingBack(false);
      } else {
        throw new Error('Preview generated but no image was returned.');
      }

      // Refresh token balance after the spend
      api.get('/token/balance').then((r) => {
        const bal = r.data?.data?.tokens ?? r.data?.tokens ?? 0;
        setTokenBalance(bal);
      }).catch(() => {});
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Preview generation failed. Please try again.';
      setGenerationError(message);
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, editTokenCost]);

  const currentImage = generatedImages[activeImageIndex] ?? null;
  const currentBack = currentImage ? backViews[currentImage] : undefined;
  const displayImage = showingBack && currentBack ? currentBack : currentImage;

  // The fabric on the design, as a URL the image editor can fetch.
  const fabricImageForEdits = useMemo(() => {
    const isRemote = (u?: string) => !!u && /^https?:\/\//i.test(u);
    const img = isRemote(appliedFabric?.image)
      ? appliedFabric?.image
      : fabricLibrary.find((f) => f.id === selectedFabric)?.image;
    return isRemote(img) ? img : undefined;
  }, [appliedFabric, fabricLibrary, selectedFabric]);

  // What the garment is, in words, for the image editor. It must always be
  // sent: the backend falls back to "women's flare mini dress" otherwise.
  const garmentWords = useMemo(() => {
    const who = designGender === 'male' ? "men's" : "women's";
    const raw = (initialGarment || '').toLowerCase();
    const named: Record<string, string> = {
      tops: 'top', shirts: 'shirt', blouses: 'blouse', dresses: 'dress', skirts: 'skirt',
      pants: 'trousers', trousers: 'trousers', jumpsuits: 'jumpsuit', sets: 'two-piece set',
      suits: 'suit', kaftan: 'kaftan', agbada: 'agbada',
    };
    const byType: Record<string, string> = { top: 'top', bottom: 'trousers', full_body: 'outfit' };
    return `${who} ${named[raw] ?? (clothingType ? byType[clothingType] : 'outfit')}`;
  }, [designGender, clothingType, initialGarment]);

  const [isRefining, setIsRefining] = useState(false);
  const refineCurrent = useCallback(async (instruction: string) => {
    const note = instruction.trim();
    if (!currentImage || !note) return;
    lastRefine.current = note;
    setIsRefining(true);
    // Refining while the back is on screen changes the back: it replaces that
    // version's back view instead of becoming a new version.
    const front = currentImage;
    const onBack = showingBack && !!backViews[front];
    try {
      await generateProductPreview(
        {
          base_image_url: onBack ? backViews[front] : front,
          // The design's real fabric, so the editor keeps the print.
          fabric_image_url: fabricImageForEdits,
          garment_type: garmentWords,
          fit: FIT_OPTIONS.find((f) => f.id === selectedFit)?.label.toLowerCase() ?? '',
          style_notes: `Change only this and keep everything else exactly as it is: ${note}`,
        },
        onBack ? (url) => setBackViews((prev) => ({ ...prev, [front]: url })) : undefined,
      );
    } finally {
      setIsRefining(false);
    }
  }, [currentImage, garmentWords, selectedFit, generateProductPreview, fabricImageForEdits, showingBack, backViews]);

  const makeBackView = useCallback(async () => {
    if (!currentImage) return;
    lastRefine.current = BACK_VIEW;
    const front = currentImage;
    setIsMakingBack(true);
    try {
      await generateProductPreview(
        {
          base_image_url: front,
          fabric_image_url: fabricImageForEdits,
          garment_type: garmentWords,
          fit: FIT_OPTIONS.find((f) => f.id === selectedFit)?.label.toLowerCase() ?? '',
          // What they asked for may say something about the back ("open back").
          style_notes: userPrompt.trim(),
          view: 'back',
        },
        (url) => {
          setBackViews((prev) => ({ ...prev, [front]: url }));
          setShowingBack(true);
        },
      );
    } finally {
      setIsMakingBack(false);
    }
  }, [currentImage, fabricImageForEdits, garmentWords, selectedFit, userPrompt, generateProductPreview]);

  const removeVersion = useCallback((index: number) => {
    const gone = generatedImages[index];
    if (gone === undefined) return;
    const remaining = generatedImages.filter((_, i) => i !== index);
    setGeneratedImages(remaining);
    // Keep the same version on screen; deleting the one on screen shows the
    // one before it (or the next, if it was the first).
    setActiveImageIndex((active) => {
      if (index < active) return active - 1;
      if (index > active) return active;
      return Math.max(0, Math.min(active - 1 < 0 ? 0 : active - 1, remaining.length - 1));
    });
    setBackViews((prev) => {
      const next = { ...prev };
      delete next[gone];
      return next;
    });
    if (index === activeImageIndex) setShowingBack(false);
  }, [generatedImages, activeImageIndex]);

  const surpriseMe = useCallback(() => {
    const pick = <T,>(arr: T[]): T | undefined =>
      arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined;
    const forThem = styleLibrary.filter(
      (st) => st.is_active !== false && (!designGender || st.gender === designGender || st.gender === 'unisex'),
    );
    const of = (cat: string) => pick(forThem.filter((st) => st.category === cat))?._id ?? null;
    const raw = (initialGarment || '').toLowerCase();

    if (clothingType === 'top') {
      setSelectedNeckline(of('neckline'));
      setSelectedSleeve(of('sleeve'));
      setSelectedCollar(of('collar'));
    } else if (clothingType === 'bottom') {
      // A skirt design gets a skirt style, trousers get a trouser style.
      if (raw === 'skirts') setSelectedSkirt(of('skirt'));
      else setSelectedTrouser(of('trouser'));
    } else {
      setSelectedFullBody(of('full_body'));
      setSelectedNeckline(of('neckline'));
      setSelectedSleeve(of('sleeve'));
    }
    // Keep a fabric the customer brought ("Use my fabric"); otherwise pick one.
    if (!appliedFabric) setSelectedFabric(pick(fabricLibrary)?.id ?? null);
    setSelectedFit(pick(FIT_OPTIONS)?.id ?? null);
  }, [styleLibrary, fabricLibrary, designGender, clothingType, initialGarment, appliedFabric]);

  const selectionSummary = useMemo(() => {
    const styleName = (id: string | null) =>
      id ? styleLibrary.find((st) => st._id === id)?.name : undefined;
    const fabricName =
      appliedFabric?.name ?? fabricLibrary.find((f) => f.id === selectedFabric)?.name;
    return [
      styleName(selectedFullBody),
      styleName(selectedSilhouette),
      styleName(selectedNeckline),
      styleName(selectedSleeve),
      styleName(selectedCollar),
      styleName(selectedSkirt),
      styleName(selectedTrouser),
      fabricName,
      FIT_OPTIONS.find((f) => f.id === selectedFit)?.label,
    ].filter((x): x is string => !!x);
  }, [
    styleLibrary, fabricLibrary, appliedFabric, selectedFabric, selectedFit,
    selectedFullBody, selectedSilhouette, selectedNeckline, selectedSleeve,
    selectedCollar, selectedSkirt, selectedTrouser,
  ]);

  return {
    designName, setDesignName,
    designGender, setDesignGender,
    clothingType, setClothingType,
    selectedSilhouette, setSelectedSilhouette,
    selectedNeckline, setSelectedNeckline,
    selectedSleeve, setSelectedSleeve,
    selectedCollar, setSelectedCollar,
    selectedSkirt, setSelectedSkirt,
    selectedTrouser, setSelectedTrouser,
    selectedFullBody, setSelectedFullBody,
    selectedFabric, setSelectedFabric,
    appliedFabric, setAppliedFabric,
    selectedColor, setSelectedColor,
    selectedAccessories, toggleAccessory, setSelectedAccessories,
    selectedAddons, selectAddon,
    selectedFit, setSelectedFit,
    measurementSetName, setMeasurementSetName,
    referenceImages, setReferenceImages, removeReference,
    handleFileUpload, fileInputRef,
    isUploading, uploadStatus, uploadError,
    userPrompt, setUserPrompt, suggestedPrompt, isAnalyzing,
    expandedSection, setExpandedSection, toggleSection,
    generatedImages, setGeneratedImages, activeImageIndex,
    setActiveImageIndex: useCallback((i: number) => {
      setActiveImageIndex(i);
      setShowingBack(false);
    }, []),
    isGenerating, handleGenerate, generateProductPreview, currentImage, tokenBalance,
    displayImage,
    backViews, setBackViews,
    showingBack, setShowingBack,
    makeBackView, isMakingBack,
    removeVersion,
    backViewsForSave: useMemo(
      () => generatedImages
        .filter((front) => backViews[front])
        .map((front) => ({ front, back: backViews[front] })),
      [generatedImages, backViews],
    ),
    editTokenCost,
    generationCost,
    refineCurrent,
    isRefining,
    retryLast: () => {
      if (lastRefine.current === BACK_VIEW) void makeBackView();
      else if (lastRefine.current) void refineCurrent(lastRefine.current);
      else void handleGenerate();
    },
    surpriseMe,
    selectionSummary,
    imagesForSave: useMemo(() => {
      const current = generatedImages[activeImageIndex];
      if (!current) return generatedImages;
      return [...generatedImages.filter((_, i) => i !== activeImageIndex), current];
    }, [generatedImages, activeImageIndex]),
    generationError,
    insufficientTokensInfo,
    dismissInsufficientTokens: useCallback(() => setInsufficientTokensInfo({ show: false, balance: 0, cost: 0 }), []),
    showSaveModal, setShowSaveModal,
    mode,
  };
}
