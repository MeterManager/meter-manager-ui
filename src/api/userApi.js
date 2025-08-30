import api from './baseApi';

export const getUsers = async (page = 1, limit = 10, search = '', is_active) => {
  const params = { page, limit };
  if (search) params.name = search; 
  if (is_active !== undefined) params.is_active = is_active;

  const response = await api.get('/users', { params });
  return response.data; 
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data; 
};

export const updateUser = async (id, data) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data; 
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data; 
};
