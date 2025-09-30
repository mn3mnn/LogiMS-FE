import { useState } from 'react';
import axios from 'axios';

export interface UserData {
  first_name: string;
  last_name: string;
  phone_number: string;
  company_code: 'uber_eats' | 'talabat';
}

export const useAddUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addUser = async (userData: UserData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const payload = {
        ...userData,
        uuid: generateUUID(),
        is_active: true 
      };

      const response = await axios.post('http://localhost:8000/api/v1/drivers/', payload, {
        headers: {
          Authorization: "Token f1a83e3f53f4aa7afcecc8398e5d328512c4d387",
          'Content-Type': 'application/json',
          accept: 'application/json'
        },
      });

      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const resetError = () => {
    setError(null);
  };

  return {
    addUser,
    isLoading,
    error,
    resetError,
  };
};