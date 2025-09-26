import { useState, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import * as metersApi from '../api/metersApi';
import { useAuthContext } from '../contexts/AuthContext';

const fetcher = async (url, getToken, search = '') => {
  const token = await getToken();
  if (!token) throw new Error('No token available');
  
  const response = await metersApi.getMeters(token, search);
  return response.data.map((m) => ({
    ...m,
    isActive: m.is_active,
  }));
};

export const useMeters = () => {
  const { isAuthenticated, isLoading, getToken, isBlocked } = useAuthContext();
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const swrKey = isAuthenticated && !isLoading && !isBlocked && getToken ? 
    ['meters', getToken, search] : null;

  const {
    data: meters = [],
    error: swrError,
    isLoading: loading,
    mutate: mutateMeters,
  } = useSWR(swrKey, ([url, getToken, search]) => fetcher(url, getToken, search), {
    onError: (err) => {
      if (err.response?.status === 403) return;
      setError('Помилка при завантаженні лічильників');
      console.error('SWR Error:', err);
    },
    revalidateOnFocus: false,
    dedupingInterval: 5000,
    refreshInterval: 30000,
  });

  const activeMeters = useMemo(() => {
    return meters.filter((meter) => meter.isActive);
  }, [meters]);

  const metersByResourceType = useMemo(() => {
    return meters.reduce((acc, meter) => {
      const resourceType = meter.resource_type_id || 'other';
      if (!acc[resourceType]) {
        acc[resourceType] = [];
      }
      acc[resourceType].push(meter);
      return acc;
    }, {});
  }, [meters]);

  const metersByLocation = useMemo(() => {
    return meters.reduce((acc, meter) => {
      const locationId = meter.location_id || 'other';
      if (!acc[locationId]) {
        acc[locationId] = [];
      }
      acc[locationId].push(meter);
      return acc;
    }, {});
  }, [meters]);

  const metersByTenant = useMemo(() => {
    return meters.reduce((acc, meter) => {
      const tenantId = meter.tenant_id || 'unassigned';
      if (!acc[tenantId]) {
        acc[tenantId] = [];
      }
      acc[tenantId].push(meter);
      return acc;
    }, {});
  }, [meters]);

  const addMeter = useCallback(
    async (data) => {
      if (isBlocked) throw new Error('User is blocked');
      
      const token = await getToken();
      if (!token) throw new Error('No token available');

      try {
        setError(null);

        const tempId = Date.now();
        const optimisticMeter = {
          ...data,
          id: tempId,
          isActive: data.is_active ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          isOptimistic: true,
        };

        mutateMeters([...meters, optimisticMeter], false);

        const response = await metersApi.createMeter(token, data);

        mutateMeters();

        mutate('metersTenant');
        mutate('deliveries');
        mutate('resourceDeliveries');
        mutate('locations');
        mutate('resourceTypes');
        mutate('tenants');
        mutate('bills');
        mutate('payments');
        mutate('calculations');
        mutate('tariffs');

        return response;
      } catch (error) {
        mutateMeters();
        setError('Помилка при додаванні лічільника');
        throw error;
      }
    },
    [meters, mutateMeters, getToken, isBlocked]
  );

  const editMeter = useCallback(
    async (id, data) => {
      if (isBlocked) throw new Error('User is blocked');
      
      const token = await getToken();
      if (!token) throw new Error('No token available');

      try {
        setError(null);

        const updatedMeters = meters.map((meter) =>
          meter.id === id
            ? {
                ...meter,
                ...data,
                isActive: data.is_active ?? meter.isActive,
                updated_at: new Date().toISOString(),
              }
            : meter
        );
        mutateMeters(updatedMeters, false);

        const response = await metersApi.updateMeter(token, id, data);

        mutateMeters();
        mutate('metersTenant');
        mutate('deliveries');
        mutate('resourceDeliveries');
        mutate('bills');
        mutate('calculations');

        return response;
      } catch (error) {
        mutateMeters();
        setError('Помилка при редагуванні лічільника');
        throw error;
      }
    },
    [meters, mutateMeters, getToken, isBlocked]
  );

  const removeMeter = useCallback(
    async (id) => {
      if (isBlocked) throw new Error('User is blocked');
      
      const token = await getToken();
      if (!token) throw new Error('No token available');

      try {
        setError(null);

        const filteredMeters = meters.filter((meter) => meter.id !== id);
        mutateMeters(filteredMeters, false);

        await metersApi.deleteMeter(token, id);

        mutateMeters();
        mutate('metersTenant');
        mutate('deliveries');
        mutate('resourceDeliveries');
        mutate('bills');
        mutate('payments');
        mutate('calculations');
        mutate('locations');
        mutate('tenants');
        mutate('resourceTypes');
      } catch (error) {
        mutateMeters();
        setError('Помилка при видаленні лічільника');
        throw error;
      }
    },
    [meters, mutateMeters, getToken, isBlocked]
  );

  const updateMeterStatus = useCallback(
    async (id, isActive) => {
      if (isBlocked) throw new Error('User is blocked');
      
      const token = await getToken();
      if (!token) throw new Error('No token available');
      
      const meter = meters.find((m) => m.id === id);

      if (!meter) throw new Error('Лічільник не знайдено');

      try {
        setError(null);

        const updatedMeters = meters.map((m) =>
          m.id === id
            ? {
                ...m,
                isActive: isActive,
                is_active: isActive,
                updated_at: new Date().toISOString(),
              }
            : m
        );
        mutateMeters(updatedMeters, false);

        const response = await metersApi.updateMeter(token, id, {
          ...meter,
          is_active: isActive,
        });

        mutateMeters();
        mutate('metersTenant');
        mutate('deliveries');
        mutate('resourceDeliveries');
        mutate('bills');

        return response;
      } catch (error) {
        mutateMeters();
        setError('Помилка при оновленні статусу лічільника');
        throw error;
      }
    },
    [meters, mutateMeters, getToken, isBlocked]
  );

  const refreshMeters = useCallback(() => {
    mutateMeters();
  }, [mutateMeters]);

  const getMetersByLocation = useCallback(
    (locationId) => {
      return meters.filter((meter) => meter.location_id === locationId);
    },
    [meters]
  );

  const getMetersByResourceType = useCallback(
    (resourceTypeId) => {
      return meters.filter((meter) => meter.resource_type_id === resourceTypeId);
    },
    [meters]
  );

  const getMetersByTenant = useCallback(
    (tenantId) => {
      return meters.filter((meter) => meter.tenant_id === tenantId);
    },
    [meters]
  );

  const getActiveMetersByLocation = useCallback(
    (locationId) => {
      return activeMeters.filter((meter) => meter.location_id === locationId);
    },
    [activeMeters]
  );

  const getActiveMetersByResourceType = useCallback(
    (resourceTypeId) => {
      return activeMeters.filter((meter) => meter.resource_type_id === resourceTypeId);
    },
    [activeMeters]
  );

  const getActiveMetersByTenant = useCallback(
    (tenantId) => {
      return activeMeters.filter((meter) => meter.tenant_id === tenantId);
    },
    [activeMeters]
  );

  const isAvailableForAssignment = useCallback(
    (meterId) => {
      const meter = meters.find((m) => m.id === meterId);
      return meter && meter.isActive && !meter.tenant_id;
    },
    [meters]
  );

  const getMeterDependencies = useCallback(async (id) => {
    const token = await getToken();
    if (!token) throw new Error('No token available');

    try {
      const response = await metersApi.getMeterDependencies(token, id);
      return response.data;
    } catch (err) {
      setError('Помилка при отриманні залежностей лічільника');
      throw err;
    }
  }, [getToken]);

  return {
    meters,
    activeMeters,
    metersByResourceType,
    metersByLocation,
    metersByTenant,
    loading,
    search,
    getMeterDependencies,
    setSearch,
    addMeter,
    editMeter,
    removeMeter,
    updateMeterStatus,
    refreshMeters,
    getMetersByLocation,
    getMetersByResourceType,
    getMetersByTenant,
    getActiveMetersByLocation,
    getActiveMetersByResourceType,
    getActiveMetersByTenant,
    isAvailableForAssignment,
    error: error || swrError,
    setError,
  };
};