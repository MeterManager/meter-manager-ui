import { useState, useEffect, useCallback } from 'react';
import { getLocations, createLocation, updateLocation, deleteLocation } from '../api/locationsApi';

export const useLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getLocations(page, 10, search);
      setLocations(response.data || []);
      setTotal(response.count || 0);
    } catch (err) {
      setError('Помилка при завантаженні локацій');
    } finally {
      setLoading(false);
    }
  }, [page, search]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addLocation = async (data) => {
    try {
      await createLocation(data);
      await fetchData();
    } catch (err) {
      setError('Помилка при додаванні локації');
    }
  };

  const editLocation = async (id, data) => {
    try {
      await updateLocation(id, data);
      await fetchData();
    } catch (err) {
      setError('Помилка при редагуванні локації');
    }
  };

  const removeLocation = async (id) => {
    try {
      await deleteLocation(id);
      await fetchData();
    } catch (err) {
      setError('Помилка при видаленні локації');
    }
  };

  return {
    locations,
    loading,
    page,
    setPage,
    search,
    setSearch,
    total,
    addLocation,
    editLocation,
    removeLocation,
    error,
  };
};
