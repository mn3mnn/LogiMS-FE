import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCompanies } from '../../hooks/useCompanies';
import { useCreateFileUpload, useDeleteFileUpload, useFileUploads } from '../../hooks/useFileUploads';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import Button from '../../components/ui/button/Button';
import config from '../../config/env';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
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

export default function FilesPage() {
  const { t } = useTranslation();
  const { companies } = useCompanies();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [companyCode, setCompanyCode] = useState<string | 'All'>('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [fileType, setFileType] = useState<'payments' | 'trips' | ''>('');
  const [status, setStatus] = useState<'pending' | 'processing' | 'completed' | 'failed' | ''>('');
  const [isNewOpen, setIsNewOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const uploadIdFromUrl = query.get('id');

  const { data, isLoading, isFetching, error } = useFileUploads({
    page,
    pageSize,
    companyCode,
    search: debouncedSearch,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    fileType: fileType || undefined,
    status: status || undefined,
    uploadId: uploadIdFromUrl ? Number(uploadIdFromUrl) : undefined,
  });

  const { mutateAsync: deleteUpload, isPending: isDeleting } = useDeleteFileUpload();

  const total = data?.count ?? 0;
  const results = data?.results ?? [];
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    const tId = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(tId);
  }, [search]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this upload?')) return;
    await deleteUpload(id);
  };

  const { token } = useAuth();
  const handleOpenFile = async (id: number) => {
    try {
      const { data: detail } = await axios.get(`${config.API_BASE_URL}/v1/data-imports/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const fileUrl: string | undefined = detail?.file;
      if (!fileUrl) return;
      const isAbsolute = /^https?:\/\//i.test(fileUrl);
      const backendBase = config.API_BASE_URL.replace(/\/$/, '').replace(/\/api\/?$/, '');
      const fullUrl = isAbsolute ? fileUrl : `${backendBase}${fileUrl}`;
      window.open(fullUrl, '_blank');
    } catch (e) {
      console.error('Failed to open file', e);
    }
  };

  const renderStatus = (status: string) => {
    const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';
    const map: Record<string, string> = {
      pending: `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300`,
      processing: `${base} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300`,
      completed: `${base} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300`,
      failed: `${base} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300`,
    };
    return <span className={map[status] || base}>{status}</span>;
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [newCompany, setNewCompany] = useState<string>('');
  const [newFrom, setNewFrom] = useState<string>('');
  const [newTo, setNewTo] = useState<string>('');
  const createUpload = useCreateFileUpload();

  const canSubmit = useMemo(() => {
    return !!newCompany && !!newFrom && !!newTo && !!uploadFile;
  }, [newCompany, newFrom, newTo, uploadFile]);

  const handleCreate = async () => {
    const file = uploadFile;
    if (!file) return;
    await createUpload.mutateAsync({
      company: Number(newCompany),
      from_date: newFrom,
      to_date: newTo,
      file,
      file_type: fileType || 'payments',
    });
    setIsNewOpen(false);
    setNewCompany('');
    setNewFrom('');
    setNewTo('');
    setUploadFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Helpers for filename inference
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const inferFromFilename = (filename: string) => {
    const base = filename.split('\\').pop()!.split('/').pop()!; // handle paths
    const match = base.match(/^(\d{8})-(\d{8})-([a-zA-Z_]+)-(.+)\.[A-Za-z0-9]+$/);
    if (!match) return;
    const [, fromRaw, toRaw, kindRaw] = match;
    const toIso = (d: string) => `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`;
    setNewFrom(toIso(fromRaw));
    setNewTo(toIso(toRaw));

    const kind = kindRaw.toLowerCase();
    if (kind.includes('trip')) setFileType('trips');
    else if (kind.includes('pay')) setFileType('payments');
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">File Uploads</h2>
        <Button onClick={() => setIsNewOpen(true)} size="sm" className="!px-4 !py-2 text-sm">+ {t('payroll.newUpload')}</Button>
      </div>

      {/* Search bar above filters */}
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
        <div>
          <label className="block text-sm mb-1">{t('payroll.fileType')}</label>
          <select value={fileType} onChange={(e) => { setFileType(e.target.value as any); setPage(1); }} className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white">
            <option value="">All</option>
            <option value="payments">Payments</option>
            <option value="trips">Trips</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">{t('payroll.status')}</label>
          <select value={status} onChange={(e) => { setStatus(e.target.value as any); setPage(1); }} className="border rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white">
            <option value="">{t('payroll.all')}</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('payroll.tableHeaders.id')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('payroll.tableHeaders.company')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('payroll.tableHeaders.file')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('payroll.tableHeaders.from')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('payroll.tableHeaders.to')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('payroll.tableHeaders.status')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('payroll.tableHeaders.error')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('payroll.tableHeaders.created')}</TableCell>
                <TableCell isHeader className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t('payroll.tableHeaders.actions')}</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {error && (
                <TableRow><TableCell colSpan={9} className="px-3 py-3 text-red-600 text-sm">{String((error as any)?.message || error)}</TableCell></TableRow>
              )}
              {isLoading && (
                <TableRow><TableCell colSpan={9} className="px-3 py-5 text-sm">{t('payroll.loading')}</TableCell></TableRow>
              )}
              {!isLoading && results.length === 0 && (
                <TableRow><TableCell colSpan={9} className="px-3 py-5 text-sm">{t('payroll.noUploadsFound')}</TableCell></TableRow>
              )}
              {results.map((u) => (
                <TableRow key={u.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <TableCell className="px-3 py-2 text-sm">{u.id}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{u.company_name}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">
                    {u.file_name ? (
                      u.file_url ? (
                        <a href={u.file_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                          {u.file_name}
                        </a>
                      ) : (
                        <button
                          onClick={() => handleOpenFile(u.id)}
                          className="text-blue-600 hover:underline"
                          title={t('payroll.openFile')}
                        >
                          {u.file_name}
                        </button>
                      )
                    ) : '-'}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-sm">{u.from_date}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{u.to_date}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">{renderStatus(u.status)}</TableCell>
                  <TableCell className="px-3 py-2 text-xs text-red-600">{u.status === 'failed' ? (u as any).error_message ?? '-' : '-'}</TableCell>
                  <TableCell className="px-3 py-2 text-xs text-gray-500">{new Date(u.created_at).toLocaleString()}</TableCell>
                  <TableCell className="px-3 py-2 text-sm">
                    <button
                      className="px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 disabled:opacity-50 text-xs"
                      onClick={() => handleDelete(u.id)}
                      disabled={isDeleting}
                    >
{t('common.delete')}
                    </button>
                  </TableCell>
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
              {t('payroll.totalFiles', { count: total })}
              {isFetching && <LoadingSpinner size="small" />}
            </div>
          </div>
        </div>
      </div>

      {isNewOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsNewOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">{t('payroll.newUpload')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">{t('payroll.fileUpload')}</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setUploadFile(f);
                    if (f) inferFromFilename(f.name);
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">{t('payroll.autoFillNote')}</p>
              </div>
              <div>
                <label className="block text-sm mb-1">{t('payroll.type')}</label>
                <select value={fileType || 'payments'} onChange={(e) => setFileType(e.target.value as any)} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white">
                  <option value="payments">Payments</option>
                  <option value="trips">Trips</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">{t('payroll.company')}</label>
                <select value={newCompany} onChange={(e) => setNewCompany(e.target.value)} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white">
                  <option value="">Select company</option>
                  {companies.filter(c => c.is_active).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">{t('payroll.fromDate')}</label>
                <input type="date" value={newFrom} onChange={(e) => setNewFrom(e.target.value)} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('payroll.toDate')}</label>
                <input type="date" value={newTo} onChange={(e) => setNewTo(e.target.value)} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white" />
              </div>
              
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition"
                onClick={() => setIsNewOpen(false)}
              >
{t('payroll.cancel')}
              </button>
                <button
                  disabled={!canSubmit || createUpload.isPending}
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                  {createUpload.isPending ? 'Uploading…' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


