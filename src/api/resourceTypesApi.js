import api from './baseApi';

export const getResourceTypes = async (page = 1, limit = 10, search = '') => {
  const response = await api.get('/resource-types', { params: { page, limit, search } });
  return response.data;
};

export const createResourceType = async (data) => {
  const response = await api.post('/resource-types', data);
  return response.data;
};

export const updateResourceType = async (id, data) => {
  const response = await api.put(`/resource-types/${id}`, data);
  return response.data;
};

export const deleteResourceType = async (id) => {
  await api.delete(`/resource-types/${id}`);
};
