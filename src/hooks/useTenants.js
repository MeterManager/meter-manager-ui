import { useState, useEffect, useCallback } from 'react';
import * as tenantsApi from '../api/tenantsApi';
import { useAuth0 } from '@auth0/auth0-react';

export const useTenants = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await tenantsApi.getTenants(getAccessTokenSilently, page, 10, search);

      setTenants(
        (response.data || []).map((tenant) => ({
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
        }))
      );
      setTotal(response.count || 0);
    } catch (err) {
      setError('Помилка при завантаженні орендарів');
      console.error('Помилка завантаження орендарів:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, getAccessTokenSilently]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addTenant = async (data) => {
    try {
      const tenantData = {
        name: data.name,
        location_id: data.locationId,
        occupied_area: data.occupiedArea || null,
        contact_person: data.contactPerson || null,
        phone: data.phone || null,
        email: data.email || null,
        is_active: data.isActive ?? true,
      };

      const response = await tenantsApi.createTenant(getAccessTokenSilently, tenantData);
      if (response.error) {
        throw new Error(response.error);
      }
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при додаванні орендаря');
    }
  };

  const editTenant = async (id, data) => {
    try {
      const tenantData = {
        name: data.name,
        location_id: data.locationId,
        occupied_area: data.occupiedArea || null,
        contact_person: data.contactPerson || null,
        phone: data.phone || null,
        email: data.email || null,
        is_active: data.isActive,
      };

      const response = await tenantsApi.updateTenant(getAccessTokenSilently, id, tenantData);
      if (response.error) {
        throw new Error(response.error);
      }
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при редагуванні орендаря');
    }
  };

  const removeTenant = async (id) => {
    try {
      await tenantsApi.deleteTenant(getAccessTokenSilently, id);
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при видаленні орендаря');
    }
  };

  const updateTenantStatus = async (id, data) => {
    try {
      const response = await tenantsApi.updateTenant(getAccessTokenSilently, id, data);
      if (response.error) {
        throw new Error(response.error);
      }
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при зміні статусу');
    }
  };

  return {
    tenants,
    loading,
    page,
    setPage,
    search,
    setSearch,
    total,
    addTenant,
    editTenant,
    removeTenant,
    updateTenantStatus,
    error,
    setError,
  };
};
