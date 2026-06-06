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
    <div className="w-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800/80 rounded-2xl overflow-hidden shadow-premium dark:shadow-dark-premium">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-dark-950/40 border-b border-slate-200 dark:border-dark-800 text-[10px] font-bold text-slate-500 dark:text-dark-400 uppercase tracking-wider select-none">
              {headers.map((header, index) => (
                <th key={index} className="px-6 py-4">
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 dark:divide-dark-800/60 text-xs">
            {loading ? (
              // Loading Shimmer Skeletons
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {headers.map((_, hIdx) => (
                    <td key={hIdx} className="px-6 py-4.5">
                      <div className="h-4 bg-slate-200 dark:bg-dark-800 rounded-lg w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={headers.length} className="px-6 py-12 text-center text-slate-400 dark:text-dark-500">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-dark-950 text-slate-300 dark:text-dark-750">
                      <Inbox className="w-8 h-8" />
                    </div>
                    <p className="font-semibold text-slate-500 dark:text-dark-400">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              paginatedData.map((row, rIdx) => (
                <tr 
                  key={row.id || rIdx} 
                  className="hover:bg-slate-50/50 dark:hover:bg-dark-850/20 transition-colors text-slate-700 dark:text-dark-300"
                >
                  {headers.map((header, hIdx) => (
                    <td key={hIdx} className="px-6 py-4 font-medium">
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
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-150 dark:border-dark-800/80 bg-slate-50/50 dark:bg-dark-950/20 select-none">
          <span className="text-xs text-slate-500 dark:text-dark-400">
            Showing <span className="font-bold">{startIndex + 1}</span> to{' '}
            <span className="font-bold">{Math.min(startIndex + rowsPerPage, data.length)}</span> of{' '}
            <span className="font-bold">{data.length}</span> entries
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-dark-800 text-slate-500 dark:text-dark-450 hover:bg-slate-100 dark:hover:bg-dark-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-750 dark:text-dark-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-dark-800 text-slate-500 dark:text-dark-450 hover:bg-slate-100 dark:hover:bg-dark-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
