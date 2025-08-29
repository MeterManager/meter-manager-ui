import api from './baseApi';

export const getTariffs = async (page = 1, limit = 10, search = '', is_active) => {
  const params = { page, limit };
  if (search) params.name = search;
  if (is_active !== undefined) params.is_active = is_active;

  const response = await api.get('/tariffs', { params });
  return response.data;
};

export const getTariffById = async (id) => {
  const response = await api.get(`/tariffs/${id}`);
  return response.data;
};

export const createTariff = async (data) => {
  const response = await api.post('/tariffs', data);
  return response.data;
};

export const updateTariff = async (id, data) => {
  const response = await api.put(`/tariffs/${id}`, data);
  return response.data;
};

export const deleteTariff = async (id) => {
  await api.delete(`/tariffs/${id}`);
};
