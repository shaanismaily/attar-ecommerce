import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import useProducts from "../../hooks/useProducts";
import useCollections from "../../hooks/useCollection";
import FilterSidebar from "./FilterSidebar";
import ShopHeader from "./ShopHeader";
import ShopToolbar from "./ShopToolbar";
import Pagination from "../../components/Pagination";
import ProductGrid from "./ProductGrid";

type SortOption = "name" | "createdAt";

const ITEMS_PER_PAGE = 6;

function Shop() {
  const [searchParams] = useSearchParams();
  const initCategory = searchParams.get("category");

  const { collections } = useCollections();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initCategory ? [initCategory] : [],
  );

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const params = {
    page,
    limit: ITEMS_PER_PAGE,
    category: selectedCategories.join(","),
    sortBy,
  };

  const { products, totalPages, error, loading, refetch } = useProducts(params);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );

    setPage(1);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPage(1);
  };

  return (
    <>
      <ShopHeader
        selectedCategories={selectedCategories}
        collections={collections}
      />

      <div className="max-w-350 mx-auto px-6 lg:px-10 py-10">
        <div className="flex gap-10">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block shrink-0 w-60">
            <div className="sticky top-28">
              <FilterSidebar
                collections={collections}
                selectedCategories={selectedCategories}
                toggleCategory={toggleCategory}
              />
            </div>
          </aside>

          {/* Mobile Sidebar */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div
                className="bg-black/40 flex-1"
                onClick={() => setSidebarOpen(false)}
              />

              <div className="bg-white w-72 p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3
                    className="font-semibold text-[#222]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Filters
                  </h3>

                  <button onClick={() => setSidebarOpen(false)}>✕</button>
                </div>

                <FilterSidebar
                  collections={collections}
                  selectedCategories={selectedCategories}
                  toggleCategory={toggleCategory}
                />
              </div>
            </div>
          )}

          {/* Main */}
          <div className="flex-1 min-w-0">
            <ShopToolbar
              products={products}
              sortBy={sortBy}
              setSortBy={handleSortChange}
              setSidebarOpen={setSidebarOpen}
            />

            {/* Error */}
            {!loading && error && (
              <div className="py-10 text-center">
                <p className="text-(--color-charcoal) mb-4">{error}</p>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => void refetch()}
                >
                  Try again
                </button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && products?.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-4xl mb-4">✦</p>

                <p
                  className="text-[#888] font-display text-xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  No fragrances found
                </p>

                <button onClick={clearFilters} className="mt-6 btn-primary">
                  Clear filters
                </button>
              </div>
            ) : (
              <ProductGrid products={products} />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                totalPages={totalPages}
                setPage={setPage}
                page={page}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Shop;
