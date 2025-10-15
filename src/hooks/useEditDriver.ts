import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import config from '../config/env';


export interface DocumentBase {
  file?: string;
  notes?: string;
  issue_date?: string;
  expiry_date?: string;
}

// Form-specific interfaces that allow File objects
export interface FormDocumentBase {
  file?: string | File;
  notes?: string;
  issue_date?: string;
  expiry_date?: string;
}

export interface Contract extends DocumentBase {
  contract_number?: string;
}

export interface License extends DocumentBase {
  license_number?: string;
  license_type?: string;
}

export interface NationalIdDoc extends DocumentBase {
  // Additional fields specific to national ID if any
}

export interface VehicleLicense extends DocumentBase {
  license_number?: string;
  license_plate?: string;
  license_type?: string;
  vehicle_type?: string;
}

// Form-specific interfaces
export interface FormContract extends FormDocumentBase {
  contract_number?: string;
}

export interface FormLicense extends FormDocumentBase {
  license_number?: string;
  license_type?: string;
}

export interface FormNationalIdDoc extends FormDocumentBase {
  // Additional fields specific to national ID if any
}

export interface FormVehicleLicense extends FormDocumentBase {
  license_number?: string;
  license_plate?: string;
  license_type?: string;
  vehicle_type?: string;
}

export interface DriverData {
  id: number;
  first_name: string;
  last_name: string;
  nid: string | null;
  uuid: string;
  phone_number: string;
  is_active: boolean;
  company_code: string;
  contracts: Contract[];
  license: License | null;
  national_id_doc: NationalIdDoc | null;
  vehicle_license: VehicleLicense | null;
}

export interface EditDriverData {
  first_name: string;
  last_name: string;
  nid: string;
  uuid: string;
  phone_number: string;
  is_active: boolean;
  company_code: string;
  contracts: FormContract[];
  license: FormLicense | null;
  national_id_doc: FormNationalIdDoc | null;
  vehicle_license: FormVehicleLicense | null;
}

export const useEditDriver = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // Get driver data for editing
  const getDriver = async (driverId: number): Promise<DriverData> => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${config.API_BASE_URL}/v1/drivers/${driverId}/`, {
        headers: {
          Authorization: `Token ${token}`,
          accept: 'application/json'
        },
      });
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch driver data';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Update driver data
  const updateDriver = async (driverId: number, driverData: EditDriverData | FormData): Promise<DriverData> => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Sending PUT request with data:', driverData);
      
      const headers: any = {
        Authorization: `Token ${token}`,
        accept: 'application/json',
      };
      
      // Don't set Content-Type for FormData - let axios handle it
      if (!(driverData instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }
      
      const response = await axios.put(`${config.API_BASE_URL}/v1/drivers/${driverId}/`, driverData, {
        headers,
      });
      
      return response.data;
    } catch (err: any) {
      console.log('Full error response:', err.response);
      
      const serverError = err.response?.data;
      let errorMessage = 'Failed to update driver';
      
      if (typeof serverError === 'object' && serverError !== null) {
        const fieldErrors = Object.entries(serverError)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        
        if (fieldErrors) {
          errorMessage = fieldErrors;
        } else if (serverError.detail) {
          errorMessage = serverError.detail;
        } else if (serverError.message) {
          errorMessage = serverError.message;
        }
      }
      
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
    getDriver,
    updateDriver,
    isLoading,
    error,
    resetError,
  };
};