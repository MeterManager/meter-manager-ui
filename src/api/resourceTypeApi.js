import api from './baseApi';

export const getResourceTypes = async (page = 1, limit = 10, search = '', is_active) => {
  const params = { page, limit };
  
  if (search) params.name = search;
  if (is_active !== undefined) params.is_active = is_active;

  const response = await api.get('/resource-types', { params });
  return response.data;
};

export const getResourceTypeById = async (id) => {
  const response = await api.get(`/resource-types/${id}`);
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
