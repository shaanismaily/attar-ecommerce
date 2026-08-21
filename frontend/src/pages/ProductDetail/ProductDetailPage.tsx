import { useParams } from "react-router-dom";
import useProduct from "../../hooks/useProduct";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ProductDetailSkeleton from "./ProductDetailSkeleton";
import ProductDetailError from "./ProductDetailError";
import useCart from "../../hooks/useCart";
import { useDispatch } from "react-redux";
import { setCheckoutIntent } from "../../store/checkoutSlice";

function ProductDetailPage() {
  const { slug } = useParams();
  const { product, relatedProducts, error, loading, refetch } = useProduct(slug);
  const { addItemToCart } = useCart()

  const volumes = product?.variants?.map((variant) => variant.volume)

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  // const [activeTab, setActiveTab] = useState<"description" | "notes" | "reviews">("description");
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [zooming, setZooming] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (volumes && volumes.length > 0 && selectedSize === null) {
      setSelectedSize(volumes[0]);
    }
  }, [volumes, selectedSize]);

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (error) {
    return <ProductDetailError message={error} onRetry={() => void refetch()} />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-5xl mb-4">✦</p>
          <h2
            className="font-display text-2xl mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Fragrance not found
          </h2>
          <Link to="/shop" className="btn-primary inline-block">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const selectedVariant = product.variants.find(
    (variant) => variant.volume === selectedSize,
  );

  const allImages = product?.images?.map((image) => image.url);


  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleBuyNow = () => {
    if (!selectedVariant) return;

    dispatch(setCheckoutIntent({
      type: "buyNow",
      product: product,
      variant: selectedVariant,
      quantity: qty
    }));

    navigate("/checkout");
  };

  return (
    <div className="bg-[#FAF8F3] min-h-screen pt-20">
      <div className="max-w-350 mx-auto px-6 lg:px-10 py-5">
        <div
          className="flex items-center gap-2 text-xs text-[#888]"
          style={{ fontFamily: "var(--font-sans))" }}
        >
          <Link to="/" className="hover:text-[#C9A227] transition-colors">
            Home
          </Link>
          <span>›</span>
          <Link to="/shop" className="hover:text-[#C9A227] transition-colors">
            Shop
          </Link>
          <span>›</span>
          <Link
            to={`/shop?category=${product?.category?.name}`}
            className="hover:text-[#C9A227] transition-colors"
          >
            {product?.category?.name}
          </Link>
          <span>›</span>
          <span className="text-[#444]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-350 mx-auto px-6 lg:px-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
          <div className="flex gap-4">
            <div className="flex flex-col gap-3">
              {allImages?.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-20 overflow-hidden border-2 transition-colors duration-200 ${
                    selectedImage === i
                      ? "border-[#C9A227]"
                      : "border-transparent hover:border-[#d0ccc0]"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            <div
              className="flex-1 overflow-hidden bg-[#f5f2ec] aspect-4/5 relative cursor-crosshair"
              onMouseMove={handleImageMouseMove}
              onMouseEnter={() => setZooming(true)}
              onMouseLeave={() => setZooming(false)}
            >
              <img
                src={allImages?.[selectedImage]}
                alt={product.name}
                className="w-full h-full transition-transform duration-300"
                style={
                  zooming
                    ? {
                        transform: "scale(1.8)",
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      }
                    : {}
                }
              />
              {product.isBestSeller && (
                <div
                  className="absolute top-4 left-4 bg-[#0F5132] text-white text-[0.6rem] tracking-[0.15em] uppercase px-3 py-1 font-medium"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Bestseller
                </div>
              )}
              {product.isNewArrival && (
                <div
                  className="absolute top-4 left-4 bg-[#C9A227] text-white text-[0.6rem] tracking-[0.15em] uppercase px-3 py-1 font-medium"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  New Arrival
                </div>
              )}
            </div>
          </div>

          <div className="lg:py-4">
            <p className="section-label mb-3">
              {product?.category?.name} Collection
            </p>
            <h1
              className="text-4xl lg:text-5xl font-bold text-[#222] mb-2 leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              <span
                className="text-4xl font-bold text-[#0F5132]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                ₹{selectedVariant?.price.toLocaleString()}
              </span>
              {/* {product.originalPrice && (
                <>
                  <span className="text-lg text-[#bbb] line-through" style={{ fontFamily: "var(--font-sans)" }}>
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                  <span className="bg-[#0F5132]/10 text-[#0F5132] text-xs font-semibold px-2 py-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                    {Math.round((1 - product.price / product.originalPrice!) * 100)}% OFF
                  </span>
                </>
              )} */}
            </div>

            {/* Size selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-[0.72rem] tracking-[0.15em] uppercase text-[#444] font-medium"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Select Size
                </span>
                {/* {selectedSize && (
                  <span className="text-xs text-[#888]" style={{ fontFamily: "var(--font-sans)" }}>
                    {sizeDescriptions[selectedSize]}
                  </span>
                )} */}
              </div>
              <div className="flex gap-3 flex-wrap">
                {product?.variants?.map((variant) => (
                  <button
                    key={variant._id}
                    onClick={() => setSelectedSize(variant.volume)}
                    className={`px-5 py-2.5 border text-sm font-medium transition-all duration-200 ${
                      selectedSize === variant.volume
                        ? "border-[#0F5132] bg-[#0F5132] text-white"
                        : "border-[#d0ccc0] text-[#666] hover:border-[#C9A227] hover:text-[#C9A227]"
                    }`}
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {variant.volume} ml
                  </button>
                ))}
              </div>
            </div>

            {/* Qty + Actions */}
            <div className="flex items-center gap-4 mb-6">
              {/* Qty stepper */}
              <div className="flex items-center border border-[#d0ccc0]">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-11 flex items-center justify-center hover:bg-[#f5f2ec] transition-colors"
                >
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="#666"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <span
                  className="w-10 text-center text-sm font-semibold text-[#222]"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-10 h-11 flex items-center justify-center hover:bg-[#f5f2ec] transition-colors"
                >
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="#666"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={ async() => {
                  await addItemToCart(qty, selectedVariant?._id);
                  setAddedToCart(true);
                }}
                className={`btn-primary flex-1 text-center transition-all ${
                  addedToCart ? "bg-[#C9A227] border-[#C9A227]" : ""
                }`}
              >
                <Link
                  to={addedToCart ? "/cart": ""}
                >
                {addedToCart ? "Go to Cart" : "Add to Cart"}
                </Link>
              </button>
              <button
                onClick={handleBuyNow}
                className="btn-gold flex-1"
              >
                Buy Now
              </button>
            </div>


            {/* Related Products */}
            {relatedProducts && (
              <div className="mt-20">
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <p className="section-label mb-3">You May Also Like</p>
                    <h2
                      className="text-3xl font-bold text-[#222]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      From the {product?.category?.name} Collection
                    </h2>
                  </div>
                  <Link
                    to={`/shop?category=${product?.category?.name}`}
                    className="hidden md:flex items-center gap-2 text-[0.72rem] tracking-widest uppercase text-[#0F5132] hover:text-[#C9A227] transition-colors"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    View All{" "}
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedProducts.map((rp) => (
                    <Link
                      key={rp._id}
                      to={`/product/${rp.slug}`}
                      className="product-card group bg-white"
                    >
                      <div className="overflow-hidden aspect-4/3 bg-[#f5f2ec]">
                        <img
                          src={rp.images[0].url}
                          alt={rp.name}
                          className="product-img w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-5">
                        <p
                          className="text-[0.6rem] tracking-[0.2em] uppercase text-[#C9A227] mb-1"
                          style={{ fontFamily: "var(--font-sans)" }}
                        >
                          {rp.category.name}
                        </p>
                        <h3
                          className="font-semibold text-[#222] mb-2"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {rp.name}
                        </h3>
                        <span
                          className="text-lg font-bold text-[#0F5132]"
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          ₹{rp.startingPrice.toLocaleString()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
