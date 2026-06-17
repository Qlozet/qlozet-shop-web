'use client';

import { api } from '@/lib/api';

// ═══════════════════════════════════════════════════════════════
//  pollJobStatus — Poll the generation job until completed/failed
// ═══════════════════════════════════════════════════════════════

export interface JobResult {
  /** Normalized image URL — could come from result.fileUrl or result.image_url */
  image_url: string;
  filePublicId?: string;
}

export interface JobStatus {
  job_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  result?: any; // Raw result from backend — shape varies
  error?: string;
}

/**
 * Polls GET /measurements/job/:jobId every `intervalMs` until completed or failed.
 * @param jobId - The job ID returned by the generate endpoint
 * @param maxAttempts - Maximum number of poll attempts (default: 60 = ~3 min)
 * @param intervalMs - Milliseconds between polls (default: 3000)
 * @param onProgress - Optional callback for progress updates
 */
export async function pollJobStatus(
  jobId: string,
  {
    maxAttempts = 60,
    intervalMs = 3000,
    onProgress,
  }: {
    maxAttempts?: number;
    intervalMs?: number;
    onProgress?: (status: JobStatus, attempt: number) => void;
  } = {}
): Promise<JobResult> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await api.get(`/measurements/job/${jobId}`);
    // The endpoint returns a Mongoose document directly
    const data = res.data?.data || res.data;

    const jobStatus: JobStatus = {
      job_id: data.job_id || jobId,
      status: data.status,
      result: data.result,
      error: data.error,
    };

    onProgress?.(jobStatus, attempt);

    if (jobStatus.status === 'completed' && jobStatus.result) {
      // Normalize: backend returns { fileUrl, filePublicId } from Cloudinary
      const raw = jobStatus.result;
      return {
        image_url: raw.fileUrl || raw.image_url || raw.imageUrl || '',
        filePublicId: raw.filePublicId || raw.publicId,
      };
    }

    if (jobStatus.status === 'failed') {
      throw new Error(jobStatus.error || 'Generation failed. Please try again.');
    }

    // 'queued' or 'running' — wait and poll again
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error('Generation timed out. Please try again.');
}

