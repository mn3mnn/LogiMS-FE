import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import config from '../config/env';

export interface CurrentUser {
  id: number;
  username: string;
  name?: string;
  email?: string;
  url?: string;
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
  const queryClient = useQueryClient();

  // Invalidate query cache when token changes or becomes null
  useEffect(() => {
    if (!token) {
      // Clear the cache when logged out
      queryClient.removeQueries({ queryKey: ['currentUser'] });
    }
  }, [token, queryClient]);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['currentUser', token], // Include token in query key so it refetches when token changes
    queryFn: () => {
      if (!token) {
        throw new Error('No authentication token available');
      }
      return fetchCurrentUser(token);
    },
    enabled: !!token && !authLoading,
    staleTime: 0, // Don't cache - always fetch fresh data when token changes
    refetchOnWindowFocus: false,
  });

  return {
    user: data,
    isLoading: isLoading || authLoading,
    error,
    isFetching,
  };
};

