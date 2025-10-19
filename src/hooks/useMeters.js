import { useState, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import * as metersApi from '../api/metersApi';
import { useAuthRequest } from './useAuthRequest';
import { useErrorHandler } from './useErrorHandler';

const fetcher = async (token, search = '') => {
  const response = await metersApi.getMeters(token, search);
  return response.data.map((m) => ({
    ...m,
    isActive: m.is_active,
  }));
};

export const useMeters = () => {
  const { canRequest, withToken } = useAuthRequest();
  const { error, setError, handleError } = useErrorHandler('Помилка при завантаженні лічильників');
  const [search, setSearch] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const swrKey = canRequest ? ['meters', search] : null;

  const {
    data: meters = [],
    isLoading: loading,
    mutate: mutateMeters,
  } = useSWR(swrKey, ([, search]) => withToken(fetcher, search), {
    onError: handleError,
    revalidateOnFocus: false,
    dedupingInterval: 5000,
    refreshInterval: 30000,
  });

  const activeMeters = useMemo(() => meters.filter((meter) => meter.isActive), [meters]);

  const metersByResourceType = useMemo(
    () =>
      meters.reduce((acc, meter) => {
        const resourceType = meter.resource_type_id || 'other';
        if (!acc[resourceType]) acc[resourceType] = [];
        acc[resourceType].push(meter);
        return acc;
      }, {}),
    [meters]
  );

  const metersByLocation = useMemo(
    () =>
      meters.reduce((acc, meter) => {
        const locationId = meter.location_id || 'other';
        if (!acc[locationId]) acc[locationId] = [];
        acc[locationId].push(meter);
        return acc;
      }, {}),
    [meters]
  );

  const metersByTenant = useMemo(
    () =>
      meters.reduce((acc, meter) => {
        const tenantId = meter.tenant_id || 'unassigned';
        if (!acc[tenantId]) acc[tenantId] = [];
        acc[tenantId].push(meter);
        return acc;
      }, {}),
    [meters]
  );

  const addMeter = useCallback(
    async (data) => {
      try {
        setError(null);
        setIsActionLoading(true);
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
        const response = await withToken(metersApi.createMeter, data);

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
        handleError(error, 'Помилка при додаванні лічильника');
        throw error;
      } finally {
        setIsActionLoading(false);
      }
    },
    [meters, mutateMeters, withToken]
  );

  const editMeter = useCallback(
    async (id, data) => {
      try {
        setError(null);
        setIsActionLoading(true);
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

        const response = await withToken(metersApi.updateMeter, id, data);

        mutateMeters();
        mutate('metersTenant');
        mutate('deliveries');
        mutate('resourceDeliveries');
        mutate('bills');
        mutate('calculations');

        return response;
      } catch (error) {
        mutateMeters();
        handleError(error, 'Помилка при редагуванні лічильника');
        throw error;
      } finally {
        setIsActionLoading(false);
      }
    },
    [meters, mutateMeters, withToken]
  );

  const removeMeter = useCallback(
    async (id) => {
      try {
        setError(null);
        setIsActionLoading(true);
        const filteredMeters = meters.filter((meter) => meter.id !== id);
        mutateMeters(filteredMeters, false);

        await withToken(metersApi.deleteMeter, id);

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
        handleError(error, 'Помилка при видаленні лічильника');
        throw error;
      } finally {
        setIsActionLoading(false);
      }
    },
    [meters, mutateMeters, withToken]
  );

  const updateMeterStatus = useCallback(
    async (id, isActive) => {
      const meter = meters.find((m) => m.id === id);
      if (!meter) throw new Error('Лічильник не знайдено');
      try {
        setError(null);
        setIsActionLoading(true);
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

        const response = await withToken(metersApi.updateMeter, id, {
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
        handleError(error, 'Помилка при оновленні статусу лічильника');
        throw error;
      } finally {
        setIsActionLoading(false);
      }
    },
    [meters, mutateMeters, withToken]
  );

  const refreshMeters = useCallback(() => {
    mutateMeters();
  }, [mutateMeters]);

  const getMetersByLocation = useCallback(
    (locationId) => meters.filter((meter) => meter.location_id === locationId),
    [meters]
  );

  const getMetersByResourceType = useCallback(
    (resourceTypeId) => meters.filter((meter) => meter.resource_type_id === resourceTypeId),
    [meters]
  );

  const getMetersByTenant = useCallback(
    (tenantId) => meters.filter((meter) => meter.tenant_id === tenantId),
    [meters]
  );

  const getActiveMetersByLocation = useCallback(
    (locationId) => activeMeters.filter((meter) => meter.location_id === locationId),
    [activeMeters]
  );

  const getActiveMetersByResourceType = useCallback(
    (resourceTypeId) => activeMeters.filter((meter) => meter.resource_type_id === resourceTypeId),
    [activeMeters]
  );

  const getActiveMetersByTenant = useCallback(
    (tenantId) => activeMeters.filter((meter) => meter.tenant_id === tenantId),
    [activeMeters]
  );

  const isAvailableForAssignment = useCallback(
    (meterId) => {
      const meter = meters.find((m) => m.id === meterId);
      return meter && meter.isActive && !meter.tenant_id;
    },
    [meters]
  );

  const getMeterDependencies = useCallback(
    async (id) => {
      try {
        const response = await withToken(metersApi.getMeterDependencies, id);
        return response.data;
      } catch (err) {
        handleError(err, 'Помилка при отриманні залежностей лічильника');
        throw err;
      }
    },
    [withToken]
  );

  return {
    meters,
    activeMeters,
    metersByResourceType,
    metersByLocation,
    metersByTenant,
    loading: loading || isActionLoading,
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
    error,
    setError,
  };
};
