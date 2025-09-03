import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { verifyUser as verifyUserApi } from '../api/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { isAuthenticated, isLoading: auth0Loading, getAccessTokenSilently, user: auth0User, loginWithRedirect, logout } = useAuth0();
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [error, setError] = useState(null);
  const [hasVerified, setHasVerified] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;
  const isMountedRef = useRef(true);
  const verificationPromiseRef = useRef(null);

  const updateState = useCallback((newState) => {
    console.log('📝 Updating auth state:', newState);
    if (newState.userData !== undefined) setUserData(newState.userData);
    if (newState.token !== undefined) setToken(newState.token);
    if (newState.isBlocked !== undefined) {
      console.log('🚫 Setting isBlocked to:', newState.isBlocked);
      setIsBlocked(newState.isBlocked);
    }
    if (newState.error !== undefined) {
      console.log('❌ Setting error to:', newState.error);
      setError(newState.error);
    }
    if (newState.hasVerified !== undefined) setHasVerified(newState.hasVerified);
    if (newState.loading !== undefined) setLoading(newState.loading);
  }, []);

  const verify = useCallback(async () => {
    console.log('🔐 Starting verify process...', { isAuthenticated, auth0Loading });
    
    if (!isAuthenticated || auth0Loading) {
      console.log('⏸️ Skipping verify - not authenticated or still loading');
      setLoading(false);
      return null;
    }

    if (isBlocked) {
      console.log('🚫 User is blocked, stopping all verification');
      return null;
    }

    if (hasVerified && token) {
      console.log('✅ Already verified, using cached token');
      return token;
    }

    if (verificationPromiseRef.current) {
      console.log('⏳ Verification already in progress...');
      try {
        const result = await verificationPromiseRef.current;
        return result;
      } catch {
        return null;
      }
    }

    console.log('🚀 Starting new verification...');
    verificationPromiseRef.current = (async () => {
      try {
        setLoading(true);
        console.log('🎫 Getting access token...');
        const newToken = await getAccessTokenSilently({ 
          authorizationParams: { audience }, 
          cacheMode: 'on' 
        });
        
        console.log('📡 Verifying user with API...');
        const response = await verifyUserApi(newToken);
        
        console.log('✅ User verification successful:', response);
        const newState = {
          token: newToken,
          userData: response.user,
          error: null,
          isBlocked: false,
          hasVerified: true,
          loading: false
        };
        updateState(newState);
        if (response.user && response.user.role) {
          setIsAdmin(response.user.role === 'admin');
        }
        return newToken;
      } catch (err) {
        console.log('❌ Verification failed:', err);
        console.log('📊 Error details:', {
          status: err.response?.status,
          message: err.response?.data?.message
        });
        
        let newState;
        if (err.response?.status === 403) {
          console.log('🚫 403 error - blocking user PERMANENTLY');
          newState = {
            isBlocked: true,
            error: err.response?.data?.message || 'Ваш акаунт деактивовано.',
            userData: null,
            token: null,
            hasVerified: true,
            loading: false
          };
          localStorage.removeItem('token');
        } else {
          console.log('⚠️ Other error - not blocking user');
          newState = {
            error: err.message,
            userData: null,
            hasVerified: true,
            loading: false
          };
        }
        updateState(newState);
        return null;
      } finally {
        console.log('🏁 Verification process finished');
        verificationPromiseRef.current = null;
      }
    })();

    try {
      return await verificationPromiseRef.current;
    } catch {
      return null;
    }
  }, [isAuthenticated, auth0Loading, getAccessTokenSilently, audience, updateState, isBlocked, hasVerified, token]);

  useEffect(() => {
    console.log('🔄 AuthProvider useEffect triggered');
    isMountedRef.current = true;
    
    if (!isBlocked) {
      verify();
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [verify, isBlocked]);

  useEffect(() => {
    if (userData && userData.role) {
      setIsAdmin(userData.role === 'admin');
    } else {
      setIsAdmin(false);
    }
  }, [userData]);

  const handleLogout = useCallback(() => {
    console.log('👋 Logging out...');
    setUserData(null);
    setToken(null);
    setIsBlocked(false);
    setError(null);
    setHasVerified(false);
    setLoading(true);
    setIsAdmin(false);
    localStorage.removeItem('token');
    logout({ logoutParams: { returnTo: window.location.origin } });
  }, [logout]);

  const getToken = useCallback(async () => {
    if (isBlocked) throw new Error('User is blocked');
    if (token) return token;
    return await verify();
  }, [verify, isBlocked, token]);

  const value = {
    isAuthenticated,
    user: userData || auth0User,
    isLoading: loading || auth0Loading,
    error,
    isBlocked,
    loginWithRedirect,
    handleLogout,
    getToken,
    isAdmin,
  };

  console.log('🔤 AuthProvider providing:', value);
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);