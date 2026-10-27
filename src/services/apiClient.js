import axios from 'axios';

/**
 * Resolves and normalizes the backend API base URL for both development and production.
 *
 * Checks in order of precedence:
 * 1. import.meta.env.VITE_API_URL (preferred Vite convention)
 * 2. import.meta.env.VITE_API_BASE_URL (legacy / existing variable)
 * 3. Fallback based on environment:
 *    - In production (import.meta.env.PROD): 'https://rescrafted-backend-kdeu.onrender.com'
 *    - In development: 'http://localhost:5000'
 *
 * Normalizes the URL so that `/api/v1` is present exactly once and trailing slashes are removed.
 */
export const resolveApiBaseUrl = () => {
  const envUrl =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL;

  let base = '';

  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    base = envUrl.trim();
  } else if (import.meta.env.PROD) {
    // Production fallback: NEVER target localhost in production!
    base = 'https://rescrafted-backend-kdeu.onrender.com';
  } else {
    // Development fallback
    base = 'http://localhost:5000';
  }

  // Remove any trailing slashes
  base = base.replace(/\/+$/, '');

  // Ensure /api/v1 is appended exactly once
  if (base.endsWith('/api/v1')) {
    return base;
  }
  if (base.endsWith('/api')) {
    return `${base}/v1`;
  }
  return `${base}/api/v1`;
};

export const API_BASE_URL = resolveApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send HttpOnly auth cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach bearer token if stored in memory/storage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rescrafted_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        'An unexpected network error occurred.',
      code: error.response?.data?.error?.code || 'NETWORK_ERROR',
      status: error.response?.status || 500,
      details: error.response?.data?.error?.details || null,
    };
    return Promise.reject(customError);
  }
);

export default apiClient;
