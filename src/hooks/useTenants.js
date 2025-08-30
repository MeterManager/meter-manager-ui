import { useState, useEffect, useCallback } from 'react';
import * as tenantApi from '../api/tenantsApi';
import useAuth from './useAuth';

export const useTenants = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || isLoading) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await tenantApi.getTenants(token, search);
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
    } catch (err) {
      setError('Помилка при завантаженні орендарів');
    } finally {
      setLoading(false);
    }
  }, [search, isAuthenticated, isLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addTenant = async (data) => {
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
    const response = await tenantApi.createTenant(token, tenantData);
    await fetchData();
    return response;
  };

  const editTenant = async (id, data) => {
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
    const response = await tenantApi.updateTenant(token, id, tenantData);
    await fetchData();
    return response;
  };

  const removeTenant = async (id) => {
    const token = localStorage.getItem('token');
    await tenantApi.deleteTenant(token, id);
    await fetchData();
  };

  const updateTenantStatus = async (id, isActive) => {
    const token = localStorage.getItem('token');
    const tenant = tenants.find((t) => t.id === id);
    if (!tenant) throw new Error('Орендар не знайдений');
    const payload = { ...tenant, is_active: isActive };
    const response = await tenantApi.updateTenant(token, id, payload);
    await fetchData();
    return response;
  };

  return {
    tenants,
    loading,
    search,
    setSearch,
    addTenant,
    editTenant,
    removeTenant,
    updateTenantStatus,
    error,
    setError,
  };
};
