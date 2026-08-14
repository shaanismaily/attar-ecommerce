import type { Product } from "../../api/products";

type SortOption = "name" | "createdAt";

type ToolbarProps = {
    products: Product[],
    setSidebarOpen: (val: boolean) => void,
    sortBy: SortOption,
    setSortBy: (val: SortOption) => void,
}

function ShopToolbar({ products, setSidebarOpen, setSortBy, sortBy }: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-5 border-b border-[#e8e4d8]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-[#d0ccc0] text-[0.72rem] tracking-wide uppercase"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="6" y1="12" x2="18" y2="12" />
                <line x1="9" y1="17" x2="15" y2="17" />
              </svg>
              Filters
            </button>
            <p
              className="text-sm text-[#888]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {products?.length} fragrances
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-[0.7rem] tracking-wide uppercase text-[#888]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Sort by
            </span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as SortOption);
              }}
              className="border border-[#d0ccc0] px-3 py-2 text-sm text-[#444] bg-white outline-none focus:border-[#C9A227] cursor-pointer"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              <option value="name">Name</option>
              <option value="createdAt">Newest</option>
            </select>
          </div>
        </div>
  )
}

export default ShopToolbar