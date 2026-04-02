import axios from 'axios';

// Dynamic Base URL detection for Local vs Cloud (PWA Readiness)
const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const client = axios.create({
  baseURL: API_URL,
});

// Senior Developer Pattern: Persistent Auth Interceptor
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
