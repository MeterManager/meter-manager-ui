import createApi from './baseApi';

export const getResourceTypes = async (getAccessTokenSilently, page = 1, limit = 10, search = '', is_active) => {
  const params = { page, limit };
  if (search) params.name = search;
  if (is_active !== undefined) params.is_active = is_active;

  try {
    const api = createApi(getAccessTokenSilently);
    const response = await api.get('/resource-types', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching resource types:', error.message, error.response?.data);
    throw error;
  }
};

export const getResourceTypeById = async (getAccessTokenSilently, id) => {
  try {
    const api = createApi(getAccessTokenSilently);
    const response = await api.get(`/resource-types/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching resource type by id:', error.message, error.response?.data);
    throw error;
  }
};

export const createResourceType = async (getAccessTokenSilently, data) => {
  try {
    const api = createApi(getAccessTokenSilently);
    const response = await api.post('/resource-types', data);
    return response.data;
  } catch (error) {
    console.error('Error creating resource type:', error.message, error.response?.data);
    throw error;
  }
};

export const updateResourceType = async (getAccessTokenSilently, id, data) => {
  try {
    const api = createApi(getAccessTokenSilently);
    const response = await api.put(`/resource-types/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating resource type:', error.message, error.response?.data);
    throw error;
  }
};

export const deleteResourceType = async (getAccessTokenSilently, id) => {
  try {
    const api = createApi(getAccessTokenSilently);
    await api.delete(`/resource-types/${id}`);
  } catch (error) {
    console.error('Error deleting resource type:', error.message, error.response?.data);
    throw error;
  }
};