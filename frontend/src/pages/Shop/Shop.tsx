import { useMemo, useState } from "react";
import useProducts from "../../hooks/useProducts";
import useCollections from "../../hooks/useCollection";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import FilterSidebar from "./FilterSidebar";
import ShopHeader from "./ShopHeader";
import ShopToolbar from "./ShopToolbar";
import Pagination from "../../components/Pagination";

function Shop() {
  const [searchParams] = useSearchParams();
  const initCategory = searchParams.get("category");

  const { collections } = useCollections();

  type SortOption = "name" | "createdAt";

  const ITEMS_PER_PAGE = 6;

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initCategory ? [initCategory] : [],
  );

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { products, error, loading, refetch } = useProducts({
    page,
    category: selectedCategories[0],
    sortBy,
  });

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const filtered = useMemo(() => {
    let list = [...products];

    if (selectedCategories.length > 0) {
        list = list.filter(p => selectedCategories.includes(p.category.name))
    }

    // switch(sortBy) {
    //     case "price-asc": list.sort((a, b) => a.)
    // }

    return list;
  }, [selectedCategories, sortBy])

  const totalPages = filtered.length / ITEMS_PER_PAGE;

  const clearFilters = () => {
    setSelectedCategories([]);
    setPage(1);
  };

  return (
    <div className="bg-(--color-ivory) min-h-screen">
      <ShopHeader {...selectedCategories} />

      <div className="max-w-350 mx-auto px-6 lg:px-10 py-10">
        <div className="flex gap-10">
          <aside className="hidden lg:block shrink-0 w-60">
            <div className="sticky top-28">
              <FilterSidebar
                collections={collections}
                selectedCategories={selectedCategories}
                toggleCategory={toggleCategory}
              />
            </div>
          </aside>
        </div>
      </div>

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
              <button onClick={() => setSidebarOpen(false)}>
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
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
        {/* Toolbar */}
        <ShopToolbar
            products={products}
            setPage={setPage}
            sortBy={sortBy}
            setSortBy={setSortBy}
            setSidebarOpen={setSidebarOpen}
        />

        {!loading && error && (
          <div className="col-span-full py-10 text-center">
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

        {/* Grid */}
        {!loading && !error && filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-4xl mb-4">✦</p>
            <p
              className="text-[#888] font-display text-xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              No fragrances found
            </p>
            <button onClick={clearFilters} className="mt-6 btn-primary">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((product) => {
              //   const wishlisted = isWishlisted(product.id);
              return (
                <div
                  key={product._id}
                  className="product-card group bg-white relative flex flex-col"
                >
                  {/* Badges */}
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                    {product.isBestSeller && (
                      <span
                        className="bg-[#0F5132] text-white text-[0.58rem] tracking-[0.12em] uppercase px-2 py-0.5 font-medium"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        Bestseller
                      </span>
                    )}
                    {product.isNewArrival && (
                      <span
                        className="bg-[#C9A227] text-white text-[0.58rem] tracking-[0.12em] uppercase px-2 py-0.5 font-medium"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        New
                      </span>
                    )}
                  </div>
                  <button
                    // onClick={() => toggleWishlist(product.id)}
                    className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition-all"
                    aria-label="Wishlist"
                  >
                    {/* <svg width="14" height="14" viewBox="0 0 24 24" fill={wishlisted ? "#C9A227" : "none"} stroke={wishlisted ? "#C9A227" : "#888"} strokeWidth="1.8">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg> */}
                  </button>
                  <Link
                    to={`/product/${product._id}`}
                    className="block overflow-hidden bg-[#f5f2ec] aspect-3/4"
                  >
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="product-img w-full h-full object-cover"
                    />
                  </Link>
                  <div className="p-5 flex flex-col flex-1">
                    <p
                      className="text-[0.6rem] tracking-[0.2em] uppercase text-[#C9A227] mb-1"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {product.category.name}
                    </p>
                    <Link
                      to={`/product/${product._id}`}
                      className="font-display text-base font-semibold text-[#222] hover:text-[#0F5132] transition-colors mb-1 leading-snug"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {product.name}
                    </Link>
                    <p
                      className="text-xs text-[#999] mb-3 font-light italic"
                      style={{ fontFamily: "var(--font-accent)" }}
                    >
                      {/* {product.subtitle} */}
                    </p>
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className="font-display text-lg font-semibold text-[#0F5132]"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        ₹
                      </span>
                      {/* {product.originalPrice && (
                            <span className="text-sm text-[#bbb] line-through" style={{ fontFamily: "var(--font-sans)" }}>
                              ₹{product.originalPrice.toLocaleString()}
                            </span>
                          )} */}
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button
                        // onClick={() => addToCart(product, product.sizes[0])}
                        className="btn-primary flex-1"
                      >
                        Add to Cart
                      </button>
                      <Link
                        to={`/product/${product._id}`}
                        className="px-3 border border-[#d0ccc0] flex items-center justify-center hover:border-[#C9A227] transition-colors"
                      >
                        <svg
                          width="15"
                          height="15"
                          fill="none"
                          stroke="#888"
                          strokeWidth="1.8"
                          viewBox="0 0 24 24"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

        {totalPages > 0 && (
          <Pagination 
           totalPages={totalPages}
           setPage={setPage}
           page={page}
          />
        )}
    </div>
  );
}
export default Shop;
