import { Link } from "react-router-dom";
import type { Product } from "../../api/products";

type ProductBreadcrumbsProps = {
  product: Product;
};

function ProductBreadcrumbs({ product }: ProductBreadcrumbsProps) {
  return (
    <div className="max-w-350 mx-auto px-6 lg:px-10 py-5">
      <div
        className="flex items-center gap-2 text-xs text-[#888]"
        style={{ fontFamily: "var(--font-sans)" }}
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
          to={`/shop?category=${product.category.name}`}
          className="hover:text-[#C9A227] transition-colors"
        >
          {product.category.name}
        </Link>
        <span>›</span>
        <span className="text-[#444]">{product.name}</span>
      </div>
    </div>
  );
}

export default ProductBreadcrumbs;
