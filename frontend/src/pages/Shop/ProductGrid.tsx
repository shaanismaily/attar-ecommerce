import { Link } from "react-router-dom";
import type { Product } from "../../api/products";

type ProductGridProps = {
    products: Product[]
}

function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => {
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
                    to={`/product/${product.slug}`}
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
                        to={`/product/${product.slug}`}
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
  )
}

export default ProductGrid