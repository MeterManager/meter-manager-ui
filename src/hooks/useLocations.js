import { useState, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import * as locationApi from '../api/locationsApi';
import useAuth from './useAuth';

const fetcher = async (url, token, search = '') => {
  const response = await locationApi.getLocations(token, search);
  return (response.data || []).map((loc) => ({
    ...loc,
    isActive: loc.is_active === true,
  }));
};

export const useLocations = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  const swrKey = isAuthenticated && !isLoading && token ? ['locations', token, search] : null;

  const {
    data: locations = [],
    error: swrError,
    isLoading: loading,
    mutate: mutateLocations,
  } = useSWR(swrKey, ([url, token, search]) => fetcher(url, token, search), {
    onError: (err) => {
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
      const token = localStorage.getItem('token');
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
    [locations, mutateLocations]
  );

  const editLocation = useCallback(
    async (id, data) => {
      const token = localStorage.getItem('token');
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
    [locations, mutateLocations]
  );

  const removeLocation = useCallback(
    async (id) => {
      const token = localStorage.getItem('token');

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
    [locations, mutateLocations]
  );

  const updateLocationStatus = useCallback(
    async (id, is_active) => {
      const token = localStorage.getItem('token');
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
    [locations, mutateLocations]
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
