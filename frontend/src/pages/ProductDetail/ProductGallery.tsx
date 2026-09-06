import type { MouseEvent } from "react";
import type { Product } from "../../api/products";

type ProductGalleryProps = {
  product: Product;
  images: string[];
  selectedImage: number;
  zoomPosition: { x: number; y: number };
  zooming: boolean;
  onSelectImage: (index: number) => void;
  onMouseMove: (event: MouseEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

function ProductGallery({
  product,
  images,
  selectedImage,
  zoomPosition,
  zooming,
  onSelectImage,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
}: ProductGalleryProps) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => onSelectImage(index)}
            className={`w-16 h-20 overflow-hidden border-2 transition-colors duration-200 ${
              selectedImage === index
                ? "border-[#C9A227]"
                : "border-transparent hover:border-[#d0ccc0]"
            }`}
          >
            <img src={image} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <div
        className="flex-1 overflow-hidden bg-[#f5f2ec] aspect-4/5 relative cursor-crosshair"
        onMouseMove={onMouseMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <img
          src={images[selectedImage]}
          alt={product.name}
          className="w-full h-full transition-transform duration-300"
          style={
            zooming
              ? {
                  transform: "scale(1.8)",
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }
              : undefined
          }
        />
        {product.isBestSeller && (
          <div className="absolute top-4 left-4 bg-[#0F5132] text-white text-[0.6rem] tracking-[0.15em] uppercase px-3 py-1 font-medium">
            Bestseller
          </div>
        )}
        {product.isNewArrival && (
          <div className="absolute top-4 left-4 bg-[#C9A227] text-white text-[0.6rem] tracking-[0.15em] uppercase px-3 py-1 font-medium">
            New Arrival
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductGallery;
