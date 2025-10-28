// hooks/useDrivers.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import config from '../config/env';


export interface Driver {
  id: number;
  first_name: string;
  last_name: string;
  nid: string;
  uuid: string;
  phone_number: string;
  email: string;
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
  token: string,
  companyFilter: string = "All", 
  page: number = 1, 
  docStatusFilter: string = "all",
  searchTerm: string = ""
): Promise<DriversResponse> => {
  try {
    const params: any = {
      page: page,
      page_size: 10
    };

    // Add company filter
    if (companyFilter !== "All") {
      params.company_code = companyFilter;
    }

    // Add document status filter
    if (docStatusFilter !== "all") {
      params.doc_status = docStatusFilter;
    }

    // Add search term if provided
    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }

    console.log('Making API request to:', `${config.API_BASE_URL}/v1/drivers/`);
    console.log('With params:', params);
    console.log('With token:', token ? 'Token present' : 'No token');

    const response = await axios.get(`${config.API_BASE_URL}/v1/drivers/`, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      params: params,
      timeout: 10000,
    });

    console.log('API Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('API Error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch drivers');
  }
};

export const useDrivers = (
  companyFilter: string = "All", 
  page: number = 1, 
  refreshKey: number = 0,
  docStatusFilter: string = "all",
  searchTerm: string = ""
) => {
  const { token, isLoading: authLoading } = useAuth();

  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ['drivers', companyFilter, page, refreshKey, docStatusFilter, searchTerm],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available');
      }
      return fetchDrivers(token, companyFilter, page, docStatusFilter, searchTerm);
    },
    enabled: !!token && !authLoading, // Wait for auth to finish loading
  });

  return {
    data,
    isLoading: isLoading || authLoading, // Combine loading states
    error,
    isFetching,
    refetch,
  };
};