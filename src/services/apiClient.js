import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

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
