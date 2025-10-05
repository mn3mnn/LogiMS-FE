import { useState, useEffect } from 'react';
import { useEditDriver, EditDriverData, FormContract, FormLicense, FormNationalIdDoc, FormVehicleLicense } from '../../hooks/useEditDriver';

interface EditDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  driverId: number | null;
}

// Helper function to create empty documents with proper defaults
const createEmptyContract = (): FormContract => ({
  file: '',
  notes: '',
  issue_date: new Date().toISOString().split('T')[0], // Today's date as default
  expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
  contract_number: `CONTRACT-${Date.now()}`
});

const createEmptyLicense = (): FormLicense => ({
  file: '',
  notes: '',
  issue_date: new Date().toISOString().split('T')[0],
  expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  license_number: `LICENSE-${Date.now()}`,
  license_type: 'standard'
});

const createEmptyNationalIdDoc = (): FormNationalIdDoc => ({
  file: '',
  notes: '',
  issue_date: new Date().toISOString().split('T')[0],
  expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
});

const createEmptyVehicleLicense = (): FormVehicleLicense => ({
  file: '',
  notes: '',
  issue_date: new Date().toISOString().split('T')[0],
  expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  license_number: `VEHICLE-${Date.now()}`,
  license_plate: 'ABC-123',
  license_type: 'commercial',
  vehicle_type: 'motorcycle'
});

