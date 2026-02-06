import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const signup = (userData) => api.post('/auth/signup', userData);
export const login = (credentials) => api.post('/auth/login', credentials);
export const getProfile = () => api.get('/auth/me');

// OTP APIs
export const sendOTP = (email) => api.post('/auth/send-otp', { email });
export const verifyOTP = (email, otp) => api.post('/auth/verify-otp', { email, otp });
export const resendOTP = (email) => api.post('/auth/resend-otp', { email });
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });

// Google Auth APIs
export const googleSignIn = (googleData) => api.post('/auth/google', googleData);
export const completeGoogleProfile = (data) => api.put('/auth/google/complete', data);


// User APIs
export const updateProfile = (data) => api.put('/user/profile', data);
export const changePassword = (data) => api.put('/user/password', data);
export const updatePreferences = (data) => api.put('/user/preferences', data);

// Contact API
export const sendContactMessage = (data) => api.post('/contact', data);


// Designs API
export const uploadDesign = (formData) => {
  return api.post('/designs', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getDesigns = (params) => {
  return api.get('/designs', { params });
};

export const getDesignById = (id) => {
  return api.get(`/designs/${id}`);
};
// Projects API
export const getProjects = () => {
  return api.get('/projects');
};

export const getProjectById = (id) => {
  return api.get(`/projects/${id}`);
};

export const getTopProjects = () => {
  return api.get('/projects/top');
};

export const uploadProject = (formData) => {
  return api.post('/projects', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteProject = (id) => {
  return api.delete(`/projects/${id}`);
};

// Dashboard API
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getDashboardUpdates = () => api.get('/dashboard/updates');

export default api;