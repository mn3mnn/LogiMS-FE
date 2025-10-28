import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCompanies } from '../../hooks/useCompanies';
import { useTripRecords } from '../../hooks/useTripRecords';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import { Link, useLocation } from 'react-router-dom';

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

  const { data, isLoading, isFetching, error } = useTripRecords({
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

  useEffect(() => {
    const tId = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(tId);
  }, [search]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Trip Records</h2>
      </div>

      <div className="w-full md:w-[430px]">
        <label className="block text-sm mb-1">{t('trips.search')}</label>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('trips.searchPlaceholder')} className="h-11 w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2.5 text-sm" />
      </div>

      <div className="flex flex-wrap gap-3 items-end mt-2">
        <div>
          <label className="block text-sm mb-1">{t('trips.company')}</label>
          <select value={companyCode} onChange={(e) => { setCompanyCode(e.target.value as any); setPage(1); }} className="border rounded-lg px-3 py-2">
            <option value="All">{t('trips.all')}</option>
            {companies.filter(c => c.is_active).map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">{t('trips.from')}</label>
          <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">{t('trips.to')}</label>
          <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">{t('trips.tripStatus')}</label>
          <select value={tripStatus} onChange={(e) => { setTripStatus(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2">
            <option value="">{t('trips.all')}</option>
            <option value="completed">completed</option>
            <option value="failed">failed</option>
            <option value="rider_cancelled">rider_cancelled</option>
            <option value="driver_cancelled">driver_cancelled</option>
            <option value="delivery_failed">delivery_failed</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100">
              <TableRow>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('trips.tableHeaders.id')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('trips.tableHeaders.upload')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('trips.tableHeaders.company')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('trips.tableHeaders.driver')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('trips.tableHeaders.tripUuid')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('trips.tableHeaders.status')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('trips.tableHeaders.fare')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('trips.tableHeaders.distance')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('trips.tableHeaders.created')}</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100">
              {error && (
                <TableRow><td colSpan={8} className="px-3 py-3 text-red-600 text-sm">{String((error as any)?.message || error)}</td></TableRow>
              )}
              {isLoading && (
                <TableRow><td colSpan={8} className="px-3 py-5 text-sm">{t('trips.loading')}</td></TableRow>
              )}
              {!isLoading && results.length === 0 && (
                <TableRow><td colSpan={8} className="px-3 py-5 text-sm">{t('trips.noRecordsFound')}</td></TableRow>
              )}
              {results.map((r) => (
                <TableRow key={r.id} className="transition-colors hover:bg-gray-50">
                  <TableCell className="px-3 py-2 text-sm">{r.id}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">
                    <Link to={`/uploads?id=${r.file_upload}`} className="text-blue-600 hover:underline">{r.file_upload}</Link>
                  </TableCell>
                  <TableCell className="px-3 py-2 text-sm">{r.company_name}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">
                    {r.driver_id ? (
                      <Link to={`/drivers/${r.driver_id}`} className="text-blue-600 hover:underline" title={t('trips.viewDriverProfile')}>
                        {r.driver_name}
                      </Link>
                    ) : r.driver_name}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-sm">{r.trip_uuid}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{r.trip_status ?? '-'}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{r.fare_amount ?? '-'}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{r.trip_distance ?? '-'}</TableCell>
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
              className="px-3 py-1 rounded disabled:opacity-30 bg-blue-600 text-white transition-all duration-200 hover:bg-blue-700 disabled:hover:bg-blue-600 hover:scale-105 active:scale-95"
            >
              {t('common.previous')}
            </button>

            {totalPages > 0 && [...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setPage(index + 1)}
                className={`px-3 py-1 rounded transition-all duration-200 hover:scale-105 active:scale-95 ${
                  page === index + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {index + 1}
              </button>
            ))}

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
              {t('trips.totalRecords', { count: total })}
              {isFetching && <LoadingSpinner size="small" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


