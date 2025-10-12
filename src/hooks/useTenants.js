import { useState, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import * as tenantApi from '../api/tenantsApi';
import { useAuthRequest } from './useAuthRequest';
import { useErrorHandler } from './useErrorHandler';

const fetcher = async (token, filters = {}) => {
  const response = await tenantApi.getTenants(token, filters);
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

export const useTenants = () => {
  const { canRequest, withToken } = useAuthRequest();
  const { error, setError, handleError } = useErrorHandler('Помилка при завантаженні орендарів');
  const [nameSearch, setNameSearch] = useState('');

  const swrKey = canRequest ? ['tenants', nameSearch] : null;

  const {
    data: tenants = [],
    isLoading: loading,
    mutate: mutateTenants,
  } = useSWR(
    swrKey,
    async ([, filters]) => withToken(fetcher, filters),
    {
      onError: handleError,
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const activeTenants = useMemo(() => tenants.filter((t) => t.isActive), [tenants]);

  const addTenant = useCallback(
    async (data) => {
      try {
        setError(null);
        const tenantData = {
          name: data.name,
          occupied_area: data.occupiedArea || null,
          contact_person: data.contactPerson || null,
          phone: data.phone || null,
          email: data.email || null,
          is_active: data.isActive ?? true,
        };

        const tempId = Date.now();
        const optimisticTenant = {
          ...tenantData,
          id: tempId,
          isActive: tenantData.is_active,
          isOptimistic: true,
          locationId: data.locationId || null,
        };

        await mutateTenants([...tenants, optimisticTenant], {
          optimisticData: [...tenants, optimisticTenant],
          rollbackOnError: true,
          populateCache: true,
          revalidate: false,
        });

        const response = await withToken(tenantApi.createTenant, tenantData);
        const newTenantId = response.data.data.id;

        if (data.locationId) {
          await withToken(tenantApi.assignLocationToTenant, newTenantId, data.locationId);
        }

        mutateTenants();
        ['meters', 'metersTenant', 'deliveries', 'resourceDeliveries', 'payments', 'contracts', 'locations'].forEach(
          mutate
        );

        return response;
      } catch (err) {
        mutateTenants();
        handleError(err, 'Помилка при додаванні орендаря');
        throw err;
      }
    },
    [tenants, mutateTenants, withToken]
  );

  const editTenant = useCallback(
    async (id, data) => {
      const oldTenant = tenants.find((t) => t.id === id);
      const oldLocationId = oldTenant?.locationId;
      const newLocationId = data.locationId;

      try {
        setError(null);
        const tenantData = {
          name: data.name,
          occupied_area: data.occupiedArea || null,
          contact_person: data.contactPerson || null,
          phone: data.phone || null,
          email: data.email || null,
          is_active: data.isActive,
        };

        const updatedTenants = tenants.map((t) =>
          t.id === id
            ? { ...t, ...tenantData, isActive: tenantData.is_active, locationId: newLocationId, updatedAt: new Date().toISOString() }
            : t
        );

        await mutateTenants(updatedTenants, {
          optimisticData: updatedTenants,
          rollbackOnError: true,
          populateCache: true,
          revalidate: false,
        });

        const response = await withToken(tenantApi.updateTenant, id, tenantData);

        if (newLocationId !== oldLocationId) {
          if (oldLocationId) {
            await withToken(tenantApi.unassignLocationFromTenant, oldLocationId);
          }
          if (newLocationId) {
            await withToken(tenantApi.assignLocationToTenant, id, newLocationId);
          }
        }

        mutateTenants();
        ['meters', 'metersTenant', 'deliveries', 'resourceDeliveries', 'locations'].forEach(mutate);

        return response;
      } catch (err) {
        mutateTenants();
        handleError(err, 'Помилка при редагуванні орендаря');
        throw err;
      }
    },
    [tenants, mutateTenants, withToken]
  );

  const removeTenant = useCallback(
    async (id) => {
      try {
        setError(null);
        await mutateTenants(
          tenants.filter((t) => t.id !== id),
          {
            optimisticData: tenants.filter((t) => t.id !== id),
            rollbackOnError: true,
            populateCache: true,
            revalidate: false,
          }
        );

        await withToken(tenantApi.deleteTenant, id);

        mutateTenants();
        ['meters', 'metersTenant', 'deliveries', 'resourceDeliveries', 'payments', 'contracts', 'locations'].forEach(
          mutate
        );
      } catch (err) {
        mutateTenants();
        handleError(err, 'Помилка при видаленні орендаря');
        throw err;
      }
    },
    [tenants, mutateTenants, withToken]
  );

  const assignLocation = useCallback(
    async (tenantId, locationId) => {
      try {
        await withToken(tenantApi.assignLocationToTenant, tenantId, locationId);
      } catch (err) {
        handleError(err, 'Помилка при призначенні локації орендарю');
        throw err;
      }
    },
    [withToken]
  );

  const unassignLocation = useCallback(
    async (locationId) => {
      try {
        await withToken(tenantApi.unassignLocationFromTenant, locationId);
      } catch (err) {
        handleError(err, 'Помилка при відкріпленні локації від орендаря');
        throw err;
      }
    },
    [withToken]
  );

  const updateTenantStatus = useCallback(
    async (id, is_active) => {
      const tenant = tenants.find((t) => t.id === id);
      if (!tenant) throw new Error('Орендар не знайдений');
      try {
        setError(null);
        const payload = { ...tenant, is_active };
        mutateTenants(
          tenants.map((t) => (t.id === id ? { ...t, isActive: is_active, updatedAt: new Date().toISOString() } : t)),
          false
        );

        const response = await withToken(tenantApi.updateTenant, id, payload);
        mutateTenants();
        ['meters', 'metersTenant', 'deliveries'].forEach(mutate);

        return response;
      } catch (err) {
        mutateTenants();
        handleError(err, 'Помилка при оновленні статусу орендаря');
        throw err;
      }
    },
    [tenants, mutateTenants, withToken]
  );

  const getTenantDependencies = useCallback(
    async (id) => {
      try {
        const response = await withToken(tenantApi.getTenantDependencies, id);
        return response;
      } catch (err) {
        handleError(err, 'Помилка при завантаженні залежностей орендаря');
        throw err;
      }
    },
    [withToken]
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
    refreshTenants: mutateTenants,
    getTenantsByLocation: useCallback((locId) => tenants.filter((t) => t.locationId === locId), [tenants]),
    getActiveTenantsByLocation: useCallback((locId) => activeTenants.filter((t) => t.locationId === locId), [activeTenants]),
    error,
    setError,
  };
};
