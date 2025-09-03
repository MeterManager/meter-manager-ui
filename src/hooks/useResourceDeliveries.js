import { useState, useEffect, useCallback } from 'react';
import * as resourceDeliveriesApi from '../api/resourceDeliveriesApi';
import { useAuthContext } from '../contexts/AuthContext';

export const useResourceDeliveries = () => {
  const { isAuthenticated, isLoading, getToken, isBlocked } = useAuthContext();
  const [deliveries, setDeliveries] = useState([]);
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

      const response = await resourceDeliveriesApi.getResourceDeliveries(token, { search });
      setDeliveries(
        (response.data || []).map((delivery) => ({
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
    } catch (err) {
      if (err.response?.status === 403) {
        return;
      }
      setError('Помилка при завантаженні поставок');
      console.error('Fetch deliveries error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, isAuthenticated, isLoading, getToken, isBlocked]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addDelivery = useCallback(async (data) => {
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
  }, [getToken, isBlocked, fetchData]);

  const editDelivery = useCallback(async (id, data) => {
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
  }, [getToken, isBlocked, fetchData]);

  const removeDelivery = useCallback(async (id) => {
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
  }, [getToken, isBlocked, fetchData]);

  return {
    deliveries,
    loading,
    search,
    setSearch,
    addDelivery,
    editDelivery,
    removeDelivery,
    error,
    setError,
  };
};