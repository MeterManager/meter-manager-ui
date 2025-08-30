import api from './baseApi';

export const getMeters = async (filters = {}) => {
  const params = {};
  if (filters.is_active !== undefined) params.is_active = filters.is_active;
  if (filters.serial_number) params.serial_number = filters.serial_number;
  if (filters.location_id) params.location_id = filters.location_id;
  if (filters.energy_resource_type_id) params.energy_resource_type_id = filters.energy_resource_type_id;
  
  const response = await api.get('/meters', { params });
  return response.data;
};

export const getMeterById = async (id) => {
  const response = await api.get(`/meters/${id}`);
  return response.data;
};

export const createMeter = async (data) => {
  const response = await api.post('/meters', data);
  return response.data;
};

export const updateMeter = async (id, data) => {
  const response = await api.put(`/meters/${id}`, data);
  return response.data;
};

export const deleteMeter = async (id) => {
  await api.delete(`/meters/${id}`);
};