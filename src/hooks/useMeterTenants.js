import { useState, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import * as meterTenantsApi from '../api/meterTenantsApi';
import { useAuthRequest } from './useAuthRequest';
import { useErrorHandler } from './useErrorHandler';

const fetcher = async (token, search) => {
  const response = await meterTenantsApi.getAllMeterTenants(token);
  if (!search) return response.data || [];
  return (response.data || []).filter(
    (mt) =>
      mt.Tenant?.name?.toLowerCase().includes(search.toLowerCase()) ||
      mt.Meter?.serial_number?.toLowerCase().includes(search.toLowerCase())
  );
};

export const useMeterTenants = () => {
  const { canRequest, withToken } = useAuthRequest();
  const { error, setError, handleError } = useErrorHandler('Помилка при завантаженні призначень лічильників');
  const [search, setSearch] = useState('');

  const swrKey = canRequest ? ['metersTenant', search] : null;

  const {
    data: meterTenants = [],
    isLoading: loading,
    mutate: mutateMeterTenants,
  } = useSWR(
    swrKey,
    async ([, search]) => withToken(fetcher, search),
    {
      onError: handleError,
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const getAllMeterTenants = useCallback(async () => {
    try {
      const response = await withToken(meterTenantsApi.getAllMeterTenants);
      return response.data || [];
    } catch (err) {
      handleError(err, 'Помилка при завантаженні всіх призначень лічильників');
      throw err;
    }
  }, [withToken]);

  const addMeterTenant = useCallback(
    async (data) => {
      try {
        setError(null);
        const tempId = Date.now();
        const optimistic = { ...data, id: tempId, isOptimistic: true };
        mutateMeterTenants([...meterTenants, optimistic], false);

        const response = await withToken(meterTenantsApi.createMeterTenant, data);

        mutateMeterTenants();
        mutate('meters');
        mutate('deliveries');
        mutate('resourceDeliveries');
        mutate('locations');
        mutate('tenants');
        mutate('resourceTypes');

        return response;
      } catch (err) {
        mutateMeterTenants();
        handleError(err, 'Помилка при додаванні призначення лічильника');
        throw err;
      }
    },
    [meterTenants, mutateMeterTenants, withToken]
  );

  const editMeterTenant = useCallback(
    async (id, data) => {
      try {
        setError(null);
        const updated = meterTenants.map((mt) => (mt.id === id ? { ...mt, ...data } : mt));
        mutateMeterTenants(updated, false);

        const response = await withToken(meterTenantsApi.updateMeterTenant, id, data);
        mutateMeterTenants();
        mutate('meters');
        mutate('deliveries');
        mutate('resourceDeliveries');

        return response;
      } catch (err) {
        mutateMeterTenants();
        handleError(err, 'Помилка при редагуванні призначення лічильника');
        throw err;
      }
    },
    [meterTenants, mutateMeterTenants, withToken]
  );

  const removeMeterTenant = useCallback(
    async (id) => {
      try {
        setError(null);
        const filtered = meterTenants.filter((mt) => mt.id !== id);
        mutateMeterTenants(filtered, false);

        await withToken(meterTenantsApi.deleteMeterTenant, id);
        mutateMeterTenants();
        mutate('meters');
        mutate('deliveries');
        mutate('resourceDeliveries');
      } catch (err) {
        mutateMeterTenants();
        handleError(err, 'Помилка при видаленні призначення лічильника');
        throw err;
      }
    },
    [meterTenants, mutateMeterTenants, withToken]
  );

  const tenantsMap = useMemo(() => {
    return meterTenants.reduce((acc, mt) => {
      const tenantId = mt.Tenant?.id || 'unassigned';
      if (!acc[tenantId]) acc[tenantId] = [];
      acc[tenantId].push(mt);
      return acc;
    }, {});
  }, [meterTenants]);

  const metersMap = useMemo(() => {
    return meterTenants.reduce((acc, mt) => {
      const meterId = mt.Meter?.id || 'unknown';
      if (!acc[meterId]) acc[meterId] = [];
      acc[meterId].push(mt);
      return acc;
    }, {});
  }, [meterTenants]);

  const refreshMeterTenants = useCallback(() => {
    mutateMeterTenants();
  }, [mutateMeterTenants]);

  return {
    meterTenants,
    loading,
    search,
    setSearch,
    addMeterTenant,
    editMeterTenant,
    removeMeterTenant,
    refreshMeterTenants,
    tenantsMap,
    metersMap,
    error,
    setError,
    getAllMeterTenants,
  };
};
