// components/BasicTableOne.tsx
import { useRef, useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { useDrivers } from "../../../hooks/useDrivers";
import { useDeleteDriver } from '../../../hooks/useDeleteDriver';
import { useExportDrivers } from '../../../hooks/useExportDrivers';
import DeleteConfirmationModal from '../../modals/DeleteConfirmationModal';
import AddDriverModal from '../../modals/AddDriverModal';
import EditDriverModal from '../../modals/EditDriverModal';
import { Link } from "react-router-dom";
import { useCompanies } from '../../../hooks/useCompanies';

// Skeleton Loader Component
const TableSkeleton = () => {
  return (
    <div className="animate-pulse">
      {[...Array(5)].map((_, index) => (
        <TableRow key={index} className="border-b border-gray-100 dark:border-white/[0.05]">
          <TableCell className="px-5 py-4">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/4"></div>
          </TableCell>
          <TableCell className="px-5 py-4">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-3/4"></div>
          </TableCell>
          <TableCell className="px-5 py-4">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/2"></div>
          </TableCell>
          <TableCell className="px-5 py-4">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/3"></div>
          </TableCell>
          <TableCell className="px-5 py-4">
            <div className="h-6 bg-gray-200 rounded-full dark:bg-gray-700 w-16"></div>
          </TableCell>
          <TableCell className="px-5 py-4">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-20"></div>
          </TableCell>
          <TableCell className="px-5 py-4">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-20"></div>
          </TableCell>
          <TableCell className="px-5 py-4">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-20"></div>
          </TableCell>
          <TableCell className="px-5 py-4">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-20"></div>
          </TableCell>
          <TableCell className="px-5 py-4">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-20"></div>
          </TableCell>
          <TableCell className="px-5 py-4">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-20"></div>
          </TableCell>
          <TableCell className="px-5 py-4">
            <div className="flex gap-2">
              <div className="h-6 w-6 bg-gray-200 rounded dark:bg-gray-700"></div>
              <div className="h-6 w-6 bg-gray-200 rounded dark:bg-gray-700"></div>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </div>
  );
};

// Loading spinner component
const LoadingSpinner = ({ size = "small" }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-6 h-6",
    large: "w-8 h-8"
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin`}></div>
  );
};

export default function BasicTableOne() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [docStatusFilter, setDocStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [companyFilter, setCompanyFilter] = useState("All");
  const [isSearching, setIsSearching] = useState(false);

  const { companies, isLoading: companiesLoading, error: companiesError } = useCompanies();
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Use debouncedSearchTerm in the API call
  const { data, isLoading: driversLoading, error: driversError, isFetching } = useDrivers(
    companyFilter, 
    currentPage, 
    refreshKey,
    docStatusFilter,
    debouncedSearchTerm
  );
  
  // Debounce effect - 2 second delay
  useEffect(() => {
    if (searchTerm.trim() !== debouncedSearchTerm.trim()) {
      setIsSearching(true);
      
      const timer = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
        setCurrentPage(1);
        setIsSearching(false);
      }, 2000);

      return () => {
        clearTimeout(timer);
        setIsSearching(false);
      };
    }
  }, [searchTerm, debouncedSearchTerm]);

  const { exportDrivers } = useExportDrivers();
  
  const drivers = data?.results || [];
  const totalCount = data?.count || 0; 
  
  const usersPerPage = 10;
  const totalPages = Math.ceil(totalCount / usersPerPage);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<{ id: number; name: string } | null>(null);
  
  const { deleteDriver, isLoading: isDeleting, error: deleteError } = useDeleteDriver();

  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);

  const [isExporting, setIsExporting] = useState(false);

  // Show loading skeleton on initial load
  if (driversLoading && drivers.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-64 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded dark:bg-gray-700 w-32 animate-pulse"></div>
          </div>
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {[...Array(11)].map((_, index) => (
                    <TableCell key={index} isHeader className="px-5 py-3">
                      <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-20 animate-pulse"></div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableSkeleton />
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }

  if (driversError) return (
    <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-6 text-center">
      <div className="text-red-600 dark:text-red-400 mb-2">
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Failed to load drivers</h3>
      <p className="text-red-600 dark:text-red-400 text-sm">{driversError.message}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Retry
      </button>
    </div>
  );

  // Handle export with all filters (including search)
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportParams: any = {};
      
      if (companyFilter !== "All") {
        exportParams.company_code = companyFilter;
      }
      
      if (docStatusFilter !== "all") {
        exportParams.doc_status = docStatusFilter;
      }
      
      if (debouncedSearchTerm.trim()) {
        exportParams.search = debouncedSearchTerm.trim();
      }

      await exportDrivers(exportParams);
      
      console.log('Export completed successfully!');
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Reset to page 1 when any filter changes
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleDriverAdded = () => {
    setRefreshKey(prev => prev + 1); 
    setCurrentPage(1); 
  };

  const handleDriverUpdated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleDeleteClick = (driverId: number, driverName: string) => {
    setSelectedDriver({ id: driverId, name: driverName });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDriver) return;
    
    try {
      await deleteDriver(selectedDriver.id);
      setRefreshKey(prev => prev + 1);
      setDeleteModalOpen(false);
      setSelectedDriver(null);
    } catch (err) {
      console.error('Failed to delete driver:', err);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) { 
      setDeleteModalOpen(false);
      setSelectedDriver(null);
    }
  };

  const handleEditClick = (driverId: number) => {
    setSelectedDriverId(driverId);
    setIsEditModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedDriverId(null);
  };

  // Helper function to format agency share
  const formatAgencyShare = (share: number | null) => {
    if (share === null || share === undefined) return 'N/A';
    return `${share}%`;
  };

  // Helper function to display insurance status
  const getInsuranceStatus = (insurance: any) => {
    if (!insurance || insurance === null || insurance === undefined) return 'No Insurance';
    
    // If insurance is a number (percentage), show the amount
    if (typeof insurance === 'number') {
      return `${insurance}`;
    }
    
    // If insurance is an object with a file property
    if (insurance.file) return 'Uploaded';
    
    // If insurance is an object but no file
    return 'No Document';
  };
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] transition-all duration-300">
      <div className="hidden lg:block my-2 mx-4">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="relative">
            <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2">
              <svg
                className="fill-gray-500 dark:fill-gray-400"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                  fill=""
                />
              </svg>
            </span>
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              placeholder="Search by name, phone, NID, or UUID..."
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px] transition-all duration-200"
            />
            {/* Show loading indicator when searching */}
            {(isSearching || (isFetching && debouncedSearchTerm)) && (
              <span className="absolute -translate-y-1/2 pointer-events-none right-4 top-1/2">
                <LoadingSpinner size="small" />
              </span>
            )}
          </div>
          {/* Show search status */}
          {debouncedSearchTerm && (
            <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
              <span>Searching for: "{debouncedSearchTerm}"</span>
              {(isSearching || isFetching) && <LoadingSpinner size="small" />}
            </div>
          )}
        </form>

        <div className="flex justify-end mr-4 mt-2">
          <span className="text-gray-700 text-sm flex items-center gap-2">
            Total Drivers: {totalCount}
            {debouncedSearchTerm && ` (filtered)`}
            {isFetching && <LoadingSpinner size="small" />}
          </span>
        </div>
      </div>
      
      {/* Filters Section */}
      <div className="flex justify-between items-end m-4">
        {/* Company Filter */}
        <div className="p-2">
          <label className="mr-2 font-medium text-gray-600 dark:text-gray-300">
            Company:
          </label>
          <select
            value={companyFilter}
            onChange={(e) => {
              setCompanyFilter(e.target.value);
              handleFilterChange();
            }}
            className="border rounded-lg px-3 py-1 text-sm dark:bg-gray-800 dark:text-white transition-colors duration-200"
            disabled={companiesLoading}
          >
            <option value="All">All Companies</option>
            
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
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <LoadingSpinner size="small" />
              Loading companies...
            </p>
          )}
          {companiesError && (
            <p className="text-xs text-red-500 mt-1">Failed to load companies</p>
          )}
        </div>

        {/* Document Status Filter */}
        <div className="p-2">
          <label className="mr-2 font-medium text-gray-600 dark:text-gray-300">
            Document Status:
          </label>
          <select
            value={docStatusFilter}
            onChange={(e) => {
              setDocStatusFilter(e.target.value);
              handleFilterChange();
            }}
            className="border rounded-lg px-3 py-1 text-sm dark:bg-gray-800 dark:text-white transition-colors duration-200"
          >
            <option value="all">All Documents</option>
            <option value="missing">Missing Documents</option>
            <option value="expired">Expired Documents</option>
            <option value="valid">Valid Documents</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            + Add Driver
          </button>
          <input
            type="file"
            id="csvInput"
            accept=".csv"
            className="hidden"
          />
        </div>
      </div>

      {/* Loading State for table data */}
      {isFetching && drivers.length > 0 && (
        <div className="p-4 text-center text-blue-600 flex items-center justify-center gap-2">
          <LoadingSpinner size="small" />
          Updating drivers...
        </div>
      )}
      
      {/* Drivers Table */}
      <div className="max-w-full overflow-x-auto transition-opacity duration-300">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Id
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                User
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Phone
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Company
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Agency Share
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Insurance
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                NID
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                License
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Vehicle License
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Contract
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {drivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="px-5 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                      {debouncedSearchTerm ? "No drivers match your search" : "No drivers found"}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 text-sm">
                      {debouncedSearchTerm ? "Try adjusting your search terms" : "Get started by adding your first driver"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : isFetching && drivers.length > 0 ? (
              <TableSkeleton />
            ) : (
              drivers.map((driver: any) => (
                <TableRow 
                  key={`${driver.id}-${driver.uuid}`}
                  className="transition-all duration-200 hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                >
                  <TableCell className="px-1 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {driver.id}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div>
                        <Link 
                          to={`/drivers/${driver.id}`}
                          className="block font-medium text-gray-800 text-theme-sm dark:text-white/90 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {driver.first_name} {driver.last_name}
                        </Link>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {driver.phone_number}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {driver.company_name}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <span className={`transition-colors duration-200 ${
                      driver.agency_share !== null ? "text-green-600" : "text-gray-400"
                    }`}>
                      {formatAgencyShare(driver.agency_share)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
  <span className={`transition-colors duration-200 ${
    typeof driver.insurance === 'number' ? "text-green-600" : 
    driver.insurance && driver.insurance.file ? "text-green-600" : 
    driver.insurance ? "text-yellow-600" : "text-red-600"
  }`}>
    {getInsuranceStatus(driver.insurance)}
  </span>
</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <span className={`transition-colors duration-200 ${driver.national_id_doc ? "text-green-600" : "text-red-600"}`}>
                      {driver.national_id_doc ? "Uploaded" : "Not Uploaded"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <span className={`transition-colors duration-200 ${driver.license ? "text-green-600" : "text-red-600"}`}>
                      {driver.license ? "Uploaded" : "Not Uploaded"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <span className={`transition-colors duration-200 ${driver.vehicle_license ? "text-green-600" : "text-red-600"}`}>
                      {driver.vehicle_license ? "Uploaded" : "Not Uploaded"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <span className={`transition-colors duration-200 ${driver.contracts && driver.contracts.length > 0 ? "text-green-600" : "text-red-600"}`}>
                      {driver.contracts && driver.contracts.length > 0 ? "Uploaded" : "Not Uploaded"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(driver.id)}
                        className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 transition-colors duration-200 hover:scale-110 transform"
                        title="Edit driver"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteClick(driver.id, `${driver.first_name} ${driver.last_name}`)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-800 dark:hover:text-red-400 transition-colors duration-200 hover:scale-110 transform disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete driver"
                      >
                        🗑️
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination and Export Section */}
      <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-white/[0.05]">
        <div className="flex items-center justify-center gap-1 flex-1">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-1 rounded disabled:opacity-30 bg-blue-600 text-white transition-all duration-200 hover:bg-blue-700 disabled:hover:bg-blue-600 hover:scale-105 active:scale-95"
          >
            Prev
          </button>

          {totalPages > 0 && [...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 rounded transition-all duration-200 hover:scale-105 active:scale-95 ${
                currentPage === index + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-1 rounded disabled:opacity-30 bg-blue-600 text-white transition-all duration-200 hover:bg-blue-700 disabled:hover:bg-blue-600 hover:scale-105 active:scale-95"
          >
            Next
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleExport}
            disabled={isExporting || drivers.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <LoadingSpinner size="small" />
                Exporting...
              </>
            ) : (
              'Export'
            )}
          </button>
        </div>
      </div>

      {/* Modals */}
      {/* Add Driver Modal */}
      <AddDriverModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSuccess={handleDriverAdded}
      />

      {/* Edit Driver Modal */}
      <EditDriverModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSuccess={handleDriverUpdated}
        driverId={selectedDriverId}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        driverName={selectedDriver?.name || ''}
        isLoading={isDeleting}
      />

      {/* Delete Error Display */}
      {deleteError && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50 animate-in slide-in-from-right duration-300">
          <strong>Error: </strong> {deleteError.message}
          <button 
            onClick={() => {/* reset error */}}
            className="float-right font-bold ml-4 hover:text-red-900 transition-colors"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}