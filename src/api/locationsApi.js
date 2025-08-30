import createApi from './baseApi';

export const getLocations = async (getAccessTokenSilently, page = 1, limit = 10, search = '') => {
  try {
    const api = createApi(getAccessTokenSilently);
    const response = await api.get('/locations', { params: { page, limit, search } });
    return response.data;
  } catch (error) {
    console.error('Error fetching locations:', error.message, error.response?.data);
    throw error;
  }
};

export const createLocation = async (getAccessTokenSilently, data) => {
  try {
    const api = createApi(getAccessTokenSilently);
    const response = await api.post('/locations', data);
    return response.data;
  } catch (error) {
    console.error('Error creating location:', error.message, error.response?.data);
    throw error;
  }
};

export const updateLocation = async (getAccessTokenSilently, id, data) => {
  try {
    const api = createApi(getAccessTokenSilently);
    const response = await api.put(`/locations/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating location:', error.message, error.response?.data);
    throw error;
  }
};

export const deleteLocation = async (getAccessTokenSilently, id) => {
  try {
    const api = createApi(getAccessTokenSilently);
    await api.delete(`/locations/${id}`);
  } catch (error) {
    console.error('Error deleting location:', error.message, error.response?.data);
    throw error;
  }
};