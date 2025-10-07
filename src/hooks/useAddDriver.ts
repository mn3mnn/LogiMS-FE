// hooks/useAddDriver.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';
const AUTH_TOKEN = 'f1a83e3f53f4aa7afcecc8398e5d328512c4d387';

export interface DriverData {
  first_name: string;
  last_name: string;
  nid: string;
  uuid: string;
  phone_number: string;
  is_active: boolean;
  company_code: string;
}

export interface LicenseData {
  driver_id: number;
  file: File | string;
  notes: string;
  issue_date: string;
  expiry_date: string;
  license_number: string;
  license_type: string;
}

export interface NationalIdData {
  driver_id: number;
  file: File | string;
  notes: string;
  issue_date: string;
  expiry_date: string;
}

export interface VehicleLicenseData {
  driver_id: number;
  file: File | string;
  notes: string;
  issue_date: string;
  expiry_date: string;
  license_number: string;
  license_plate: string;
  license_type: string;
  vehicle_type: string;
}

export interface ContractData {
  driver_id: number;
  file: File | string;
  notes: string;
  issue_date: string;
  expiry_date: string;
  contract_number: string;
}

export interface AddDriverPayload {
  driverData: DriverData;
  licenseData: Omit<LicenseData, 'driver_id'>;
  nationalIdData: Omit<NationalIdData, 'driver_id'>;
  vehicleLicenseData: Omit<VehicleLicenseData, 'driver_id'>;
  contractsData: Omit<ContractData, 'driver_id'>[];
}

// Improved Helper function to create FormData
const createFormData = (data: any, fileFields: string[]): FormData => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    // Skip null or undefined values
    if (value === null || value === undefined) {
      return;
    }
    
    // Handle files
    if (fileFields.includes(key) && value instanceof File) {
      formData.append(key, value);
    } 
    // Handle numbers (like driver_id)
    else if (typeof value === 'number') {
      formData.append(key, value.toString());
    }
    // Handle strings and other types
    else {
      formData.append(key, String(value));
    }
  });
  
  return formData;
};

// Common headers with authorization
const getHeaders = () => ({
  'Authorization': `Token ${AUTH_TOKEN}`,
  'Content-Type': 'application/json',
});

const getMultipartHeaders = () => ({
  'Authorization': `Token ${AUTH_TOKEN}`,
});

export const useAddDriver = () => {
  const queryClient = useQueryClient();

  const addDriverMutation = useMutation({
    mutationFn: async (payload: AddDriverPayload) => {
      const { driverData, licenseData, nationalIdData, vehicleLicenseData, contractsData } = payload;

      // Step 1: Create the driver
      const driverResponse = await axios.post(`${API_BASE_URL}/drivers/`, driverData, {
        headers: getHeaders(),
      });
      const driver = driverResponse.data;
      const driverId = driver.id;

      console.log('Driver created with ID:', driverId);

      // Step 2: Create all documents with proper driver_id
      const documentPromises = [
        // Create license
        axios.post(`${API_BASE_URL}/licenses/`, createFormData({
          ...licenseData,
          driver_id: driverId,
        }, ['file']), {
          headers: getMultipartHeaders(),
        }),

        // Create national ID
        axios.post(`${API_BASE_URL}/national-ids/`, createFormData({
          ...nationalIdData,
          driver_id: driverId,
        }, ['file']), {
          headers: getMultipartHeaders(),
        }),

        // Create vehicle license
        axios.post(`${API_BASE_URL}/vehicle-licenses/`, createFormData({
          ...vehicleLicenseData,
          driver_id: driverId,
        }, ['file']), {
          headers: getMultipartHeaders(),
        }),

        // Create all contracts
        ...contractsData.map(contract =>
          axios.post(`${API_BASE_URL}/contracts/`, createFormData({
            ...contract,
            driver_id: driverId,
          }, ['file']), {
            headers: getMultipartHeaders(),
          })
        ),
      ];

      // Wait for all document creation requests to complete
      const responses = await Promise.allSettled(documentPromises);
      
      // Check for failed document creations and log details
      const failedDocuments = responses.filter(response => response.status === 'rejected');
      
      if (failedDocuments.length > 0) {
        console.error('Some documents failed to create:', failedDocuments);
        failedDocuments.forEach((failedDoc, index) => {
          if (failedDoc.status === 'rejected') {
            console.error(`Document ${index} failed:`, failedDoc.reason.response?.data || failedDoc.reason.message);
          }
        });
        
        // For debugging, let's see what data we're sending
        console.log('License data being sent:', { ...licenseData, driver_id: driverId });
        console.log('National ID data being sent:', { ...nationalIdData, driver_id: driverId });
        console.log('Vehicle license data being sent:', { ...vehicleLicenseData, driver_id: driverId });
        contractsData.forEach((contract, index) => {
          console.log(`Contract ${index} data being sent:`, { ...contract, driver_id: driverId });
        });
      }

      return { driver, documentResults: responses };
    },
    onSuccess: () => {
      // Invalidate and refetch drivers list
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
    onError: (error: any) => {
      console.error('Add driver mutation failed:', error);
      console.error('Error response:', error.response?.data);
    },
  });

  return {
    addDriver: addDriverMutation.mutateAsync,
    addDriverMutation,
    isLoading: addDriverMutation.isPending,
    error: addDriverMutation.error,
    isError: addDriverMutation.isError,
    isSuccess: addDriverMutation.isSuccess,
    reset: addDriverMutation.reset,
  };
};