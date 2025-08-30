import { useState, useEffect, useCallback } from 'react';
import {
  getResourceDeliveries,
  createResourceDelivery,
  updateResourceDelivery,
  deleteResourceDelivery,
} from '../api/resourceDeliveriesApi';

export const useResourceDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getResourceDeliveries(page, 10, search);
      console.log('Дані з бекенду:', response.data);
      setDeliveries(
        (response.data || []).map((delivery) => {
          console.log('Delivery data:', delivery);
          return {
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
          };
        })
      );

      setTotal(response.count || response.total || 0);
    } catch (err) {
      setError('Помилка при завантаженні поставок');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addDelivery = async (data) => {
    try {
      const deliveryData = {
        location_id: data.locationId,
        resource_type: data.resourceType,
        quantity: data.quantity,
        unit: data.unit,
        price_per_unit: data.pricePerUnit,
        total_cost: data.totalCost,
        supplier: data.supplier,
      };
      console.log('Sending delivery data:', deliveryData);
      const response = await createResourceDelivery(deliveryData);
      if (response.error) throw new Error(response.error);
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при додаванні поставки');
    }
  };

  const editDelivery = async (id, data) => {
    try {
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
      console.log('Editing delivery with ID:', id);
      console.log('Sending edit data:', deliveryData);
      console.log('Original form data:', data);

      const response = await updateResourceDelivery(id, deliveryData);
      console.log('Edit response:', response);
      await fetchData();
    } catch (err) {
      console.error('Edit delivery error:', err);
      console.error('Error response:', err.response?.data);
      throw new Error(err.response?.data?.message || err.response?.data?.error || 'Помилка при редагуванні поставки');
    }
  };

  const removeDelivery = async (id) => {
    try {
      await deleteResourceDelivery(id);
      await fetchData();
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Помилка при видаленні поставки');
    }
  };

  return {
    deliveries,
    loading,
    page,
    setPage,
    search,
    setSearch,
    total,
    addDelivery,
    editDelivery,
    removeDelivery,
    error,
    setError,
  };
};
