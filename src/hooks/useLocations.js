import { useState, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import * as locationApi from '../api/locationsApi';
import { useAuthContext } from '../contexts/AuthContext';

const fetcher = async (getToken, search = '') => {
  const token = await getToken();
  if (!token) throw new Error('No token available');

  const data = await locationApi.getLocations(token, search);

  return (data || []).map((loc) => ({
    ...loc,
    isActive: loc.is_active === true,
    tenant: loc.Tenant || null, 
  }));
};

export const useLocations = () => {
  const { isAuthenticated, isLoading, getToken, isBlocked } = useAuthContext();
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const swrKey =
    isAuthenticated && !isLoading && !isBlocked && getToken ? ['locations', getToken, search] : null;

  const {
    data: locations = [],
    error: swrError,
    isLoading: loading,
    mutate: mutateLocations,
  } = useSWR(
    swrKey,
    async ([, getTokenRef, searchVal]) => fetcher(getTokenRef, searchVal),
    {
      onError: (err) => {
        if (err.response?.status === 403) {
          return;
        }
        setError('Помилка при завантаженні локацій');
        console.error('SWR Error:', err);
      },
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const activeLocations = useMemo(() => locations.filter((loc) => loc.isActive), [locations]);

  const addLocation = useCallback(
    async (data) => {
      if (isBlocked) throw new Error('User is blocked');

      const token = await getToken();
      if (!token) throw new Error('No token available');

      const transformedData = {
        name: data.name,
        address: data.address,
        is_active: data.isActive ?? true,
        occupied_area:  data.occupied_area,
        tenant_id: data.tenant_id ?? null,
      };

      try {
        setError(null);

        const tempId = `temp-${Date.now()}`;
        const optimisticLocation = {
          id: tempId,
          name: transformedData.name,
          address: transformedData.address,
          isActive: transformedData.is_active,
          occupied_area:   transformedData.occupied_area,
          tenant: data.tenant_id ? { id: data.tenant_id, name: data.tenantName || '...' } : null,
          isOptimistic: true,
        };

        mutateLocations((prev = []) => [...prev, optimisticLocation], false);

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
    [mutateLocations, getToken, isBlocked]
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
        occupied_area:  data.occupied_area,
        tenant_id: data.tenant_id ?? null,
      };

      try {
        setError(null);

        const updatedLocations = locations.map((loc) =>
          loc.id === id
            ? {
                ...loc,
                name: transformedData.name,
                address: transformedData.address,
                isActive: transformedData.is_active,
                occupied_area: transformedData.occupied_area,
                tenant: transformedData.tenant_id ? { id: transformedData.tenant_id, name: data.tenantName || loc.tenant?.name } : null,
              }
            : loc
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
    [mutateLocations, getToken, isBlocked]
  );

  const updateLocationStatus = useCallback(
    async (id, is_active) => {
      if (isBlocked) throw new Error('User is blocked');
      const token = await getToken();
      if (!token) throw new Error('No token available');
      const loc = locations.find((l) => l.id === id);
      if (!loc) throw new Error('Локацію не знайдено');
      try {
        setError(null);
        if (!is_active) {
          const dependencies = await locationApi.getLocationDependencies(token, id);
          if (dependencies.data.active_meters > 0) {
            const confirm = window.confirm(
              `Ця дія деактивує ${dependencies.data.active_meters} активних лічильників. Продовжити?`
            );
            if (!confirm) return;
          }
        }
        const payload = { name: loc.name, address: loc.address, is_active, tenant_id: loc.tenant?.id ?? null };
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

  const getDependencies = useCallback(
    async (id) => {
      const token = await getToken();
      if (!token) throw new Error('No token available');
      try {
        setError(null);
        const response = await locationApi.getLocationDependencies(token, id);
        return response.data;
      } catch (err) {
        setError('Помилка при отриманні залежностей локації');
        throw err;
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
    loading,
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
