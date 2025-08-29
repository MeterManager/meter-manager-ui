import api from './baseApi';

export const getResourceDeliveries = async (page = 1, limit = 10, search = '') => {
  const response = await api.get('/resource-deliveries', { params: { page, limit, search } });
  return response.data;
};

export const createResourceDelivery = async (data) => {
  const response = await api.post('/resource-deliveries', data);
  return response.data;
};

export const updateResourceDelivery = async (id, data) => {
  const response = await api.put(`/resource-deliveries/${id}`, data);
  return response.data;
};

export const deleteResourceDelivery = async (id) => {
  await api.delete(`/resource-deliveries/${id}`);
};
