import { useState, useEffect, useCallback } from 'react';
import *as locationsApi from '../api/locationsApi';
import { useAuth0 } from '@auth0/auth0-react';

export const useLocations = () => {
  const { getAccessTokenSilently } = useAuth0();
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
      const response = await locationsApi.getLocations(getAccessTokenSilently, page, 10, search);
      setLocations(
        (response.data || []).map((loc) => ({
          ...loc,
          isActive: loc.is_active === true,
        }))
      );
      setTotal(response.count || 0);
    } catch (err) {
      setError('Помилка при завантаженні локацій');
    } finally {
      setLoading(false);
    }
  }, [page, search, getAccessTokenSilently]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addLocation = async (data) => {
    try {
      const response = await locationsApi.createLocation(getAccessTokenSilently, data);
      if (response.error) {
        throw new Error(response.error);
      }
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при додаванні локації');
    }
  };

  const editLocation = async (id, data) => {
    try {
      const response = await locationsApi.updateLocation(getAccessTokenSilently, id, {
        name: data.name,
        address: data.address,
        is_active: data.isActive,
      });
      if (response.error) {
        throw new Error(response.error);
      }
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при редагуванні локації');
    }
  };

  const removeLocation = async (id) => {
    try {
      await  locationsApi.deleteLocation(getAccessTokenSilently, id);
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при видаленні локації');
    }
  };

  const updateLocationStatus = async (id, data) => {
    try {
      const response = await locationsApi.updateLocation(getAccessTokenSilently, id, data);
      if (response.error) {
        throw new Error(response.error);
      }
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при зміні статусу локації');
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
    updateLocationStatus,
    error,
    setError,
  };
};
