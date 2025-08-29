import { useState, useEffect,useCallback } from 'react';
import * as resourceTypeApi from '../api/resourceTypeApi';

export const useResourceTypes = () => {
  const [resourceTypes, setResourceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { 
      const response = await resourceTypeApi.getResourceTypes(page, 10, search); 
      setResourceTypes(
        (response.data || []).map((type) => ({
          ...type,
          isActive: type.is_active === true,
        }))
      );
    setTotal(response.count || 0);
    } catch (err) {
      setError('Помилка при завантаженні типів ресурсів');
    } finally {
      setLoading(false);
    }
  }, [page, search]);
    
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addResourceType = async (payload) => {
    try {
      const newType = await resourceTypeApi.createResourceType(payload);
      await fetchData(); return newType.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при додаванні типу ресурсу');
    }
  };

  const editResourceType = async (id, payload) => {
    try {
      const updatedType = await resourceTypeApi.updateResourceType(id, payload);
      await fetchData();
      return updatedType.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при редагуванні типу ресурсу');
    }
  };

  const removeResourceType = async (id) => {
    try {
      await resourceTypeApi.deleteResourceType(id);
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при видаленні типу ресурсу');
    }
  };

  const updateResourceTypeStatus = async (id, payload) => {
    try {
      const updatedType = await resourceTypeApi.updateResourceType(id, payload);
      await fetchData();
      return updatedType.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при зміні статусу');
    }
  };
  
  return {
    resourceTypes,
    loading,
    page,
    setPage,
    search,
    setSearch,
    total,
    addResourceType,
    editResourceType,
    removeResourceType,
    updateResourceTypeStatus,
    error,
    setError,
  };
};
