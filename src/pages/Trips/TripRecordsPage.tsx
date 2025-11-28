import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCompanies } from '../../hooks/useCompanies';
import { useTripRecordsAggregated } from '../../hooks/useTripRecords';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import { Link, useLocation } from 'react-router-dom';
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


export default function TripRecordsPage() {
  const { t } = useTranslation();
  const { companies } = useCompanies();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [companyCode, setCompanyCode] = useState<string | 'All'>('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [tripStatus, setTripStatus] = useState<string>('');

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const uploadIdFromUrl = query.get('id');

  const { data, isLoading, isFetching, error } = useTripRecordsAggregated({
    page,
    pageSize,
    companyCode,
    search: debouncedSearch,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    uploadId: uploadIdFromUrl ? Number(uploadIdFromUrl) : undefined,
    tripStatus: tripStatus || undefined,
  });

  const total = data?.count ?? 0;
  const results = data?.results ?? [];
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Initialize filters from URL query parameters on mount and when URL changes
  useEffect(() => {
    const urlQuery = new URLSearchParams(location.search);
    const companyCodeFromUrl = urlQuery.get('company_code');
    const fromDateFromUrl = urlQuery.get('from_date');
    const toDateFromUrl = urlQuery.get('to_date');
    const tripStatusFromUrl = urlQuery.get('trip_status');

    if (companyCodeFromUrl) {
      setCompanyCode(companyCodeFromUrl);
    }
    if (fromDateFromUrl) {
      setFromDate(fromDateFromUrl);
    }
    if (toDateFromUrl) {
      setToDate(toDateFromUrl);
    }
    if (tripStatusFromUrl) {
      setTripStatus(tripStatusFromUrl);
    }
  }, [location.search]);

  useEffect(() => {
    const tId = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(tId);
  }, [search]);


  return (
    <>
      <PageBreadcrumb pageTitle="Trip Records" />
      <div className="space-y-4">

      <div className="w-full md:w-[430px]">
        <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">{t('trips.search')}</label>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('trips.searchPlaceholder')} className="h-11 w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
      </div>

      <div className="flex flex-wrap gap-3 items-end mt-2">
        <div>
          <label className="block text-sm mb-1">{t('trips.company')}</label>
          <select value={companyCode} onChange={(e) => { setCompanyCode(e.target.value as any); setPage(1); }} className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white">
            <option value="All">{t('trips.all')}</option>
            {companies.filter(c => c.is_active).map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">{t('trips.from')}</label>
          <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm mb-1">{t('trips.to')}</label>
          <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm mb-1">{t('trips.tripStatus')}</label>
          <select value={tripStatus} onChange={(e) => { setTripStatus(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white">
            <option value="">{t('trips.all')}</option>
            <option value="completed">completed</option>
            <option value="failed">failed</option>
            <option value="rider_cancelled">rider_cancelled</option>
            <option value="driver_cancelled">driver_cancelled</option>
            <option value="delivery_failed">delivery_failed</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('trips.tableHeaders.period')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('trips.tableHeaders.upload')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('trips.tableHeaders.company')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('trips.tableHeaders.driver')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('trips.tableHeaders.driverUuid')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('trips.tableHeaders.status')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('trips.tableHeaders.tripCount')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('trips.tableHeaders.totalFare')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('trips.tableHeaders.totalDistance')}</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {error && (
                <TableRow><TableCell colSpan={9} className="px-3 py-3 text-red-600 text-sm">{String((error as any)?.message || error)}</TableCell></TableRow>
              )}
              {isLoading && (
                <TableRow><TableCell colSpan={9} className="px-3 py-5 text-sm">{t('trips.loading')}</TableCell></TableRow>
              )}
              {!isLoading && results.length === 0 && (
                <TableRow><TableCell colSpan={9} className="px-3 py-5 text-sm">{t('trips.noRecordsFound')}</TableCell></TableRow>
              )}
              {results.map((r, index) => (
                <TableRow key={`${r.driver_uuid}-${r.from_date}-${r.to_date}-${r.trip_status || 'null'}-${index}`} className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <TableCell className="px-3 py-2 text-sm">
                    {r.from_date && r.to_date ? (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(r.from_date).toLocaleDateString()} - {new Date(r.to_date).toLocaleDateString()}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-sm">
                    <Link
                      to={`/uploads?id=${r.file_upload}`}
                      className="text-[#ffb433] hover:underline"
                      title={t('trips.viewUpload')}
                    >
                      {r.file_upload}
                    </Link>
                  </TableCell>
                  <TableCell className="px-3 py-2 text-sm">{r.company_name}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">
                    {r.driver_id ? (
                      <Link to={`/drivers/${r.driver_id}`} className="text-[#ffb433] hover:underline" title={t('trips.viewDriverProfile')}>
                        {r.driver_name}
                      </Link>
                    ) : r.driver_name}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-sm">{r.driver_uuid}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{r.trip_status ?? '-'}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{r.trip_count}</TableCell>
                  <TableCell className="px-3 py-2 text-sm font-medium">{r.total_fare ? parseFloat(r.total_fare).toFixed(2) : '0.00'}</TableCell>
                  <TableCell className="px-3 py-2 text-sm font-medium">{r.total_distance ? parseFloat(r.total_distance).toFixed(2) : '0.00'}</TableCell>
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
              {t('trips.totalRecords', { count: total })}
              {isFetching && <LoadingSpinner size="small" />}
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}


