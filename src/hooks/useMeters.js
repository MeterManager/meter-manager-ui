// useMeters.js
import { useState, useEffect, useCallback } from 'react';
import * as metersApi from '../api/metersApi';
import useAuth from './useAuth';

export const useMeters = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || isLoading) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await metersApi.getMeters(token, search);
      setMeters(response.data.map((m) => ({ ...m, isActive: m.is_active })));
    } catch (err) {
      setError('Помилка при завантаженні лічильників');
    } finally {
      setLoading(false);
    }
  }, [search, isAuthenticated, isLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addMeter = async (data) => {
    const token = localStorage.getItem('token');
    await metersApi.createMeter(token, data);
    await fetchData();
  };

  const editMeter = async (id, data) => {
    const token = localStorage.getItem('token');
    await metersApi.updateMeter(token, id, data);
    await fetchData();
  };

  const removeMeter = async (id) => {
    const token = localStorage.getItem('token');
    await metersApi.deleteMeter(token, id);
    await fetchData();
  };

  const updateMeterStatus = async (id, isActive) => {
    const token = localStorage.getItem('token');
    const meter = meters.find((m) => m.id === id);
    if (!meter) throw new Error('Лічильник не знайдено');
    await metersApi.updateMeter(token, id, { ...meter, is_active: isActive });
    await fetchData();
  };

  return {
    meters,
    loading,
    search,
    setSearch,
    addMeter,
    editMeter,
    removeMeter,
    updateMeterStatus,
    error,
    setError,
  };
};
