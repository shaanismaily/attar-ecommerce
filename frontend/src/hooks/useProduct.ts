import axios from "axios";
import { getProduct, type Product, type RelatedProductResponse } from "../api/products";
import { useCallback, useEffect, useState } from "react";

function useProduct(slug: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProductResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    if (!slug) return;

    try {
      setLoading(true);
      setError("");

      const response = await getProduct(slug);

      setProduct(response.data.data.product);
      setRelatedProducts(response.data.data.relatedProducts);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message ?? error.message);
      } else {
        setError("Could not load product");
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    product,
    relatedProducts,
    error,
    loading,
    refetch,
  };
}

export default useProduct;