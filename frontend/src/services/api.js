import axios from 'axios';

// Create custom axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Inject JWT token into headers for every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('blog_cms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized (401), token might be expired/invalid
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized access, removing token...');
      localStorage.removeItem('blog_cms_token');
      localStorage.removeItem('blog_cms_user');
      // We can also trigger a window redirect or context reload if required,
      // but Context handles state checking.
    }
    return Promise.reject(error);
  }
);

export default api;
