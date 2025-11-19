import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCompanies } from '../../hooks/useCompanies';
import { usePaymentRecords } from '../../hooks/usePaymentRecords';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import { Link } from 'react-router-dom';
import { generatePaginationPages } from '../../utils/pagination';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

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

export default function RecordsPage() {
  const { t } = useTranslation();
  const { companies } = useCompanies();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [companyCode, setCompanyCode] = useState<string | 'All'>('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [orderBy, setOrderBy] = useState("");
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");

  // Build ordering string
  const ordering = orderBy ? (orderDirection === "desc" ? `-${orderBy}` : orderBy) : "";

  const { data, isLoading, isFetching, error } = usePaymentRecords({
    page,
    pageSize,
    companyCode,
    search: debouncedSearch,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    ordering,
  });

  const total = data?.count ?? 0;
  const results = data?.results ?? [];
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    const tId = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(tId);
  }, [search]);

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
    setPage(1);
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Payroll Records" />
      <div className="space-y-4">

      {/* Search above filters (match Drivers width/UX) */}
      <div className="w-full md:w-[430px]">
        <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">{t('payroll.search')}</label>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('payroll.searchPlaceholder')}
          className="h-11 w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>

      <div className="flex flex-wrap gap-3 items-end mt-2">
        <div>
          <label className="block text-sm mb-1">{t('payroll.company')}</label>
          <select
            value={companyCode}
            onChange={(e) => { setCompanyCode(e.target.value as any); setPage(1); }}
            className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white"
          >
            <option value="All">{t('payroll.all')}</option>
            {companies.filter(c => c.is_active).map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">{t('payroll.from')}</label>
          <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm mb-1">{t('payroll.to')}</label>
          <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white" />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('payroll.tableHeaders.id')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('payroll.tableHeaders.upload')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('payroll.tableHeaders.company')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('payroll.tableHeaders.driver')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('payroll.tableHeaders.driverUuid')}</TableCell>
                <SortableHeader field="total_revenue" label={t('payroll.tableHeaders.totalRevenue')} currentOrderBy={orderBy} currentDirection={orderDirection} onSort={handleSort} />
                <SortableHeader field="tax_deduction" label={t('payroll.tableHeaders.tax')} currentOrderBy={orderBy} currentDirection={orderDirection} onSort={handleSort} />
                <SortableHeader field="agency_share_deduction" label={t('payroll.tableHeaders.agencyShare')} currentOrderBy={orderBy} currentDirection={orderDirection} onSort={handleSort} />
                <SortableHeader field="insurance_deduction" label={t('payroll.tableHeaders.insurance')} currentOrderBy={orderBy} currentDirection={orderDirection} onSort={handleSort} />
                <SortableHeader field="total_deductions" label={t('payroll.tableHeaders.totalDeductions')} currentOrderBy={orderBy} currentDirection={orderDirection} onSort={handleSort} />
                <SortableHeader field="final_net_earnings" label={t('payroll.tableHeaders.finalNet')} currentOrderBy={orderBy} currentDirection={orderDirection} onSort={handleSort} />
                <SortableHeader field="created_at" label={t('payroll.tableHeaders.created')} currentOrderBy={orderBy} currentDirection={orderDirection} onSort={handleSort} />
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {error && (
                <TableRow><TableCell colSpan={12} className="px-3 py-3 text-red-600 text-sm">{String((error as any)?.message || error)}</TableCell></TableRow>
              )}
              {isLoading && (
                <TableRow><TableCell colSpan={12} className="px-3 py-5 text-sm">{t('payroll.loading')}</TableCell></TableRow>
              )}
              {!isLoading && results.length === 0 && (
                <TableRow><TableCell colSpan={12} className="px-3 py-5 text-sm">{t('payroll.noRecordsFound')}</TableCell></TableRow>
              )}
              {results.map((r) => (
                <TableRow key={r.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <TableCell className="px-3 py-2 text-sm">{r.id}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">
                    <Link
                      to={`/uploads?id=${r.file_upload}`}
                      className="text-[#ffb433] hover:underline"
                      title={t('payroll.viewUpload')}
                    >
                      {r.file_upload}
                    </Link>
                  </TableCell>
                  <TableCell className="px-3 py-2 text-sm">{r.company_name}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">
                    {r.driver_id ? (
                      <Link
                        to={`/drivers/${r.driver_id}`}
                        className="text-[#ffb433] hover:underline"
                        title={t('payroll.viewDriverProfile')}
                      >
                        {r.driver_name}
                      </Link>
                    ) : (
                      r.driver_name
                    )}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-sm">{r.driver_uuid}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{r.total_revenue ?? '-'}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{r.tax_deduction ?? '-'}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{r.agency_share_deduction ?? '-'}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{r.insurance_deduction ?? '-'}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{r.total_deductions ?? '-'}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{r.final_net_earnings ?? '-'}</TableCell>
                  <TableCell className="px-3 py-2 text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Section */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-white/[0.05]">
          <div className="flex items-center justify-center gap-1 flex-1">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 rounded disabled:opacity-30 bg-[#ffb433] text-white transition-all duration-200 hover:bg-[#e6a02e] disabled:hover:bg-[#ffb433] hover:scale-105 active:scale-95"
            >
              {t('common.previous')}
            </button>

            {totalPages > 0 && generatePaginationPages(page, totalPages).map((pageNum, index) => {
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
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1 rounded transition-all duration-200 hover:scale-105 active:scale-95 ${
                    page === pageNum
                      ? "bg-[#ffb433] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 rounded disabled:opacity-30 bg-[#ffb433] text-white transition-all duration-200 hover:bg-[#e6a02e] disabled:hover:bg-[#ffb433] hover:scale-105 active:scale-95"
            >
              {t('common.next')}
            </button>
          </div>

          <div className="flex justify-end">
            <div className="text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
              {t('payroll.totalRecords', { count: total })}
              {isFetching && <LoadingSpinner size="small" />}
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}