export default function EditDriverModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  driverId 
}: EditDriverModalProps) {
  const { getDriver, updateDriver, isLoading, error, resetError } = useEditDriver();
  const [validationError, setValidationError] = useState<string>('');
  
  const [formData, setFormData] = useState<EditDriverData>({
    first_name: '',
    last_name: '',
    nid: '', // Add NID field here
    uuid: '',
    phone_number: '',
    company_code: 'talabat',
    is_active: true,
    contracts: [createEmptyContract()],
    license: createEmptyLicense(),
    national_id_doc: createEmptyNationalIdDoc(),
    vehicle_license: createEmptyVehicleLicense(),
  });

  // Fetch driver data when modal opens
  useEffect(() => {
    if (isOpen && driverId) {
      resetError();
      fetchDriverData();
    }
  }, [isOpen, driverId]);

  const fetchDriverData = async () => {
    if (!driverId) return;
    
    try {
      const driver = await getDriver(driverId);
      
      // Fill in missing data with defaults
      setFormData({
        first_name: driver.first_name || '',
        last_name: driver.last_name || '',
        nid: driver.nid || '', // Add NID from API response
        uuid: driver.uuid || '',
        phone_number: driver.phone_number || '',
        company_code: driver.company_code || 'talabat',
        is_active: driver.is_active !== undefined ? driver.is_active : true,
        
        // Use existing data or create empty defaults
        contracts: driver.contracts && driver.contracts.length > 0 
          ? driver.contracts.map(contract => ({
              file: contract.file || '',
              notes: contract.notes || '',
              issue_date: contract.issue_date || new Date().toISOString().split('T')[0],
              expiry_date: contract.expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              contract_number: contract.contract_number || `CONTRACT-${Date.now()}`
            }))
          : [createEmptyContract()],
          
        license: driver.license ? {
          file: driver.license.file || '',
          notes: driver.license.notes || '',
          issue_date: driver.license.issue_date || new Date().toISOString().split('T')[0],
          expiry_date: driver.license.expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          license_number: driver.license.license_number || `LICENSE-${Date.now()}`,
          license_type: driver.license.license_type || 'standard'
        } : createEmptyLicense(),
        
        national_id_doc: driver.national_id_doc ? {
          file: driver.national_id_doc.file || '',
          notes: driver.national_id_doc.notes || '',
          issue_date: driver.national_id_doc.issue_date || new Date().toISOString().split('T')[0],
          expiry_date: driver.national_id_doc.expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        } : createEmptyNationalIdDoc(),
        
        vehicle_license: driver.vehicle_license ? {
          file: driver.vehicle_license.file || '',
          notes: driver.vehicle_license.notes || '',
          issue_date: driver.vehicle_license.issue_date || new Date().toISOString().split('T')[0],
          expiry_date: driver.vehicle_license.expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          license_number: driver.vehicle_license.license_number || `VEHICLE-${Date.now()}`,
          license_plate: driver.vehicle_license.license_plate || 'ABC-123',
          license_type: driver.vehicle_license.license_type || 'commercial',
          vehicle_type: driver.vehicle_license.vehicle_type || 'motorcycle'
        } : createEmptyVehicleLicense(),
      });
    } catch (err) {
      console.error('Failed to fetch driver data:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!driverId) return;
    
    try {
      // Validate required fields
      if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.phone_number.trim()) {
        setValidationError('First name, last name, and phone number are required');
        return;
      }

      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Add basic fields
      submitData.append('first_name', formData.first_name);
      submitData.append('last_name', formData.last_name);
      submitData.append('nid', formData.nid || ''); // Add NID to the request
      submitData.append('phone_number', formData.phone_number);
      submitData.append('company_code', formData.company_code);
      submitData.append('is_active', formData.is_active.toString());
      
      // Add contracts
      formData.contracts.forEach((contract, index) => {
        submitData.append(`contracts[${index}][contract_number]`, contract.contract_number || '');
        submitData.append(`contracts[${index}][notes]`, contract.notes || '');
        submitData.append(`contracts[${index}][issue_date]`, contract.issue_date || '');
        submitData.append(`contracts[${index}][expiry_date]`, contract.expiry_date || '');
        if (contract.file instanceof File) {
          submitData.append(`contracts[${index}][file]`, contract.file);
        }
      });
      
      // Add license
      if (formData.license) {
        submitData.append('license[license_number]', formData.license.license_number || '');
        submitData.append('license[license_type]', formData.license.license_type || '');
        submitData.append('license[notes]', formData.license.notes || '');
        submitData.append('license[issue_date]', formData.license.issue_date || '');
        submitData.append('license[expiry_date]', formData.license.expiry_date || '');
        if (formData.license.file instanceof File) {
          submitData.append('license[file]', formData.license.file);
        }
      }
      
      // Add national_id_doc
      if (formData.national_id_doc) {
        submitData.append('national_id_doc[notes]', formData.national_id_doc.notes || '');
        submitData.append('national_id_doc[issue_date]', formData.national_id_doc.issue_date || '');
        submitData.append('national_id_doc[expiry_date]', formData.national_id_doc.expiry_date || '');
        if (formData.national_id_doc.file instanceof File) {
          submitData.append('national_id_doc[file]', formData.national_id_doc.file);
        }
      }
      
      // Add vehicle_license
      if (formData.vehicle_license) {
        submitData.append('vehicle_license[license_number]', formData.vehicle_license.license_number || '');
        submitData.append('vehicle_license[license_plate]', formData.vehicle_license.license_plate || '');
        submitData.append('vehicle_license[license_type]', formData.vehicle_license.license_type || '');
        submitData.append('vehicle_license[vehicle_type]', formData.vehicle_license.vehicle_type || '');
        submitData.append('vehicle_license[notes]', formData.vehicle_license.notes || '');
        submitData.append('vehicle_license[issue_date]', formData.vehicle_license.issue_date || '');
        submitData.append('vehicle_license[expiry_date]', formData.vehicle_license.expiry_date || '');
        if (formData.vehicle_license.file instanceof File) {
          submitData.append('vehicle_license[file]', formData.vehicle_license.file);
        }
      }

      console.log('Submitting FormData:', submitData);
      // Log FormData contents for debugging
      for (let [key, value] of submitData.entries()) {
        console.log(`${key}:`, value);
      }
      
      await updateDriver(driverId, submitData);
      setValidationError('');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to update driver:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Handle nested object changes
  const handleNestedChange = (section: 'license' | 'national_id_doc' | 'vehicle_license', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Handle file uploads - store File objects directly
  const handleFileChange = (section: 'license' | 'national_id_doc' | 'vehicle_license' | 'contracts', field: string, file: File | null, contractIndex?: number) => {
    if (section === 'contracts' && contractIndex !== undefined) {
      setFormData(prev => ({
        ...prev,
        contracts: prev.contracts.map((contract, i) => 
          i === contractIndex ? { ...contract, [field]: file } : contract
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: file
        }
      }));
    }
  };

  // Handle contract changes (since it's an array)
  const handleContractChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contracts: prev.contracts.map((contract, i) => 
        i === index ? { ...contract, [field]: value } : contract
      )
    }));
  };

  const handleClose = () => {
    if (!isLoading) {
      resetError();
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100000] p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[95vh] overflow-y-auto transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
            Edit Driver
          </h2>
          
          {(error || validationError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error || validationError}
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
                    value={formData.first_name}
                    onChange={handleChange}
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
                    value={formData.last_name}
                    onChange={handleChange}
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
                    value={formData.nid}
                    onChange={handleChange}
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
                    value={formData.phone_number}
                    onChange={handleChange}
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
                    value={formData.company_code}
                    onChange={handleChange}
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
                    value={formData.uuid}
                    readOnly
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white bg-gray-100 dark:bg-gray-600"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
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
              <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2">
                Contract Information
              </h3>
              {formData.contracts.map((contract, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Contract Number
                    </label>
                    <input
                      type="text"
                      value={contract.contract_number || ''}
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
                      value={contract.issue_date || ''}
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
                      value={contract.expiry_date || ''}
                      onChange={(e) => handleContractChange(index, 'expiry_date', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Notes
                    </label>
                    <textarea
                      value={contract.notes || ''}
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
                    License Number
                  </label>
                  <input
                    type="text"
                    value={formData.license?.license_number || ''}
                    onChange={(e) => handleNestedChange('license', 'license_number', e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    License Type
                  </label>
                  <select
                    value={formData.license?.license_type || ''}
                    onChange={(e) => handleNestedChange('license', 'license_type', e.target.value)}
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
                    value={formData.license?.issue_date || ''}
                    onChange={(e) => handleNestedChange('license', 'issue_date', e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.license?.expiry_date || ''}
                    onChange={(e) => handleNestedChange('license', 'expiry_date', e.target.value)}
                    required
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
                    value={formData.license?.notes || ''}
                    onChange={(e) => handleNestedChange('license', 'notes', e.target.value)}
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
                    value={formData.national_id_doc?.issue_date || ''}
                    onChange={(e) => handleNestedChange('national_id_doc', 'issue_date', e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.national_id_doc?.expiry_date || ''}
                    onChange={(e) => handleNestedChange('national_id_doc', 'expiry_date', e.target.value)}
                    required
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
                    onChange={(e) => handleFileChange('national_id_doc', 'file', e.target.files?.[0] || null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-gray-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload national ID document (PDF, JPG, PNG)</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    National ID Notes
                  </label>
                  <textarea
                    value={formData.national_id_doc?.notes || ''}
                    onChange={(e) => handleNestedChange('national_id_doc', 'notes', e.target.value)}
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
                    value={formData.vehicle_license?.license_number || ''}
                    onChange={(e) => handleNestedChange('vehicle_license', 'license_number', e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    License Plate
                  </label>
                  <input
                    type="text"
                    value={formData.vehicle_license?.license_plate || ''}
                    onChange={(e) => handleNestedChange('vehicle_license', 'license_plate', e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="ABC-123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    License Type
                  </label>
                  <select
                    value={formData.vehicle_license?.license_type || ''}
                    onChange={(e) => handleNestedChange('vehicle_license', 'license_type', e.target.value)}
                    required
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
                    value={formData.vehicle_license?.vehicle_type || ''}
                    onChange={(e) => handleNestedChange('vehicle_license', 'vehicle_type', e.target.value)}
                    required
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
                    value={formData.vehicle_license?.issue_date || ''}
                    onChange={(e) => handleNestedChange('vehicle_license', 'issue_date', e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.vehicle_license?.expiry_date || ''}
                    onChange={(e) => handleNestedChange('vehicle_license', 'expiry_date', e.target.value)}
                    required
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
                    onChange={(e) => handleFileChange('vehicle_license', 'file', e.target.files?.[0] || null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-gray-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload vehicle license document (PDF, JPG, PNG)</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Vehicle License Notes
                  </label>
                  <textarea
                    value={formData.vehicle_license?.notes || ''}
                    onChange={(e) => handleNestedChange('vehicle_license', 'notes', e.target.value)}
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
                    Updating...
                  </>
                ) : (
                  'Update Driver'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}