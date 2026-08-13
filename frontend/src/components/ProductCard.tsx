import { Link } from "react-router-dom";
import { type Product } from "../api/products";

function ProductCard(product: Product) {
  return (
    <div>
         <Link to={`/product/${product.slug}`} className="block overflow-hidden bg-[#f5f2ec] aspect-3/4">
        <img
          src={product.images[0].url}
          alt={product.name}
          className="product-img w-full h-full object-cover"
        />
        <h1>{product.name}</h1>
      </Link>
    </div>
  )
}

export default ProductCard