import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import config from '../config/env';


export const useDeleteDriver = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const deleteDriver = async (driverId: number) => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await axios.delete(`${config.API_BASE_URL}/drivers/${driverId}/`, {
        headers: {
          Authorization: `Token ${token}`,
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