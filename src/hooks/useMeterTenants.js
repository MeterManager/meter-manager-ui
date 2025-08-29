import { useState, useEffect, useCallback } from 'react';
import { 
  getMeterTenants as getAllMeterTenants, 
  createMeterTenant, 
  updateMeterTenant, 
  deleteMeterTenant 
} from '../api/meterTenantsApi';

export const useMeterTenants = () => {
  const [meterTenants, setMeterTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllMeterTenants();
      const filtered = response.data.filter(mt => 
        mt.Tenant?.name.toLowerCase().includes(search.toLowerCase()) ||
        mt.Meter?.serial_number.toLowerCase().includes(search.toLowerCase())
      );
      setMeterTenants(filtered);
    } catch (err) {
      setError('Помилка при завантаженні призначень лічильників');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addMeterTenant = async (data) => {
    try {
      const response = await createMeterTenant(data);
      if (response.error) throw new Error(response.error);
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при додаванні призначення лічильника');
    }
  };

  const editMeterTenant = async (id, data) => {
    try {
      const response = await updateMeterTenant(id, data);
      if (response.error) throw new Error(response.error);
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при редагуванні призначення лічильника');
    }
  };

  const removeMeterTenant = async (id) => {
    try {
      await deleteMeterTenant(id);
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при видаленні призначення лічильника');
    }
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
