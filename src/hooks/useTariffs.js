import { useState, useEffect, useCallback } from 'react';
import * as tariffApi from '../api/tariffApi';
import { useAuth0 } from '@auth0/auth0-react';

export const useTariffs = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [tariffs, setTariffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await tariffApi.getTariffs(getAccessTokenSilently, page, 10, search);
      setTariffs(
        (response.data || []).map((t) => ({
          ...t,
          isActive: t.is_active === true,
        }))
      );
      setTotal(response.count || 0);
    } catch (err) {
      setError('Помилка при завантаженні тарифів');
    } finally {
      setLoading(false);
    }
  }, [page, search, getAccessTokenSilently]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addTariff = async (payload) => {
    try {
      const newTariff = await tariffApi.createTariff(getAccessTokenSilently, payload);
      await fetchData();
      return newTariff;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при додаванні тарифу');
    }
  };

  const editTariff = async (id, payload) => {
    try {
      const updatedTariff = await tariffApi.updateTariff(getAccessTokenSilently, id, payload);
      await fetchData();
      return updatedTariff;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при редагуванні тарифу');
    }
  };

  const removeTariff = async (id) => {
    try {
      await tariffApi.deleteTariff(getAccessTokenSilently, id);
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при видаленні тарифу');
    }
  };

  const updateTariffStatus = async (id, is_active) => {
    try {
      const currentTariff = tariffs.find((t) => t.id === id);
      if (!currentTariff) throw new Error('Тариф не знайдено');

      const payload = { ...currentTariff, is_active };
      const updatedTariff = await tariffApi.updateTariff(getAccessTokenSilently, id, payload);
      await fetchData();
      return updatedTariff;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при зміні статусу');
    }
  };

  return {
    tariffs,
    loading,
    page,
    setPage,
    search,
    setSearch,
    total,
    addTariff,
    editTariff,
    removeTariff,
    updateTariffStatus,
    error,
    setError,
  };
};
