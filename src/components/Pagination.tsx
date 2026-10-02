import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with ellipses for wide screens
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const pages = getPageNumbers();

  return (
    <div
      className={`mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6 ${className}`}
      aria-label="Pagination Navigation"
    >
      {/* Range Status */}
      <span className="font-mono text-xs text-zinc-500 order-2 sm:order-1">
        Showing <span className="text-zinc-300 font-medium">{startItem}–{endItem}</span> of{" "}
        <span className="text-zinc-300 font-medium">{totalItems}</span> references
      </span>

      {/* Navigation Controls */}
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous Page"
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900/60 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:bg-zinc-800 hover:text-white disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Mobile Page Indicator (compact) */}
        <div className="flex items-center sm:hidden px-2 text-xs font-mono text-zinc-400">
          <span className="text-white font-semibold">{currentPage}</span>
          <span className="mx-1 text-zinc-600">/</span>
          <span>{totalPages}</span>
        </div>

        {/* Desktop Page Numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1.5 py-1 text-xs text-zinc-600 font-mono select-none"
                >
                  ...
                </span>
              );
            }

            const pageNum = p as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                aria-current={isActive ? "page" : undefined}
                className={`min-w-[32px] h-8 rounded-lg text-xs font-mono font-medium transition ${
                  isActive
                    ? "bg-zinc-100 text-zinc-950 font-bold shadow-sm"
                    : "border border-transparent text-zinc-400 hover:border-white/10 hover:bg-zinc-800/80 hover:text-zinc-200"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next Page"
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900/60 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:bg-zinc-800 hover:text-white disabled:pointer-events-none disabled:opacity-30"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
