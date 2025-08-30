import { useState, useEffect, useCallback } from 'react';
import * as resourceTypeApi from '../api/resourceTypeApi';
import useAuth from './useAuth';

export const useResourceTypes = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [resourceTypes, setResourceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || isLoading) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await resourceTypeApi.getResourceTypes(token, search);
      setResourceTypes(
        (response.data || []).map((type) => ({
          ...type,
          isActive: type.is_active === true,
        }))
      );
    } catch (err) {
      setError('Помилка при завантаженні типів ресурсів');
    } finally {
      setLoading(false);
    }
  }, [search, isAuthenticated, isLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addResourceType = async (payload) => {
    const token = localStorage.getItem('token');
    const response = await resourceTypeApi.createResourceType(token, payload);
    await fetchData();
    return response;
  };

  const editResourceType = async (id, payload) => {
    const token = localStorage.getItem('token');
    const response = await resourceTypeApi.updateResourceType(token, id, payload);
    await fetchData();
    return response;
  };

  const removeResourceType = async (id) => {
    const token = localStorage.getItem('token');
    await resourceTypeApi.deleteResourceType(token, id);
    await fetchData();
  };

  const updateResourceTypeStatus = async (id, is_active) => {
    const token = localStorage.getItem('token');
    const type = resourceTypes.find((t) => t.id === id);
    if (!type) throw new Error('Тип ресурсу не знайдено');
    const payload = { ...type, is_active };
    const response = await resourceTypeApi.updateResourceType(token, id, payload);
    await fetchData();
    return response;
  };

  return {
    resourceTypes,
    loading,
    search,
    setSearch,
    addResourceType,
    editResourceType,
    removeResourceType,
    updateResourceTypeStatus,
    error,
    setError,
  };
};
