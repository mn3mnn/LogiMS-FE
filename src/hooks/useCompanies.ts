// hooks/useCompanies.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export interface Company {
  id: number;
  code: string;
  name: string;
  is_active: boolean;
  logo: string | null;
  created_at: string;
  updated_at: string;
}

interface CompaniesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Company[];
}

const fetchCompanies = async (token: string): Promise<Company[]> => {
  const { data } = await axios.get<CompaniesResponse>('http://localhost:8000/api/v1/companies/', {
    headers: {
      Authorization: `Token ${token}`,
      accept: 'application/json'
    },
  });
  return data.results;
};

export const useCompanies = () => {
  const { token } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['companies'],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available');
      }
      return fetchCompanies(token);
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    companies: data || [],
    isLoading,
    error,
  };
};