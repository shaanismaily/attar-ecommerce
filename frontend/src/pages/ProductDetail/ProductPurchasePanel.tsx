import type { Dispatch, SetStateAction } from "react";
import type { Product, Variant } from "../../api/products";

type ProductPurchasePanelProps = {
  product: Product;
  selectedVariant: Variant;
  selectedVolume: number;
  quantity: number;
  addedToCart: boolean;
  canAddToCart: boolean;
  onSelectVolume: (volume: number) => void;
  setQuantity: Dispatch<SetStateAction<number>>;
  onAddToCart: () => Promise<void>;
  onBuyNow: () => void;
};

function ProductPurchasePanel({
  product,
  selectedVariant,
  selectedVolume,
  quantity,
  addedToCart,
  canAddToCart,
  onSelectVolume,
  setQuantity,
  onAddToCart,
  onBuyNow,
}: ProductPurchasePanelProps) {
  const capitalizeWords = (value?: string) =>
    value ? value.replace(/\b[a-zA-Z]/g, (char) => char.toUpperCase()) : "";
  const isInStock = selectedVariant.isAvailable && selectedVariant.stock > 0;

  return (
    <div className="lg:py-4">
      <p className="section-label mb-3">{product.category.name} Collection</p>
      <h1
        className="text-4xl lg:text-5xl font-bold text-[#222] mb-2 leading-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {product.name}
      </h1>
      <p
        className="text-xl text-[#888] mb-5 font-light"
        style={{ fontFamily: "var(--font-accent)", fontStyle: "italic" }}
      >
        {product.tagline}
      </p>
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#e8e4d8]">
        <span
          className={`text-sm font-medium ${isInStock ? "text-[#0F5132]" : "text-red-500"}`}
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {isInStock ? "✓ In Stock" : "Out of Stock"}
        </span>
      </div>
      <div className="flex items-baseline gap-3 mb-8">
        <span
          className="text-4xl font-bold text-[#0F5132]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          ₹{selectedVariant.price.toLocaleString()}
        </span>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[0.72rem] tracking-[0.15em] uppercase text-[#444] font-medium"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Select Size
          </span>
        </div>
        <div className="flex gap-3 flex-wrap">
          {product.variants.map((variant) => (
            <button
              key={variant._id}
              type="button"
              onClick={() => onSelectVolume(variant.volume)}
              className={`px-5 py-2.5 border text-sm font-medium transition-all duration-200 ${
                selectedVolume === variant.volume
                  ? "border-[#0F5132] bg-[#0F5132] text-white"
                  : "border-[#d0ccc0] text-[#666] hover:border-[#C9A227] hover:text-[#C9A227]"
              }`}
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {variant.volume}ml
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center border border-[#d0ccc0]">
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            className="w-10 h-11 flex items-center justify-center hover:bg-[#f5f2ec] transition-colors"
            aria-label="Decrease quantity"
          >
            <span aria-hidden="true">−</span>
          </button>
          <span
            className="w-10 text-center text-sm font-semibold text-[#222]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() =>
              setQuantity((current) =>
                Math.min(selectedVariant.stock, current + 1),
              )
            }
            className="w-10 h-11 flex items-center justify-center hover:bg-[#f5f2ec] transition-colors"
            disabled={!canAddToCart || quantity >= selectedVariant.stock}
            aria-label="Increase quantity"
          >
            <span aria-hidden="true">+</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <button
          type="button"
          onClick={() => void onAddToCart()}
          className={`btn-primary flex-1 text-center transition-all ${
            addedToCart ? "bg-[#C9A227] border-[#C9A227]" : ""
          } disabled:cursor-not-allowed disabled:opacity-50`}
          disabled={!canAddToCart || quantity > selectedVariant.stock}
        >
          {!selectedVariant.isAvailable || selectedVariant.stock < 1
            ? "Out of Stock"
            : addedToCart
              ? "Go to Cart"
              : "Add to Cart"}
        </button>
        <button
          type="button"
          onClick={onBuyNow}
          className="btn-gold flex-1 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canAddToCart || quantity > selectedVariant.stock}
        >
          Buy Now
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 p-5 bg-white border border-[#e8e4d8] mb-6">
        {[
          {
            label: "Concentration",
            value: capitalizeWords(product.concentration),
          },
          { label: "Gender", value: capitalizeWords(product.gender) },
          { label: "Longevity", value: capitalizeWords(product.longevity) },
          { label: "Sillage", value: capitalizeWords(product.sillage) },
        ].map((spec) => (
          <div key={spec.label}>
            <p className="text-[0.6rem] tracking-[0.2em] uppercase text-[#C9A227] mb-0.5">
              {spec.label}
            </p>
            <p className="text-sm font-medium text-[#333]">
              {spec.value || "Not provided"}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-[#888]">
        {[
          "✓ 100% Authentic",
          "✓ Free Shipping over ₹999",
          "✓ Secure Checkout",
        ].map((badge) => (
          <span key={badge}>{badge}</span>
        ))}
      </div>
    </div>
  );
}

export default ProductPurchasePanel;
