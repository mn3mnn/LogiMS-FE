// components/AddDriverModal.tsx
import { useState, useEffect } from 'react';
import { useAddDriver, DriverData, LicenseData, NationalIdData, VehicleLicenseData, ContractData } from '../../hooks/useAddDriver';

interface AddDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Helper functions to create empty documents
const createEmptyContract = (): Omit<ContractData, 'driver_id'> => ({
  file: '',
  notes: '',
  issue_date: new Date().toISOString().split('T')[0],
  expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  contract_number: `CONTRACT-${Date.now()}`
});

const createEmptyLicense = (): Omit<LicenseData, 'driver_id'> => ({
  file: '',
  notes: '',
  issue_date: new Date().toISOString().split('T')[0],
  expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  license_number: `LICENSE-${Date.now()}`,
  license_type: 'standard'
});

const createEmptyNationalId = (): Omit<NationalIdData, 'driver_id'> => ({
  file: '',
  notes: '',
  issue_date: new Date().toISOString().split('T')[0],
  expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
});

const createEmptyVehicleLicense = (): Omit<VehicleLicenseData, 'driver_id'> => ({
  file: '',
  notes: '',
  issue_date: new Date().toISOString().split('T')[0],
  expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  license_number: `VEHICLE-${Date.now()}`,
  license_plate: 'ABC-123',
  license_type: 'commercial',
  vehicle_type: 'motorcycle'
});

