import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { useCrmTheme } from '../context/CrmThemeContext';

export interface Column<T> {
  key: string;
  header: string;
  accessor?: (item: T) => any;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
  selectedValue: string;
  onChange: (value: string) => void;
}

interface CrmDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  headerRightAction?: React.ReactNode;
  onRowClick?: (item: T) => void;
  searchPlaceholder?: string;
  searchFields?: ((item: T) => string | undefined | null)[];
  filterGroups?: FilterGroup[];
  initialPageSize?: number;
  pageSizeOptions?: number[];
  emptyMessage?: string;
  emptySubtext?: string;
  emptyIcon?: React.ReactNode;
  defaultSortKey?: string;
  defaultSortDirection?: 'asc' | 'desc';
}

export function CrmDataTable<T>({
  data,
  columns,
  keyExtractor,
  title,
  subtitle,
  icon,
  headerRightAction,
  onRowClick,
  searchPlaceholder = 'Search records...',
  searchFields,
  filterGroups = [],
  initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  emptyMessage = 'No records found',
  emptySubtext = 'Try adjusting your search query or filters.',
  emptyIcon,
  defaultSortKey,
  defaultSortDirection = 'desc',
}: CrmDataTableProps<T>) {
  const { theme } = useCrmTheme();
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortKey, setSortKey] = useState<string | undefined>(defaultSortKey);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  const [jumpPageInput, setJumpPageInput] = useState('');

  // Reset to page 1 on search or filter change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Sorting handler
  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortKey(undefined); // reset
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // 1. Filter data by search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase().trim();

    return data.filter((item) => {
      if (searchFields && searchFields.length > 0) {
        return searchFields.some((fn) => {
          const val = fn(item);
          return val ? String(val).toLowerCase().includes(query) : false;
        });
      }

      // Default: inspect all column accessors/keys
      return columns.some((col) => {
        let val: any;
        if (col.accessor) {
          val = col.accessor(item);
        } else if ((item as any)[col.key] !== undefined) {
          val = (item as any)[col.key];
        }
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, searchFields, columns]);

  // 2. Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filteredData;

    return [...filteredData].sort((a, b) => {
      let valA: any = col.accessor ? col.accessor(a) : (a as any)[sortKey];
      let valB: any = col.accessor ? col.accessor(b) : (b as any)[sortKey];

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();

      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDirection, columns]);

  // 3. Pagination math
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, safeCurrentPage, pageSize]);

  const startRange = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endRange = Math.min(safeCurrentPage * pageSize, totalItems);

  // Pagination page numbers generation
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (safeCurrentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', totalPages);
      }
    }
    return pages;
  }, [safeCurrentPage, totalPages]);

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setJumpPageInput('');
    }
  };

  return (
    <div className={`space-y-4 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
      {/* 1. Header & Quick Controls */}
      {(title || headerRightAction) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {title && (
            <div className="flex items-center gap-2.5">
              {icon && (
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isDark
                      ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400'
                      : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                  }`}
                >
                  {icon}
                </div>
              )}
              <div>
                <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {title}
                </h2>
                {subtitle && (
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>
                )}
              </div>
            </div>
          )}

          {headerRightAction && <div className="flex items-center gap-2">{headerRightAction}</div>}
        </div>
      )}

      {/* 2. Search Bar & Filter Controls */}
      <div
        className={`p-3.5 rounded-2xl border transition-all ${
          isDark
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search
              className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isDark
                  ? 'bg-slate-950 border border-slate-800 text-white placeholder-slate-500'
                  : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-1.5 py-0.5 rounded-md ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Dropdowns / Groups */}
          {filterGroups.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {filterGroups.map((fg) => (
                <div key={fg.key} className="flex items-center gap-1.5">
                  <select
                    value={fg.selectedValue}
                    onChange={(e) => {
                      fg.onChange(e.target.value);
                      setCurrentPage(1);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer ${
                      isDark
                        ? 'bg-slate-950 border border-slate-800 text-slate-200'
                        : 'bg-slate-50 border border-slate-200 text-slate-800'
                    }`}
                  >
                    {fg.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* Results Counter & Page Size Selector */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
            <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Showing <strong className={isDark ? 'text-white' : 'text-slate-900'}>{totalItems}</strong> entries
            </span>

            <div className="flex items-center gap-1.5">
              <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className={`py-1.5 px-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer ${
                  isDark
                    ? 'bg-slate-950 border border-slate-800 text-slate-200'
                    : 'bg-slate-50 border border-slate-200 text-slate-800'
                }`}
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Data Table Container */}
      <div
        className={`rounded-3xl border overflow-hidden shadow-xs transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-xs">
            <thead
              className={`border-b uppercase text-[10px] tracking-wider font-bold select-none ${
                isDark
                  ? 'bg-slate-950/90 border-slate-800 text-slate-400'
                  : 'bg-slate-100/90 border-slate-200 text-slate-600'
              }`}
            >
              <tr>
                {columns.map((col) => {
                  const isSorted = sortKey === col.key;
                  const isSortable = col.sortable !== false;

                  return (
                    <th
                      key={col.key}
                      onClick={() => isSortable && handleSort(col.key)}
                      className={`p-3.5 ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      } ${isSortable ? 'cursor-pointer hover:text-emerald-500 transition-colors' : ''} ${
                        col.headerClassName || ''
                      }`}
                    >
                      <div
                        className={`inline-flex items-center gap-1.5 ${
                          col.align === 'right'
                            ? 'justify-end'
                            : col.align === 'center'
                            ? 'justify-center'
                            : 'justify-start'
                        }`}
                      >
                        <span>{col.header}</span>
                        {isSortable && (
                          <span className="shrink-0">
                            {isSorted ? (
                              sortDirection === 'asc' ? (
                                <ArrowUp className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <ArrowDown className="w-3.5 h-3.5 text-emerald-500" />
                              )
                            ) : (
                              <ArrowUpDown className="w-3 h-3 opacity-30" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
                {onRowClick && (
                  <th className="p-3.5 text-right w-16">
                    <span className="sr-only">Details</span>
                  </th>
                )}
              </tr>
            </thead>

            <tbody
              className={`divide-y ${
                isDark ? 'divide-slate-800/60' : 'divide-slate-200/80'
              }`}
            >
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (onRowClick ? 1 : 0)}
                    className="p-12 text-center"
                  >
                    <div className="max-w-sm mx-auto space-y-3">
                      {emptyIcon ? (
                        emptyIcon
                      ) : (
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
                            isDark
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <Search className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h4
                          className={`text-sm font-bold ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {emptyMessage}
                        </h4>
                        <p
                          className={`text-xs mt-0.5 ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          {emptySubtext}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => {
                  const rowKey = keyExtractor(item);
                  return (
                    <tr
                      key={rowKey}
                      onClick={() => onRowClick && onRowClick(item)}
                      className={`transition-colors group ${
                        onRowClick ? 'cursor-pointer' : ''
                      } ${
                        isDark
                          ? 'hover:bg-slate-850/80'
                          : 'hover:bg-emerald-50/50'
                      }`}
                    >
                      {columns.map((col) => {
                        return (
                          <td
                            key={col.key}
                            className={`p-3.5 ${
                              col.align === 'right'
                                ? 'text-right'
                                : col.align === 'center'
                                ? 'text-center'
                                : 'text-left'
                            } ${col.className || ''}`}
                          >
                            {col.render
                              ? col.render(item, index)
                              : col.accessor
                              ? col.accessor(item)
                              : (item as any)[col.key] || '—'}
                          </td>
                        );
                      })}
                      {onRowClick && (
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            title="View Entity Details"
                            className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                              isDark
                                ? 'text-slate-400 group-hover:text-emerald-400 group-hover:bg-slate-800'
                                : 'text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-100/60'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Pagination Footer Bar */}
        {totalItems > 0 && (
          <div
            className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
              isDark
                ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                : 'bg-slate-50/80 border-slate-200 text-slate-600'
            }`}
          >
            {/* Range info */}
            <div>
              <span>
                Showing <strong className={isDark ? 'text-white' : 'text-slate-900'}>{startRange}</strong> to{' '}
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>{endRange}</strong> of{' '}
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>{totalItems}</strong> records
              </span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {/* First Page */}
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage === 1}
                className={`p-1.5 rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                    : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Prev Page */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className={`p-1.5 rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                    : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1">
                {pageNumbers.map((p, idx) => {
                  if (p === '...') {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-500 font-bold select-none">
                        ...
                      </span>
                    );
                  }

                  const isCurrent = p === safeCurrentPage;
                  return (
                    <button
                      key={`page-${p}`}
                      type="button"
                      onClick={() => setCurrentPage(Number(p))}
                      className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isDark
                          ? 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300'
                          : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              {/* Next Page */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                className={`p-1.5 rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                    : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last Page */}
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage === totalPages}
                className={`p-1.5 rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                    : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>

              {/* Jump to Page Form */}
              {totalPages > 3 && (
                <form onSubmit={handleJumpPage} className="hidden md:flex items-center gap-1 ml-2">
                  <span className="text-[11px] text-slate-500">Go to:</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={jumpPageInput}
                    onChange={(e) => setJumpPageInput(e.target.value)}
                    placeholder="#"
                    className={`w-12 py-1 px-1.5 text-center text-xs font-bold rounded-lg border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
