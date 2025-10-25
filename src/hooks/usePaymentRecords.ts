import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import config from '../config/env';

export interface PaymentRecordItem {
  id: number;
  file_upload: number;
  company_name: string;
  driver_uuid: string;
  driver_name: string;
  driver_first_name: string;
  driver_last_name: string;
  total_revenue: string | null;
  tax_deduction: string | null;
  agency_share_deduction: string | null;
  insurance_deduction: string | null;
  total_deductions: string | null;
  final_net_earnings: string | null;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface PaymentRecordsFilters {
  page?: number;
  pageSize?: number;
  companyCode?: string | 'All';
  search?: string; // driver name/uuid
  fromDate?: string; // YYYY-MM-DD
  toDate?: string;   // YYYY-MM-DD
}

const buildAuthHeaders = (token: string | null) => ({
  Authorization: token ? `Token ${token}` : '',
  accept: 'application/json',
});

export const usePaymentRecords = (filters: PaymentRecordsFilters) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['payment-records', filters],
    enabled: !!token,
    queryFn: async (): Promise<PaginatedResponse<PaymentRecordItem>> => {
      const params: Record<string, any> = {
        page: filters.page ?? 1,
        page_size: filters.pageSize ?? 10,
        ordering: '-created_at',
      };

      if (filters.companyCode && filters.companyCode !== 'All') {
        params['company_code'] = filters.companyCode; // mapped in filterset
      }
      if (filters.search) params.search = filters.search;
      if (filters.fromDate) params.from_date = filters.fromDate;
      if (filters.toDate) params.to_date = filters.toDate;

      const { data } = await axios.get<PaginatedResponse<PaymentRecordItem>>(
        `${config.API_BASE_URL}/v1/payment-records/`,
        { headers: buildAuthHeaders(token), params }
      );

      // Client-side date filtering using FileUpload's from/to via created_at fallback
      const { fromDate, toDate } = filters;
      if (fromDate || toDate) {
        const fromTs = fromDate ? Date.parse(fromDate) : Number.NEGATIVE_INFINITY;
        const toTs = toDate ? Date.parse(toDate) : Number.POSITIVE_INFINITY;

        const filtered = (data.results || []).filter((item) => {
          const createdTs = Date.parse(item.created_at);
          return createdTs >= fromTs && createdTs <= toTs;
        });
        return { ...data, results: filtered };
      }

      return data;
    },
  });
};


