'use client';

import { useState, useCallback, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import {
  OUTFIT_POOL,
  GENERATION_COST,
  type SectionId,
} from '@/data/studio-options';

// ═══════════════════════════════════════════════════════════════
//  useCustomization Hook
//  Shared state & handlers for bespoke studio and product customization.
// ═══════════════════════════════════════════════════════════════

export type CustomizationMode = 'studio' | 'product';

export interface UseCustomizationOptions {
  mode: CustomizationMode;
  defaultSection?: SectionId;
}

export interface CustomizationState {
  // Selections
  selectedSilhouette: string | null;
  setSelectedSilhouette: (id: string | null) => void;
  selectedNeckline: string | null;
  setSelectedNeckline: (id: string | null) => void;
  selectedSleeve: string | null;
  setSelectedSleeve: (id: string | null) => void;
  selectedFabric: string | null;
  setSelectedFabric: (id: string | null) => void;
  selectedColor: string | null;
  setSelectedColor: (id: string | null) => void;
  selectedAccessories: string[];
  toggleAccessory: (id: string) => void;
  selectedFit: string | null;
  setSelectedFit: (id: string | null) => void;
  referenceImages: string[];
  removeReference: (index: number) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;

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

  // Mode
  mode: CustomizationMode;
}

export function useCustomization({
  mode = 'studio',
  defaultSection = 'styles',
}: UseCustomizationOptions): CustomizationState {
  const { user, deductTokens } = useApp();

  // ── Selections ──────────────────────────────────────────────
  const [selectedSilhouette, setSelectedSilhouette] = useState<string | null>('s1');
  const [selectedNeckline, setSelectedNeckline] = useState<string | null>('n1');
  const [selectedSleeve, setSelectedSleeve] = useState<string | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>('#1B2A4A');
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [selectedFit, setSelectedFit] = useState<string | null>('fit1');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);

  // ── Panel navigation ────────────────────────────────────────
  const [expandedSection, setExpandedSection] = useState<string>(defaultSection);

  // ── Generation (studio only) ────────────────────────────────
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const removeReference = useCallback((index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (isGenerating || mode !== 'studio') return;
    const success = deductTokens(GENERATION_COST);
    if (!success) return;

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const randomImage = OUTFIT_POOL[Math.floor(Math.random() * OUTFIT_POOL.length)];
    setGeneratedImages((prev) => {
      const updated = [...prev, randomImage];
      setActiveImageIndex(updated.length - 1);
      return updated;
    });
    setIsGenerating(false);
  }, [isGenerating, mode, deductTokens]);

  const currentImage = generatedImages[activeImageIndex] ?? null;

  return {
    selectedSilhouette, setSelectedSilhouette,
    selectedNeckline, setSelectedNeckline,
    selectedSleeve, setSelectedSleeve,
    selectedFabric, setSelectedFabric,
    selectedColor, setSelectedColor,
    selectedAccessories, toggleAccessory,
    selectedFit, setSelectedFit,
    referenceImages, removeReference,
    handleFileUpload, fileInputRef,
    expandedSection, setExpandedSection, toggleSection,
    generatedImages, activeImageIndex, setActiveImageIndex,
    isGenerating, handleGenerate, currentImage, tokenBalance,
    mode,
  };
}
