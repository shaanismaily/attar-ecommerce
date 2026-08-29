import { useState } from "react";
import { Link } from "react-router-dom";
import { type Product } from "../api/products";
import useCart from "../hooks/useCart";

function ProductCard({ product }: { product: Product }) {
  const { addItemToCart } = useCart();
  const [hovered, setHovered] = useState(false);
  // const wishlisted = isWishlisted(product.slug);

  const defaultVariant =
    product.variants.find(
      (variant) => variant.isAvailable && variant.stock > 0,
    ) ?? null;

  return (
    <div
      className="product-card group bg-white relative flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
        {defaultVariant?.price && (
          <span
            className="bg-[#222] text-white text-[0.58rem] tracking-[0.12em] uppercase px-2 py-0.5 font-medium"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Sale
          </span>
        )}
      </div>

      {/* Wishlist */}
      {/* 
      <button
        // onClick={() => toggleWishlist(product.slug)}
        className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition-all duration-200"
        aria-label="Wishlist"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill={wishlisted ? "#C9A227" : "none"} stroke={wishlisted ? "#C9A227" : "#888"} strokeWidth="1.8">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg> 
      </button>
      */}

      {/* Image */}
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

      {/* Quick View overlay */}
      <div
        className={`absolute bottom-25 left-0 right-0 flex justify-center transition-all duration-300 ${hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      >
        <Link
          to={`/product/${product.slug}`}
          className="bg-white/95 px-6 py-2.5 text-[0.68rem] tracking-[0.15em] uppercase text-[#222] hover:bg-[#C9A227] hover:text-white transition-colors duration-300 shadow-lg"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Quick View
        </Link>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p
              className="text-[0.63rem] tracking-[0.2em] uppercase text-[#C9A227] mb-0.5"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {product.category.name}
            </p>
            <Link
              to={`/product/${product.slug}`}
              className="font-display text-[0.95rem] font-semibold text-[#222] hover:text-[#0F5132] transition-colors leading-tight block"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {product.name}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span
            className="font-display text-lg font-semibold text-[#0F5132]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            ₹{defaultVariant?.price.toLocaleString()}
          </span>
          {defaultVariant?.price && (
            <span
              className="text-sm text-[#aaa] line-through"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              ₹{defaultVariant?.price.toLocaleString()}
            </span>
          )}
        </div>

        <button
          onClick={async () => {
            if (!defaultVariant) return;

            await addItemToCart({
              variant: defaultVariant,
              product,
              quantity: 1,
            });
          }}
          className="btn-primary w-full mt-auto text-center disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!defaultVariant}
        >
          {!defaultVariant ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
