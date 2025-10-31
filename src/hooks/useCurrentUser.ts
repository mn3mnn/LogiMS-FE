import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import config from '../config/env';

export interface CurrentUser {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

const fetchCurrentUser = async (token: string): Promise<CurrentUser> => {
  const { data } = await axios.get<CurrentUser>(`${config.API_BASE_URL}/v1/users/me/`, {
    headers: {
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  return data;
};

export const useCurrentUser = () => {
  const { token, isLoading: authLoading } = useAuth();

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available');
      }
      return fetchCurrentUser(token);
    },
    enabled: !!token && !authLoading,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    user: data,
    isLoading: isLoading || authLoading,
    error,
    isFetching,
  };
};