export default function AddDriverModal({ isOpen, onClose, onSuccess }: AddDriverModalProps) {
  const { addDriver, isLoading, error, reset, isSuccess } = useAddDriver();
  const [validationError, setValidationError] = useState<string>('');
  
  // Form state
  const [driverData, setDriverData] = useState<DriverData>({
    first_name: '',
    last_name: '',
    nid: '',
    uuid: '',
    phone_number: '',
    is_active: true,
    company_code: 'talabat',
  });

  const [licenseData, setLicenseData] = useState<Omit<LicenseData, 'driver_id'>>(createEmptyLicense());
  const [nationalIdData, setNationalIdData] = useState<Omit<NationalIdData, 'driver_id'>>(createEmptyNationalId());
  const [vehicleLicenseData, setVehicleLicenseData] = useState<Omit<VehicleLicenseData, 'driver_id'>>(createEmptyVehicleLicense());
  const [contractsData, setContractsData] = useState<Omit<ContractData, 'driver_id'>[]>([createEmptyContract()]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetForm();
      reset();
    }
  }, [isOpen]);

  // Handle success
  useEffect(() => {
    if (isSuccess) {
      onSuccess();
      onClose();
      resetForm();
    }
  }, [isSuccess, onSuccess, onClose]);

  const resetForm = () => {
    setDriverData({
      first_name: '',
      last_name: '',
      nid: '',
      uuid: '',
      phone_number: '',
      is_active: true,
      company_code: 'talabat',
    });
    setLicenseData(createEmptyLicense());
    setNationalIdData(createEmptyNationalId());
    setVehicleLicenseData(createEmptyVehicleLicense());
    setContractsData([createEmptyContract()]);
    setValidationError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!driverData.first_name.trim() || !driverData.last_name.trim() || !driverData.phone_number.trim()) {
      setValidationError('First name, last name, and phone number are required');
      return;
    }

    if (!licenseData.license_number || !licenseData.license_type) {
      setValidationError('License number and type are required');
      return;
    }

    try {
      await addDriver({
        driverData,
        licenseData,
        nationalIdData,
        vehicleLicenseData,
        contractsData,
      });
    } catch (err) {
      console.error('Failed to add driver:', err);
    }
  };

  // Handler for driver data changes
  const handleDriverChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setDriverData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Handler for license data changes
  const handleLicenseChange = (field: string, value: string) => {
    setLicenseData(prev => ({ ...prev, [field]: value }));
  };

  // Handler for national ID data changes
  const handleNationalIdChange = (field: string, value: string) => {
    setNationalIdData(prev => ({ ...prev, [field]: value }));
  };

  // Handler for vehicle license data changes
  const handleVehicleLicenseChange = (field: string, value: string) => {
    setVehicleLicenseData(prev => ({ ...prev, [field]: value }));
  };

  // Handler for contract changes
  const handleContractChange = (index: number, field: string, value: string) => {
    setContractsData(prev => 
      prev.map((contract, i) => 
        i === index ? { ...contract, [field]: value } : contract
      )
    );
  };

  // Handler for file uploads
  const handleFileChange = (section: 'license' | 'nationalId' | 'vehicleLicense' | 'contracts', field: string, file: File | null, contractIndex?: number) => {
    if (section === 'license') {
      setLicenseData(prev => ({ ...prev, [field]: file || '' }));
    } else if (section === 'nationalId') {
      setNationalIdData(prev => ({ ...prev, [field]: file || '' }));
    } else if (section === 'vehicleLicense') {
      setVehicleLicenseData(prev => ({ ...prev, [field]: file || '' }));
    } else if (section === 'contracts' && contractIndex !== undefined) {
      setContractsData(prev => 
        prev.map((contract, i) => 
          i === contractIndex ? { ...contract, [field]: file || '' } : contract
        )
      );
    }
  };

  // Add new contract
  const addContract = () => {
    setContractsData(prev => [...prev, createEmptyContract()]);
  };

  // Remove contract
  const removeContract = (index: number) => {
    if (contractsData.length > 1) {
      setContractsData(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      setValidationError('');
      onClose();
    }
  };

  // Handle ESC key and background click
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isLoading]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed h-full w-full inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100000] p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[95vh] overflow-y-auto transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
            Add New Driver
          </h2>
          
          {(error || validationError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {validationError || (error as any)?.message || 'Failed to add driver'}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={driverData.first_name}
                    onChange={handleDriverChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={driverData.last_name}
                    onChange={handleDriverChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    National ID (NID)
                  </label>
                  <input
                    type="text"
                    name="nid"
                    value={driverData.nid}
                    onChange={handleDriverChange}
                    placeholder="Enter national ID number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={driverData.phone_number}
                    onChange={handleDriverChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Company
                  </label>
                  <select
                    name="company_code"
                    value={driverData.company_code}
                    onChange={handleDriverChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="talabat">Talabat</option>
                    <option value="uber_eats">Uber Eats</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    UUID
                  </label>
                  <input
                    type="text"
                    name="uuid"
                    value={driverData.uuid}
                    onChange={handleDriverChange}
                    placeholder="Leave empty for auto-generation"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={driverData.is_active}
                    onChange={handleDriverChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active Driver
                  </label>
                </div>
              </div>
            </div>

            {/* Contracts Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">
                  Contract Information
                </h3>
                <button
                  type="button"
                  onClick={addContract}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Add Contract
                </button>
              </div>
              
              {contractsData.map((contract, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border rounded-lg relative">
                  {contractsData.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContract(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Contract Number
                    </label>
                    <input
                      type="text"
                      value={contract.contract_number}
                      onChange={(e) => handleContractChange(index, 'contract_number', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      value={contract.issue_date}
                      onChange={(e) => handleContractChange(index, 'issue_date', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={contract.expiry_date}
                      onChange={(e) => handleContractChange(index, 'expiry_date', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Notes
                    </label>
                    <textarea
                      value={contract.notes}
                      onChange={(e) => handleContractChange(index, 'notes', e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Additional contract notes..."
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Contract Document
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('contracts', 'file', e.target.files?.[0] || null, index)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-gray-300"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload contract document (PDF, JPG, PNG)</p>
                  </div>
                </div>
              ))}
            </div>

            {/* License Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2">
                Driver License Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    License Number *
                  </label>
                  <input
                    type="text"
                    value={licenseData.license_number}
                    onChange={(e) => handleLicenseChange('license_number', e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    License Type *
                  </label>
                  <select
                    value={licenseData.license_type}
                    onChange={(e) => handleLicenseChange('license_type', e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select License Type</option>
                    <option value="standard">Standard</option>
                    <option value="commercial">Commercial</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="heavy_vehicle">Heavy Vehicle</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={licenseData.issue_date}
                    onChange={(e) => handleLicenseChange('issue_date', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={licenseData.expiry_date}
                    onChange={(e) => handleLicenseChange('expiry_date', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    License Document
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('license', 'file', e.target.files?.[0] || null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-gray-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload driver license document (PDF, JPG, PNG)</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    License Notes
                  </label>
                  <textarea
                    value={licenseData.notes}
                    onChange={(e) => handleLicenseChange('notes', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Additional license notes..."
                  />
                </div>
              </div>
            </div>

            {/* National ID Document Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2">
                National ID Document
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={nationalIdData.issue_date}
                    onChange={(e) => handleNationalIdChange('issue_date', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={nationalIdData.expiry_date}
                    onChange={(e) => handleNationalIdChange('expiry_date', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    National ID Document
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('nationalId', 'file', e.target.files?.[0] || null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-gray-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload national ID document (PDF, JPG, PNG)</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    National ID Notes
                  </label>
                  <textarea
                    value={nationalIdData.notes}
                    onChange={(e) => handleNationalIdChange('notes', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Additional national ID notes..."
                  />
                </div>
              </div>
            </div>

            {/* Vehicle License Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2">
                Vehicle License Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    License Number
                  </label>
                  <input
                    type="text"
                    value={vehicleLicenseData.license_number}
                    onChange={(e) => handleVehicleLicenseChange('license_number', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    License Plate
                  </label>
                  <input
                    type="text"
                    value={vehicleLicenseData.license_plate}
                    onChange={(e) => handleVehicleLicenseChange('license_plate', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="ABC-123"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    License Type
                  </label>
                  <select
                    value={vehicleLicenseData.license_type}
                    onChange={(e) => handleVehicleLicenseChange('license_type', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select License Type</option>
                    <option value="commercial">Commercial</option>
                    <option value="private">Private</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="heavy_vehicle">Heavy Vehicle</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Vehicle Type
                  </label>
                  <select
                    value={vehicleLicenseData.vehicle_type}
                    onChange={(e) => handleVehicleLicenseChange('vehicle_type', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select Vehicle Type</option>
                    <option value="motorcycle">Motorcycle</option>
                    <option value="car">Car</option>
                    <option value="van">Van</option>
                    <option value="truck">Truck</option>
                    <option value="bicycle">Bicycle</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={vehicleLicenseData.issue_date}
                    onChange={(e) => handleVehicleLicenseChange('issue_date', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={vehicleLicenseData.expiry_date}
                    onChange={(e) => handleVehicleLicenseChange('expiry_date', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Vehicle License Document
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('vehicleLicense', 'file', e.target.files?.[0] || null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-gray-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload vehicle license document (PDF, JPG, PNG)</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Vehicle License Notes
                  </label>
                  <textarea
                    value={vehicleLicenseData.notes}
                    onChange={(e) => handleVehicleLicenseChange('notes', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Additional vehicle license notes..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Driver...
                  </>
                ) : (
                  'Add Driver'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}