const config = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
  };
  
  export default config;