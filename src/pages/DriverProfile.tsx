import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from "react-router"; // Use react-router, not react-router-dom
import axios from 'axios';

interface Driver {
  id: number;
  first_name: string;
  last_name: string;
  uuid: string;
  phone_number: string;
  is_active: boolean;
  company_code: string;
  company_name?: string;
  contracts: any[];
  license: any;
  national_id_doc: any;
  vehicle_license: any;
}

const DriverProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDriver = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get(`http://localhost:8000/api/v1/drivers/${id}/`, {
          headers: {
            Authorization: "Token f1a83e3f53f4aa7afcecc8398e5d328512c4d387",
            accept: 'application/json'
          },
        });
        
        setDriver(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load driver profile');
        console.error('Error fetching driver:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDriver();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading driver profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Error: {error}</div>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-600 text-lg mb-4">Driver not found</div>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link 
            to="/basic-tables" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Drivers
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Driver Profile
          </h1>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          driver.is_active 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {driver.is_active ? 'Active' : 'Inactive'}
        </div>
      </div>

      {/* Driver Information Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  First Name
                </label>
                <p className="text-gray-800 dark:text-white">{driver.first_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Last Name
                </label>
                <p className="text-gray-800 dark:text-white">{driver.last_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Phone Number
                </label>
                <p className="text-gray-800 dark:text-white">{driver.phone_number}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Company
                </label>
                <p className="text-gray-800 dark:text-white capitalize">
                  {driver.company_name || driver.company_code}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  UUID
                </label>
                <p className="text-gray-800 dark:text-white font-mono text-sm">{driver.uuid}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Driver ID
                </label>
                <p className="text-gray-800 dark:text-white">{driver.id}</p>
              </div>
            </div>
          </div>

          {/* Documents Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2">
              Documents Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="font-medium text-gray-800 dark:text-white mb-2">National ID</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  driver.national_id_doc 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {driver.national_id_doc ? 'Uploaded' : 'Not Uploaded'}
                </span>
              </div>
              
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="font-medium text-gray-800 dark:text-white mb-2">License</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  driver.license 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {driver.license ? 'Uploaded' : 'Not Uploaded'}
                </span>
              </div>
              
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="font-medium text-gray-800 dark:text-white mb-2">Vehicle License</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  driver.vehicle_license 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {driver.vehicle_license ? 'Uploaded' : 'Not Uploaded'}
                </span>
              </div>
              
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="font-medium text-gray-800 dark:text-white mb-2">Contracts</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  driver.contracts && driver.contracts.length > 0
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {driver.contracts && driver.contracts.length > 0 ? 'Uploaded' : 'Not Uploaded'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;