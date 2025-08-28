import api from './baseApi';

export const getTenants = async (page = 1, limit = 10, search = '') => {
  const response = await api.get('/tenants', { params: { page, limit, search } });
  return response.data;
};

export const createTenant = async (data) => {
  const response = await api.post('/tenants', data);
  return response.data;
};

export const updateTenant = async (id, data) => {
  const response = await api.put(`/tenants/${id}`, data);
  return response.data;
};

export const deleteTenant = async (id) => {
  await api.delete(`/tenants/${id}`);
};
