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
      const contentDisposition = response.headers['content-disposition'] || 
                                  response.headers['Content-Disposition'] || 
                                  '';
      let filename = 'drivers_export.csv';
      
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=([^;\n]*)/i);
        if (match && match[1]) {
          let extracted = match[1].trim();
          // Remove surrounding quotes if present
          extracted = extracted.replace(/^["']|["']$/g, '');
          // Clean up any trailing underscores, spaces, or other invalid characters
          extracted = extracted.replace(/[_\s]+$/g, '');
          // Ensure it ends with .csv
          if (extracted && extracted.endsWith('.csv')) {
            filename = extracted;
          }
        }
      }
      
      // Fallback: generate filename with current date if extraction failed
      if (filename === 'drivers_export.csv') {
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        filename = `drivers_export_${date}.csv`;
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