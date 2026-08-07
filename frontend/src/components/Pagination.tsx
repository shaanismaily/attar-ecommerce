import type { Dispatch, SetStateAction } from "react";

type PaginationProps = {
  page: number;
  totalPages: number;
  setPage: Dispatch<SetStateAction<number>>;
};

function Pagination({ page, totalPages, setPage }: PaginationProps) {
  const visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(
      (p) => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1),
    )
    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) {
        acc.push("...");
      }
      acc.push(p);
      return acc;
    }, []);

  return (
    <nav
      aria-label="Page navigation"
      className="flex justify-center gap-3 items-center mt-6"
    >
      <button
        aria-label="Previous page"
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 border border-[#d0ccc0] flex items-center justify-center text-[#666] hover:border-[#0F5132] hover:text-[#0F5132] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <div className="flex gap-2">
        {visiblePages.map((item, idx) =>
          item === "..." ? (
            <span
              key={`ellipsis-${page}-${idx}`}
              className="px-1 text-[0.9rem] text-(--color-charcoal-light)"
            >
              {item}
            </span>
          ) : (
            <button
              key={item}
              onClick={() => setPage(item)}
              className={`w-9 h-9 border text-sm transition-colors ${
                item === page
                  ? "border-[#0F5132] bg-[#0F5132] text-white"
                  : "border-[#d0ccc0] text-[#666] hover:border-[#C9A227]"
              }`}
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <button
        aria-label="Next page"
        onClick={() => setPage(page + 1)}
        disabled={page === totalPages}
        className="w-9 h-9 border border-[#d0ccc0] flex items-center justify-center text-[#666] hover:border-[#0F5132] hover:text-[#0F5132] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <svg
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </nav>
  );
}

export default Pagination;
