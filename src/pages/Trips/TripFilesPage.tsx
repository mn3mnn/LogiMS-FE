import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCompanies } from '../../hooks/useCompanies';
import { useFileUploads, useCreateFileUpload } from '../../hooks/useFileUploads';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import { useLocation, Link } from 'react-router-dom';
import Button from '../../components/ui/button/Button';

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

export default function TripFilesPage() {
  const { t } = useTranslation();
  const { companies } = useCompanies();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [companyCode, setCompanyCode] = useState<string | 'All'>('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newCompany, setNewCompany] = useState<string>('');
  const [newFrom, setNewFrom] = useState<string>('');
  const [newTo, setNewTo] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createUpload = useCreateFileUpload();

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const uploadIdFromUrl = query.get('id');

  const { data, isLoading, isFetching, error } = useFileUploads({
    page,
    pageSize,
    companyCode,
    search: debouncedSearch,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    fileType: 'trips',
    uploadId: uploadIdFromUrl ? Number(uploadIdFromUrl) : undefined,
  });

  const total = data?.count ?? 0;
  const results = data?.results ?? [];
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    const tId = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(tId);
  }, [search]);

  const canSubmit = useMemo(() => {
    return !!newCompany && !!newFrom && !!newTo && !!uploadFile;
  }, [newCompany, newFrom, newTo, uploadFile]);

  const handleCreate = async () => {
    if (!uploadFile) return;
    await createUpload.mutateAsync({
      company: Number(newCompany),
      from_date: newFrom,
      to_date: newTo,
      file: uploadFile,
      file_type: 'trips',
    });
    setIsNewOpen(false);
    setNewCompany('');
    setNewFrom('');
    setNewTo('');
    setUploadFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Trip File Uploads</h2>
        <Button onClick={() => setIsNewOpen(true)} size="sm" className="!px-4 !py-2 text-sm">+ New Upload</Button>
      </div>

      <div className="w-full md:w-[430px]">
        <label className="block text-sm mb-1">Search</label>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by file name" className="h-11 w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2.5 text-sm" />
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
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Company</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">File</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">From</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">To</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Status</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Created</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100">
              {error && (
                <TableRow><td colSpan={7} className="px-3 py-3 text-red-600 text-sm">{String((error as any)?.message || error)}</td></TableRow>
              )}
              {isLoading && (
                <TableRow><td colSpan={7} className="px-3 py-5 text-sm">Loading...</td></TableRow>
              )}
              {!isLoading && results.length === 0 && (
                <TableRow><td colSpan={7} className="px-3 py-5 text-sm">No uploads found</td></TableRow>
              )}
              {results.map((u) => (
                <TableRow key={u.id} className="transition-colors hover:bg-gray-50">
                  <TableCell className="px-3 py-2 text-sm">{u.id}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{u.company_name}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{u.file_name || '-'}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{u.from_date}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{u.to_date}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{u.status}</TableCell>
                  <TableCell className="px-3 py-2 text-xs text-gray-500">{new Date(u.created_at).toLocaleString()}</TableCell>
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
              {t('trips.totalFiles', { count: total })}
              {isFetching && <LoadingSpinner size="small" />}
            </div>
          </div>
        </div>
      </div>

      {isNewOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsNewOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">New Trip Upload</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Company</label>
                <select value={newCompany} onChange={(e) => setNewCompany(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                  <option value="">Select company</option>
                  {companies.filter(c => c.is_active).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">From date</label>
                <input type="date" value={newFrom} onChange={(e) => setNewFrom(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm mb-1">To date</label>
                <input type="date" value={newTo} onChange={(e) => setNewTo(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm mb-1">File (.csv, .xlsx)</label>
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="w-full border rounded-lg px-3 py-2" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50" onClick={() => setIsNewOpen(false)}>Cancel</button>
              <button disabled={!canSubmit || createUpload.isLoading} onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {createUpload.isLoading ? 'Uploading…' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Modal appended within same component render above
// Inserted near return earlier for visibility


