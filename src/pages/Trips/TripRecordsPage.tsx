import { useEffect, useState } from 'react';
import { useCompanies } from '../../hooks/useCompanies';
import { useTripRecords } from '../../hooks/useTripRecords';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import { Link, useLocation } from 'react-router-dom';

export default function TripRecordsPage() {
  const { companies } = useCompanies();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [companyCode, setCompanyCode] = useState<string | 'All'>('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

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
        <label className="block text-sm mb-1">Search</label>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Driver or Trip UUID" className="h-11 w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2.5 text-sm" />
      </div>

      <div className="flex flex-wrap gap-3 items-end mt-2">
        <div>
          <label className="block text-sm mb-1">Company</label>
          <select value={companyCode} onChange={(e) => { setCompanyCode(e.target.value as any); setPage(1); }} className="border rounded-lg px-3 py-2">
            <option value="All">All</option>
            {companies.filter(c => c.is_active).map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">From</label>
          <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">To</label>
          <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2" />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100">
              <TableRow>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">ID</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Upload</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Company</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Driver</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Trip UUID</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Fare</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Distance</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Created</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100">
              {error && (
                <TableRow><td colSpan={8} className="px-3 py-3 text-red-600 text-sm">{String((error as any)?.message || error)}</td></TableRow>
              )}
              {isLoading && (
                <TableRow><td colSpan={8} className="px-3 py-5 text-sm">Loading...</td></TableRow>
              )}
              {!isLoading && results.length === 0 && (
                <TableRow><td colSpan={8} className="px-3 py-5 text-sm">No records found</td></TableRow>
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
                      <Link to={`/drivers/${r.driver_id}`} className="text-blue-600 hover:underline" title="View driver profile">
                        {r.driver_name}
                      </Link>
                    ) : r.driver_name}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-sm">{r.trip_uuid}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{r.fare_amount ?? '-'}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{r.trip_distance ?? '-'}</TableCell>
                  <TableCell className="px-3 py-2 text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <div className="text-xs text-gray-600">{isFetching ? 'Updating…' : `Total: ${total}`}</div>
          <div className="flex items-center gap-2">
            <button className="px-2.5 py-1 rounded bg-blue-600 text-white text-sm disabled:opacity-30" disabled={page<=1} onClick={() => setPage((p) => p-1)}>Previous</button>
            <span className="text-xs">{page} / {totalPages}</span>
            <button className="px-2.5 py-1 rounded bg-blue-600 text-white text-sm disabled:opacity-30" disabled={page>=totalPages} onClick={() => setPage((p) => p+1)}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}


