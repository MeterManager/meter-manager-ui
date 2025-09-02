import { useState, useEffect, useCallback, useMemo } from 'react';
import * as resourceTypeApi from '../api/resourceTypesApi';
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

  const activeResourceTypes = useMemo(() => {
    return resourceTypes.filter(type => type.isActive);
  }, [resourceTypes]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addResourceType = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const transformedData = {
        name: data.name,
        unit: data.unit,
        is_active: data.isActive !== undefined ? data.isActive : true,
      };

      const response = await resourceTypeApi.createResourceType(token, transformedData);
      await fetchData();
      return response;
    } catch (error) {
      console.error('Create resource type error:', error.response?.data);
      throw error;
    }
  };

  const editResourceType = async (id, data) => {
    try {
      const token = localStorage.getItem('token');
      const transformedData = {
        name: data.name,
        unit: data.unit,
        is_active: data.isActive,
      };

      const response = await resourceTypeApi.updateResourceType(token, id, transformedData);
      await fetchData();
      return response;
    } catch (error) {
      console.error('Update resource type error:', error.response?.data);
      throw error;
    }
  };

  const removeResourceType = async (id) => {
    const token = localStorage.getItem('token');
    await resourceTypeApi.deleteResourceType(token, id);
    await fetchData();
  };

  const updateResourceTypeStatus = async (id, is_active) => {
    try {
      const token = localStorage.getItem('token');
      const type = resourceTypes.find((t) => t.id === id);

      if (!type) throw new Error('Тип ресурсу не знайдено');

      const payload = {
        name: type.name,
        unit: type.unit,
        is_active,
      };

      const response = await resourceTypeApi.updateResourceType(token, id, payload);
      await fetchData();
      return response;
    } catch (error) {
      console.error('Update resource type status error:', error.response?.data);
      throw error;
    }
  };

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
    error,
    setError,
  };
};
