import { useAuthContext } from '../contexts/AuthContext';
export const useAuthRequest = () => {
  const { isAuthenticated, isLoading, getToken, isBlocked } = useAuthContext();
  
  const canRequest = isAuthenticated && !isLoading && !isBlocked;
  
  const withToken = async (apiCall, ...args) => {
    if (!canRequest) throw new Error('Unauthorized');
    const token = await getToken();
    if (!token) throw new Error('No token available');
    return apiCall(token, ...args);
  };
  
  return { canRequest, withToken };
};
