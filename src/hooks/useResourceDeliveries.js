import { useState, useEffect, useCallback } from 'react';
import * as resourceDeliveriesApi from '../api/resourceDeliveriesApi';
import useAuth from './useAuth';

export const useResourceDeliveries = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || isLoading) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await resourceDeliveriesApi.getResourceDeliveries(token, { search });
      setDeliveries(
        (response.data || []).map((delivery) => ({
          id: delivery.id,
          locationId: delivery.location_id,
          resourceType: delivery.resource_type,
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
      setError('Помилка при завантаженні поставок');
    } finally {
      setLoading(false);
    }
  }, [search, isAuthenticated, isLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addDelivery = async (data) => {
    try {
      const token = localStorage.getItem('token');

      const deliveryData = {
        location_id: data.locationId,
        resource_type: data.resourceType,
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
  };

  const editDelivery = async (id, data) => {
    try {
      const token = localStorage.getItem('token');

      const deliveryData = {
        location_id: data.locationId,
        resource_type: data.resourceType, // Передаємо ID типу ресурсу
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
  };

  const removeDelivery = async (id) => {
    const token = localStorage.getItem('token');
    await resourceDeliveriesApi.deleteResourceDelivery(token, id);
    await fetchData();
  };

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
