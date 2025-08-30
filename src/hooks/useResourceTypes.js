import { useState, useEffect } from 'react';
import { getResourceTypes } from '../api/resourceTypesApi';
export const useResourceTypes = () => {
  const [resourceTypes, setResourceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        setLoading(true);
        const data = await getResourceTypes();
        setResourceTypes(data);
      } catch (err) {
        setError(err.message || 'Не вдалося завантажити типи ресурсів');
      } finally {
        setLoading(false);
      }
    };

    fetchTypes();
  }, []);

  return { resourceTypes, loading, error };
};
