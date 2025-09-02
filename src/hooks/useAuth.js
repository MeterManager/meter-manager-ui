import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { verifyUser as verifyUserApi } from '../api/authApi';

const useAuth = () => {
  const { isAuthenticated, isLoading, getAccessTokenSilently, user, loginWithRedirect, logout } = useAuth0();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false); 

  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  useEffect(() => {
    const verify = async () => {
      if (!isAuthenticated || isLoading) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const token = await getAccessTokenSilently({
          authorizationParams: { audience },
        });

        localStorage.setItem('token', token);

        const response = await verifyUserApi(token);

        setUserData(response.user);
        setError(null);
        setIsBlocked(false); 
      } catch (err) {
        console.error('Error verifying user:', err);

        if (err.response?.status === 403) {
          setIsBlocked(true);
          setError(err.response?.data?.message || 'Ваш акаунт деактивовано.');
        } else {
          setError(err.message);
        }
        localStorage.removeItem('token');
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [isAuthenticated, isLoading, getAccessTokenSilently, audience]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserData(null);
    setIsBlocked(false);
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return {
    isAuthenticated,
    user: userData || user,
    isLoading: loading,
    error,
    isBlocked, 
    loginWithRedirect,
    handleLogout,
  };
};

export default useAuth;
