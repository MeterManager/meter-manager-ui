import { useState, useCallback } from "react";
import useSWR, { mutate } from "swr";
import * as meterReadingsApi from "../api/meterReadings"; 
import { useAuthContext } from "../contexts/AuthContext";

const fetcher = async ([_, getToken]) => {
  const token = await getToken();
  if (!token) throw new Error("No token available");
  const response = await meterReadingsApi.getMeterReadings(token); 
  return response.data || [];
};

export const useMeterReadings = () => {
  const { isAuthenticated, isLoading, getToken, isBlocked } = useAuthContext();
  const [error, setError] = useState(null);

  const swrKey =
    isAuthenticated && !isLoading && !isBlocked && getToken
      ? ["meterReadings", getToken]
      : null;

  const {
    data: meterReadings = [],
    error: swrError,
    isLoading: loading,
    mutate: mutateReadings,
  } = useSWR(swrKey, fetcher, {
    onError: (err) => {
      if (err.response?.status === 403) return;
      setError("Помилка при завантаженні показників.");
      console.error("SWR Error:", err);
    },
    revalidateOnFocus: false,
  });

  const addReading = useCallback(
    async (newReading) => {
      if (isBlocked) throw new Error("User is blocked.");
      const token = await getToken();
      if (!token) throw new Error("No token available.");

      try {
        setError(null);
        const tempId = Date.now();
        const optimisticReading = { ...newReading, id: tempId, isOptimistic: true };
        mutateReadings([...meterReadings, optimisticReading], false);

        await meterReadingsApi.createMeterReading(token, newReading);
        mutateReadings(); 
        mutate("meters"); 
      } catch (err) {
        mutateReadings(); 
        setError("Помилка при додаванні показника.");
        throw err;
      }
    },
    [meterReadings, mutateReadings, getToken, isBlocked]
  );

  const editReading = useCallback(
    async (id, updatedReading) => {
      if (isBlocked) throw new Error("User is blocked.");
      const token = await getToken();
      if (!token) throw new Error("No token available.");

      try {
        setError(null);
        const updatedList = meterReadings.map((r) =>
          r.id === id ? { ...r, ...updatedReading } : r
        );
        mutateReadings(updatedList, false);

        await meterReadingsApi.updateMeterReading(token, id, updatedReading);
        mutateReadings(); 
        mutate("meters");
      } catch (err) {
        mutateReadings(); 
        setError("Помилка при редагуванні показника.");
        throw err;
      }
    },
    [meterReadings, mutateReadings, getToken, isBlocked]
  );

  const removeReading = useCallback(
    async (id) => {
      if (isBlocked) throw new Error("User is blocked.");
      const token = await getToken();
      if (!token) throw new Error("No token available.");

      try {
        setError(null);
        const filteredList = meterReadings.filter((r) => r.id !== id);
        mutateReadings(filteredList, false);

        await meterReadingsApi.deleteMeterReading(token, id);
        mutateReadings(); 
        mutate("meters");
      } catch (err) {
        mutateReadings(); 
        setError("Помилка при видаленні показника.");
        throw err;
      }
    },
    [meterReadings, mutateReadings, getToken, isBlocked]
  );

  const fetchReadings = useCallback(() => {
    mutateReadings();
  }, [mutateReadings]);

  const getReadingsSummary = useCallback(async (filters = {}) => {
    if (isBlocked) throw new Error("User is blocked.");
    const token = await getToken();
    if (!token) throw new Error("No token available.");
  
    try {
      const response = await meterReadingsApi.getMeterReadingsSummary(token, filters);
      return response.data; 
    } catch (err) {
      console.error("Failed to fetch readings summary:", err);
      setError("Помилка при отриманні зведених даних.");
      throw err;
    }
  }, [getToken, isBlocked]);
  

  return {
    meterReadings,
    loading,
    error: error || swrError,
    setError,
    fetchReadings,
    addReading,
    editReading,
    removeReading,
    getReadingsSummary
  };
};