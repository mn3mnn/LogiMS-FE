// components/AddDriverModal.tsx
import { useState, useEffect, useRef } from 'react';
import { useAddDriver, DriverData, LicenseData, NationalIdData, VehicleLicenseData, ContractData } from '../../hooks/useAddDriver';
import { useCompanies } from '../../hooks/useCompanies';
import { useTranslation } from 'react-i18next';

interface AddDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Helper functions to create empty documents
const createEmptyContract = (): Omit<ContractData, 'driver_id'> => ({
  file: '',
  notes: '',
  issue_date: '',
  expiry_date: '',
  contract_number: ''
});

const createEmptyLicense = (): Omit<LicenseData, 'driver_id'> => ({
  file: '',
  notes: '',
  issue_date: '',
  expiry_date: '',
  license_number: '',
  license_type: ''
});

const createEmptyNationalId = (): Omit<NationalIdData, 'driver_id'> => ({
  file: '',
  notes: '',
  issue_date: '',
  expiry_date: ''
});

const createEmptyVehicleLicense = (): Omit<VehicleLicenseData, 'driver_id'> => ({
  file: '',
  notes: '',
  issue_date: '',
  expiry_date: '',
  license_number: '',
  license_plate: '',
  license_type: '',
  vehicle_type: ''
});

