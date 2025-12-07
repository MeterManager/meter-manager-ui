import { useState } from 'react';

export const useErrorHandler = (defaultMessage) => {
  const [error, setError] = useState(null);

  const handleError = (err, customMessage) => {
    if (err.response?.status === 403) return;
    setError(customMessage || err.message || defaultMessage);
  };

  return { error, setError, handleError };
};
