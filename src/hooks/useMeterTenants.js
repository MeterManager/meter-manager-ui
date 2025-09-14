import { useState, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import * as meterTenantsApi from '../api/meterTenantsApi';
import { useAuthContext } from '../contexts/AuthContext';

const fetcher = async ([_, getToken, search]) => {
  const token = await getToken();
  if (!token) throw new Error('No token available');
  
  const response = await meterTenantsApi.getAllMeterTenants(token);
  if (!search) return response.data || [];
  return (response.data || []).filter(
    (mt) =>
      mt.Tenant?.name?.toLowerCase().includes(search.toLowerCase()) ||
      mt.Meter?.serial_number?.toLowerCase().includes(search.toLowerCase())
  );
};

export const useMeterTenants = () => {
  const { isAuthenticated, isLoading, getToken, isBlocked } = useAuthContext();
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const swrKey = isAuthenticated && !isLoading && !isBlocked && getToken ? 
    ['metersTenant', getToken, search] : null;

  const {
    data: meterTenants = [],
    error: swrError,
    isLoading: loading,
    mutate: mutateMeterTenants,
  } = useSWR(swrKey, fetcher, {
    onError: (err) => {
      if (err.response?.status === 403) return;
      setError('Помилка при завантаженні призначень лічильників');
      console.error('SWR Error:', err);
    },
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  const getAllMeterTenants = useCallback(async () => {
    const token = await getToken();
    if (!token) throw new Error("No token available");

    const response = await meterTenantsApi.getAllMeterTenants(token);
    return response.data || [];
  }, [getToken]);

  const addMeterTenant = useCallback(
    async (data) => {
      if (isBlocked) throw new Error('User is blocked');
      
      const token = await getToken();
      if (!token) throw new Error('No token available');

      try {
        setError(null);

        const tempId = Date.now();
        const optimistic = { ...data, id: tempId, isOptimistic: true };
        mutateMeterTenants([...meterTenants, optimistic], false);

        const response = await meterTenantsApi.createMeterTenant(token, data);

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
        setError('Помилка при додаванні призначення лічильника');
        throw err;
      }
    },
    [meterTenants, mutateMeterTenants, getToken, isBlocked]
  );

  const editMeterTenant = useCallback(
    async (id, data) => {
      if (isBlocked) throw new Error('User is blocked');
      
      const token = await getToken();
      if (!token) throw new Error('No token available');

      try {
        setError(null);

        const updated = meterTenants.map((mt) => (mt.id === id ? { ...mt, ...data } : mt));
        mutateMeterTenants(updated, false);

        const response = await meterTenantsApi.updateMeterTenant(token, id, data);
        mutateMeterTenants();
        mutate('meters');
        mutate('deliveries');
        mutate('resourceDeliveries');

        return response;
      } catch (err) {
        mutateMeterTenants();
        setError('Помилка при редагуванні призначення лічильника');
        throw err;
      }
    },
    [meterTenants, mutateMeterTenants, getToken, isBlocked]
  );

  const removeMeterTenant = useCallback(
    async (id) => {
      if (isBlocked) throw new Error('User is blocked');
      
      const token = await getToken();
      if (!token) throw new Error('No token available');

      try {
        setError(null);

        const filtered = meterTenants.filter((mt) => mt.id !== id);
        mutateMeterTenants(filtered, false);

        await meterTenantsApi.deleteMeterTenant(token, id);
        mutateMeterTenants();
        mutate('meters');
        mutate('deliveries');
        mutate('resourceDeliveries');
      } catch (err) {
        mutateMeterTenants();
        setError('Помилка при видаленні призначення лічильника');
        throw err;
      }
    },
    [meterTenants, mutateMeterTenants, getToken, isBlocked]
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
    refreshMeterTenants: () => mutateMeterTenants(),
    tenantsMap,
    metersMap,
    error: error || swrError,
    setError,
    getAllMeterTenants,
  };
};