'use client';

import { useState, useCallback, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { useUpload } from '@/hooks/useUpload';
import { useStyleLibrary } from '@/hooks/useStyleLibrary';
import { api } from '@/lib/api';
import { pollJobStatus } from '@/lib/pollJobStatus';
import {
  GENERATION_COST,
  FABRICS,
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
  selectedColor: string | null;
  setSelectedColor: (id: string | null) => void;
  selectedAccessories: string[];
  toggleAccessory: (id: string) => void;
  selectedFit: string | null;
  setSelectedFit: (id: string | null) => void;
  referenceImages: string[];  // Cloudinary URLs (or blob URLs as preview fallback)
  removeReference: (index: number) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  uploadStatus: string | null;
  uploadError: string | null;
  userPrompt: string;
  setUserPrompt: (value: string) => void;

  // Panel navigation
  expandedSection: string;
  setExpandedSection: (section: string) => void;
  toggleSection: (section: string) => void;

  // Generation (studio mode)
  generatedImages: string[];
  activeImageIndex: number;
  setActiveImageIndex: (index: number) => void;
  isGenerating: boolean;
  handleGenerate: () => Promise<void>;
  currentImage: string | null;
  tokenBalance: number;
  generationError: string | null;

  // Mode
  mode: CustomizationMode;
}

export function useCustomization({
  mode = 'studio',
  defaultSection = 'styles',
  initialDesignName = '',
  initialClothingType,
  initialGender,
}: UseCustomizationOptions): CustomizationState {
  const { user, deductTokens } = useApp();
  const { uploadOutfitImages, isUploading, uploadStatus, uploadError } = useUpload();
  const { all: styleLibrary } = useStyleLibrary();

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
  const [selectedColor, setSelectedColor] = useState<string | null>('#1B2A4A');
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [selectedFit, setSelectedFit] = useState<string | null>('fit1');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [userPrompt, setUserPrompt] = useState('');

  // ── Panel navigation ────────────────────────────────────────
  const [expandedSection, setExpandedSection] = useState<string>(defaultSection);

  // ── Generation (studio only) ────────────────────────────────
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const tokenBalance = user?.tokenBalance ?? 1000;

  // ── Handlers ────────────────────────────────────────────────

  const toggleSection = useCallback((section: string) => {
    setExpandedSection((prev) => (prev === section ? '' : section));
  }, []);

  const toggleAccessory = useCallback((id: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
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
    }

    e.target.value = '';
  }, [referenceImages.length, uploadOutfitImages]);

  const removeReference = useCallback((index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (isGenerating || mode !== 'studio') return;

    setGenerationError(null);

    // ── 1. Check token balance ──────────────────────────────────
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

      if (balance < cost) {
        setGenerationError(`Insufficient tokens. You have ${balance} but need ${cost}. Please top up your wallet.`);
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
    const configReferences: string[] = [];
    const selFabric = FABRICS.find((f) => f.id === selectedFabric);
    if (selFabric?.image) configReferences.push(selFabric.image);
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

    // Fabric + accessory image URLs as inspiration
    const inspirationUrls: string[] = [];
    if (selFabric?.image) {
      config.fabricRefId = selFabric.image;
      inspirationUrls.push(selFabric.image);
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

    try {
      const genRes = await api.post('/measurements/generate-outfit', {
        config,
        userPrompt: userPrompt.trim() || undefined,
        reference_image_urls: referenceImages.length > 0 ? referenceImages : undefined,
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
      }

      // Deduct tokens from local state for UI update
      deductTokens(GENERATION_COST);
    } catch (err: any) {
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
    referenceImages, styleLibrary, deductTokens,
  ]);

  const currentImage = generatedImages[activeImageIndex] ?? null;

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
    selectedColor, setSelectedColor,
    selectedAccessories, toggleAccessory,
    selectedFit, setSelectedFit,
    referenceImages, removeReference,
    handleFileUpload, fileInputRef,
    isUploading, uploadStatus, uploadError,
    userPrompt, setUserPrompt,
    expandedSection, setExpandedSection, toggleSection,
    generatedImages, activeImageIndex, setActiveImageIndex,
    isGenerating, handleGenerate, currentImage, tokenBalance,
    generationError,
    mode,
  };
}
