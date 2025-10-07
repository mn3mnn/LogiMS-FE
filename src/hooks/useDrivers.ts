// hooks/useDrivers.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Import the auth hook

const API_BASE_URL = 'http://localhost:8000/api/v1';
// REMOVED: const AUTH_TOKEN = 'f1a83e3f53f4aa7afcecc8398e5d328512c4d387';

export interface Driver {
  id: number;
  first_name: string;
  last_name: string;
  nid: string;
  uuid: string;
  phone_number: string;
  is_active: boolean;
  company_code: string;
  company_name: string;
  created_at: string;
  updated_at: string;
  license?: any;
  vehicle_license?: any;
  national_id_doc?: any;
  contracts?: any[];
}

interface DriversResponse {
  results: Driver[];
  count: number;
  next: string | null;
  previous: string | null;
}

const fetchDrivers = async (
  token: string, // Add token as parameter
  companyFilter: string = "All", 
  page: number = 1, 
  driverStatusFilter: string = "all",
  docStatusFilter: string = "all"
): Promise<DriversResponse> => {
  const params: any = {
    page: page,
    page_size: 10
  };

  // Add company filter
  if (companyFilter !== "All") {
    params.company_code = companyFilter;
  }

  // Add driver status filter
  if (driverStatusFilter !== "all") {
    params.is_active = driverStatusFilter === "active";
  }

  // Add document status filter
  if (docStatusFilter !== "all") {
    params.doc_status = docStatusFilter;
  }

  const response = await axios.get(`${API_BASE_URL}/drivers/`, {
    headers: {
      'Authorization': `Token ${token}`, // Use dynamic token
    },
    params: params
  });
  return response.data;
};

export const useDrivers = (
  companyFilter: string = "All", 
  page: number = 1, 
  refreshKey: number = 0,
  driverStatusFilter: string = "all",
  docStatusFilter: string = "all"
) => {
  const { token } = useAuth(); // Get token from auth context

  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ['drivers', companyFilter, page, refreshKey, driverStatusFilter, docStatusFilter],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available');
      }
      return fetchDrivers(token, companyFilter, page, driverStatusFilter, docStatusFilter);
    },
    enabled: !!token, // Only run query if token exists
  });

  return {
    data,
    isLoading,
    error,
    isFetching,
    refetch,
  };
};