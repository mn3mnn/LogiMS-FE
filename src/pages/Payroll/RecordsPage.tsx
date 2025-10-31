import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCompanies } from '../../hooks/useCompanies';
import { usePaymentRecords } from '../../hooks/usePaymentRecords';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import { Link } from 'react-router-dom';
import { generatePaginationPages } from '../../utils/pagination';

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

  const { data, isLoading, isFetching, error } = usePaymentRecords({
    page,
    pageSize,
    companyCode,
    search: debouncedSearch,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const total = data?.count ?? 0;
  const results = data?.results ?? [];
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    const tId = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(tId);
  }, [search]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payroll Records</h2>
      </div>

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
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('payroll.tableHeaders.totalRevenue')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('payroll.tableHeaders.tax')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('payroll.tableHeaders.agencyShare')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('payroll.tableHeaders.insurance')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('payroll.tableHeaders.totalDeductions')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('payroll.tableHeaders.finalNet')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('payroll.tableHeaders.created')}</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {error && (
                <TableRow><td colSpan={12} className="px-3 py-3 text-red-600 text-sm">{String((error as any)?.message || error)}</td></TableRow>
              )}
              {isLoading && (
                <TableRow><td colSpan={12} className="px-3 py-5 text-sm">{t('payroll.loading')}</td></TableRow>
              )}
              {!isLoading && results.length === 0 && (
                <TableRow><td colSpan={12} className="px-3 py-5 text-sm">{t('payroll.noRecordsFound')}</td></TableRow>
              )}
              {results.map((r) => (
                <TableRow key={r.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <TableCell className="px-3 py-2 text-sm">{r.id}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">
                    <Link
                      to={`/uploads?id=${r.file_upload}`}
                      className="text-blue-600 hover:underline"
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
                        className="text-blue-600 hover:underline"
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
                  <TableCell className="px-3 py-2 text-sm">{new Date(r.created_at).toLocaleString()}</TableCell>
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
              className="px-3 py-1 rounded disabled:opacity-30 bg-blue-600 text-white transition-all duration-200 hover:bg-blue-700 disabled:hover:bg-blue-600 hover:scale-105 active:scale-95"
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
                      ? "bg-blue-600 text-white"
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
              className="px-3 py-1 rounded disabled:opacity-30 bg-blue-600 text-white transition-all duration-200 hover:bg-blue-700 disabled:hover:bg-blue-600 hover:scale-105 active:scale-95"
            >
              {t('common.next')}
            </button>
          </div>

          <div className="flex justify-end">
            <div className="text-gray-700 text-sm flex items-center gap-2">
              {t('payroll.totalRecords', { count: total })}
              {isFetching && <LoadingSpinner size="small" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


