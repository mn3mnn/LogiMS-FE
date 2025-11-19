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
import { generatePaginationPages } from "../../../utils/pagination";
import { useDeleteDriver } from '../../../hooks/useDeleteDriver';
import { useExportDrivers } from '../../../hooks/useExportDrivers';
import DeleteConfirmationModal from '../../modals/DeleteConfirmationModal';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import AddDriverModal from '../../modals/AddDriverModal';
import EditDriverModal from '../../modals/EditDriverModal';
import { Link } from "react-router-dom";
import { useCompanies } from '../../../hooks/useCompanies';
import { useTranslation } from 'react-i18next';

// Skeleton Loader Component
const TableSkeleton = () => {
  return (
    <div className="animate-pulse">
      {[...Array(5)].map((_, index) => (
        <TableRow key={index} className="border-b border-gray-100 dark:border-white/[0.05]">
          <TableCell className="px-3 py-2">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/4"></div>
          </TableCell>
          <TableCell className="px-3 py-2">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-3/4"></div>
          </TableCell>
          <TableCell className="px-3 py-2">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/2"></div>
          </TableCell>
          <TableCell className="px-3 py-2">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-1/3"></div>
          </TableCell>
          <TableCell className="px-3 py-2">
            <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-16"></div>
          </TableCell>
          <TableCell className="px-3 py-2">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-20"></div>
          </TableCell>
          <TableCell className="px-3 py-2">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-20"></div>
          </TableCell>
          <TableCell className="px-3 py-2">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-20"></div>
          </TableCell>
          <TableCell className="px-3 py-2">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-20"></div>
          </TableCell>
          <TableCell className="px-3 py-2">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-20"></div>
          </TableCell>
          <TableCell className="px-3 py-2">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-20"></div>
          </TableCell>
          <TableCell className="px-3 py-2">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-20"></div>
          </TableCell>
          <TableCell className="px-3 py-2">
            <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-24"></div>
          </TableCell>
          <TableCell className="px-3 py-2">
            <div className="flex gap-2">
              <div className="h-5 w-5 bg-gray-200 rounded dark:bg-gray-700"></div>
              <div className="h-5 w-5 bg-gray-200 rounded dark:bg-gray-700"></div>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </div>
  );
};

// Loading spinner component
const LoadingSpinner = ({ size = "small" }: { size?: "small" | "medium" | "large" }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-6 h-6",
    large: "w-8 h-8"
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin`}></div>
  );
};

// Sortable header component
interface SortableHeaderProps {
  field: string;
  label: string;
  currentOrderBy: string;
  currentDirection: "asc" | "desc";
  onSort: (field: string) => void;
}

const SortableHeader = ({ field, label, currentOrderBy, currentDirection, onSort }: SortableHeaderProps) => {
  const isActive = currentOrderBy === field;
  
  return (
    <TableCell 
      isHeader 
      className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors select-none"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <div className="flex flex-col">
          <svg 
            className={`w-3 h-3 ${isActive && currentDirection === 'asc' ? 'text-[#ffb433]' : 'text-gray-400'}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M5 10l5-5 5 5H5z" />
          </svg>
          <svg 
            className={`w-3 h-3 -mt-1 ${isActive && currentDirection === 'desc' ? 'text-[#ffb433]' : 'text-gray-400'}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M15 10l-5 5-5-5h10z" />
          </svg>
        </div>
      </div>
    </TableCell>
  );
};

export default function BasicTableOne() {
  const { t } = useTranslation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [docStatusFilter, setDocStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [companyFilter, setCompanyFilter] = useState("All");
  const [isSearching, setIsSearching] = useState(false);
  const [orderBy, setOrderBy] = useState("");
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");

  const { companies, isLoading: companiesLoading, error: companiesError } = useCompanies();
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Build ordering string
  const ordering = orderBy ? (orderDirection === "desc" ? `-${orderBy}` : orderBy) : "";

  // Use debouncedSearchTerm in the API call
  const { data, isLoading: driversLoading, error: driversError, isFetching } = useDrivers(
    companyFilter, 
    currentPage, 
    refreshKey,
    docStatusFilter,
    debouncedSearchTerm,
    ordering
  );
  
  // Debounce effect - 0.5 second delay
  useEffect(() => {
    if (searchTerm.trim() !== debouncedSearchTerm.trim()) {
      setIsSearching(true);
      
      const timer = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
        setCurrentPage(1);
        setIsSearching(false);
      }, 500);

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

  // Handle sorting
  const handleSort = (field: string) => {
    if (orderBy === field) {
      // Toggle direction if clicking the same field
      setOrderDirection(orderDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending
      setOrderBy(field);
      setOrderDirection("asc");
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  if (driversError) return (
    <div className="p-6">
      <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-6 text-center">
        <div className="text-red-600 dark:text-red-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">{t('drivers.loadingError')}</h3>
        <p className="text-red-600 dark:text-red-400 text-sm">{driversError.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          {t('common.retry')}
        </button>
      </div>
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
      alert(t('drivers.exportFailed'));
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
    if (share === null || share === undefined) return t('common.notAvailable');
    return `${share}%`;
  };

  return (
    <div className="space-y-4">

      {/* Search bar and Add button */}
      <div className="flex items-center justify-between gap-4">
        <div className="w-full md:w-[430px]">
          <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">{t('drivers.search', { defaultValue: 'Search' })}</label>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('drivers.searchPlaceholder')}
            className="h-11 w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
          {(isSearching || (isFetching && debouncedSearchTerm)) && (
            <span className="absolute -translate-y-1/2 pointer-events-none right-4 top-1/2">
              <LoadingSpinner size="small" />
            </span>
          )}
        </div>
        </div>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-[#ffb433] text-white text-sm font-medium rounded-lg hover:bg-[#e6a02e] shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('drivers.addDriver')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end mt-2">
        <div>
          <label className="block text-sm mb-1">{t('drivers.company')}</label>
          <select
            value={companyFilter}
            onChange={(e) => {
              setCompanyFilter(e.target.value);
              handleFilterChange();
            }}
            className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white"
            disabled={companiesLoading}
          >
            <option value="All">{t('drivers.allCompanies')}</option>
            {companiesLoading ? (
              <option disabled>{t('drivers.loadingCompanies')}</option>
            ) : companiesError ? (
              <option disabled>{t('drivers.companiesError')}</option>
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
        </div>

        <div>
          <label className="block text-sm mb-1">{t('drivers.documentStatus')}</label>
          <select
            value={docStatusFilter}
            onChange={(e) => {
              setDocStatusFilter(e.target.value);
              handleFilterChange();
            }}
            className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">{t('drivers.allDocuments')}</option>
            <option value="missing">{t('drivers.missingDocuments')}</option>
            <option value="expired">{t('drivers.expiredDocuments')}</option>
            <option value="valid">{t('drivers.validDocuments')}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('drivers.id')}</TableCell>
                <SortableHeader field="first_name" label={t('drivers.user')} currentOrderBy={orderBy} currentDirection={orderDirection} onSort={handleSort} />
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('drivers.phone')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('drivers.email')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('drivers.company')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('drivers.reportsTo')}</TableCell>
                <SortableHeader field="agency_share" label={t('drivers.agencyShare')} currentOrderBy={orderBy} currentDirection={orderDirection} onSort={handleSort} />
                <SortableHeader field="insurance" label={t('drivers.insurance')} currentOrderBy={orderBy} currentDirection={orderDirection} onSort={handleSort} />
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('drivers.nid')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('drivers.license')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('drivers.vehicleLicense')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('drivers.contract')}</TableCell>
                <SortableHeader field="updated_at" label={t('drivers.updatedAt')} currentOrderBy={orderBy} currentDirection={orderDirection} onSort={handleSort} />
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('drivers.actions')}</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {driversLoading && drivers.length === 0 ? (
                <TableSkeleton />
              ) : drivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="px-3 py-5 text-sm text-center">
                    {debouncedSearchTerm ? t('drivers.noMatchingDrivers') : t('drivers.noDriversFound')}
                  </TableCell>
                </TableRow>
              ) : (
                drivers.map((driver: any) => (
                  <TableRow 
                    key={`${driver.id}-${driver.uuid}`}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  >
                    <TableCell className="px-3 py-2 text-sm">{driver.id}</TableCell>
                    <TableCell className="px-3 py-2 text-sm">
                      <Link 
                        to={`/drivers/${driver.id}`}
                        className="text-black hover:underline"
                      >
                        {driver.first_name} {driver.last_name}
                      </Link>
                    </TableCell>
                    <TableCell className="px-3 py-2 text-sm">{driver.phone_number}</TableCell>
                    <TableCell className="px-3 py-2 text-sm">{driver.email || '-'}</TableCell>
                    <TableCell className="px-3 py-2 text-sm">{driver.company_name}</TableCell>
                    <TableCell className="px-3 py-2 text-sm">{driver.reports_to || '-'}</TableCell>
                    <TableCell className="px-3 py-2 text-sm">
                      <span className={driver.agency_share !== null ? "text-green-600" : "text-gray-400"}>
                        {formatAgencyShare(driver.agency_share)}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-2 text-sm">
                      <span className={
                        driver.insurance === null || driver.insurance === undefined || driver.insurance === ''
                          ? "text-gray-400"
                          : "text-green-600"
                      }>
                        {driver.insurance === null || driver.insurance === undefined || driver.insurance === ''
                          ? t('common.notAvailable')
                          : driver.insurance}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-2 text-sm">
                      {(() => {
                        const doc = driver.national_id_doc;
                        const status = doc?.status as ("valid" | "expired" | undefined);
                        const { label, cls } = !doc
                          ? { label: t('drivers.noDocument'), cls: 'text-red-600' }
                          : status === 'expired'
                            ? { label: 'Expired', cls: 'text-red-600' }
                            : { label: 'Valid', cls: 'text-green-600' };
                        const fileUrl = doc?.file;
                        if (fileUrl) {
                          return (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${cls} hover:underline cursor-pointer`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {label}
                            </a>
                          );
                        }
                        return <span className={cls}>{label}</span>;
                      })()}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-sm">
                      {(() => {
                        const doc = driver.license;
                        const status = doc?.status as ("valid" | "expired" | undefined);
                        const { label, cls } = !doc
                          ? { label: t('drivers.noDocument'), cls: 'text-red-600' }
                          : status === 'expired'
                            ? { label: 'Expired', cls: 'text-red-600' }
                            : { label: 'Valid', cls: 'text-green-600' };
                        const fileUrl = doc?.file;
                        if (fileUrl) {
                          return (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${cls} hover:underline cursor-pointer`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {label}
                            </a>
                          );
                        }
                        return <span className={cls}>{label}</span>;
                      })()}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-sm">
                      {(() => {
                        const doc = driver.vehicle_license;
                        const status = doc?.status as ("valid" | "expired" | undefined);
                        const { label, cls } = !doc
                          ? { label: t('drivers.noDocument'), cls: 'text-red-600' }
                          : status === 'expired'
                            ? { label: 'Expired', cls: 'text-red-600' }
                            : { label: 'Valid', cls: 'text-green-600' };
                        const fileUrl = doc?.file;
                        if (fileUrl) {
                          return (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${cls} hover:underline cursor-pointer`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {label}
                            </a>
                          );
                        }
                        return <span className={cls}>{label}</span>;
                      })()}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-sm">
                      {(() => {
                        const contracts = (driver.contracts || []) as Array<{ status?: 'valid' | 'expired', file?: string }>;
                        if (!contracts.length) {
                          return <span className="text-red-600">{t('drivers.noDocument')}</span>;
                        }
                        const hasExpired = contracts.some(c => c?.status === 'expired');
                        const label = hasExpired ? 'Expired' : 'Valid';
                        const cls = hasExpired ? 'text-red-600' : 'text-green-600';
                        // Use the first contract's file if available
                        const fileUrl = contracts[0]?.file;
                        if (fileUrl) {
                          return (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${cls} hover:underline cursor-pointer`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {label}
                            </a>
                          );
                        }
                        return <span className={cls}>{label}</span>;
                      })()}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                      {driver.updated_at ? new Date(driver.updated_at).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(driver.id)}
                          className="text-[#ffb433] hover:text-[#cc8c29] dark:hover:text-[#feb273] transition-colors"
                          title={t('drivers.editDriver')}
                        >
                          <AiOutlineEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(driver.id, `${driver.first_name} ${driver.last_name}`)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-800 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={t('drivers.deleteDriver')}
                        >
                          <AiOutlineDelete size={18} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Section */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-white/[0.05]">
          <div className="flex items-center justify-center gap-1 flex-1">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3 py-1 rounded disabled:opacity-30 bg-[#ffb433] text-white transition-all duration-200 hover:bg-[#e6a02e] disabled:hover:bg-[#ffb433] hover:scale-105 active:scale-95"
            >
              {t('common.previous')}
            </button>

            {totalPages > 0 && generatePaginationPages(currentPage, totalPages).map((pageNum, index) => {
              if (pageNum === 'ellipsis') {
                return (
                  <span key={`ellipsis-${index}`} className="px-2 text-gray-500 dark:text-gray-400">
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded transition-all duration-200 hover:scale-105 active:scale-95 ${
                    currentPage === pageNum
                      ? "bg-[#ffb433] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-3 py-1 rounded disabled:opacity-30 bg-[#ffb433] text-white transition-all duration-200 hover:bg-[#e6a02e] disabled:hover:bg-[#ffb433] hover:scale-105 active:scale-95"
            >
              {t('common.next')}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
              {t('drivers.totalDrivers', { count: totalCount })}
              {debouncedSearchTerm && ` (${t('drivers.filtered')})`}
              {isFetching && <LoadingSpinner size="small" />}
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting || drivers.length === 0}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <LoadingSpinner size="small" />
                  {t('drivers.exporting')}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t('drivers.export')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddDriverModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSuccess={handleDriverAdded}
      />

      <EditDriverModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSuccess={handleDriverUpdated}
        driverId={selectedDriverId}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        driverName={selectedDriver?.name || ''}
        isLoading={isDeleting}
      />

      {deleteError && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50 animate-in slide-in-from-right duration-300">
          <strong>{t('common.error')}: </strong> {String(deleteError)}
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
