import api from './baseApi';

export const getMeterTenants = async (filters = {}) => {
  const params = {};
  if (filters.meter_id) params.meter_id = filters.meter_id;
  if (filters.tenant_id) params.tenant_id = filters.tenant_id;
  if (filters.active_only !== undefined) params.active_only = filters.active_only;
  
  const response = await api.get('/meter-tenants', { params });
  return response.data;
};

export const createMeterTenant = async (data) => {
  const response = await api.post('/meter-tenants', data);
  return response.data;
};

export const updateMeterTenant = async (id, data) => {
  const response = await api.put(`/meter-tenants/${id}`, data);
  return response.data;
};

export const deleteMeterTenant = async (id) => {
  await api.delete(`/meter-tenants/${id}`);
};