import { useState, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import * as resourceTypeApi from '../api/resourceTypesApi';
import useAuth from './useAuth';

const fetcher = async (url, token, search = '') => {
  const response = await resourceTypeApi.getResourceTypes(token, search);
  return (response.data || []).map((type) => ({
    ...type,
    isActive: type.is_active === true,
  }));
};

export const useResourceTypes = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  const swrKey = isAuthenticated && !isLoading && token ? ['resourceTypes', token, search] : null;

  const {
    data: resourceTypes = [],
    error: swrError,
    isLoading: loading,
    mutate: mutateResourceTypes,
  } = useSWR(swrKey, ([url, token, search]) => fetcher(url, token, search), {
    onError: (err) => {
      setError('Помилка при завантаженні типів ресурсів');
      console.error('SWR Error:', err);
    },
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  });

  const activeResourceTypes = useMemo(() => {
    return resourceTypes.filter((type) => type.isActive);
  }, [resourceTypes]);

  const addResourceType = useCallback(
    async (data) => {
      const token = localStorage.getItem('token');
      const transformedData = {
        name: data.name,
        unit: data.unit,
        is_active: data.isActive !== undefined ? data.isActive : true,
      };

      try {
        setError(null);

        const tempId = Date.now();
        const optimisticResourceType = {
          id: tempId,
          name: transformedData.name,
          unit: transformedData.unit,
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
      } catch (error) {
        mutateResourceTypes();
        setError('Помилка при додаванні типу ресурсу');
        console.error('Create resource type error:', error.response?.data);
        throw error;
      }
    },
    [resourceTypes, mutateResourceTypes]
  );

  const editResourceType = useCallback(
    async (id, data) => {
      const token = localStorage.getItem('token');
      const transformedData = {
        name: data.name,
        unit: data.unit,
        is_active: data.isActive,
      };

      try {
        setError(null);

        const updatedResourceTypes = resourceTypes.map((type) =>
          type.id === id
            ? {
                ...type,
                name: transformedData.name,
                unit: transformedData.unit,
                isActive: transformedData.is_active,
              }
            : type
        );
        mutateResourceTypes(updatedResourceTypes, false);

        const response = await resourceTypeApi.updateResourceType(token, id, transformedData);

        mutateResourceTypes();
        mutate('meters');
        mutate('resources');
        mutate('deliveries');

        return response;
      } catch (error) {
        mutateResourceTypes();
        setError('Помилка при редагуванні типу ресурсу');
        console.error('Update resource type error:', error.response?.data);
        throw error;
      }
    },
    [resourceTypes, mutateResourceTypes]
  );

  const removeResourceType = useCallback(
    async (id) => {
      const token = localStorage.getItem('token');

      try {
        setError(null);

        const filteredResourceTypes = resourceTypes.filter((type) => type.id !== id);
        mutateResourceTypes(filteredResourceTypes, false);

        await resourceTypeApi.deleteResourceType(token, id);

        mutateResourceTypes();
        mutate('meters');
        mutate('resources');
        mutate('deliveries');
        mutate('metersTenant');
        mutate('resourceDeliveries');
      } catch (error) {
        mutateResourceTypes();
        setError('Помилка при видаленні типу ресурсу');
        throw error;
      }
    },
    [resourceTypes, mutateResourceTypes]
  );

  const updateResourceTypeStatus = useCallback(
    async (id, is_active) => {
      const token = localStorage.getItem('token');
      const type = resourceTypes.find((t) => t.id === id);

      if (!type) throw new Error('Тип ресурсу не знайдено');

      const payload = {
        name: type.name,
        unit: type.unit,
        is_active,
      };

      try {
        setError(null);

        const updatedResourceTypes = resourceTypes.map((resourceType) =>
          resourceType.id === id ? { ...resourceType, isActive: is_active } : resourceType
        );
        mutateResourceTypes(updatedResourceTypes, false);

        const response = await resourceTypeApi.updateResourceType(token, id, payload);

        mutateResourceTypes();
        mutate('meters');
        mutate('resources');

        return response;
      } catch (error) {
        mutateResourceTypes();
        setError('Помилка при оновленні статусу типу ресурсу');
        console.error('Update resource type status error:', error.response?.data);
        throw error;
      }
    },
    [resourceTypes, mutateResourceTypes]
  );

  const refreshResourceTypes = useCallback(() => {
    mutateResourceTypes();
  }, [mutateResourceTypes]);

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
    refreshResourceTypes,
    error: error || swrError,
    setError,
  };
};
