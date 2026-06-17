import axios from 'axios';

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

// Request interceptor to inject Bearer Token
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

// Response interceptor to handle token refresh on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Guard: only attempt refresh on 401, if it's not already a retry, and if we are on client side
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
