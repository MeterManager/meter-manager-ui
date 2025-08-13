import api from './baseApi';

export const getLocations = async (page = 1, limit = 10, search = '') => {
  const response = await api.get('/locations', { params: { page, limit, search } });
  return response.data;
};

export const createLocation = async (data) => {
  const response = await api.post('/locations', data);
  return response.data;
};

export const updateLocation = async (id, data) => {
  const response = await api.put(`/locations/${id}`, data);
  return response.data;
};

export const deleteLocation = async (id) => {
  await api.delete(`/locations/${id}`);
};
