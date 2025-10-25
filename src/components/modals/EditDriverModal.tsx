// components/EditDriverModal.tsx
import { useState, useEffect, useRef } from 'react';
import { DriverData, LicenseData, NationalIdData, VehicleLicenseData, ContractData } from '../../hooks/useAddDriver';
import { useCompanies } from '../../hooks/useCompanies';
import { useEditDriver } from '../../hooks/useEditDriver';
import { useTranslation } from 'react-i18next';

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
  
  // Local editable types with optional id for existing documents
  type EditableLicense = Omit<LicenseData, 'driver_id'> & { id?: number };
  type EditableNationalId = Omit<NationalIdData, 'driver_id'> & { id?: number };
  type EditableVehicleLicense = Omit<VehicleLicenseData, 'driver_id'> & { id?: number };
  type EditableContract = Omit<ContractData, 'driver_id'> & { id?: number };
  
  export default function EditDriverModal({ isOpen, onClose, onSuccess, driverId }: EditDriverModalProps) {
    const { t } = useTranslation();
    const { updateDriver, getDriver, isLoading, error, resetError, createFormData, saveDocument, deleteDocument } = useEditDriver();
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
  
    const [licenseData, setLicenseData] = useState<EditableLicense>(createEmptyLicense());
    const [nationalIdData, setNationalIdData] = useState<EditableNationalId>(createEmptyNationalId());
    const [vehicleLicenseData, setVehicleLicenseData] = useState<EditableVehicleLicense>(createEmptyVehicleLicense());
    const [contractsData, setContractsData] = useState<EditableContract[]>([createEmptyContract()]);

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
    const originalContractIdsRef = useRef<Set<number>>(new Set());
  
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
              id: (driver.license as any).id,
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
              id: (driver.national_id_doc as any).id,
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
              id: (driver.vehicle_license as any).id,
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
            const contracts = driver.contracts.map((contract: any) => ({
              id: contract.id,
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
            originalContractIdsRef.current = new Set(contracts.filter(c => c.id).map(c => c.id as number));
          } else {
            setContractsData([createEmptyContract()]);
            setExistingFiles(prev => ({ ...prev, contracts: [false] }));
            originalContractIdsRef.current = new Set();
          }
      
          setHasFetched(true);
          console.log('Driver data successfully loaded into form');
      
        } catch (err) {
          // Only update state if component is still mounted and showing the same driver
          if (isMountedRef.current && currentDriverIdRef.current === driverId) {
            console.error('Failed to fetch driver data:', err);
            setValidationError(t('editDriver.errors.loadFailed'));
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
        setValidationError(t('editDriver.validation.requiredFields'));
        return;
      }

      // Additional NID validation - must not be empty and should be unique
      if (driverData.nid.trim() === '') {
        setValidationError(t('editDriver.validation.nidRequired'));
        return;
      }
    
      // License validation (if you want to keep license as required)
      if (!licenseData.license_number || !licenseData.license_type) {
        setValidationError(t('editDriver.validation.licenseRequired'));
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

        // ✅ Update base driver fields
        await updateDriver(driverId, formData);

        // ✅ Sync documents (create/update/delete)
        const ops: Promise<any>[] = [];

        // License
        const licenseHasFile = hasFile(licenseData.file);
        if (licenseData.id) {
          if (!licenseHasFile) {
            ops.push(deleteDocument('licenses', licenseData.id));
          } else {
            const { id, ...payload } = licenseData as any;
            const licFD = createFormData({ ...payload });
            ops.push(saveDocument('licenses', licFD, licenseData.id));
          }
        } else if (licenseHasFile) {
          const licFD = createFormData({ ...licenseData, driver_id: driverId });
          ops.push(saveDocument('licenses', licFD));
        }

        // National ID
        const nidHasFile = hasFile(nationalIdData.file);
        if (nationalIdData.id) {
          if (!nidHasFile) {
            ops.push(deleteDocument('national-ids', nationalIdData.id));
          } else {
            const { id, ...payload } = nationalIdData as any;
            const nidFD = createFormData({ ...payload });
            ops.push(saveDocument('national-ids', nidFD, nationalIdData.id));
          }
        } else if (nidHasFile) {
          const nidFD = createFormData({ ...nationalIdData, driver_id: driverId });
          ops.push(saveDocument('national-ids', nidFD));
        }

        // Vehicle License
        const vhlHasFile = hasFile(vehicleLicenseData.file);
        if (vehicleLicenseData.id) {
          if (!vhlHasFile) {
            ops.push(deleteDocument('vehicle-licenses', vehicleLicenseData.id));
          } else {
            const { id, ...payload } = vehicleLicenseData as any;
            const vhlFD = createFormData({ ...payload });
            ops.push(saveDocument('vehicle-licenses', vhlFD, vehicleLicenseData.id));
          }
        } else if (vhlHasFile) {
          const vhlFD = createFormData({ ...vehicleLicenseData, driver_id: driverId });
          ops.push(saveDocument('vehicle-licenses', vhlFD));
        }

        // Contracts (create/update/delete)
        const currentIds = new Set(contractsData.filter(c => (c as any).id).map(c => (c as any).id as number));
        const removedIds: number[] = Array.from(originalContractIdsRef.current).filter(id => !currentIds.has(id));
        removedIds.forEach((id) => ops.push(deleteDocument('contracts', id)));

        contractsData.forEach((c) => {
          const hasDoc = hasFile(c.file);
          if ((c as any).id) {
            const cid = (c as any).id as number;
            if (!hasDoc) {
              ops.push(deleteDocument('contracts', cid));
            } else {
              const { id, ...payload } = c as any;
              const cFD = createFormData({ ...payload });
              ops.push(saveDocument('contracts', cFD, cid));
            }
          } else if (hasDoc) {
            const cFD = createFormData({ ...c, driver_id: driverId });
            ops.push(saveDocument('contracts', cFD));
          }
        });

        const results = await Promise.allSettled(ops);
        const failures = results.filter(r => r.status === 'rejected');
        if (failures.length) {
          console.warn('Some document operations failed:', failures);
        }
        
        // Handle success
        console.log("✅ Driver updated successfully, closing modal...");
        onSuccess?.();
        onClose();
        resetForm();
  
      } catch (err: any) {
        console.error("❌ Failed to update driver:", err);
        
        // Handle specific NID duplicate error
        if (err.message?.includes('duplicate') || err.message?.includes('nid') || err.message?.includes('unique')) {
          setValidationError(t('editDriver.validation.nidDuplicate'));
        } else {
          setValidationError(t('editDriver.validation.submitError'));
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
        return file.split('/').pop() || t('editDriver.fileLabels.uploadedFile');
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
            {t('editDriver.title')} {driverId && `#${driverId}`}
            {isFetchingDriver && t('editDriver.loading')}
          </h2>
          
          {(error || validationError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {validationError || (error as any)?.message || t('editDriver.errors.updateFailed')}
            </div>
          )}

          {/* Loading state when fetching driver data */}
          {isFetchingDriver && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                {t('editDriver.loadingDriverData')}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2">
                {t('editDriver.sections.basicInfo')} <span className="text-red-500 text-sm">{t('editDriver.requiredFields')}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('editDriver.fields.firstName')} *
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
                    {t('editDriver.fields.lastName')} *
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
                    {t('editDriver.fields.nid')} *
                  </label>
                  <input
                    type="text"
                    name="nid"
                    value={driverData.nid}
                    onChange={handleDriverChange}
                    placeholder={t('editDriver.placeholders.nid')}
                    required
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('editDriver.fields.phoneNumber')} *
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
                    {t('editDriver.fields.company')} *
                  </label>
                  <select
                    name="company_code"
                    value={driverData.company_code}
                    onChange={handleDriverChange}
                    required
                    disabled={isFetchingDriver || companiesLoading}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  >
                    <option value="">{t('editDriver.selectCompany')}</option>
                    {companiesLoading ? (
                      <option disabled>{t('editDriver.loadingCompanies')}</option>
                    ) : companiesError ? (
                      <option disabled>{t('editDriver.companiesError')}</option>
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
                    <p className="text-xs text-gray-500 mt-1">{t('editDriver.loadingCompanies')}</p>
                  )}
                  {companiesError && (
                    <p className="text-xs text-red-500 mt-1">{t('editDriver.companiesError')}</p>
                  )}
                </div>

                {/* ADDED: Agency Share Field */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('editDriver.fields.agencyShare')}
                  </label>
                  <input
                    type="number"
                    name="agency_share"
                    value={driverData.agency_share === null ? '' : driverData.agency_share}
                    onChange={handleDriverChange}
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder={t('editDriver.placeholders.agencyShare')}
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('editDriver.hints.agencyShare')}</p>
                </div>

                {/* ADDED: Insurance Amount Field */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('editDriver.fields.insuranceAmount')}
                  </label>
                  <input
                    type="number"
                    name="insurance"
                    value={driverData.insurance === null ? '' : driverData.insurance}
                    onChange={handleDriverChange}
                    min="0"
                    step="0.01"
                    placeholder={t('editDriver.placeholders.insurance')}
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('editDriver.hints.insurance')}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('editDriver.fields.uuid')}
                  </label>
                  <input
                    type="text"
                    name="uuid"
                    value={driverData.uuid}
                    onChange={handleDriverChange}
                    placeholder={t('editDriver.placeholders.uuid')}
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
                    {t('editDriver.fields.activeDriver')}
                  </label>
                </div>
              </div>
            </div>

            {/* Contracts Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">
                  {t('editDriver.sections.contractInfo')}
                </h3>
                <button
                  type="button"
                  onClick={addContract}
                  disabled={isFetchingDriver}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
                >
                  {t('editDriver.buttons.addContract')}
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
                      {t('editDriver.fields.contractNumber')}
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
                      {t('editDriver.fields.issueDate')}
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
                      {t('editDriver.fields.expiryDate')}
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
                      {t('editDriver.fields.notes')}
                    </label>
                    <textarea
                      value={contract.notes}
                      onChange={(e) => handleContractChange(index, 'notes', e.target.value)}
                      rows={3}
                      disabled={isFetchingDriver}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                      placeholder={t('editDriver.placeholders.contractNotes')}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      {t('editDriver.fields.contractDocument')}
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
                          title={t('editDriver.buttons.deleteDocument')}
                        >
                          🗑️ {t('editDriver.buttons.delete')}
                        </button>
                      )}
                    </div>
                    {hasFile(contract.file) && (
                      <p className="text-xs text-green-600 mt-1">
                        {t('editDriver.fileLabels.currentFile')}: {getFileName(contract.file)}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{t('editDriver.hints.contractDocument')}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* License Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2">
                {t('editDriver.sections.licenseInfo')} <span className="text-red-500 text-sm">{t('editDriver.requiredFields')}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('editDriver.fields.licenseNumber')} *
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
                    {t('editDriver.fields.licenseType')} *
                  </label>
                  <select
                    value={licenseData.license_type}
                    onChange={(e) => handleLicenseChange('license_type', e.target.value)}
                    required
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  >
                    <option value="">{t('editDriver.selectLicenseType')}</option>
                    <option value="standard">{t('editDriver.licenseTypes.standard')}</option>
                    <option value="commercial">{t('editDriver.licenseTypes.commercial')}</option>
                    <option value="motorcycle">{t('editDriver.licenseTypes.motorcycle')}</option>
                    <option value="heavy_vehicle">{t('editDriver.licenseTypes.heavyVehicle')}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('editDriver.fields.issueDate')}
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
                    {t('editDriver.fields.expiryDate')}
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
                    {t('editDriver.fields.licenseDocument')}
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
                        title={t('editDriver.buttons.deleteDocument')}
                      >
                        🗑️ {t('editDriver.buttons.delete')}
                      </button>
                    )}
                  </div>
                  {hasFile(licenseData.file) && (
                    <p className="text-xs text-green-600 mt-1">
                      {t('editDriver.fileLabels.currentFile')}: {getFileName(licenseData.file)}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{t('editDriver.hints.licenseDocument')}</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('editDriver.fields.notes')}
                  </label>
                  <textarea
                    value={licenseData.notes}
                    onChange={(e) => handleLicenseChange('notes', e.target.value)}
                    rows={3}
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                    placeholder={t('editDriver.placeholders.licenseNotes')}
                  />
                </div>
              </div>
            </div>

            {/* National ID Document Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2">
                {t('editDriver.sections.nationalId')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('editDriver.fields.issueDate')}
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
                    {t('editDriver.fields.expiryDate')}
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
                    {t('editDriver.fields.nationalIdDocument')}
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
                        title={t('editDriver.buttons.deleteDocument')}
                      >
                        🗑️ {t('editDriver.buttons.delete')}
                      </button>
                    )}
                  </div>
                  {hasFile(nationalIdData.file) && (
                    <p className="text-xs text-green-600 mt-1">
                      {t('editDriver.fileLabels.currentFile')}: {getFileName(nationalIdData.file)}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{t('editDriver.hints.nationalIdDocument')}</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('editDriver.fields.notes')}
                  </label>
                  <textarea
                    value={nationalIdData.notes}
                    onChange={(e) => handleNationalIdChange('notes', e.target.value)}
                    rows={3}
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                    placeholder={t('editDriver.placeholders.nationalIdNotes')}
                  />
                </div>
              </div>
            </div>

            {/* Vehicle License Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2">
                {t('editDriver.sections.vehicleLicense')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('editDriver.fields.licenseNumber')}
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
                    {t('editDriver.fields.licensePlate')}
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
                    {t('editDriver.fields.licenseType')}
                  </label>
                  <select
                    value={vehicleLicenseData.license_type}
                    onChange={(e) => handleVehicleLicenseChange('license_type', e.target.value)}
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  >
                    <option value="">{t('editDriver.selectLicenseType')}</option>
                    <option value="commercial">{t('editDriver.licenseTypes.commercial')}</option>
                    <option value="private">{t('editDriver.licenseTypes.private')}</option>
                    <option value="motorcycle">{t('editDriver.licenseTypes.motorcycle')}</option>
                    <option value="heavy_vehicle">{t('editDriver.licenseTypes.heavyVehicle')}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('editDriver.fields.vehicleType')}
                  </label>
                  <select
                    value={vehicleLicenseData.vehicle_type}
                    onChange={(e) => handleVehicleLicenseChange('vehicle_type', e.target.value)}
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                  >
                    <option value="">{t('editDriver.selectVehicleType')}</option>
                    <option value="motorcycle">{t('editDriver.vehicleTypes.motorcycle')}</option>
                    <option value="car">{t('editDriver.vehicleTypes.car')}</option>
                    <option value="van">{t('editDriver.vehicleTypes.van')}</option>
                    <option value="truck">{t('editDriver.vehicleTypes.truck')}</option>
                    <option value="bicycle">{t('editDriver.vehicleTypes.bicycle')}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('editDriver.fields.issueDate')}
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
                    {t('editDriver.fields.expiryDate')}
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
                    {t('editDriver.fields.vehicleLicenseDocument')}
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
                        title={t('editDriver.buttons.deleteDocument')}
                      >
                        🗑️ {t('editDriver.buttons.delete')}
                      </button>
                    )}
                  </div>
                  {hasFile(vehicleLicenseData.file) && (
                    <p className="text-xs text-green-600 mt-1">
                      {t('editDriver.fileLabels.currentFile')}: {getFileName(vehicleLicenseData.file)}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{t('editDriver.hints.vehicleLicenseDocument')}</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    {t('editDriver.fields.notes')}
                  </label>
                  <textarea
                    value={vehicleLicenseData.notes}
                    onChange={(e) => handleVehicleLicenseChange('notes', e.target.value)}
                    rows={3}
                    disabled={isFetchingDriver}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                    placeholder={t('editDriver.placeholders.vehicleLicenseNotes')}
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
                {t('editDriver.buttons.cancel')}
              </button>
              <button
                type="submit"
                disabled={isLoading || isFetchingDriver}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('editDriver.buttons.updatingDriver')}
                  </>
                ) : (
                  t('editDriver.buttons.updateDriver')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}