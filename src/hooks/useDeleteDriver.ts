import { useState } from 'react';
import axios from 'axios';

export const useDeleteDriver = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteDriver = async (driverId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await axios.delete(`http://localhost:8000/api/v1/drivers/${driverId}/`, {
        headers: {
          Authorization: "Token f1a83e3f53f4aa7afcecc8398e5d328512c4d387",
          accept: 'application/json'
        },
      });
      
      return true; // Success
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete driver';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetError = () => {
    setError(null);
  };

  return {
    deleteDriver,
    isLoading,
    error,
    resetError,
  };
};