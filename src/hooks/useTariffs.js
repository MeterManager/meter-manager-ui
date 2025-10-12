import { useState, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import * as tariffApi from '../api/tariffApi';
import { useAuthRequest } from './useAuthRequest';
import { useErrorHandler } from './useErrorHandler';

const fetcher = async (token, search = '') => {
  const response = await tariffApi.getTariffs(token, search);
  return (response.data || []).map((t) => ({ ...t, isActive: t.is_active === true }));
};

export const useTariffs = () => {
  const { canRequest, withToken } = useAuthRequest();
  const { error, setError, handleError } = useErrorHandler('Помилка при завантаженні тарифів');
  const [search, setSearch] = useState('');

  const swrKey = canRequest ? ['tariffs', search] : null;

  const {
    data: tariffs = [],
    isLoading: loading,
    mutate: mutateTariffs,
  } = useSWR(
    swrKey,
    async ([, search]) => withToken(fetcher, search),
    {
      onError: handleError,
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
      try {
        setError(null);
        const tempId = Date.now();
        const optimisticTariff = { ...payload, id: tempId, isActive: payload.is_active ?? true, isOptimistic: true };

        mutateTariffs([...tariffs, optimisticTariff], false);
        const response = await withToken(tariffApi.createTariff, payload);

        mutateTariffs();
        ['deliveries', 'resourceDeliveries', 'bills', 'payments', 'calculations', 'meters'].forEach(mutate);

        return response;
      } catch (err) {
        mutateTariffs();
        handleError(err, 'Помилка при додаванні тарифу');
        throw err;
      }
    },
    [tariffs, mutateTariffs, withToken]
  );

  const editTariff = useCallback(
    async (id, payload) => {
      try {
        setError(null);
        mutateTariffs(
          tariffs.map((t) => (t.id === id ? { ...t, ...payload, isActive: payload.is_active ?? t.isActive } : t)),
          false
        );

        const response = await withToken(tariffApi.updateTariff, id, payload);
        mutateTariffs();
        ['deliveries', 'resourceDeliveries', 'bills', 'payments', 'calculations'].forEach(mutate);

        return response;
      } catch (err) {
        mutateTariffs();
        handleError(err, 'Помилка при редагуванні тарифу');
        throw err;
      }
    },
    [tariffs, mutateTariffs, withToken]
  );

  const removeTariff = useCallback(
    async (id) => {
      try {
        setError(null);
        mutateTariffs(tariffs.filter((t) => t.id !== id), false);
        await withToken(tariffApi.deleteTariff, id);
        mutateTariffs();
        ['deliveries', 'resourceDeliveries', 'bills', 'payments', 'calculations', 'meters'].forEach(mutate);
      } catch (err) {
        mutateTariffs();
        handleError(err, 'Помилка при видаленні тарифу');
        throw err;
      }
    },
    [tariffs, mutateTariffs, withToken]
  );

  const updateTariffStatus = useCallback(
    async (id, is_active) => {
      const tariff = tariffs.find((t) => t.id === id);
      if (!tariff) throw new Error('Тариф не знайдено');
      try {
        setError(null);
        const payload = { ...tariff, is_active };
        mutateTariffs(
          tariffs.map((t) => (t.id === id ? { ...t, isActive: is_active, is_active } : t)),
          false
        );

        const response = await withToken(tariffApi.updateTariff, id, payload);
        mutateTariffs();
        ['deliveries', 'resourceDeliveries', 'bills', 'calculations'].forEach(mutate);

        return response;
      } catch (err) {
        mutateTariffs();
        handleError(err, 'Помилка при оновленні статусу тарифу');
        throw err;
      }
    },
    [tariffs, mutateTariffs, withToken]
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
    error,
    setError,
  };
};
