import { useState, useEffect, useCallback } from 'react';
import * as resourceDeliveriesApi from '../api/resourceDeliveriesApi';
import * as locationApi from '../api/locationsApi';
import * as resourceTypesApi from '../api/resourceTypesApi';
import { useAuthContext } from '../contexts/AuthContext';

export const useResourceDeliveries = () => {
  const { isAuthenticated, isLoading, getToken, isBlocked } = useAuthContext();
  const [deliveries, setDeliveries] = useState([]);
  const [locations, setLocations] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || isLoading || isBlocked) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const [deliveriesResponse, locationsResponse, resourceTypesResponse] = await Promise.all([
        resourceDeliveriesApi.getResourceDeliveries(token, { search }),
        locationApi.getLocations(token),
        resourceTypesApi.getResourceTypes(token),
      ]);

      setDeliveries(
        (deliveriesResponse.data || []).map((delivery) => ({
          id: delivery.id,
          location_id: delivery.location_id,
          energy_resource_type_id: delivery.energy_resource_type_id,
          delivery_date: delivery.delivery_date,
          price_per_unit: delivery.price_per_unit,
          locationName: delivery.location?.name,
          resourceTypeName: delivery.energyResourceType?.name,
          deliveryDate: delivery.delivery_date,
          quantity: delivery.quantity,
          unit: delivery.unit,
          pricePerUnit: delivery.price_per_unit,
          totalCost: delivery.total_cost,
          supplier: delivery.supplier,
          createdAt: delivery.created_at,
          updatedAt: delivery.updated_at,
        }))
      );

      setLocations((locationsResponse.data || []).filter((location) => location.is_active));

      setResourceTypes((resourceTypesResponse.data || []).filter((type) => type.is_active));
    } catch (err) {
      if (err.response?.status === 403) {
        return;
      }
      setError('Помилка при завантаженні даних');
      console.error('Fetch data error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, isAuthenticated, isLoading, getToken, isBlocked]);

  const fetchFormData = useCallback(async () => {
    if (!isAuthenticated || isLoading || isBlocked) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) return;

      const [locationsResponse, resourceTypesResponse] = await Promise.all([
        locationApi.getLocations(token),
        resourceTypesApi.getResourceTypes(token),
      ]);

      setLocations((locationsResponse.data || []).filter((location) => location.is_active));
      setResourceTypes((resourceTypesResponse.data || []).filter((type) => type.is_active));
    } catch (err) {
      console.error('Fetch form data error:', err);
    }
  }, [isAuthenticated, isLoading, getToken, isBlocked]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addDelivery = useCallback(
    async (data) => {
      if (isBlocked) throw new Error('User is blocked');

      const token = await getToken();
      if (!token) throw new Error('No token available');

      try {
        const deliveryData = {
          location_id: data.locationId,
          energy_resource_type_id: data.resourceTypeId,
          delivery_date: data.deliveryDate,
          quantity: data.quantity,
          unit: data.unit,
          price_per_unit: data.pricePerUnit,
          total_cost: data.totalCost,
          supplier: data.supplier,
        };

        const response = await resourceDeliveriesApi.createResourceDelivery(token, deliveryData);
        await fetchData();
        return response;
      } catch (error) {
        console.error('Create delivery error:', error.response?.data);
        throw error;
      }
    },
    [getToken, isBlocked, fetchData]
  );

  const editDelivery = useCallback(
    async (id, data) => {
      if (isBlocked) throw new Error('User is blocked');

      const token = await getToken();
      if (!token) throw new Error('No token available');

      try {
        const deliveryData = {
          location_id: data.locationId,
          energy_resource_type_id: data.resourceTypeId,
          delivery_date: data.deliveryDate,
          quantity: data.quantity,
          unit: data.unit,
          price_per_unit: data.pricePerUnit,
          total_cost: data.totalCost,
          supplier: data.supplier,
        };

        const response = await resourceDeliveriesApi.updateResourceDelivery(token, id, deliveryData);
        await fetchData();
        return response;
      } catch (error) {
        console.error('Update delivery error:', error.response?.data);
        throw error;
      }
    },
    [getToken, isBlocked, fetchData]
  );

  const removeDelivery = useCallback(
    async (id) => {
      if (isBlocked) throw new Error('User is blocked');

      const token = await getToken();
      if (!token) throw new Error('No token available');

      try {
        await resourceDeliveriesApi.deleteResourceDelivery(token, id);
        await fetchData();
      } catch (error) {
        console.error('Delete delivery error:', error.response?.data);
        throw error;
      }
    },
    [getToken, isBlocked, fetchData]
  );

  return {
    deliveries,
    locations,
    resourceTypes,
    loading,
    search,
    setSearch,
    addDelivery,
    editDelivery,
    removeDelivery,
    fetchFormData,
    error,
    setError,
  };
};
