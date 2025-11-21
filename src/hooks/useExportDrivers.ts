// hooks/useExportDrivers.ts
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import config from '../config/env';



export interface ExportParams {
  company_code?: string;
  doc_status?: 'expired_docs' | 'missing_docs';
  search?: string;
}

export const useExportDrivers = () => {
  const { token } = useAuth();

  const exportDrivers = async (params: ExportParams = {}) => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    try {
      const response = await axios.get(`${config.API_BASE_URL}/v1/drivers/export/`, {
        params: params,
        headers: {
          'Authorization': `Token ${token}`,
        },
        responseType: 'blob', // Important for file downloads
      });

      // Create a blob from the response
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'text/csv'
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'] || '';
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
      const filename = filenameMatch?.[1] || `drivers_export_${new Date().toISOString().split('T')[0]}.csv`;

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, filename };
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  };

  return { exportDrivers };
};