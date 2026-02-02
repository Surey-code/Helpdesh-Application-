import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

const statusColors = {
  OPEN: 'text-emerald-600 dark:text-emerald-400',
  IN_PROGRESS: 'text-blue-600 dark:text-blue-400',
  WAITING: 'text-indigo-600 dark:text-indigo-400',
  RESOLVED: 'text-slate-600 dark:text-slate-400',
  CLOSED: 'text-slate-500 dark:text-slate-500',
};

const priorityColors = {
  LOW: 'text-slate-500',
  MEDIUM: 'text-blue-600 dark:text-blue-400',
  HIGH: 'text-blue-600 dark:text-blue-400',
  URGENT: 'text-red-600 dark:text-red-400',
};

function DataTable({ data, columns, onRowClick, renderActions, pageSize = 10 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = data.slice(startIndex, startIndex + pageSize);

  return (
    <div className="glass-card overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {paginatedData.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => {
                  let cellContent = column.render ? column.render(row[column.key], row) : row[column.key];

                  if (column.key === 'status') {
                    const formattedStatus = cellContent.replace('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
                    cellContent = (
                      <span className={cn('font-medium', statusColors[cellContent] || statusColors.OPEN)}>
                        {formattedStatus}
                      </span>
                    );
                  } else if (column.key === 'priority') {
                    const formattedPriority = cellContent.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
                    cellContent = (
                      <span className={cn('font-medium', priorityColors[cellContent] || priorityColors.MEDIUM)}>
                        {formattedPriority}
                      </span>
                    );
                  } else if (column.key === 'createdAt') {
                    cellContent = format(new Date(cellContent), 'MMM dd, yyyy');
                  } else if (column.key === 'customer' && row.customer) {
                    cellContent = row.customer.name;
                  } else if (column.key === 'assignedAgent' && row.assignedAgent) {
                    cellContent = row.assignedAgent.name || 'Unassigned';
                  } else if (column.key === 'slaBreached') {
                    cellContent = row.slaBreached ? (
                      <span className="text-red-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-green-600">No</span>
                    );
                  }

                  return (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                      {cellContent}
                    </td>
                  );
                })}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  {renderActions ? (
                    renderActions(row)
                  ) : (
                    <Link
                      to={`/tickets/${row.id}`}
                      className="inline-flex items-center gap-1 text-brand-600 hover:text-blue-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Eye size={16} />
                      View
                    </Link>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, data.length)} of {data.length} results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
