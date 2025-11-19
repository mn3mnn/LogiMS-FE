import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import config from '../config/env';
import { useAuth } from '../context/AuthContext';

interface UploadsStats {
  by_status: { status: string; count: number }[];
  by_type: { file_type: 'payments' | 'trips'; count: number }[];
  total: number;
}

const authHeaders = (token: string | null) => ({ Authorization: token ? `Token ${token}` : '' });

export function useUploadsStats(params?: Record<string, any>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['uploads-stats', params],
    enabled: !!token,
    queryFn: async (): Promise<UploadsStats> => {
      const { data } = await axios.get(`${config.API_BASE_URL}/v1/data-imports/stats/`, {
        headers: authHeaders(token),
        params,
      });
      return data;
    },
    staleTime: 60_000,
  });
}

export interface Summary {
  [k: string]: number | string | null;
}

export function usePaymentSummary(filters?: Record<string, any>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['payment-summary', filters],
    enabled: !!token,
    queryFn: async (): Promise<Summary> => {
      const { data } = await axios.get(`${config.API_BASE_URL}/v1/payment-records/summary/`, {
        headers: authHeaders(token),
        params: filters,
      });
      return data;
    },
    staleTime: 30_000,
  });
}

export function useTripSummary(filters?: Record<string, any>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['trip-summary', filters],
    enabled: !!token,
    queryFn: async (): Promise<Summary> => {
      const { data } = await axios.get(`${config.API_BASE_URL}/v1/trip-records/summary/`, {
        headers: authHeaders(token),
        params: filters,
      });
      return data;
    },
    staleTime: 30_000,
  });
}

export function useTripStats(filters?: Record<string, any>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['trip-stats', filters],
    enabled: !!token,
    queryFn: async (): Promise<any> => {
      const { data } = await axios.get(`${config.API_BASE_URL}/v1/trip-records/stats/`, {
        headers: authHeaders(token),
        params: filters,
      });
      return data;
    },
    staleTime: 60_000,
  });
}

export function usePaymentStats(filters?: Record<string, any>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['payment-stats', filters],
    enabled: !!token,
    queryFn: async (): Promise<any> => {
      const { data } = await axios.get(`${config.API_BASE_URL}/v1/payment-records/stats/`, {
        headers: authHeaders(token),
        params: filters,
      });
      return data;
    },
    staleTime: 60_000,
  });
}

export function usePaymentTimeseries(filters?: Record<string, any>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['payment-timeseries', filters],
    enabled: !!token,
    queryFn: async (): Promise<any[]> => {
      const { data } = await axios.get(`${config.API_BASE_URL}/v1/payment-records/timeseries/`, {
        headers: authHeaders(token),
        params: filters,
      });
      return data;
    },
    staleTime: 60_000,
  });
}

export function useTripTimeseries(filters?: Record<string, any>) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['trip-timeseries', filters],
    enabled: !!token,
    queryFn: async (): Promise<any[]> => {
      const { data } = await axios.get(`${config.API_BASE_URL}/v1/trip-records/timeseries/`, {
        headers: authHeaders(token),
        params: filters,
      });
      return data;
    },
    staleTime: 60_000,
  });
}


