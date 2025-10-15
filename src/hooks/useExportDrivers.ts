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
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'drivers_export.csv';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

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