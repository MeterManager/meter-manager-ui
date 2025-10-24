import { useState, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import * as tenantApi from '../api/tenantsApi';
import { useAuthContext } from '../contexts/AuthContext';

const fetcher = async (url, token) => {
  const response = await tenantApi.getTenants(token);

  return (response.data || []).map((tenant) => {
    const locations = Array.isArray(tenant.Locations) ? tenant.Locations : [];

    return {
      id: tenant.id,
      name: tenant.name,
      occupiedArea: tenant.occupied_area,
      contactPerson: tenant.contact_person,
      phone: tenant.phone,
      email: tenant.email,
      isActive: tenant.is_active === true,
      createdAt: tenant.created_at,
      updatedAt: tenant.updated_at,
      locations: locations.map((loc) => ({
        id: loc.id,
        name: loc.name,
      })),
      locationId: locations[0]?.id || null,
      locationName: locations[0]?.name || null,
    };
  });
};

export const useSimpleTenants = () => {
  const { isAuthenticated, getToken } = useAuthContext();

  const { data = [], isLoading, error } = useSWR(
    isAuthenticated ? 'tenants/simple' : null,
    async () => {
      const token = await getToken();
      return tenantApi.getSimpleTenants(token);
    }
  );

  return { tenants: data, isLoading, error };
};

export const useTenants = () => {
  const { isAuthenticated, isLoading, getToken, isBlocked } = useAuthContext();
  const [nameSearch, setNameSearch] = useState('');
  const [error, setError] = useState(null);

  const swrKey = isAuthenticated && !isLoading && !isBlocked ? ['tenants'] : null;

  const {
    data: tenants = [],
    error: swrError,
    isLoading: loading,
    mutate: mutateTenants,
  } = useSWR(
    swrKey,
    async () => {
      const token = await getToken();
      return fetcher('tenants', token);
    },
    {
      onError: (err) => {
        if (err.response?.status === 403) return;
        setError(err.response?.data?.message || 'Помилка при завантаженні орендарів');
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
        contact_person: data.contactPerson || null,
        phone: data.phone || null,
        email: data.email || null,
        is_active: data.isActive ?? true,
      };

      try {
        setError(null);
        const tempId = Date.now();
        const optimisticTenant = {
          ...tenantData,
          id: tempId,
          isActive: tenantData.is_active,
          isOptimistic: true,
          locations: [],
        };
        await mutateTenants([...tenants, optimisticTenant], {
          optimisticData: [...tenants, optimisticTenant],
          rollbackOnError: true,
          populateCache: true,
          revalidate: false,
        });

        await tenantApi.createTenant(token, tenantData);
        
        mutateTenants();
        ['meters', 'metersTenant', 'deliveries', 'resourceDeliveries', 'payments', 'contracts', 'locations'].forEach(mutate);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Помилка при додаванні орендаря';
        mutateTenants();
        throw new Error(errorMessage);
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
        contact_person: data.contactPerson || null,
        phone: data.phone || null,
        email: data.email || null,
        is_active: data.isActive,
      };

      try {
        setError(null);
        const updatedTenants = tenants.map((t) =>
          t.id === id
            ? {
                ...t,
                ...tenantData,
                isActive: tenantData.is_active,
                updatedAt: new Date().toISOString(),
              }
            : t
        );
        await mutateTenants(updatedTenants, {
          optimisticData: updatedTenants,
          rollbackOnError: true,
          populateCache: true,
          revalidate: false,
        });

        await tenantApi.updateTenant(token, id, tenantData);

        mutateTenants();
        ['meters', 'metersTenant', 'deliveries', 'resourceDeliveries', 'locations'].forEach(mutate);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Помилка при редагуванні орендаря';
        mutateTenants();
        setError(errorMessage);
        throw new Error(errorMessage);
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

        await mutateTenants(tenants.filter((t) => t.id !== id), {
          optimisticData: tenants.filter((t) => t.id !== id),
          rollbackOnError: true,
          populateCache: true,
          revalidate: false,
        });

        await tenantApi.deleteTenant(token, id);

        mutateTenants();
        ['meters', 'metersTenant', 'deliveries', 'resourceDeliveries', 'payments', 'contracts', 'locations'].forEach(mutate);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Помилка при видаленні орендаря';
        mutateTenants();
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [tenants, mutateTenants, getToken, isBlocked]
  );

  const assignLocation = useCallback(async (tenantId, locationId) => {
    if (isBlocked) throw new Error('User is blocked');
    const token = await getToken();
    if (!token) throw new Error('No token available');
    try {
        await tenantApi.assignLocationToTenant(token, tenantId, locationId); 
    } catch (err) {
        const errorMessage = err.response?.data?.message || 'Помилка при призначенні локації орендарю';
        throw new Error(errorMessage);
    }
  }, [getToken, isBlocked]);

  const unassignLocation = useCallback(async (locationId) => {
    if (isBlocked) throw new Error('User is blocked');
    const token = await getToken();
    if (!token) throw new Error('No token available');
    try {
        await tenantApi.unassignLocationFromTenant(token, locationId); 
    } catch (err) {
        const errorMessage = err.response?.data?.message || 'Помилка при відкріпленні локації від орендаря';
        throw new Error(errorMessage);
    }
  }, [getToken, isBlocked]);

  const updateTenantStatus = useCallback(
    async (id, is_active) => {
      if (isBlocked) throw new Error('User is blocked');
      const token = await getToken();
      if (!token) throw new Error('No token available');
      const tenant = tenants.find((t) => t.id === id);
      if (!tenant) throw new Error('Орендар не знайдений');

      const tenantData = {
        name: tenant.name,
        contact_person: tenant.contactPerson,
        phone: tenant.phone,
        email: tenant.email,
        is_active: is_active,
      };

      try {
        setError(null);
        mutateTenants(
          tenants.map((t) => (t.id === id ? { ...t, isActive: is_active, updatedAt: new Date().toISOString() } : t)),
          false
        );

        await tenantApi.updateTenant(token, id, tenantData);
        mutateTenants();
        ['meters', 'metersTenant', 'deliveries'].forEach(mutate);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Помилка при оновленні статусу орендаря';
        mutateTenants();
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [tenants, mutateTenants, getToken, isBlocked]
  );
  
  const getTenantDependencies = useCallback(
    async (id) => {
      if (isBlocked) throw new Error('User is blocked');
      const token = await getToken();
      if (!token) throw new Error('No token available');
      try {
        const response = await tenantApi.getTenantDependencies(token, id);
        return response;
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Помилка при завантаженні залежностей орендаря';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [getToken, isBlocked]
  );
    
  return {
    tenants,
    activeTenants,
    loading,
    search: nameSearch,
    setSearch: setNameSearch,
    addTenant,
    editTenant,
    removeTenant,
    updateTenantStatus,
    getTenantDependencies,
    assignLocation, 
    unassignLocation,
    refreshTenants: mutateTenants,
    getTenantsByLocation: useCallback((locId) => tenants.filter((t) => t.locations.some(l => l.id === locId)), [tenants]),
    getActiveTenantsByLocation: useCallback((locId) => activeTenants.filter((t) => t.locations.some(l => l.id === locId)), [activeTenants]),
    error: error || swrError,
    setError,
  };
};
