import { useState } from "react";
import { createProduct, type CreateProductData } from "../../api/products";
import ProductForm from "../../components/ProductForm";
import useCollections from "../../hooks/useCollection";
import useProducts from "../../hooks/useProducts";

function Products() {
  const [formOpened, setFormOpened] = useState(false);
  const { products, totalProducts, refetch } = useProducts();
  const { collections } = useCollections();

  const addProduct = async (data: CreateProductData) => {
    await createProduct(data);
    await refetch();
    setFormOpened(false);
  };

  return (
    <div className="animate-fade-in mx-auto max-w-350 px-6 pb-12 pt-28 lg:px-10">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-[#888]" style={{ fontFamily: "var(--font-sans)" }}>
          {totalProducts} total products
        </p>
        <button type="button" onClick={() => setFormOpened((opened) => !opened)} className="btn-primary px-6 py-2.5">
          {formOpened ? "Close Form" : "+ Add Product"}
        </button>
      </div>

      {formOpened && (
        <div className="mb-8 border border-[#e8e4d8] bg-white p-5 sm:p-6">
          <h2 className="text-xl text-[#222]" style={{ fontFamily: "var(--font-display)" }}>Add Product</h2>
          <ProductForm
            categories={collections.filter((collection) => collection.isActive)}
            onSubmit={addProduct}
            onCancel={() => setFormOpened(false)}
          />
        </div>
      )}

      <div className="overflow-x-auto border border-[#e8e4d8] bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f0ede4]">
              {["Product", "Category", "Price", "Stock", "Actions"].map((heading) => (
                <th key={heading} className="px-6 py-4 text-left text-[0.62rem] font-medium uppercase tracking-[0.15em] text-[#aaa]" style={{ fontFamily: "var(--font-sans)" }}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-b border-[#faf8f3] transition-colors hover:bg-[#faf8f3]">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-12 shrink-0 overflow-hidden bg-[#f5f2ec]">
                      {product.images[0] && <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#222]" style={{ fontFamily: "var(--font-sans)" }}>{product.name}</p>
                      <p className="text-xs text-[#aaa]" style={{ fontFamily: "var(--font-sans)" }}>{product.gender}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-[#666]" style={{ fontFamily: "var(--font-sans)" }}>{product.category.name}</td>
                <td className="px-6 py-4 text-sm font-semibold text-[#0F5132]" style={{ fontFamily: "var(--font-display)" }}>₹{product.startingPrice?.toLocaleString() ?? "—"}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 text-[0.62rem] font-medium ${product.variants.some((variant) => variant.isAvailable && variant.stock > 0) ? "bg-[#0F5132]/10 text-[#0F5132]" : "bg-red-50 text-red-500"}`} style={{ fontFamily: "var(--font-sans)" }}>
                    {product.variants.some((variant) => variant.isAvailable && variant.stock > 0) ? "In Stock" : "Out of Stock"}
                  </span>
                </td>
                <td className="px-6 py-4 text-[0.7rem] text-[#aaa]">Edit and delete are not yet available.</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Products;
