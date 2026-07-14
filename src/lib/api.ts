import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

// Get base URL from environment or fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://qlozet-backend.fly.dev/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to check window environment safely (avoids Next.js SSR crashes)
const isClient = typeof window !== 'undefined';

// ═══════════════════════════════════════════════════════════════
//  REQUEST DEDUPLICATION
//  Identical GET requests within a short window share the same
//  in-flight promise instead of firing duplicate network calls.
// ═══════════════════════════════════════════════════════════════

interface CacheEntry {
  promise: Promise<AxiosResponse>;
  timestamp: number;
}

const inflightCache = new Map<string, CacheEntry>();
const DEDUP_WINDOW_MS = 2000; // 2 seconds — deduplicate identical GETs

/** Build a stable cache key from a GET request config */
function getCacheKey(config: AxiosRequestConfig): string | null {
  if (config.method && config.method.toLowerCase() !== 'get') return null;
  const url = config.url || '';
  const params = config.params ? JSON.stringify(config.params) : '';
  return `GET:${url}:${params}`;
}

/** Wrap api.get with deduplication */
const originalGet = api.get.bind(api);
api.get = function dedupGet<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  const fullConfig = { ...config, url, method: 'get' };
  const key = getCacheKey(fullConfig);

  if (key) {
    const cached = inflightCache.get(key);
    if (cached && Date.now() - cached.timestamp < DEDUP_WINDOW_MS) {
      // Return the same in-flight promise
      return cached.promise as Promise<AxiosResponse<T>>;
    }

    const promise = originalGet<T>(url, config).finally(() => {
      // Clean up after the dedup window expires
      setTimeout(() => inflightCache.delete(key), DEDUP_WINDOW_MS);
    });

    inflightCache.set(key, { promise: promise as Promise<AxiosResponse>, timestamp: Date.now() });
    return promise;
  }

  return originalGet<T>(url, config);
} as typeof api.get;

// ═══════════════════════════════════════════════════════════════
//  REQUEST INTERCEPTOR — inject Bearer Token
// ═══════════════════════════════════════════════════════════════

api.interceptors.request.use(
  (config) => {
    if (isClient) {
      const token = localStorage.getItem('qlozet_access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════════════════
//  RESPONSE INTERCEPTOR — retry on 429, refresh on 401
// ═══════════════════════════════════════════════════════════════

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/** Delay helper */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ── 429 Too Many Requests — retry with exponential backoff ──
    if (error.response?.status === 429) {
      const retryCount = originalRequest._retryCount || 0;
      const MAX_RETRIES = 3;

      if (retryCount < MAX_RETRIES) {
        originalRequest._retryCount = retryCount + 1;

        // Use Retry-After header if provided, otherwise exponential backoff
        const retryAfter = error.response.headers['retry-after'];
        const backoffMs = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : Math.min(1000 * Math.pow(2, retryCount) + Math.random() * 500, 8000);

        await delay(backoffMs);
        return api(originalRequest);
      }

      // Exhausted retries — let error propagate
      return Promise.reject(error);
    }

    // ── 401 Unauthorized — token refresh ──
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      isClient &&
      originalRequest.url !== '/auth/refresh' &&
      originalRequest.url !== '/auth/login/customer'
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const userId = localStorage.getItem('qlozet_user_id');
      const refreshToken = localStorage.getItem('qlozet_refresh_token');

      if (!userId || !refreshToken) {
        isRefreshing = false;
        // Session expired, clear details and dispatch an event or logout
        handleAuthFailure();
        return Promise.reject(error);
      }

      try {
        // Hit the refresh endpoint using a clean axios call (to avoid infinite request loops)
        const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {
          userId,
          refreshToken,
        });

        // Backend returns access_token and refresh_token
        const { access_token, refresh_token } = refreshResponse.data;

        if (access_token) {
          localStorage.setItem('qlozet_access_token', access_token);
          if (refresh_token) {
            localStorage.setItem('qlozet_refresh_token', refresh_token);
          }

          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          originalRequest.headers.Authorization = `Bearer ${access_token}`;

          processQueue(null, access_token);
          isRefreshing = false;

          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        handleAuthFailure();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Clear local details on final authentication failure
function handleAuthFailure() {
  if (isClient) {
    localStorage.removeItem('qlozet_access_token');
    localStorage.removeItem('qlozet_refresh_token');
    localStorage.removeItem('qlozet_user_id');
    localStorage.removeItem('qlozet_user');
    // Dispatch custom event to notify AppContext of a forced logout
    window.dispatchEvent(new Event('qlozet_auth_failed'));
  }
}
