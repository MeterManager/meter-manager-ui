import { useState, useEffect, useCallback } from 'react';
import * as locationApi from '../api/locationsApi';
import useAuth from './useAuth';

export const useLocations = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || isLoading) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await locationApi.getLocations(token, search);
      setLocations(
        (response.data || []).map((loc) => ({
          ...loc,
          isActive: loc.is_active === true,
        }))
      );
    } catch (err) {
      setError('Помилка при завантаженні локацій');
    } finally {
      setLoading(false);
    }
  }, [search, isAuthenticated, isLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addLocation = async (data) => {
    const token = localStorage.getItem('token');
    const transformedData = {
      name: data.name,
      address: data.address,
      is_active: data.isActive ?? true,
    };
    const response = await locationApi.createLocation(token, transformedData);
    await fetchData();
    return response;
  };

  const editLocation = async (id, data) => {
    const token = localStorage.getItem('token');
    const transformedData = {
      name: data.name,
      address: data.address,
      is_active: data.isActive,
    };
    const response = await locationApi.updateLocation(token, id, transformedData);
    await fetchData();
    return response;
  };

  const removeLocation = async (id) => {
    const token = localStorage.getItem('token');
    await locationApi.deleteLocation(token, id);
    await fetchData();
  };

  const updateLocationStatus = async (id, is_active) => {
    const token = localStorage.getItem('token');
    const loc = locations.find((l) => l.id === id);

    if (!loc) throw new Error('Локацію не знайдено');

    const payload = {
      name: loc.name,
      address: loc.address,
      is_active,
    };

    const response = await locationApi.updateLocation(token, id, payload);
    await fetchData();
    return response;
  };

  return {
    locations,
    loading,
    search,
    setSearch,
    addLocation,
    editLocation,
    removeLocation,
    updateLocationStatus,
    error,
    setError,
  };
};
