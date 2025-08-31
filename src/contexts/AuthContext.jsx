import { createContext, useContext, useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { isAuthenticated, user, isLoading, error, loginWithRedirect, handleLogout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user && user.role) {
      setIsAdmin(user.role === 'admin');
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        error,
        loginWithRedirect,
        handleLogout,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
