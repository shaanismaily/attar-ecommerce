import { useState, type MouseEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import useCart from "../../hooks/useCart";
import useProduct from "../../hooks/useProduct";
import { setCheckoutIntent } from "../../store/checkoutSlice";
import ProductBreadcrumbs from "./ProductBreadcrumbs";
import ProductDetailError from "./ProductDetailError";
import ProductDetailSkeleton from "./ProductDetailSkeleton";
import ProductGallery from "./ProductGallery";
import ProductInformationTabs from "./ProductInformationTabs";
import ProductPurchasePanel from "./ProductPurchasePanel";
import RelatedProducts from "./RelatedProducts";

function ProductDetailPage() {
  const { slug } = useParams();
  const { product, relatedProducts, error, loading, refetch } = useProduct(slug);
  const { addItemToCart } = useCart();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "notes" | "reviews">("description");
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [zooming, setZooming] = useState(false);

  if (loading) return <ProductDetailSkeleton />;

  if (error) {
    return <ProductDetailError message={error} onRetry={() => void refetch()} />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-5xl mb-4">✦</p>
          <h2 className="font-display text-2xl mb-4">Fragrance not found</h2>
          <Link to="/shop" className="btn-primary inline-block">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const selectedVolume = selectedSize ?? product.variants[0]?.volume;
  const selectedVariant = product.variants.find(
    (variant) => variant.volume === selectedVolume,
  );

  if (!selectedVariant || selectedVolume === undefined) {
    return (
      <ProductDetailError
        message="This fragrance has no available sizes."
        onRetry={() => void refetch()}
      />
    );
  }

  const images = product.images.map((image) => image.url);
  const canAddToCart = selectedVariant.isAvailable && selectedVariant.stock > 0;

  const handleImageMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setZoomPosition({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleAddToCart = async () => {
    if (addedToCart) {
      navigate("/cart");
      return;
    }

    if (!canAddToCart || quantity > selectedVariant.stock) return;

    await addItemToCart({
      variant: selectedVariant,
      product,
      quantity,
    });
    setAddedToCart(true);
  };

  const handleBuyNow = () => {
    if (!canAddToCart || quantity > selectedVariant.stock) return;

    dispatch(setCheckoutIntent({
      type: "buyNow",
      product,
      variant: selectedVariant,
      quantity,
    }));
    navigate("/checkout");
  };

  return (
    <div className="bg-[#FAF8F3] min-h-screen pt-20">
      <ProductBreadcrumbs product={product} />

      <main className="max-w-350 mx-auto px-6 lg:px-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
          <ProductGallery
            product={product}
            images={images}
            selectedImage={selectedImage}
            zoomPosition={zoomPosition}
            zooming={zooming}
            onSelectImage={setSelectedImage}
            onMouseMove={handleImageMouseMove}
            onMouseEnter={() => setZooming(true)}
            onMouseLeave={() => setZooming(false)}
          />
          <ProductPurchasePanel
            product={product}
            selectedVariant={selectedVariant}
            selectedVolume={selectedVolume}
            quantity={quantity}
            addedToCart={addedToCart}
            canAddToCart={canAddToCart}
            onSelectVolume={(volume) => {
              setSelectedSize(volume);
              setQuantity(1);
              setAddedToCart(false);
            }}
            setQuantity={setQuantity}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        </div>

        <ProductInformationTabs
          product={product}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
        />

        <RelatedProducts
          products={relatedProducts}
          categoryName={product.category.name}
        />
      </main>
    </div>
  );
}

export default ProductDetailPage;
