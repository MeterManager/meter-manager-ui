import { useState, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import * as resourceTypeApi from '../api/resourceTypesApi';
import { useAuthContext } from '../contexts/AuthContext';

const fetcher = async (url, token, search = '') => {
  const response = await resourceTypeApi.getResourceTypes(token, search);
  return (response.data || []).map((type) => ({
    ...type,
    isActive: type.is_active === true,
  }));
};

export const useResourceTypes = () => {
  const { isAuthenticated, isLoading, getToken } = useAuthContext();
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const swrKey = isAuthenticated && !isLoading ? ['resourceTypes', search] : null;

  const {
    data: resourceTypes = [],
    error: swrError,
    isLoading: loading,
    mutate: mutateResourceTypes,
  } = useSWR(
    swrKey,
    async ([, search]) => {
      const token = await getToken();
      return fetcher('resourceTypes', token, search);
    },
    {
      onError: (err) => {
        setError('Помилка при завантаженні типів ресурсів');
        console.error('SWR Error:', err);
      },
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const activeResourceTypes = useMemo(() => resourceTypes.filter((t) => t.isActive), [resourceTypes]);

  const addResourceType = useCallback(
    async (data) => {
      const token = await getToken();
      const transformedData = {
        name: data.name,
        unit: data.unit,
        is_active: data.isActive ?? true,
      };

      try {
        setError(null);

        const tempId = Date.now();
        const optimisticResourceType = {
          id: tempId,
          ...transformedData,
          isActive: transformedData.is_active,
          isOptimistic: true,
        };

        mutateResourceTypes([...resourceTypes, optimisticResourceType], false);

        const response = await resourceTypeApi.createResourceType(token, transformedData);

        mutateResourceTypes();
        mutate('meters');
        mutate('resources');
        mutate('deliveries');
        mutate('metersTenant');
        mutate('resourceDeliveries');

        return response;
      } catch (err) {
        mutateResourceTypes();
        setError('Помилка при додаванні типу ресурсу');
        console.error(err.response?.data);
        throw err;
      }
    },
    [resourceTypes, mutateResourceTypes, getToken]
  );

  const editResourceType = useCallback(
    async (id, data) => {
      const token = await getToken();
      const transformedData = { name: data.name, unit: data.unit, is_active: data.isActive };

      try {
        setError(null);
        mutateResourceTypes(
          resourceTypes.map((t) => (t.id === id ? { ...t, ...transformedData, isActive: transformedData.is_active } : t)),
          false
        );

        const response = await resourceTypeApi.updateResourceType(token, id, transformedData);

        mutateResourceTypes();
        mutate('meters');
        mutate('resources');
        mutate('deliveries');

        return response;
      } catch (err) {
        mutateResourceTypes();
        setError('Помилка при редагуванні типу ресурсу');
        console.error(err.response?.data);
        throw err;
      }
    },
    [resourceTypes, mutateResourceTypes, getToken]
  );

  const removeResourceType = useCallback(
    async (id) => {
      const token = await getToken();

      try {
        setError(null);
        mutateResourceTypes(resourceTypes.filter((t) => t.id !== id), false);

        await resourceTypeApi.deleteResourceType(token, id);

        mutateResourceTypes();
        mutate('meters');
        mutate('resources');
        mutate('deliveries');
        mutate('metersTenant');
        mutate('resourceDeliveries');
      } catch (err) {
        mutateResourceTypes();
        setError('Помилка при видаленні типу ресурсу');
        throw err;
      }
    },
    [resourceTypes, mutateResourceTypes, getToken]
  );

  const updateResourceTypeStatus = useCallback(
    async (id, is_active) => {
      const token = await getToken();
      const type = resourceTypes.find((t) => t.id === id);
      if (!type) throw new Error('Тип ресурсу не знайдено');

      const payload = { ...type, is_active };

      try {
        setError(null);
        mutateResourceTypes(resourceTypes.map((t) => (t.id === id ? { ...t, isActive: is_active } : t)), false);

        const response = await resourceTypeApi.updateResourceType(token, id, payload);

        mutateResourceTypes();
        mutate('meters');
        mutate('resources');

        return response;
      } catch (err) {
        mutateResourceTypes();
        setError('Помилка при оновленні статусу типу ресурсу');
        console.error(err.response?.data);
        throw err;
      }
    },
    [resourceTypes, mutateResourceTypes, getToken]
  );

  return {
    resourceTypes,
    activeResourceTypes,
    loading,
    search,
    setSearch,
    addResourceType,
    editResourceType,
    removeResourceType,
    updateResourceTypeStatus,
    refreshResourceTypes: mutateResourceTypes,
    error: error || swrError,
    setError,
  };
};