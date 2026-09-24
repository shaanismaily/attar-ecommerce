import { useMemo, useState } from "react";
import { Eye, EyeOff, PackagePlus, Search, Trash2, X } from "lucide-react";
import {
  createProduct,
  deleteProduct,
  updateProduct,
  type CreateProductData,
} from "../../api/products";
import ProductForm from "../../components/ProductForm";
import useCollections from "../../hooks/useCollection";
import useProducts from "../../hooks/useProducts";

function Products() {
  const [formOpened, setFormOpened] = useState(false);
  const [query, setQuery] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const { products, totalProducts, refetch, loading, error } = useProducts({
    limit: 50,
  });
  const { collections } = useCollections();
  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        `${product.name} ${product.category.name}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [products, query],
  );

  const addProduct = async (data: CreateProductData) => {
    await createProduct(data);
    await refetch();
    setFormOpened(false);
  };
  const togglePublished = async (id: string, isPublished: boolean) => {
    setActionError(null);
    setWorkingId(id);
    try {
      await updateProduct(id, { isPublished: !isPublished });
      await refetch();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not update product.",
      );
    } finally {
      setWorkingId(null);
    }
  };
  const removeProduct = async (id: string, name: string) => {
    if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) return;
    setActionError(null);
    setWorkingId(id);
    try {
      await deleteProduct(id);
      await refetch();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not delete product.",
      );
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-360 px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">Catalogue</p>
          <h1
            className="mt-2 text-3xl text-[#173a28] sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Products
          </h1>
          <p className="mt-2 text-sm text-[#777]">
            {totalProducts} products in your store
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpened((opened) => !opened)}
          className="btn-primary flex w-fit items-center gap-2 px-5 py-3"
        >
          <PackagePlus size={16} /> {formOpened ? "Close form" : "Add product"}
        </button>
      </div>
      {formOpened && (
        <section className="mb-7 border border-[#e5e1d7] bg-white p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                className="text-2xl text-[#173a28]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                New product
              </h2>
              <p className="mt-1 text-sm text-[#777]">
                Every product needs a category, image, and at least one bottle
                size.
              </p>
            </div>
            <button
              onClick={() => setFormOpened(false)}
              className="p-1 text-[#888]"
              aria-label="Close product form"
            >
              <X size={20} />
            </button>
          </div>
          <ProductForm
            categories={collections.filter((collection) => collection.isActive)}
            onSubmit={addProduct}
            onCancel={() => setFormOpened(false)}
          />
        </section>
      )}
      <div className="border border-[#e5e1d7] bg-white">
        <div className="flex flex-col gap-4 border-b border-[#eeeae1] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]"
              size={17}
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products or categories"
              className="input-luxury py-2.5 pl-10"
            />
          </div>
          <p className="text-xs text-[#888]">
            Showing {filteredProducts.length} of {totalProducts}
          </p>
        </div>
        {actionError && (
          <p
            role="alert"
            className="mx-4 mt-4 border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            {actionError}
          </p>
        )}
        {error && (
          <p className="mx-4 mt-4 border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-180">
            <thead>
              <tr className="border-b border-[#f0ede6] text-left text-[0.62rem] font-medium uppercase tracking-[0.14em] text-[#999]">
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Inventory</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-[#888]"
                  >
                    Loading products…
                  </td>
                </tr>
              ) : filteredProducts.length ? (
                filteredProducts.map((product) => {
                  const stock = product.variants.reduce(
                    (sum, variant) => sum + variant.stock,
                    0,
                  );
                  const busy = workingId === product._id;
                  return (
                    <tr
                      key={product._id}
                      className="border-b border-[#f4f1eb] text-sm last:border-0 hover:bg-[#fcfbf8]"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-10 shrink-0 overflow-hidden bg-[#f3f0e8]">
                            {product.images[0] && (
                              <img
                                src={product.images[0].url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-[#333]">
                              {product.name}
                            </p>
                            <p className="mt-0.5 text-xs text-[#999] capitalize">
                              {product.gender}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#666]">
                        {product.category.name}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-[#0F5132]">
                        ₹{product.startingPrice?.toLocaleString() ?? "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={stock ? "text-[#0F5132]" : "text-red-500"}
                        >
                          {stock} units
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={
                            product.isPublished
                              ? "bg-emerald-50 px-2 py-1 text-xs text-[#0F5132]"
                              : "bg-[#f3f0e9] px-2 py-1 text-xs text-[#777]"
                          }
                        >
                          {product.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <button
                            disabled={busy}
                            onClick={() =>
                              void togglePublished(
                                product._id,
                                product.isPublished,
                              )
                            }
                            title={
                              product.isPublished ? "Unpublish" : "Publish"
                            }
                            className="rounded p-2 text-[#777] hover:bg-[#f0ede6] hover:text-[#0F5132] disabled:opacity-40"
                          >
                            {product.isPublished ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                          <button
                            disabled={busy}
                            onClick={() =>
                              void removeProduct(product._id, product.name)
                            }
                            title="Delete product"
                            className="rounded p-2 text-[#999] hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-[#888]"
                  >
                    {query
                      ? "No products match your search."
                      : "No products yet. Add your first product above."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Products;
