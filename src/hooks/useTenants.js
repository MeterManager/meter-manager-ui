import { useState, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import * as tenantApi from '../api/tenantsApi';
import useAuth from './useAuth';

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
  const { isAuthenticated, isLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  const swrKey = isAuthenticated && !isLoading && token ? ['tenants', token, search] : null;

  const {
    data: tenants = [],
    error: swrError,
    isLoading: loading,
    mutate: mutateTenants,
  } = useSWR(swrKey, ([url, token, search]) => fetcher(url, token, search), {
    onError: (err) => {
      setError('Помилка при завантаженні орендарів');
      console.error('SWR Error:', err);
    },
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  const activeTenants = useMemo(() => {
    return tenants.filter((tenant) => tenant.isActive);
  }, [tenants]);

  const addTenant = useCallback(
    async (data) => {
      const token = localStorage.getItem('token');
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
        const optimisticTenant = {
          id: tempId,
          name: tenantData.name,
          locationId: tenantData.location_id,
          occupiedArea: tenantData.occupied_area,
          contactPerson: tenantData.contact_person,
          phone: tenantData.phone,
          email: tenantData.email,
          isActive: tenantData.is_active,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isOptimistic: true,
        };

        mutateTenants([...tenants, optimisticTenant], false);

        const response = await tenantApi.createTenant(token, tenantData);

        mutateTenants();

        mutate('meters');
        mutate('metersTenant');
        mutate('deliveries');
        mutate('resourceDeliveries');
        mutate('payments');
        mutate('contracts');

        return response;
      } catch (error) {
        mutateTenants();
        setError('Помилка при додаванні орендаря');
        throw error;
      }
    },
    [tenants, mutateTenants]
  );

  const editTenant = useCallback(
    async (id, data) => {
      const token = localStorage.getItem('token');
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

        const updatedTenants = tenants.map((tenant) =>
          tenant.id === id
            ? {
                ...tenant,
                name: tenantData.name,
                locationId: tenantData.location_id,
                occupiedArea: tenantData.occupied_area,
                contactPerson: tenantData.contact_person,
                phone: tenantData.phone,
                email: tenantData.email,
                isActive: tenantData.is_active,
                updatedAt: new Date().toISOString(),
              }
            : tenant
        );
        mutateTenants(updatedTenants, false);

        const response = await tenantApi.updateTenant(token, id, tenantData);

        mutateTenants();
        mutate('meters');
        mutate('metersTenant');
        mutate('deliveries');
        mutate('resourceDeliveries');

        return response;
      } catch (error) {
        mutateTenants();
        setError('Помилка при редагуванні орендаря');
        throw error;
      }
    },
    [tenants, mutateTenants]
  );

  const removeTenant = useCallback(
    async (id) => {
      const token = localStorage.getItem('token');

      try {
        setError(null);

        const filteredTenants = tenants.filter((tenant) => tenant.id !== id);
        mutateTenants(filteredTenants, false);

        await tenantApi.deleteTenant(token, id);

        mutateTenants();
        mutate('meters');
        mutate('metersTenant');
        mutate('deliveries');
        mutate('resourceDeliveries');
        mutate('payments');
        mutate('contracts');
      } catch (error) {
        mutateTenants();
        setError('Помилка при видаленні орендаря');
        throw error;
      }
    },
    [tenants, mutateTenants]
  );

  const updateTenantStatus = useCallback(
    async (id, is_active) => {
      const token = localStorage.getItem('token');
      const tenant = tenants.find((t) => t.id === id);

      if (!tenant) throw new Error('Орендар не знайдений');

      const payload = {
        name: tenant.name,
        location_id: tenant.locationId,
        occupied_area: tenant.occupiedArea || null,
        contact_person: tenant.contactPerson || null,
        phone: tenant.phone || null,
        email: tenant.email || null,
        is_active,
      };

      try {
        setError(null);

        const updatedTenants = tenants.map((t) =>
          t.id === id ? { ...t, isActive: is_active, updatedAt: new Date().toISOString() } : t
        );
        mutateTenants(updatedTenants, false);

        const response = await tenantApi.updateTenant(token, id, payload);

        mutateTenants();
        mutate('meters');
        mutate('metersTenant');
        mutate('deliveries');

        return response;
      } catch (error) {
        mutateTenants();
        setError('Помилка при оновленні статусу орендаря');
        console.error('Update tenant status error:', error.response?.data);
        throw error;
      }
    },
    [tenants, mutateTenants]
  );

  const refreshTenants = useCallback(() => {
    mutateTenants();
  }, [mutateTenants]);

  const getTenantsByLocation = useCallback(
    (locationId) => {
      return tenants.filter((tenant) => tenant.locationId === locationId);
    },
    [tenants]
  );

  const getActiveTenantsByLocation = useCallback(
    (locationId) => {
      return activeTenants.filter((tenant) => tenant.locationId === locationId);
    },
    [activeTenants]
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
    refreshTenants,
    getTenantsByLocation,
    getActiveTenantsByLocation,
    error: error || swrError,
    setError,
  };
};
