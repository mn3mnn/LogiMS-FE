// components/BasicTableOne.tsx
import { useRef, useState } from "react";
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
import EditDriverModal from '../../modals/AddDriverModal';
import { Link } from "react-router-dom";
import { useCompanies } from '../../../hooks/useCompanies';

export default function BasicTableOne() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [driverStatusFilter, setDriverStatusFilter] = useState("all");
  const [docStatusFilter, setDocStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [companyFilter, setCompanyFilter] = useState("All");

  const { companies, isLoading: companiesLoading, error: companiesError } = useCompanies();
  
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading: driversLoading, error: driversError, isFetching } = useDrivers(
    companyFilter, 
    currentPage, 
    refreshKey,
    driverStatusFilter,
    docStatusFilter
  );
  
  const { exportDrivers } = useExportDrivers();
  
  const drivers = data?.results || [];
  const totalCount = data?.count || 0; 
  
  const usersPerPage = 10;
  const totalPages = Math.ceil(totalCount / usersPerPage);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<{ id: number; name: string } | null>(null);
  
  const { deleteDriver, isLoading: isDeleting, error: deleteError } = useDeleteDriver();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);

  const [isExporting, setIsExporting] = useState(false);

  if (driversLoading) return <p>Loading...</p>;
  if (driversError) return <p>Failed to load drivers</p>;

  // Client-side search (only for displayed data)
  const filteredData = drivers.filter((driver: any) => {
    const matchesId = driver?.uuid?.toString().includes(searchTerm);
    const matchesName = driver?.first_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesId || matchesName;
  });

  // Handle export with all filters
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportParams: any = {};
      
      if (companyFilter !== "All") {
        exportParams.company_code = companyFilter;
      }
      
      if (driverStatusFilter !== "all") {
        exportParams.is_active = driverStatusFilter === "active";
      }
      
      if (docStatusFilter !== "all") {
        exportParams.doc_status = docStatusFilter;
      }
      
      if (searchTerm) {
        exportParams.search = searchTerm;
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

  const handleUserAdded = () => {
    setRefreshKey(prev => prev + 1); 
    setCurrentPage(1); 
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

  const handleCloseModal = () => {
    if (!isDeleting) { 
      setDeleteModalOpen(false);
      setSelectedDriver(null);
    }
  };

  const handleEditClick = (driverId: number) => {
    setSelectedDriverId(driverId);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedDriverId(null);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="hidden lg:block my-2 mx-4">
        <form>
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
              placeholder="Search by ID or Name..."
              className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-12 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[430px]"
            />
          </div>
        </form>

        <div className="flex justify-end mr-4">
          <span className="text-gray-700 text-sm">
            Total Drivers: {totalCount}
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
            className="border rounded-lg px-3 py-1 text-sm dark:bg-gray-800 dark:text-white"
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
            <p className="text-xs text-gray-500 mt-1">Loading companies...</p>
          )}
          {companiesError && (
            <p className="text-xs text-red-500 mt-1">Failed to load companies</p>
          )}
        </div>

        {/* Driver Status Filter */}
        <div className="p-2">
          <label className="mr-2 font-medium text-gray-600 dark:text-gray-300">
            Driver Status:
          </label>
          <select
            value={driverStatusFilter}
            onChange={(e) => {
              setDriverStatusFilter(e.target.value);
              handleFilterChange();
            }}
            className="border rounded-lg px-3 py-1 text-sm dark:bg-gray-800 dark:text-white"
          >
            <option value="all">All Drivers</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
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
            className="border rounded-lg px-3 py-1 text-sm dark:bg-gray-800 dark:text-white"
          >
            <option value="all">All Documents</option>
            <option value="missing_docs">Missing Documents</option>
            <option value="expired_docs">Expired Documents</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Driver
          </button>
          <button
            onClick={() => document.getElementById("csvInput")?.click()}
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Bulk Add
          </button>
          <input
            type="file"
            id="csvInput"
            accept=".csv"
            className="hidden"
          />
        </div>
      </div>

      {/* Loading State */}
      {isFetching && (
        <div className="p-4 text-center text-blue-600">
          Loading drivers...
        </div>
      )}
      
      {/* Drivers Table */}
      <div className="max-w-full overflow-x-auto">
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
                Status
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
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="px-5 py-4 text-center text-gray-500">
                  {drivers.length === 0 ? "No drivers found" : "No drivers match your search"}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((driver: any) => (
                <TableRow key={`${driver.id}-${driver.uuid}`}>
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
                  <TableCell className="px-4 py-3 text-start text-theme-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      driver.is_active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {driver.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <span className={driver.national_id_doc ? "text-green-600" : "text-red-600"}>
                      {driver.national_id_doc ? "Uploaded" : "Not Uploaded"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <span className={driver.license ? "text-green-600" : "text-red-600"}>
                      {driver.license ? "Uploaded" : "Not Uploaded"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <span className={driver.vehicle_license ? "text-green-600" : "text-red-600"}>
                      {driver.vehicle_license ? "Uploaded" : "Not Uploaded"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <span className={driver.contracts && driver.contracts.length > 0 ? "text-green-600" : "text-red-600"}>
                      {driver.contracts && driver.contracts.length > 0 ? "Uploaded" : "Not Uploaded"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button
                          onClick={() => handleEditClick(driver.id)}
                        className="text-blue-600 hover:underline"
                      >
                        ✏️
                      </button>
                      <button
                          onClick={() => handleDeleteClick(driver.id, `${driver.first_name} ${driver.last_name}`)}
                          disabled={isDeleting}
                        className="text-red-600 hover:underline"
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
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center justify-center gap-1 flex-1">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-1 rounded disabled:opacity-30 bg-blue-600 text-white"
          >
            Prev
          </button>

          {totalPages > 0 && [...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === index + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-1 rounded disabled:opacity-30 bg-blue-600 text-white"
          >
            Next
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Exporting...
              </>
            ) : (
              'Export'
            )}
          </button>
        </div>
      </div>

      {/* Modals */}
      <EditDriverModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleUserAdded}
      />

       <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        driverName={selectedDriver?.name || ''}
        isLoading={isDeleting}
      />
      {deleteError && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50">
          <strong>Error: </strong> {deleteError.message}
          <button 
            onClick={() => {/* reset error */}}
            className="float-right font-bold ml-4"
          >
            ×
          </button>
        </div>
      )}

       <EditDriverModal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
        driverId={selectedDriverId}
      />
    </div>
  );
}