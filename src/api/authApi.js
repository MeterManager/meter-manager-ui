import createApi from './baseApi';

export const verifyUser = async (token) => {
  try {
    const api = createApi(token);
    const response = await api.get('/auth/verify-token');
    return response.data;
  } catch (error) {
    console.error('Error verifying user:', error.message, error.response?.data);
    throw error;
  }
};
