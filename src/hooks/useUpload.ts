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
        headers: { 'Content-Type': undefined as any },  // Let browser set multipart boundary
      });

      // Parse response — exhaustive unwrapping for NestJS interceptor patterns
      const d = res.data;
      console.log('[Upload] Full response data:', JSON.stringify(d, null, 2));

      let results: UploadResult[] = [];
      if (Array.isArray(d?.data)) {
        results = d.data;
      } else if (d?.data && typeof d.data === 'object') {
        // NestJS returns { "0": {imageUrl, publicId}, "1": ... } — convert to array
        const vals = Object.values(d.data);
        if (vals.length > 0 && (vals[0] as any)?.imageUrl) {
          results = vals as UploadResult[];
        } else if (Array.isArray((d.data as any)?.data)) {
          results = (d.data as any).data;
        }
      } else if (Array.isArray(d)) {
        results = d;
      }

      console.log('[Upload] Parsed results:', results);

      // Ensure HTTPS — Cloudinary may return http:// URLs which AI pipelines reject
      results = results.map((r) => ({
        ...r,
        imageUrl: r.imageUrl?.replace(/^http:\/\//, 'https://'),
      }));

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
