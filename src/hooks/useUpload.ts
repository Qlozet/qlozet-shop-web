'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

// ═══════════════════════════════════════════════════════════════
//  useUpload — Upload images to Cloudinary via backend
// ═══════════════════════════════════════════════════════════════

export interface UploadResult {
  imageUrl: string;
  publicId: string;
}

export interface UseUploadReturn {
  /** Upload files to /uploads/outfits → returns Cloudinary URLs */
  uploadOutfitImages: (files: File[]) => Promise<UploadResult[]>;
  /** Whether an upload is currently in progress */
  isUploading: boolean;
  /** Upload progress as a message (e.g. "Uploading 2 of 3...") */
  uploadStatus: string | null;
  /** Last upload error */
  uploadError: string | null;
  /** Clear any upload error */
  clearUploadError: () => void;
}

export function useUpload(): UseUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadOutfitImages = useCallback(async (files: File[]): Promise<UploadResult[]> => {
    if (files.length === 0) return [];
    if (files.length > 3) {
      setUploadError('Maximum 3 reference images allowed');
      return [];
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadStatus(`Uploading ${files.length} image${files.length > 1 ? 's' : ''}...`);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const res = await api.post('/uploads/outfits', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Parse response: { data: [{ imageUrl, publicId }] }
      const results: UploadResult[] = res.data?.data || res.data;
      setUploadStatus(null);
      return results;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to upload images';
      setUploadError(message);
      setUploadStatus(null);
      return [];
    } finally {
      setIsUploading(false);
    }
  }, []);

  const clearUploadError = useCallback(() => {
    setUploadError(null);
  }, []);

  return {
    uploadOutfitImages,
    isUploading,
    uploadStatus,
    uploadError,
    clearUploadError,
  };
}
