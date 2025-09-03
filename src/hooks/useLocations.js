import { useState, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import * as locationApi from '../api/locationsApi';
import { useAuthContext } from '../contexts/AuthContext';

const fetcher = async (url, getToken, search = '') => {
  const token = await getToken();
  if (!token) throw new Error('No token available');
  
  const response = await locationApi.getLocations(token, search);
  return (response.data || []).map((loc) => ({
    ...loc,
    isActive: loc.is_active === true,
  }));
};

export const useLocations = () => {
  const { isAuthenticated, isLoading, getToken, isBlocked } = useAuthContext();
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const swrKey = isAuthenticated && !isLoading && !isBlocked && getToken ? 
    ['locations', getToken, search] : null;

  const {
    data: locations = [],
    error: swrError,
    isLoading: loading,
    mutate: mutateLocations,
  } = useSWR(swrKey, ([url, getToken, search]) => fetcher(url, getToken, search), {
    onError: (err) => {
      if (err.response?.status === 403) {
        return;
      }
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
      if (isBlocked) throw new Error('User is blocked');
      
      const token = await getToken();
      if (!token) throw new Error('No token available');
      
      const transformedData = {
        name: data.name,
        address: data.address,
        is_active: data.isActive ?? true,
      };

      try {
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

        return response;
      } catch (err) {
        mutateLocations();
        setError('Помилка при додаванні локації');
        throw err;
      }
    },
    [locations, mutateLocations, getToken, isBlocked]
  );

  const editLocation = useCallback(
    async (id, data) => {
      if (isBlocked) throw new Error('User is blocked');
      
      const token = await getToken();
      if (!token) throw new Error('No token available');
      
      const transformedData = {
        name: data.name,
        address: data.address,
        is_active: data.isActive,
      };

      try {
        setError(null);

        const updatedLocations = locations.map((loc) =>
          loc.id === id ? { ...loc, ...transformedData, isActive: transformedData.is_active } : loc
        );
        mutateLocations(updatedLocations, false);

        const response = await locationApi.updateLocation(token, id, transformedData);

        mutateLocations();
        mutate('meters');
        mutate('tenants');

        return response;
      } catch (err) {
        mutateLocations();
        setError('Помилка при редагуванні локації');
        throw err;
      }
    },
    [locations, mutateLocations, getToken, isBlocked]
  );

  const removeLocation = useCallback(
    async (id) => {
      if (isBlocked) throw new Error('User is blocked');
      
      const token = await getToken();
      if (!token) throw new Error('No token available');

      try {
        setError(null);

        const filteredLocations = locations.filter((loc) => loc.id !== id);
        mutateLocations(filteredLocations, false);

        await locationApi.deleteLocation(token, id);

        mutateLocations();
        mutate('meters');
        mutate('tenants');
        mutate('deliveries');
      } catch (err) {
        mutateLocations();
        setError('Помилка при видаленні локації');
        throw err;
      }
    },
    [locations, mutateLocations, getToken, isBlocked]
  );

  const updateLocationStatus = useCallback(
    async (id, is_active) => {
      if (isBlocked) throw new Error('User is blocked');
      
      const token = await getToken();
      if (!token) throw new Error('No token available');
      
      const loc = locations.find((l) => l.id === id);

      if (!loc) throw new Error('Локацію не знайдено');

      const payload = {
        name: loc.name,
        address: loc.address,
        is_active,
      };

      try {
        setError(null);

        const updatedLocations = locations.map((location) =>
          location.id === id ? { ...location, isActive: is_active } : location
        );
        mutateLocations(updatedLocations, false);

        const response = await locationApi.updateLocation(token, id, payload);

        mutateLocations();
        mutate('meters');

        return response;
      } catch (err) {
        mutateLocations();
        setError('Помилка при оновленні статусу локації');
        throw err;
      }
    },
    [locations, mutateLocations, getToken, isBlocked]
  );

  const refreshLocations = useCallback(() => {
    mutateLocations();
  }, [mutateLocations]);

  return {
    locations,
    activeLocations,
    loading,
    search,
    setSearch,
    addLocation,
    editLocation,
    removeLocation,
    updateLocationStatus,
    refreshLocations,
    error: error || swrError,
    setError,
  };
};