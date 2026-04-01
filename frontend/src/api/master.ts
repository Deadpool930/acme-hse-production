import client from './client';

export const fetchPlants = async () => {
  const { data } = await client.get('/master/plants');
  return data;
};

export const fetchRoles = async () => {
  const { data } = await client.get('/master/roles');
  return data;
};
