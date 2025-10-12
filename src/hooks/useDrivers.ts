// hooks/useDrivers.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8000/api/v1';

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
  token: string,
  companyFilter: string = "All", 
  page: number = 1, 
  docStatusFilter: string = "all",
  searchTerm: string = ""
): Promise<DriversResponse> => {
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

  const response = await axios.get(`${API_BASE_URL}/drivers/`, {
    headers: {
      'Authorization': `Token ${token}`,
    },
    params: params
  });
  return response.data;
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