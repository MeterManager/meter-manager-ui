import { useState, useEffect, useCallback } from 'react';
import * as tariffApi from '../api/tariffApi';
import useAuth from './useAuth';

export const useTariffs = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || isLoading) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await tariffApi.getTariffs(token, search);
      setTariffs(
        (response.data || []).map((t) => ({
          ...t,
          isActive: t.is_active === true,
        }))
      );
    } catch (err) {
      setError('Помилка при завантаженні тарифів');
    } finally {
      setLoading(false);
    }
  }, [search, isAuthenticated, isLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addTariff = async (payload) => {
    const token = localStorage.getItem('token');
    const response = await tariffApi.createTariff(token, payload);
    await fetchData();
    return response;
  };

  const editTariff = async (id, payload) => {
    const token = localStorage.getItem('token');
    const response = await tariffApi.updateTariff(token, id, payload);
    await fetchData();
    return response;
  };

  const removeTariff = async (id) => {
    const token = localStorage.getItem('token');
    await tariffApi.deleteTariff(token, id);
    await fetchData();
  };

  const updateTariffStatus = async (id, is_active) => {
    const token = localStorage.getItem('token');
    const tariff = tariffs.find((t) => t.id === id);
    if (!tariff) throw new Error('Тариф не знайдено');
    const payload = { ...tariff, is_active };
    const response = await tariffApi.updateTariff(token, id, payload);
    await fetchData();
    return response;
  };

  return {
    tariffs,
    loading,
    search,
    setSearch,
    addTariff,
    editTariff,
    removeTariff,
    updateTariffStatus,
    error,
    setError,
  };
};
