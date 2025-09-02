import { useState, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import * as tariffApi from '../api/tariffApi';
import useAuth from './useAuth';

const fetcher = async (url, token, search = '') => {
  const response = await tariffApi.getTariffs(token, search);
  return (response.data || []).map((t) => ({
    ...t,
    isActive: t.is_active === true,
  }));
};

export const useTariffs = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  const swrKey = isAuthenticated && !isLoading && token ? ['tariffs', token, search] : null;

  const {
    data: tariffs = [],
    error: swrError,
    isLoading: loading,
    mutate: mutateTariffs,
  } = useSWR(swrKey, ([url, token, search]) => fetcher(url, token, search), {
    onError: (err) => {
      setError('Помилка при завантаженні тарифів');
      console.error('SWR Error:', err);
    },
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  const activeTariffs = useMemo(() => {
    return tariffs.filter((tariff) => tariff.isActive);
  }, [tariffs]);

  const tariffsByResourceType = useMemo(() => {
    return tariffs.reduce((acc, tariff) => {
      const resourceType = tariff.resource_type_id || 'other';
      if (!acc[resourceType]) {
        acc[resourceType] = [];
      }
      acc[resourceType].push(tariff);
      return acc;
    }, {});
  }, [tariffs]);

  const addTariff = useCallback(
    async (payload) => {
      const token = localStorage.getItem('token');

      try {
        setError(null);

        const tempId = Date.now();
        const optimisticTariff = {
          ...payload,
          id: tempId,
          isActive: payload.is_active ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          isOptimistic: true,
        };

        mutateTariffs([...tariffs, optimisticTariff], false);

        const response = await tariffApi.createTariff(token, payload);

        mutateTariffs();

        mutate('deliveries');
        mutate('resourceDeliveries');
        mutate('bills');
        mutate('payments');
        mutate('calculations');
        mutate('meters');

        return response;
      } catch (error) {
        mutateTariffs();
        setError('Помилка при додаванні тарифу');
        throw error;
      }
    },
    [tariffs, mutateTariffs]
  );

  const editTariff = useCallback(
    async (id, payload) => {
      const token = localStorage.getItem('token');

      try {
        setError(null);

        const updatedTariffs = tariffs.map((tariff) =>
          tariff.id === id
            ? {
                ...tariff,
                ...payload,
                isActive: payload.is_active ?? tariff.isActive,
                updated_at: new Date().toISOString(),
              }
            : tariff
        );
        mutateTariffs(updatedTariffs, false);

        const response = await tariffApi.updateTariff(token, id, payload);

        mutateTariffs();
        mutate('deliveries');
        mutate('resourceDeliveries');
        mutate('bills');
        mutate('payments');
        mutate('calculations');

        return response;
      } catch (error) {
        mutateTariffs();
        setError('Помилка при редагуванні тарифу');
        throw error;
      }
    },
    [tariffs, mutateTariffs]
  );

  const removeTariff = useCallback(
    async (id) => {
      const token = localStorage.getItem('token');

      try {
        setError(null);

        const filteredTariffs = tariffs.filter((tariff) => tariff.id !== id);
        mutateTariffs(filteredTariffs, false);

        await tariffApi.deleteTariff(token, id);

        mutateTariffs();
        mutate('deliveries');
        mutate('resourceDeliveries');
        mutate('bills');
        mutate('payments');
        mutate('calculations');
        mutate('meters');
      } catch (error) {
        mutateTariffs();
        setError('Помилка при видаленні тарифу');
        throw error;
      }
    },
    [tariffs, mutateTariffs]
  );

  const updateTariffStatus = useCallback(
    async (id, is_active) => {
      const token = localStorage.getItem('token');
      const tariff = tariffs.find((t) => t.id === id);

      if (!tariff) throw new Error('Тариф не знайдено');

      const payload = { ...tariff, is_active };

      try {
        setError(null);

        const updatedTariffs = tariffs.map((t) =>
          t.id === id
            ? {
                ...t,
                isActive: is_active,
                is_active: is_active,
                updated_at: new Date().toISOString(),
              }
            : t
        );
        mutateTariffs(updatedTariffs, false);

        const response = await tariffApi.updateTariff(token, id, payload);

        mutateTariffs();
        mutate('deliveries');
        mutate('resourceDeliveries');
        mutate('bills');
        mutate('calculations');

        return response;
      } catch (error) {
        mutateTariffs();
        setError('Помилка при оновленні статусу тарифу');
        throw error;
      }
    },
    [tariffs, mutateTariffs]
  );

  const refreshTariffs = useCallback(() => {
    mutateTariffs();
  }, [mutateTariffs]);

  const getTariffsByResourceType = useCallback(
    (resourceTypeId) => {
      return tariffs.filter((tariff) => tariff.resource_type_id === resourceTypeId);
    },
    [tariffs]
  );

  const getActiveTariffsByResourceType = useCallback(
    (resourceTypeId) => {
      return activeTariffs.filter((tariff) => tariff.resource_type_id === resourceTypeId);
    },
    [activeTariffs]
  );

  const getCurrentTariff = useCallback(
    (resourceTypeId, date = new Date()) => {
      return activeTariffs
        .filter(
          (tariff) =>
            tariff.resource_type_id === resourceTypeId &&
            new Date(tariff.start_date || '2000-01-01') <= date &&
            (!tariff.end_date || new Date(tariff.end_date) >= date)
        )
        .sort((a, b) => new Date(b.start_date || '2000-01-01') - new Date(a.start_date || '2000-01-01'))[0];
    },
    [activeTariffs]
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
    refreshTariffs,
    getTariffsByResourceType,
    getActiveTariffsByResourceType,
    getCurrentTariff,
    error: error || swrError,
    setError,
  };
};
