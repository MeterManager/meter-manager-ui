import { useState, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import * as locationApi from '../api/locationsApi';
import { useAuthContext } from '../contexts/AuthContext';

const fetcher = async (url, getToken, search = '') => {
  const token = await getToken();
  if (!token) throw new Error('Токен недоступний');
  
  const response = await locationApi.getLocations(token, search);
  return (response.data || []).map((loc) => ({
    ...loc,
    isActive: loc.is_active === true,
  }));
};

export const useLocations = () => {
  const { isAuthenticated, isLoading: authLoading, getToken, isBlocked } = useAuthContext();
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const swrKey = isAuthenticated && !authLoading && !isBlocked && getToken ? 
    ['locations', getToken, search] : null;

  const {
    data: locations = [],
    error: swrError,
    isLoading: loading,
    mutate: mutateLocations,
  } = useSWR(swrKey, ([url, getToken, search]) => fetcher(url, getToken, search), {
    onError: (err) => {
      if (err.response?.status === 403) return;
      setError('Помилка при завантаженні локацій');
      console.error('SWR Error:', err);
    },
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  const activeLocations = useMemo(() => {
    return locations.filter((loc) => loc.isActive);
  }, [locations]);

  const addLocation = useCallback(
    async (data) => {
      if (isBlocked) throw new Error('Користувача заблоковано');
      
      const token = await getToken();
      if (!token) throw new Error('Токен недоступний');
      
      const transformedData = {
        name: data.name,
        address: data.address,
        is_active: data.isActive ?? true,
      };

      try {
        setIsActionLoading(true);
        setError(null);

        const tempId = Date.now();
        const optimisticLocation = {
          id: tempId,
          name: transformedData.name,
          address: transformedData.address,
          isActive: transformedData.is_active,
          isOptimistic: true,
        };

        mutateLocations([...locations, optimisticLocation], false);

        const response = await locationApi.createLocation(token, transformedData);

        mutateLocations();
        mutate('meters');
        mutate('tenants');
        mutate('deliveries');

        setError(null);
        return response;
      } catch (err) {
        mutateLocations();
        setError(err.message || 'Помилка при додаванні локації');
        throw err;
      } finally {
        setIsActionLoading(false);
      }
    },
    [locations, mutateLocations, getToken, isBlocked]
  );

  const editLocation = useCallback(
    async (id, data) => {
      if (isBlocked) throw new Error('Користувача заблоковано');
      
      const token = await getToken();
      if (!token) throw new Error('Токен недоступний');
      
      const transformedData = {
        name: data.name,
        address: data.address,
        is_active: data.isActive,
      };

      try {
        setIsActionLoading(true);
        setError(null);

        const updatedLocations = locations.map((loc) =>
          loc.id === id ? { ...loc, ...transformedData, isActive: transformedData.is_active } : loc
        );
        mutateLocations(updatedLocations, false);

        const response = await locationApi.updateLocation(token, id, transformedData);

        mutateLocations();
        if (transformedData.is_active === false) {
          mutate('meters');
          mutate('tenants');
        }

        setError(null);
        return response;
      } catch (err) {
        mutateLocations();
        setError(err.message || 'Помилка при редагуванні локації');
        throw err;
      } finally {
        setIsActionLoading(false);
      }
    },
    [locations, mutateLocations, getToken, isBlocked]
  );

  const removeLocation = useCallback(
    async (id) => {
      if (isBlocked) throw new Error('Користувача заблоковано');
      const token = await getToken();
      if (!token) throw new Error('Токен недоступний');
      
      try {
        setIsActionLoading(true);
        setError(null);
        await locationApi.deleteLocation(token, id);
        mutateLocations();
        mutate('meters');
        mutate('tenants');
        mutate('deliveries');
        setError(null);
      } catch (err) {
        mutateLocations();
        setError(err.message || 'Помилка при видаленні локації');
        throw err;
      } finally {
        setIsActionLoading(false);
      }
    },
    [mutateLocations, getToken, isBlocked]
  );

  const updateLocationStatus = useCallback(
    async (id, is_active) => {
      if (isBlocked) throw new Error('Користувача заблоковано');
      const token = await getToken();
      if (!token) throw new Error('Токен недоступний');
      const loc = locations.find((l) => l.id === id);
      if (!loc) throw new Error('Локацію не знайдено');
      
      try {
        setIsActionLoading(true);
        setError(null);
        
        if (!is_active) {
          const dependencies = await locationApi.getLocationDependencies(token, id);
          if (dependencies.data.active_meters > 0 || dependencies.data.deliveries > 0 || dependencies.data.active_tenants > 0) {
            return { requiresConfirmation: true, dependencies: dependencies.data };
          }
        }

        const updatedLocations = locations.map((location) =>
          location.id === id ? { ...location, isActive: is_active } : location
        );
        mutateLocations(updatedLocations, false);

        const response = await locationApi.updateLocation(token, id, {
          name: loc.name,
          address: loc.address,
          is_active,
        });

        mutateLocations();
        if (!is_active) {
          mutate('meters');
        }

        setError(null);
        return { response, dependencies: null };
      } catch (err) {
        mutateLocations();
        setError(err.message || 'Помилка при оновленні статусу локації');
        throw err;
      } finally {
        setIsActionLoading(false);
      }
    },
    [locations, mutateLocations, getToken, isBlocked]
  );

  const getDependencies = useCallback(
    async (id) => {
      const token = await getToken();
      if (!token) throw new Error('Токен недоступний');
      try {
        setIsActionLoading(true);
        setError(null);
        const response = await locationApi.getLocationDependencies(token, id);
        setError(null);
        return response.data;
      } catch (err) {
        setError(err.message || 'Помилка при отриманні залежностей локації');
        throw err;
      } finally {
        setIsActionLoading(false);
      }
    },
    [getToken]
  );

  const refreshLocations = useCallback(() => {
    mutateLocations();
  }, [mutateLocations]);

  return {
    locations,
    activeLocations,
    loading: loading || isActionLoading,
    search,
    setSearch,
    addLocation,
    editLocation,
    removeLocation,
    updateLocationStatus,
    refreshLocations,
    getDependencies,
    error: error || swrError,
    setError,
  };
};