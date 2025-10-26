import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import config from '../config/env';

export interface TripRecordItem {
  id: number;
  file_upload: number;
  company_name: string;
  trip_uuid: string;
  driver_id?: number | null;
  driver_uuid: string;
  driver_name: string;
  driver_first_name: string;
  driver_last_name: string;
  service_type?: string | null;
  order_time?: string | null;
  arrival_time?: string | null;
  pickup_address?: string | null;
  destination_address?: string | null;
  trip_distance?: string | null;
  trip_status?: string | null;
  fare_amount?: string | null;
  trip_duration_minutes?: number | null;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface TripRecordsFilters {
  page?: number;
  pageSize?: number;
  companyCode?: string | 'All';
  search?: string; // driver or trip uuid
  fromDate?: string; // YYYY-MM-DD
  toDate?: string;   // YYYY-MM-DD
  uploadId?: number;
}

const buildAuthHeaders = (token: string | null) => ({
  Authorization: token ? `Token ${token}` : '',
  accept: 'application/json',
});

export const useTripRecords = (filters: TripRecordsFilters) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['trip-records', filters],
    enabled: !!token,
    queryFn: async (): Promise<PaginatedResponse<TripRecordItem>> => {
      const params: Record<string, any> = {
        page: filters.page ?? 1,
        page_size: filters.pageSize ?? 10,
        ordering: '-created_at',
      };

      if (filters.companyCode && filters.companyCode !== 'All') params.company_code = filters.companyCode;
      if (filters.search) params.search = filters.search;
      if (filters.fromDate) params.from_date = filters.fromDate;
      if (filters.toDate) params.to_date = filters.toDate;
      if (filters.uploadId) params.file_upload = filters.uploadId;

      const { data } = await axios.get<PaginatedResponse<TripRecordItem>>(
        `${config.API_BASE_URL}/v1/trip-records/`,
        { headers: buildAuthHeaders(token), params }
      );
      return data;
    },
  });
};


