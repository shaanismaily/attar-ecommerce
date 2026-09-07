import { Link } from "react-router-dom";
import type { RelatedProduct } from "../../api/products";

type RelatedProductsProps = {
  products: RelatedProduct[];
  categoryName: string;
};

function RelatedProducts({ products, categoryName }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <div className="mt-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="section-label mb-3">You May Also Like</p>
          <h2 className="text-3xl font-bold text-[#222]" style={{ fontFamily: "var(--font-display)" }}>
                  From the {categoryName} Collection
                </h2>
        </div>
        <Link
          to={`/shop?category=${categoryName}`}
          className="hidden md:flex items-center gap-2 text-[0.72rem] tracking-widest uppercase text-[#0F5132] hover:text-[#C9A227] transition-colors"
        >
          View All
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Link
            key={product._id}
            to={`/product/${product.slug}`}
            className="product-card group bg-white"
          >
            <div className="overflow-hidden aspect-4/3 bg-[#f5f2ec]">
              <img
                src={product.images[0]?.url}
                alt={product.name}
                className="product-img w-full h-full object-cover"
              />
            </div>
            <div className="p-5">
                    <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[#C9A227] mb-1" style={{ fontFamily: "var(--font-sans)" }}>{product.category.name}</p>
                    <h3 className="font-semibold text-[#222] mb-2" style={{ fontFamily: "var(--font-display)" }}>{product.name}</h3>
                    <span className="text-lg font-bold text-[#0F5132]" style={{ fontFamily: "var(--font-display)" }}>₹{product.startingPrice.toLocaleString()}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default RelatedProducts;
