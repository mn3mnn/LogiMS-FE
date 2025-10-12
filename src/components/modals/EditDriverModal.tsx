// components/EditDriverModal.tsx
import { useState, useEffect, useRef } from 'react';
import { DriverData, LicenseData, NationalIdData, VehicleLicenseData, ContractData } from '../../hooks/useAddDriver';
import { useCompanies } from '../../hooks/useCompanies';
import { useEditDriver } from '../../hooks/useEditDriver';

interface EditDriverModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    driverId?: number | null;
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
    license_number: '',
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
    license_number: '',
    license_plate: '',
    license_type: 'commercial',
    vehicle_type: 'motorcycle'
  });
  
  export default function EditDriverModal({ isOpen, onClose, onSuccess, driverId }: EditDriverModalProps) {
    const { updateDriver, getDriver, isLoading, error, resetError } = useEditDriver();
    const [validationError, setValidationError] = useState<string>('');
    const { companies, isLoading: companiesLoading, error: companiesError } = useCompanies();
    const [isFetchingDriver, setIsFetchingDriver] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
  
    // Form state
    const [driverData, setDriverData] = useState<DriverData>({
      first_name: '',
      last_name: '',
      nid: '',
      uuid: '',
      phone_number: '',
      is_active: true,
      company_code: '',
      agency_share: null,
      insurance: null,
    });
  
    const [licenseData, setLicenseData] = useState<Omit<LicenseData, 'driver_id'>>(createEmptyLicense());
    const [nationalIdData, setNationalIdData] = useState<Omit<NationalIdData, 'driver_id'>>(createEmptyNationalId());
    const [vehicleLicenseData, setVehicleLicenseData] = useState<Omit<VehicleLicenseData, 'driver_id'>>(createEmptyVehicleLicense());
    const [contractsData, setContractsData] = useState<Omit<ContractData, 'driver_id'>[]>([createEmptyContract()]);

    // Track which documents have existing files
    const [existingFiles, setExistingFiles] = useState({
      license: false,
      nationalId: false,
      vehicleLicense: false,
      contracts: [] as boolean[]
    });

    // Use ref to track if component is mounted and active
    const isMountedRef = useRef(true);
    const currentDriverIdRef = useRef<number | null>(null);
  
    // Reset everything when modal closes
    useEffect(() => {
      if (!isOpen) {
        resetForm();
        resetError();
        setHasFetched(false);
        currentDriverIdRef.current = null;
      }
    }, [isOpen]);
  
    // Set up mounted ref
    useEffect(() => {
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
      };
    }, []);
  
    // Update current driver ID ref
    useEffect(() => {
      if (driverId) {
        currentDriverIdRef.current = driverId;
      }
    }, [driverId]);
  
    // Fixed: Single useEffect for data fetching with proper cleanup
    useEffect(() => {
      // Skip if not open, no driverId, or already fetched for this driver
      if (!isOpen || !driverId || (hasFetched && currentDriverIdRef.current === driverId)) {
        return;
      }
  
      const fetchDriverData = async () => {
        // Set current driver ID before starting fetch
        currentDriverIdRef.current = driverId;
        
        setIsFetchingDriver(true);
        
        try {
          const driver = await getDriver(driverId);
          
          // Critical: Check if we're still supposed to be showing this driver's data
          if (!isMountedRef.current || currentDriverIdRef.current !== driverId) {
            console.log('Fetch completed but driver changed or component unmounted');
            return;
          }
          
          // Populate form with existing driver data
          const newDriverData = {
            first_name: driver.first_name || '',
            last_name: driver.last_name || '',
            nid: driver.nid || '',
            uuid: driver.uuid || '',
            phone_number: driver.phone_number || '',
            is_active: driver.is_active !== undefined ? driver.is_active : true,
            company_code: driver.company_code || '',
            agency_share: driver.agency_share !== undefined ? driver.agency_share : null,
            insurance: driver.insurance !== undefined ? driver.insurance : null,
          };
          
          setDriverData(newDriverData);
      
          // Populate license data if exists
          if (driver.license) {
            const newLicenseData = {
              file: driver.license.file || '',
              notes: driver.license.notes || '',
              issue_date: driver.license.issue_date || new Date().toISOString().split('T')[0],
              expiry_date: driver.license.expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              license_number: driver.license.license_number || '',
              license_type: driver.license.license_type || 'standard'
            };
            setLicenseData(newLicenseData);
            setExistingFiles(prev => ({ ...prev, license: !!driver.license.file }));
          } else {
            setLicenseData(createEmptyLicense());
            setExistingFiles(prev => ({ ...prev, license: false }));
          }
      
          // Populate national ID data if exists
          if (driver.national_id_doc) {
            const newNationalIdData = {
              file: driver.national_id_doc.file || '',
              notes: driver.national_id_doc.notes || '',
              issue_date: driver.national_id_doc.issue_date || new Date().toISOString().split('T')[0],
              expiry_date: driver.national_id_doc.expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };
            setNationalIdData(newNationalIdData);
            setExistingFiles(prev => ({ ...prev, nationalId: !!driver.national_id_doc.file }));
          } else {
            setNationalIdData(createEmptyNationalId());
            setExistingFiles(prev => ({ ...prev, nationalId: false }));
          }
      
          // Populate vehicle license data if exists
          if (driver.vehicle_license) {
            const newVehicleLicenseData = {
              file: driver.vehicle_license.file || '',
              notes: driver.vehicle_license.notes || '',
              issue_date: driver.vehicle_license.issue_date || new Date().toISOString().split('T')[0],
              expiry_date: driver.vehicle_license.expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              license_number: driver.vehicle_license.license_number || '',
              license_plate: driver.vehicle_license.license_plate || '',
              license_type: driver.vehicle_license.license_type || 'commercial',
              vehicle_type: driver.vehicle_license.vehicle_type || 'motorcycle'
            };
            setVehicleLicenseData(newVehicleLicenseData);
            setExistingFiles(prev => ({ ...prev, vehicleLicense: !!driver.vehicle_license.file }));
          } else {
            setVehicleLicenseData(createEmptyVehicleLicense());
            setExistingFiles(prev => ({ ...prev, vehicleLicense: false }));
          }
      
          // Populate contracts data if exists
          if (driver.contracts && driver.contracts.length > 0) {
            const contracts = driver.contracts.map(contract => ({
              file: contract.file || '',
              notes: contract.notes || '',
              issue_date: contract.issue_date || new Date().toISOString().split('T')[0],
              expiry_date: contract.expiry_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              contract_number: contract.contract_number || `CONTRACT-${Date.now()}`
            }));
            setContractsData(contracts);
            setExistingFiles(prev => ({ 
              ...prev, 
              contracts: contracts.map(contract => !!contract.file)
            }));
          } else {
            setContractsData([createEmptyContract()]);
            setExistingFiles(prev => ({ ...prev, contracts: [false] }));
          }
      
          setHasFetched(true);
          console.log('Driver data successfully loaded into form');
      
        } catch (err) {
          // Only update state if component is still mounted and showing the same driver
          if (isMountedRef.current && currentDriverIdRef.current === driverId) {
            console.error('Failed to fetch driver data:', err);
            setValidationError('Failed to load driver data');
          }
        } finally {
          // Only update state if component is still mounted and showing the same driver
          if (isMountedRef.current && currentDriverIdRef.current === driverId) {
            setIsFetchingDriver(false);
          }
        }
      };
  
      fetchDriverData();
  
      // Cleanup function - mark this fetch as obsolete if driverId changes
      return () => {
        // This doesn't cancel the fetch, but prevents state updates for obsolete fetches
      };
    }, [isOpen, driverId]); // Only depend on isOpen and driverId
  
    const resetForm = () => {
      setDriverData({
        first_name: '',
        last_name: '',
        nid: '',
        uuid: '',
        phone_number: '',
        is_active: true,
        company_code: '',
        agency_share: null,
        insurance: null,
      });
      setLicenseData(createEmptyLicense());
      setNationalIdData(createEmptyNationalId());
      setVehicleLicenseData(createEmptyVehicleLicense());
      setContractsData([createEmptyContract()]);
      setExistingFiles({
        license: false,
        nationalId: false,
        vehicleLicense: false,
        contracts: [false]
      });
      setValidationError('');
      setHasFetched(false);
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
    
      // Clear old validation errors
      setValidationError("");
    
      // ✅ Validate required fields - name, phone, nid, company
      if (
        !driverData.first_name.trim() ||
        !driverData.last_name.trim() ||
        !driverData.phone_number.trim() ||
        !driverData.nid.trim() ||
        !driverData.company_code.trim()
      ) {
        setValidationError("First name, last name, phone number, NID, and company are required");
        return;
      }

      // Additional NID validation - must not be empty and should be unique
      if (driverData.nid.trim() === '') {
        setValidationError("NID is required and cannot be empty");
        return;
      }
    
      // License validation (if you want to keep license as required)
      if (!licenseData.license_number || !licenseData.license_type) {
        setValidationError("License number and type are required");
        return;
      }
    
      try {
        if (!driverId) {
          throw new Error('Driver ID is required for update');
        }

        // Create FormData for file uploads
        const formData = new FormData();
        
        // Append required driver data
        formData.append('first_name', driverData.first_name.trim());
        formData.append('last_name', driverData.last_name.trim());
        formData.append('nid', driverData.nid.trim()); // Ensure trimmed NID
        formData.append('phone_number', driverData.phone_number.trim());
        formData.append('company_code', driverData.company_code);
        
        // Append optional fields
        formData.append('uuid', driverData.uuid || '');
        formData.append('is_active', driverData.is_active.toString());

        // Append agency_share and insurance if they exist
        if (driverData.agency_share !== null) {
          formData.append('agency_share', driverData.agency_share.toString());
        }
        if (driverData.insurance !== null) {
          formData.append('insurance', driverData.insurance.toString());
        }

        // ✅ Trigger the API call safely
        await updateDriver(driverId, formData);
        
        // Handle success
        console.log("✅ Driver updated successfully, closing modal...");
        onSuccess?.();
        onClose();
        resetForm();
  
      } catch (err: any) {
        console.error("❌ Failed to update driver:", err);
        
        // Handle specific NID duplicate error
        if (err.message?.includes('duplicate') || err.message?.includes('nid') || err.message?.includes('unique')) {
          setValidationError("This NID is already registered to another driver. Please use a different NID.");
        } else {
          setValidationError("Failed to update driver. Please try again.");
        }
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
        setExistingFiles(prev => ({ ...prev, license: !!file }));
      } else if (section === 'nationalId') {
        setNationalIdData(prev => ({ ...prev, [field]: file || '' }));
        setExistingFiles(prev => ({ ...prev, nationalId: !!file }));
      } else if (section === 'vehicleLicense') {
        setVehicleLicenseData(prev => ({ ...prev, [field]: file || '' }));
        setExistingFiles(prev => ({ ...prev, vehicleLicense: !!file }));
      } else if (section === 'contracts' && contractIndex !== undefined) {
        setContractsData(prev => 
          prev.map((contract, i) => 
            i === contractIndex ? { ...contract, [field]: file || '' } : contract
          )
        );
        setExistingFiles(prev => ({
          ...prev,
          contracts: prev.contracts.map((hasFile, i) => 
            i === contractIndex ? !!file : hasFile
          )
        }));
      }
    };

    // Handler for deleting documents
    const handleDeleteDocument = (section: 'license' | 'nationalId' | 'vehicleLicense' | 'contracts', contractIndex?: number) => {
      if (section === 'license') {
        setLicenseData(prev => ({ ...prev, file: '' }));
        setExistingFiles(prev => ({ ...prev, license: false }));
      } else if (section === 'nationalId') {
        setNationalIdData(prev => ({ ...prev, file: '' }));
        setExistingFiles(prev => ({ ...prev, nationalId: false }));
      } else if (section === 'vehicleLicense') {
        setVehicleLicenseData(prev => ({ ...prev, file: '' }));
        setExistingFiles(prev => ({ ...prev, vehicleLicense: false }));
      } else if (section === 'contracts' && contractIndex !== undefined) {
        setContractsData(prev => 
          prev.map((contract, i) => 
            i === contractIndex ? { ...contract, file: '' } : contract
          )
        );
        setExistingFiles(prev => ({
          ...prev,
          contracts: prev.contracts.map((hasFile, i) => 
            i === contractIndex ? false : hasFile
          )
        }));
      }
    };
  
    // Add new contract
    const addContract = () => {
      setContractsData(prev => [...prev, createEmptyContract()]);
      setExistingFiles(prev => ({
        ...prev,
        contracts: [...prev.contracts, false]
      }));
    };
  
    // Remove contract
    const removeContract = (index: number) => {
      if (contractsData.length > 1) {
        setContractsData(prev => prev.filter((_, i) => i !== index));
        setExistingFiles(prev => ({
          ...prev,
          contracts: prev.contracts.filter((_, i) => i !== index)
        }));
      }
    };
  
    const handleClose = () => {
      if (!isLoading && !isFetchingDriver) {
        resetError();
        setValidationError('');
        onClose();
      }
    };
  
    // Handle ESC key and background click
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isLoading && !isFetchingDriver) {
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
    }, [isOpen, isLoading, isFetchingDriver]);
  
    if (!isOpen) return null;

    // Helper function to get filename from file path or File object
    const getFileName = (file: string | File): string => {
      if (typeof file === 'string') {
        return file.split('/').pop() || 'Uploaded file';
      }
      return file.name;
    };

    // Helper function to check if a file exists
    const hasFile = (file: string | File): boolean => {
      if (typeof file === 'string') {
        return file !== '';
      }
      return file instanceof File;
    };

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
            Edit Driver {driverId && `#${driverId}`}
            {isFetchingDriver && ' (Loading...)'}
          </h2>
          
          {(error || validationError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {validationError || (error as any)?.message || 'Failed to update driver'}
            </div>
          )}

          {/* Loading state when fetching driver data */}
          {isFetchingDriver && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Loading driver data...
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2">
                Basic Information <span className="text-red-500 text-sm">* Required fields</span>
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
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
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
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    National ID (NID) *
                  </label>
                  <input
                    type="text"
                    name="nid"
                    value={driverData.nid}
                    onChange={handleDriverChange}
                    placeholder="Enter national ID number"
                    required
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
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
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Company *
                  </label>
                  <select
                    name="company_code"
                    value={driverData.company_code}
                    onChange={handleDriverChange}
                    required
                    disabled={isFetchingDriver || companiesLoading}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  >
                    <option value="">Select a company *</option>
                    {companiesLoading ? (
                      <option disabled>Loading companies...</option>
                    ) : companiesError ? (
                      <option disabled>Error loading companies</option>
                    ) : (
                      companies
                        .filter(company => company.is_active)
                        .map((company) => (
                          <option key={company.code} value={company.code}>
                            {company.name}
                          </option>
                        ))
                    )}
                  </select>
                  
                  {companiesLoading && (
                    <p className="text-xs text-gray-500 mt-1">Loading companies...</p>
                  )}
                  {companiesError && (
                    <p className="text-xs text-red-500 mt-1">Failed to load companies</p>
                  )}
                </div>

                {/* ADDED: Agency Share Field */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Agency Share (%)
                  </label>
                  <input
                    type="number"
                    name="agency_share"
                    value={driverData.agency_share === null ? '' : driverData.agency_share}
                    onChange={handleDriverChange}
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="Enter percentage (0-100)"
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty if no agency share</p>
                </div>

                {/* ADDED: Insurance Amount Field */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Insurance Amount
                  </label>
                  <input
                    type="number"
                    name="insurance"
                    value={driverData.insurance === null ? '' : driverData.insurance}
                    onChange={handleDriverChange}
                    min="0"
                    step="0.01"
                    placeholder="Enter insurance amount"
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty if no insurance</p>
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
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={driverData.is_active}
                    onChange={handleDriverChange}
                    disabled={isFetchingDriver}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
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
                  disabled={isFetchingDriver}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
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
                      disabled={isFetchingDriver}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 disabled:opacity-50"
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
                      disabled={isFetchingDriver}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
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
                      disabled={isFetchingDriver}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
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
                      disabled={isFetchingDriver}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
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
                      disabled={isFetchingDriver}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                      placeholder="Additional contract notes..."
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Contract Document
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange('contracts', 'file', e.target.files?.[0] || null, index)}
                        disabled={isFetchingDriver}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-gray-300 disabled:opacity-50"
                      />
                      {hasFile(contract.file) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument('contracts', index)}
                          disabled={isFetchingDriver}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors text-sm whitespace-nowrap"
                          title="Delete document"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                    {hasFile(contract.file) && (
                      <p className="text-xs text-green-600 mt-1">
                        Current file: {getFileName(contract.file)}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Upload contract document (PDF, JPG, PNG)</p>
                  </div>
                </div>
              ))}
            </div>

            {/* License Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2">
                Driver License Information <span className="text-red-500 text-sm">* Required fields</span>
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
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
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
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  >
                    <option value="">Select License Type *</option>
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
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
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
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    License Document
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('license', 'file', e.target.files?.[0] || null)}
                      disabled={isFetchingDriver}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-gray-300 disabled:opacity-50"
                    />
                    {hasFile(licenseData.file) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument('license')}
                        disabled={isFetchingDriver}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors text-sm whitespace-nowrap"
                        title="Delete document"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                  {hasFile(licenseData.file) && (
                    <p className="text-xs text-green-600 mt-1">
                      Current file: {getFileName(licenseData.file)}
                    </p>
                  )}
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
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
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
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
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
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    National ID Document
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('nationalId', 'file', e.target.files?.[0] || null)}
                      disabled={isFetchingDriver}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-gray-300 disabled:opacity-50"
                    />
                    {hasFile(nationalIdData.file) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument('nationalId')}
                        disabled={isFetchingDriver}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors text-sm whitespace-nowrap"
                        title="Delete document"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                  {hasFile(nationalIdData.file) && (
                    <p className="text-xs text-green-600 mt-1">
                      Current file: {getFileName(nationalIdData.file)}
                    </p>
                  )}
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
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
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
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
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
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
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
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
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
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
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
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
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
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Vehicle License Document
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('vehicleLicense', 'file', e.target.files?.[0] || null)}
                      disabled={isFetchingDriver}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-gray-300 disabled:opacity-50"
                    />
                    {hasFile(vehicleLicenseData.file) && (
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument('vehicleLicense')}
                        disabled={isFetchingDriver}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors text-sm whitespace-nowrap"
                        title="Delete document"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                  {hasFile(vehicleLicenseData.file) && (
                    <p className="text-xs text-green-600 mt-1">
                      Current file: {getFileName(vehicleLicenseData.file)}
                    </p>
                  )}
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
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                    placeholder="Additional vehicle license notes..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading || isFetchingDriver}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || isFetchingDriver}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating Driver...
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