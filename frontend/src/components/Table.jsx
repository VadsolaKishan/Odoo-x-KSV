import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export const Table = ({
  headers = [],
  data = [],
  loading = false,
  emptyMessage = 'No items found.',
  rowsPerPage = 10,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination logic
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + rowsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="w-full bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800/60 rounded-2xl overflow-hidden shadow-premium-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-neutral-950/20 border-b border-slate-200 dark:border-neutral-800 text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider select-none">
              {headers.map((header, index) => (
                <th key={index} className="px-6 py-4.5 font-semibold">
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/40 text-xs">
            {loading ? (
              // Loading Shimmer Skeletons
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {headers.map((_, hIdx) => (
                    <td key={hIdx} className="px-6 py-5">
                      <div className="h-4 bg-slate-200 dark:bg-neutral-800 rounded-lg w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={headers.length} className="px-6 py-16 text-center text-slate-400 dark:text-neutral-500">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-950 text-slate-300 dark:text-neutral-700 border border-slate-150 dark:border-neutral-800/50">
                      <Inbox className="w-8 h-8" />
                    </div>
                    <p className="font-semibold text-slate-500 dark:text-neutral-450">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              paginatedData.map((row, rIdx) => (
                <tr 
                  key={row.id || rIdx} 
                  className="hover:bg-slate-50/60 dark:hover:bg-neutral-850/20 transition-all duration-200 text-slate-700 dark:text-neutral-350"
                >
                  {headers.map((header, hIdx) => (
                    <td key={hIdx} className="px-6 py-4.5 font-medium">
                      {header.render ? header.render(row) : row[header.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Actions */}
      {!loading && data.length > rowsPerPage && (
        <div className="flex items-center justify-between px-6 py-4.5 border-t border-slate-150 dark:border-neutral-800/80 bg-slate-50/40 dark:bg-neutral-950/10 select-none">
          <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium">
            Showing <span className="font-bold text-slate-700 dark:text-neutral-300">{startIndex + 1}</span> to{' '}
            <span className="font-bold text-slate-700 dark:text-neutral-300">{Math.min(startIndex + rowsPerPage, data.length)}</span> of{' '}
            <span className="font-bold text-slate-700 dark:text-neutral-300">{data.length}</span> entries
          </span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-850 disabled:opacity-40 disabled:cursor-not-allowed hover:border-slate-300 dark:hover:border-neutral-700 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-700 dark:text-neutral-300 font-display">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-850 disabled:opacity-40 disabled:cursor-not-allowed hover:border-slate-300 dark:hover:border-neutral-700 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
