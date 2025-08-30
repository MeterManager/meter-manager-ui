import createApi from './baseApi';

export const getTariffs = async (getAccessTokenSilently, page = 1, limit = 10, search = '', is_active) => {
  const params = { page, limit };
  if (search) params.name = search;
  if (is_active !== undefined) params.is_active = is_active;

  try {
    const api = createApi(getAccessTokenSilently);
    const response = await api.get('/tariffs', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching tariffs:', error.message, error.response?.data);
    throw error;
  }
};

export const getTariffById = async (getAccessTokenSilently, id) => {
  try {
    const api = createApi(getAccessTokenSilently);
    const response = await api.get(`/tariffs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tariff by id:', error.message, error.response?.data);
    throw error;
  }
};

export const createTariff = async (getAccessTokenSilently, data) => {
  try {
    const api = createApi(getAccessTokenSilently);
    const response = await api.post('/tariffs', data);
    return response.data;
  } catch (error) {
    console.error('Error creating tariff:', error.message, error.response?.data);
    throw error;
  }
};

export const updateTariff = async (getAccessTokenSilently, id, data) => {
  try {
    const api = createApi(getAccessTokenSilently);
    const response = await api.put(`/tariffs/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating tariff:', error.message, error.response?.data);
    throw error;
  }
};

export const deleteTariff = async (getAccessTokenSilently, id) => {
  try {
    const api = createApi(getAccessTokenSilently);
    await api.delete(`/tariffs/${id}`);
  } catch (error) {
    console.error('Error deleting tariff:', error.message, error.response?.data);
    throw error;
  }
};