import { useState, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import * as tariffApi from '../api/tariffApi';
import { useAuthContext } from '../contexts/AuthContext';

const fetcher = async (url, token, search = '') => {
  const response = await tariffApi.getTariffs(token, search);
  return (response.data || []).map((t) => ({ ...t, isActive: t.is_active === true }));
};

export const useTariffs = () => {
  const { isAuthenticated, isLoading, getToken } = useAuthContext();
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const swrKey = isAuthenticated && !isLoading ? ['tariffs', search] : null;

  const {
    data: tariffs = [],
    error: swrError,
    isLoading: loading,
    mutate: mutateTariffs,
  } = useSWR(
    swrKey,
    async ([, search]) => {
      const token = await getToken();
      return fetcher('tariffs', token, search);
    },
    {
      onError: (err) => {
        setError('Помилка при завантаженні тарифів');
        console.error('SWR Error:', err);
      },
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const activeTariffs = useMemo(() => tariffs.filter((t) => t.isActive), [tariffs]);
  const tariffsByResourceType = useMemo(
    () =>
      tariffs.reduce((acc, t) => {
        const type = t.resource_type_id || 'other';
        acc[type] = acc[type] || [];
        acc[type].push(t);
        return acc;
      }, {}),
    [tariffs]
  );

  const addTariff = useCallback(
    async (payload) => {
      const token = await getToken();
      const tempId = Date.now();
      const optimisticTariff = { ...payload, id: tempId, isActive: payload.is_active ?? true, isOptimistic: true };

      try {
        setError(null);
        mutateTariffs([...tariffs, optimisticTariff], false);

        const response = await tariffApi.createTariff(token, payload);

        mutateTariffs();
        ['deliveries','resourceDeliveries','bills','payments','calculations','meters'].forEach(mutate);

        return response;
      } catch (err) {
        mutateTariffs();
        setError('Помилка при додаванні тарифу');
        throw err;
      }
    },
    [tariffs, mutateTariffs, getToken]
  );

  const editTariff = useCallback(
    async (id, payload) => {
      const token = await getToken();
      mutateTariffs(
        tariffs.map((t) =>
          t.id === id ? { ...t, ...payload, isActive: payload.is_active ?? t.isActive } : t
        ),
        false
      );

      const response = await tariffApi.updateTariff(token, id, payload);
      mutateTariffs();
      ['deliveries','resourceDeliveries','bills','payments','calculations'].forEach(mutate);

      return response;
    },
    [tariffs, mutateTariffs, getToken]
  );

  const removeTariff = useCallback(
    async (id) => {
      const token = await getToken();
      mutateTariffs(tariffs.filter((t) => t.id !== id), false);
      await tariffApi.deleteTariff(token, id);
      mutateTariffs();
      ['deliveries','resourceDeliveries','bills','payments','calculations','meters'].forEach(mutate);
    },
    [tariffs, mutateTariffs, getToken]
  );

  const updateTariffStatus = useCallback(
    async (id, is_active) => {
      const token = await getToken();
      const tariff = tariffs.find((t) => t.id === id);
      if (!tariff) throw new Error('Тариф не знайдено');

      const payload = { ...tariff, is_active };
      mutateTariffs(
        tariffs.map((t) => (t.id === id ? { ...t, isActive: is_active, is_active } : t)),
        false
      );

      const response = await tariffApi.updateTariff(token, id, payload);
      mutateTariffs();
      ['deliveries','resourceDeliveries','bills','calculations'].forEach(mutate);

      return response;
    },
    [tariffs, mutateTariffs, getToken]
  );

  return {
    tariffs,
    activeTariffs,
    tariffsByResourceType,
    loading,
    search,
    setSearch,
    addTariff,
    editTariff,
    removeTariff,
    updateTariffStatus,
    refreshTariffs: mutateTariffs,
    error: error || swrError,
    setError,
  };
};