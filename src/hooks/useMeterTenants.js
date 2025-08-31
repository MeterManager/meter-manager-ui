import { useState, useEffect, useCallback } from 'react';
import * as meterTenantsApi from '../api/meterTenantsApi';
import useAuth from './useAuth';

export const useMeterTenants = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [meterTenants, setMeterTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || isLoading) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await meterTenantsApi.getMeterTenants(token);
      const filtered = response.data.filter(
        (mt) =>
          mt.Tenant?.name.toLowerCase().includes(search.toLowerCase()) ||
          mt.Meter?.serial_number.toLowerCase().includes(search.toLowerCase())
      );
      setMeterTenants(filtered);
    } catch (err) {
      setError('Помилка при завантаженні призначень лічильників');
    } finally {
      setLoading(false);
    }
  }, [search, isAuthenticated, isLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addMeterTenant = async (data) => {
    const token = localStorage.getItem('token');
    const response = await meterTenantsApi.createMeterTenant(token, data);
    await fetchData();
    return response;
  };

  const editMeterTenant = async (id, data) => {
    const token = localStorage.getItem('token');
    const response = await meterTenantsApi.updateMeterTenant(token, id, data);
    await fetchData();
    return response;
  };

  const removeMeterTenant = async (id) => {
    const token = localStorage.getItem('token');
    await meterTenantsApi.deleteMeterTenant(token, id);
    await fetchData();
  };

  return {
    meterTenants,
    loading,
    search,
    setSearch,
    addMeterTenant,
    editMeterTenant,
    removeMeterTenant,
    error,
    setError,
  };
};
