import { useState, useEffect, useCallback } from 'react';
import { getTenants, createTenant, updateTenant, deleteTenant } from '../api/tenantsApi';

export const useTenants = () => {
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
      const response = await getTenants(page, 10, search);

      console.log(response.data);
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
  }, [page, search]);

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

      const response = await createTenant(tenantData);
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

      const response = await updateTenant(id, tenantData);
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
      await deleteTenant(id);
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при видаленні орендаря');
    }
  };

  const updateTenantStatus = async (id, data) => {
    try {
      const response = await updateTenant(id, data);
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
