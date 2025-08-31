import createApi from './baseApi';

export const getUsers = async (token, search = '') => {
  const api = createApi(token);
  const params = {};
  if (search) params.search = search;
  const response = await api.get('/users', { params });
  return response.data;
};

export const getUserById = async (token, id) => {
  const api = createApi(token);
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (token, id, data) => {
  const api = createApi(token);
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (token, id) => {
  const api = createApi(token);
  await api.delete(`/users/${id}`);
};