import { useState, useEffect, useCallback } from 'react';
import { getMeters, createMeter, updateMeter, deleteMeter } from '../api/metersApi';

export const useMeters = () => {
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const searchFilters = {
        ...filters,
        ...(search && { serial_number: search })
      };
      
      const response = await getMeters(searchFilters);
      console.log('Дані лічильників з бекенду:', response.data);
      
      setMeters(
        (response.data || []).map((meter) => ({
          ...meter,
          isActive: meter.is_active === true,
          locationName: meter.Location?.name || 'Невідома локація',
          energyResourceType: meter.EnergyResourceType?.name || 'Невідомий тип',
        }))
      );
      setTotal(response.count || 0);
    } catch (err) {
      setError('Помилка при завантаженні лічильників');
      console.error('Помилка завантаження лічильників:', err);
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addMeter = async (data) => {
    try {
      const response = await createMeter(data);
      if (response.error) {
        throw new Error(response.error);
      }
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при додаванні лічильника');
    }
  };

  const editMeter = async (id, data) => {
    try {
      const response = await updateMeter(id, {
        serial_number: data.serial_number,
        location_id: data.location_id,
        energy_resource_type_id: data.energy_resource_type_id,
        is_active: data.isActive,
      });
      if (response.error) {
        throw new Error(response.error);
      }
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при редагуванні лічильника');
    }
  };

  const removeMeter = async (id) => {
    try {
      await deleteMeter(id);
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при видаленні лічільника');
    }
  };

  const updateMeterStatus = async (id, data) => {
    try {
      const response = await updateMeter(id, data);
      if (response.error) {
        throw new Error(response.error);
      }
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при зміні статусу лічільника');
    }
  };

  return {
    meters,
    loading,
    search,
    setSearch,
    filters,
    setFilters,
    total,
    addMeter,
    editMeter,
    removeMeter,
    updateMeterStatus,
    error,
    setError,
  };
};