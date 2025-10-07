// hooks/useExportDrivers.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';
const AUTH_TOKEN = 'f1a83e3f53f4aa7afcecc8398e5d328512c4d387';

export interface ExportParams {
  company_code?: string;
  doc_status?: 'expired_docs' | 'missing_docs';
  search?: string;
}

export const useExportDrivers = () => {
  const exportDrivers = async (params: ExportParams = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/drivers/export/`, {
        params: params,
        headers: {
          'Authorization': `Token ${AUTH_TOKEN}`,
        },
        responseType: 'blob', // Important for file downloads
      });

      // Create a blob from the response
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'drivers_export.xlsx';
      
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