import { useState, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import * as tenantApi from '../api/tenantsApi';
import { useAuthContext } from '../contexts/AuthContext';

const fetcher = async (url, token, search = '') => {
  const response = await tenantApi.getTenants(token, search);
  return (response.data || []).map((tenant) => ({
    id: tenant.id,
    name: tenant.name,
    locationId: tenant.location_id,
    occupiedArea: tenant.occupied_area,
    contactPerson: tenant.contact_person,
    phone: tenant.phone,
    email: tenant.email,
    isActive: tenant.is_active === true,
    createdAt: tenant.created_at,
    updatedAt: tenant.updated_at,
  }));
};

export const useTenants = () => {
  const { isAuthenticated, isLoading, getToken, isBlocked } = useAuthContext();
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const swrKey = isAuthenticated && !isLoading && !isBlocked ? ['tenants', search] : null; 

  const {
    data: tenants = [],
    error: swrError,
    isLoading: loading,
    mutate: mutateTenants,
  } = useSWR(
    swrKey,
    async ([, search]) => {
      const token = await getToken();
      return fetcher('tenants', token, search);
    },
    {
      onError: (err) => {
        if (err.response?.status === 403) return;
        setError('Помилка при завантаженні орендарів');
        console.error('SWR Error:', err);
      },
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const activeTenants = useMemo(() => tenants.filter((t) => t.isActive), [tenants]);

  const addTenant = useCallback(
    async (data) => {
      if (isBlocked) throw new Error('User is blocked'); 
      const token = await getToken();
      if (!token) throw new Error('No token available');
      const tenantData = {
        name: data.name,
        location_id: data.locationId,
        occupied_area: data.occupiedArea || null,
        contact_person: data.contactPerson || null,
        phone: data.phone || null,
        email: data.email || null,
        is_active: data.isActive ?? true,
      };

      try {
        setError(null);
        const tempId = Date.now();
        const optimisticTenant = { ...tenantData, id: tempId, isActive: tenantData.is_active, isOptimistic: true };
        mutateTenants([...tenants, optimisticTenant], false);

        const response = await tenantApi.createTenant(token, tenantData);

        mutateTenants();
        ['meters', 'metersTenant', 'deliveries', 'resourceDeliveries', 'payments', 'contracts'].forEach(mutate);

        return response;
      } catch (err) {
        mutateTenants();
        setError('Помилка при додаванні орендаря');
        throw err;
      }
    },
    [tenants, mutateTenants, getToken, isBlocked]
  );

  const editTenant = useCallback(
    async (id, data) => {
      if (isBlocked) throw new Error('User is blocked');
      const token = await getToken();
      if (!token) throw new Error('No token available');
      const tenantData = {
        name: data.name,
        location_id: data.locationId,
        occupied_area: data.occupiedArea || null,
        contact_person: data.contactPerson || null,
        phone: data.phone || null,
        email: data.email || null,
        is_active: data.isActive,
      };

      try {
        setError(null);
        mutateTenants(
          tenants.map((t) =>
            t.id === id ? { ...t, ...tenantData, isActive: tenantData.is_active, updatedAt: new Date().toISOString() } : t
          ),
          false
        );

        const response = await tenantApi.updateTenant(token, id, tenantData);
        mutateTenants();
        ['meters', 'metersTenant', 'deliveries', 'resourceDeliveries'].forEach(mutate);

        return response;
      } catch (err) {
        mutateTenants();
        setError('Помилка при редагуванні орендаря');
        throw err;
      }
    },
    [tenants, mutateTenants, getToken, isBlocked]
  );

  const removeTenant = useCallback(
    async (id) => {
      if (isBlocked) throw new Error('User is blocked');
      const token = await getToken();
      if (!token) throw new Error('No token available');
      try {
        setError(null);
        mutateTenants(tenants.filter((t) => t.id !== id), false);
        await tenantApi.deleteTenant(token, id);
        mutateTenants();
        ['meters', 'metersTenant', 'deliveries', 'resourceDeliveries', 'payments', 'contracts'].forEach(mutate);
      } catch (err) {
        mutateTenants();
        setError('Помилка при видаленні орендаря');
        throw err;
      }
    },
    [tenants, mutateTenants, getToken, isBlocked]
  );

  const updateTenantStatus = useCallback(
    async (id, is_active) => {
      if (isBlocked) throw new Error('User is blocked');
      const token = await getToken();
      if (!token) throw new Error('No token available');
      const tenant = tenants.find((t) => t.id === id);
      if (!tenant) throw new Error('Орендар не знайдений');

      const payload = { ...tenant, is_active };
      try {
        setError(null);
        mutateTenants(
          tenants.map((t) => (t.id === id ? { ...t, isActive: is_active, updatedAt: new Date().toISOString() } : t)),
          false
        );

        const response = await tenantApi.updateTenant(token, id, payload);
        mutateTenants();
        ['meters', 'metersTenant', 'deliveries'].forEach(mutate);

        return response;
      } catch (err) {
        mutateTenants();
        setError('Помилка при оновленні статусу орендаря');
        throw err;
      }
    },
    [tenants, mutateTenants, getToken, isBlocked]
  );

  return {
    tenants,
    activeTenants,
    loading,
    search,
    setSearch,
    addTenant,
    editTenant,
    removeTenant,
    updateTenantStatus,
    refreshTenants: mutateTenants,
    getTenantsByLocation: useCallback((locId) => tenants.filter((t) => t.locationId === locId), [tenants]),
    getActiveTenantsByLocation: useCallback((locId) => activeTenants.filter((t) => t.locationId === locId), [activeTenants]),
    error: error || swrError,
    setError,
  };
};