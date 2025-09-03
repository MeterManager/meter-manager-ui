import createApi from './baseApi';

export const verifyUser = async (token) => {
  try {
    const api = createApi(token);
    const response = await api.get('/auth/verify-token');
    return response.data;
  } catch (error) {
    if (error.response?.status !== 403) {
      console.error('Error verifying user:', error.message);
    }
    throw error;
  }
};