export default function AddDriverModal({ isOpen, onClose, onSuccess }: AddDriverModalProps) {
  const { t } = useTranslation();
  const { addDriver, isLoading, error, reset, isSuccess } = useAddDriver();
  const [validationError, setValidationError] = useState<string>('');
  const { companies, isLoading: companiesLoading, error: companiesError } = useCompanies();

  
  // Form state
  const [driverData, setDriverData] = useState<DriverData>({
    first_name: '',
    last_name: '',
    nid: '',
    uuid: '',
    phone_number: '',
    email: '',
    reports_to: '',
    is_active: true,
    company_code: 'talabat',
    agency_share: null,
    insurance: null,
  });

  const [licenseData, setLicenseData] = useState<Omit<LicenseData, 'driver_id'>>(createEmptyLicense());
  const [nationalIdData, setNationalIdData] = useState<Omit<NationalIdData, 'driver_id'>>(createEmptyNationalId());
  const [vehicleLicenseData, setVehicleLicenseData] = useState<Omit<VehicleLicenseData, 'driver_id'>>(createEmptyVehicleLicense());
  const [contractsData, setContractsData] = useState<Omit<ContractData, 'driver_id'>[]>([createEmptyContract()]);

  // Ref to track if we've already handled success to prevent infinite loops
  const hasHandledSuccessRef = useRef(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetForm();
      reset();
      hasHandledSuccessRef.current = false; // Reset the flag when modal opens
    }
  }, [isOpen, reset]);

  // Handle success - only run once per success state
  useEffect(() => {
    if (isSuccess && !hasHandledSuccessRef.current) {
      hasHandledSuccessRef.current = true; // Mark as handled immediately
      console.log("✅ Driver added successfully, closing modal...");
      
      // Use setTimeout to avoid any timing issues with React's lifecycle
      const timer = setTimeout(() => {
        // Safe calls with optional chaining
        onSuccess?.();
        onClose();
        resetForm();
        reset(); // Reset mutation state after handling success
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isSuccess]); // Remove onSuccess and onClose from dependencies to prevent loop

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, []);

  const resetForm = () => {
    setDriverData({
      first_name: '',
      last_name: '',
      nid: '',
      uuid: '',
      phone_number: '',
      email: '',
      reports_to: '',
      is_active: true,
      company_code: 'talabat',
      agency_share: null,
      insurance: null,
    });
    setLicenseData(createEmptyLicense());
    setNationalIdData(createEmptyNationalId());
    setVehicleLicenseData(createEmptyVehicleLicense());
    setContractsData([createEmptyContract()]);
    setValidationError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Clear old validation errors
    setValidationError("");
  
    // ✅ Validate required fields
    if (
      !driverData.first_name.trim() ||
      !driverData.last_name.trim() ||
      !driverData.phone_number.trim()
    ) {
      setValidationError(t('addDriver.validation.requiredFields'));
      return;
    }
  
    // No license required at creation (backend allows creating driver without docs)
  
    try {
      // Convert empty strings to null for optional fields to avoid unique constraint violations
      const sanitizedDriverData = {
        ...driverData,
        nid: driverData.nid?.trim() || null,
        uuid: driverData.uuid?.trim() || null,
        email: driverData.email?.trim() || null,
        reports_to: driverData.reports_to?.trim() || null,
      };

      // ✅ Trigger the API call safely
      await addDriver({
        driverData: sanitizedDriverData,
        licenseData,
        nationalIdData,
        vehicleLicenseData,
        contractsData,
      });
  
    } catch (err) {
      console.error("❌ Failed to add driver:", err);
      setValidationError(t('addDriver.validation.submitError'));
    }
  };
  

  // Handler for driver data changes
  const handleDriverChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'agency_share' || name === 'insurance') {
      // Handle numeric fields - convert to number or null
      const numValue = value === '' ? null : Number(value);
      setDriverData(prev => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      setDriverData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    }
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
            {t('addDriver.title')}
          </h2>
          
          {(error || validationError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {validationError || (error as any)?.message || t('addDriver.validation.defaultError')}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2">
                {t('addDriver.sections.basicInfo')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('addDriver.fields.firstName')} <span className="text-red-500">*</span>
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
                    {t('addDriver.fields.lastName')} <span className="text-red-500">*</span>
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
                    {t('addDriver.fields.nid')}
                  </label>
                  <input
                    type="text"
                    name="nid"
                    value={driverData.nid}
                    onChange={handleDriverChange}
                    placeholder={t('addDriver.placeholders.nid')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('addDriver.fields.phoneNumber')} <span className="text-red-500">*</span>
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
                    {t('addDriver.fields.email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={driverData.email}
                    onChange={handleDriverChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('addDriver.fields.reportsTo')}
                  </label>
                  <input
                    type="text"
                    name="reports_to"
                    value={driverData.reports_to || ''}
                    onChange={handleDriverChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('addDriver.fields.company')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="company_code"
                    value={driverData.company_code}
                    onChange={handleDriverChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                    disabled={isLoading}
                  >
                    {companiesLoading ? (
                      <option value="">{t('addDriver.loadingCompanies')}</option>
                    ) : companiesError ? (
                      <option value="">{t('addDriver.companiesError')}</option>
                    ) : (
                      <>
                        <option value="">{t('addDriver.selectCompany')}</option>
                        {companies
                          .filter(company => company.is_active)
                          .map((company) => (
                            <option key={company.code} value={company.code}>
                              {company.name}
                            </option>
                          ))
                        }
                      </>
                    )}
                  </select>
                  
                  {companiesLoading && (
                    <p className="text-xs text-gray-500 mt-1">{t('addDriver.loadingCompanies')}</p>
                  )}
                  {companiesError && (
                    <p className="text-xs text-red-500 mt-1">{t('addDriver.companiesError')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('addDriver.fields.agencyShare')}
                  </label>
                  <input
                    type="number"
                    name="agency_share"
                    value={driverData.agency_share === null ? '' : driverData.agency_share}
                    onChange={handleDriverChange}
                    min="0"
                    max="100"
                    step="0.001"
                    placeholder={t('addDriver.placeholders.agencyShare')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('addDriver.hints.agencyShare')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('addDriver.fields.insuranceAmount')}
                  </label>
                  <input
                    type="number"
                    name="insurance"
                    value={driverData.insurance === null ? '' : driverData.insurance}
                    onChange={handleDriverChange}
                    min="0"
                    step="0.01"
                    placeholder={t('addDriver.placeholders.insurance')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('addDriver.hints.insurance')}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('addDriver.fields.uuid')}
                  </label>
                  <input
                    type="text"
                    name="uuid"
                    value={driverData.uuid}
                    onChange={handleDriverChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={driverData.is_active}
                    onChange={handleDriverChange}
                    className="w-4 h-4 text-[#ffb433] bg-gray-100 border-gray-300 rounded focus:ring-[#ffb433] dark:focus:ring-[#ffb433] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('addDriver.fields.activeDriver')}
                  </label>
                </div>
              </div>
            </div>

            {/* Contracts Section */}
            <div className="mt-12 md:mt-16 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">
                  {t('addDriver.sections.contractInfo')}
                </h3>
                <button
                  type="button"
                  onClick={addContract}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  {t('addDriver.buttons.addContract')}
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
                      {t('addDriver.fields.contractNumber')}
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
                      {t('addDriver.fields.issueDate')}
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
                      {t('addDriver.fields.expiryDate')}
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
                      {t('addDriver.fields.notes')}
                    </label>
                    <textarea
                      value={contract.notes}
                      onChange={(e) => handleContractChange(index, 'notes', e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder={t('addDriver.placeholders.contractNotes')}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      {t('addDriver.fields.contractDocument')}
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('contracts', 'file', e.target.files?.[0] || null, index)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#fff6ed] file:text-[#cc8c29] hover:file:bg-[#ffead5] dark:file:bg-gray-600 dark:file:text-gray-300"
                    />
                    <p className="text-xs text-gray-500 mt-1">{t('addDriver.hints.contractDocument')}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* License Section */}
            <div className="mt-12 md:mt-16 mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2">
                {t('addDriver.sections.licenseInfo')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('addDriver.fields.licenseNumber')}
                  </label>
                  <input
                    type="text"
                    value={licenseData.license_number}
                    onChange={(e) => handleLicenseChange('license_number', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('addDriver.fields.licenseType')}
                  </label>
                  <select
                    value={licenseData.license_type}
                    onChange={(e) => handleLicenseChange('license_type', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">{t('addDriver.selectLicenseType')}</option>
                    <option value="standard">{t('addDriver.licenseTypes.standard')}</option>
                    <option value="commercial">{t('addDriver.licenseTypes.commercial')}</option>
                    <option value="motorcycle">{t('addDriver.licenseTypes.motorcycle')}</option>
                    <option value="heavy_vehicle">{t('addDriver.licenseTypes.heavyVehicle')}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('addDriver.fields.issueDate')}
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
                    {t('addDriver.fields.expiryDate')}
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
                    {t('addDriver.fields.licenseDocument')}
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('license', 'file', e.target.files?.[0] || null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#fff6ed] file:text-[#cc8c29] hover:file:bg-[#ffead5] dark:file:bg-gray-600 dark:file:text-gray-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('addDriver.hints.licenseDocument')}</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('addDriver.fields.notes')}
                  </label>
                  <textarea
                    value={licenseData.notes}
                    onChange={(e) => handleLicenseChange('notes', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={t('addDriver.placeholders.licenseNotes')}
                  />
                </div>
              </div>
            </div>

            {/* National ID Document Section */}
            <div className="mt-12 md:mt-16 mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2">
                {t('addDriver.sections.nationalId')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('addDriver.fields.issueDate')}
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
                    {t('addDriver.fields.expiryDate')}
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
                    {t('addDriver.fields.nationalIdDocument')}
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('nationalId', 'file', e.target.files?.[0] || null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#fff6ed] file:text-[#cc8c29] hover:file:bg-[#ffead5] dark:file:bg-gray-600 dark:file:text-gray-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('addDriver.hints.nationalIdDocument')}</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('addDriver.fields.notes')}
                  </label>
                  <textarea
                    value={nationalIdData.notes}
                    onChange={(e) => handleNationalIdChange('notes', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={t('addDriver.placeholders.nationalIdNotes')}
                  />
                </div>
              </div>
            </div>

            {/* Vehicle License Section */}
            <div className="mt-12 md:mt-16 mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2">
                {t('addDriver.sections.vehicleLicense')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('addDriver.fields.licenseNumber')}
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
                    {t('addDriver.fields.licensePlate')}
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
                    {t('addDriver.fields.licenseType')}
                  </label>
                  <select
                    value={vehicleLicenseData.license_type}
                    onChange={(e) => handleVehicleLicenseChange('license_type', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">{t('addDriver.selectLicenseType')}</option>
                    <option value="commercial">{t('addDriver.licenseTypes.commercial')}</option>
                    <option value="private">{t('addDriver.licenseTypes.private')}</option>
                    <option value="motorcycle">{t('addDriver.licenseTypes.motorcycle')}</option>
                    <option value="heavy_vehicle">{t('addDriver.licenseTypes.heavyVehicle')}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('addDriver.fields.vehicleType')}
                  </label>
                  <select
                    value={vehicleLicenseData.vehicle_type}
                    onChange={(e) => handleVehicleLicenseChange('vehicle_type', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">{t('addDriver.selectVehicleType')}</option>
                    <option value="motorcycle">{t('addDriver.vehicleTypes.motorcycle')}</option>
                    <option value="car">{t('addDriver.vehicleTypes.car')}</option>
                    <option value="van">{t('addDriver.vehicleTypes.van')}</option>
                    <option value="truck">{t('addDriver.vehicleTypes.truck')}</option>
                    <option value="bicycle">{t('addDriver.vehicleTypes.bicycle')}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('addDriver.fields.issueDate')}
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
                    {t('addDriver.fields.expiryDate')}
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
                    {t('addDriver.fields.vehicleLicenseDocument')}
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('vehicleLicense', 'file', e.target.files?.[0] || null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#fff6ed] file:text-[#cc8c29] hover:file:bg-[#ffead5] dark:file:bg-gray-600 dark:file:text-gray-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('addDriver.hints.vehicleLicenseDocument')}</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('addDriver.fields.notes')}
                  </label>
                  <textarea
                    value={vehicleLicenseData.notes}
                    onChange={(e) => handleVehicleLicenseChange('notes', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={t('addDriver.placeholders.vehicleLicenseNotes')}
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
                {t('addDriver.buttons.cancel')}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-[#ffb433] text-white rounded-lg hover:bg-[#e6a02e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('addDriver.buttons.creatingDriver')}
                  </>
                ) : (
                  t('addDriver.buttons.addDriver')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}