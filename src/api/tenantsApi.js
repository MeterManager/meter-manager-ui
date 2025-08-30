import createApi from './baseApi';

export const getTenants = async (getAccessTokenSilently, page = 1, limit = 10, search = '') => {
  try {
    const api = createApi(getAccessTokenSilently);
    const response = await api.get('/tenants', { params: { page, limit, search } });
    return response.data;
  } catch (error) {
    console.error('Error fetching tenants:', error.message, error.response?.data);
    throw error;
  }
};

export const createTenant = async (getAccessTokenSilently, data) => {
  try {
    const api = createApi(getAccessTokenSilently);
    const response = await api.post('/tenants', data);
    return response.data;
  } catch (error) {
    console.error('Error creating tenant:', error.message, error.response?.data);
    throw error;
  }
};

export const updateTenant = async (getAccessTokenSilently, id, data) => {
  try {
    const api = createApi(getAccessTokenSilently);
    const response = await api.put(`/tenants/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating tenant:', error.message, error.response?.data);
    throw error;
  }
};

export const deleteTenant = async (getAccessTokenSilently, id) => {
  try {
    const api = createApi(getAccessTokenSilently);
    await api.delete(`/tenants/${id}`);
  } catch (error) {
    console.error('Error deleting tenant:', error.message, error.response?.data);
    throw error;
  }
};