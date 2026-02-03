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

// Google Auth APIs
export const googleSignIn = (googleData) => api.post('/auth/google', googleData);
export const completeGoogleProfile = (data) => api.put('/auth/google/complete', data);


// User APIs
export const updateProfile = (data) => api.put('/user/profile', data);
export const changePassword = (data) => api.put('/user/password', data);
export const updatePreferences = (data) => api.put('/user/preferences', data);

// Contact API
export const sendContactMessage = (data) => api.post('/contact', data);

// Reports API
export const downloadReport = (reportId) => {
  return api.get(`/reports/download/${reportId}`, {
    responseType: 'blob'
  });
};

export const getAllReports = () => api.get('/reports');

export const uploadReport = (formData) => {
  return api.post('/reports/upload', formData);
};

export const deleteReport = (reportId) => api.delete(`/reports/${reportId}`);

export const downloadUploadedFile = (reportId) => {
  return api.get(`/reports/file/${reportId}`, {
    responseType: 'blob'
  });
};

export default api;