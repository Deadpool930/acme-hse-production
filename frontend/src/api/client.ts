import axios from 'axios';

const API_URL = '/api/v1';

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
