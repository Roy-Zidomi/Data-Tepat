import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import Spinner from './Spinner';

/**
 * DataTable - Reusable table component with client-side sort, search, and server-driven pagination.
 *
 * Props:
 * - columns: Array of { key, label, sortable?, render? }
 * - data: Array of row objects
 * - loading: boolean
 * - meta: { total, page, limit, totalPages, hasNextPage, hasPrevPage } (from API)
 * - onPageChange: (page) => void
 * - onSearch: (searchString) => void  (optional, for server-side search)
 * - searchPlaceholder: string
 * - emptyMessage: string
 */
const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  meta = null,
  onPageChange,
  onSearch,
  searchPlaceholder = 'Cari...',
  emptyMessage = 'Tidak ada data ditemukan',
  className = '',
}) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Client-side sort
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'string') {
        return sortDir === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [data, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const SortIcon = ({ column }) => {
    if (sortKey !== column) return <ChevronsUpDown className="w-3.5 h-3.5 text-surface-400" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 text-primary-500" />
      : <ChevronDown className="w-3.5 h-3.5 text-primary-500" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search bar */}
      {onSearch && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-surface-200 dark:border-surface-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-50 dark:bg-surface-800/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left font-medium text-surface-600 dark:text-surface-400 whitespace-nowrap ${
                    col.sortable !== false ? 'cursor-pointer select-none hover:text-surface-900 dark:hover:text-surface-200' : ''
                  }`}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable !== false && <SortIcon column={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-12">
                  <Spinner size="md" text="Memuat data..." />
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-surface-500 dark:text-surface-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-surface-700 dark:text-surface-300 whitespace-nowrap">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Menampilkan {((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} dari {meta.total} data
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(meta.page - 1)}
              disabled={!meta.hasPrevPage}
              className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
              let pageNum;
              if (meta.totalPages <= 5) {
                pageNum = i + 1;
              } else if (meta.page <= 3) {
                pageNum = i + 1;
              } else if (meta.page >= meta.totalPages - 2) {
                pageNum = meta.totalPages - 4 + i;
              } else {
                pageNum = meta.page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    pageNum === meta.page
                      ? 'bg-primary-600 text-white'
                      : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-400'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(meta.page + 1)}
              disabled={!meta.hasNextPage}
              className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Halaman berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
