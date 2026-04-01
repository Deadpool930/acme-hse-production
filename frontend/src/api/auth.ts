import client from './client';

export const login = async (credentials: any) => {
  const { data } = await client.post('/auth/login', credentials);
  if (data.access_token) {
    localStorage.setItem('token', data.access_token);
  }
  return data;
};

export const getMe = async () => {
  const { data } = await client.get('/users/me');
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
};
