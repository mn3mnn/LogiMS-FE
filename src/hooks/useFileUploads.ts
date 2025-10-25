import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import config from '../config/env';

export interface FileUploadListItem {
  id: number;
  company: number;
  company_name: string;
  file_type: 'payments' | 'trips';
  file_type_display: string;
  file_name: string | null;
  file_url?: string | null;
  from_date: string; // YYYY-MM-DD
  to_date: string;   // YYYY-MM-DD
  status: 'pending' | 'processing' | 'completed' | 'failed';
  status_display: string;
  processed_records_count: number;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface FileUploadsFilters {
  page?: number;
  pageSize?: number;
  companyCode?: string | 'All';
  search?: string;
  fromDate?: string; // YYYY-MM-DD
  toDate?: string;   // YYYY-MM-DD
  fileType?: 'payments' | 'trips';
  status?: 'pending' | 'processing' | 'completed' | 'failed';
}

const buildAuthHeaders = (token: string | null) => ({
  Authorization: token ? `Token ${token}` : '',
  accept: 'application/json',
});

export const useFileUploads = (filters: FileUploadsFilters) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['file-uploads', filters],
    enabled: !!token,
    queryFn: async (): Promise<PaginatedResponse<FileUploadListItem>> => {
      const params: Record<string, any> = {
        page: filters.page ?? 1,
        page_size: filters.pageSize ?? 10,
        ordering: '-created_at',
      };

      if (filters.search) params.search = filters.search;
      if (filters.companyCode && filters.companyCode !== 'All') params.company_code = filters.companyCode;
      if (filters.fileType) params.file_type = filters.fileType;
      if (filters.status) params.status = filters.status;

      // Server-side date range
      if (filters.fromDate) params.from_date = filters.fromDate;
      if (filters.toDate) params.to_date = filters.toDate;

      const { data } = await axios.get<PaginatedResponse<FileUploadListItem>>(
        `${config.API_BASE_URL}/v1/data-imports/`,
        { headers: buildAuthHeaders(token), params }
      );
      return data;
    },
  });
};

export interface CreateFileUploadInput {
  company: number; // company id
  file: File;
  from_date: string; // YYYY-MM-DD
  to_date: string;   // YYYY-MM-DD
  file_type?: 'payments' | 'trips';
}

export const useCreateFileUpload = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateFileUploadInput) => {
      const formData = new FormData();
      formData.append('company', String(payload.company));
      formData.append('file_type', payload.file_type ?? 'payments');
      formData.append('file', payload.file);
      formData.append('from_date', payload.from_date);
      formData.append('to_date', payload.to_date);

      const { data } = await axios.post(
        `${config.API_BASE_URL}/v1/data-imports/`,
        formData,
        {
          headers: {
            ...buildAuthHeaders(token),
          },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['file-uploads'] });
    },
  });
};

export const useDeleteFileUpload = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`${config.API_BASE_URL}/v1/data-imports/${id}/`, {
        headers: buildAuthHeaders(token),
      });
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['file-uploads'] });
    },
  });
};


