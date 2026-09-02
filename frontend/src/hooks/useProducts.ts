import { useEffect, useCallback, useState } from "react";
import axios from "axios";
import { getProducts, type Product } from "../api/products";

export type ProductQueryParams = {
  page?: number;
  limit?: number;
  query?: string;
  category?: string;
  bestSeller?: boolean;
  featured?: boolean;
  newArrival?: boolean;
  sortBy?: "name" | "createdAt" | "updatedAt";
  sortType?: "asc" | "desc";
};

export default function useProducts(params?: ProductQueryParams) {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const {
    page,
    limit,
    query,
    category,
    bestSeller,
    featured,
    newArrival,
    sortBy,
    sortType,
  } = params ?? {};

  const refetch = useCallback(
    async (signal?: AbortSignal) => {
      if (signal?.aborted) return;

      setLoading(true);
      setError(null);

      try {
        const response = await getProducts(
          {
            page,
            limit,
            query,
            category,
            bestSeller,
            featured,
            newArrival,
            sortBy,
            sortType,
          },
          signal,
        );

        const payload = response.data.data;

        if (signal?.aborted) return;

        setProducts(payload.products ?? []);
        setTotalProducts(payload.totalProducts ?? 0);
        setTotalPages(payload.totalPages ?? 0);
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === "ERR_CANCELED") {
          return;
        }

        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message ?? error.message);
        } else {
          setError("Could not load products");
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [
      page,
      limit,
      query,
      category,
      bestSeller,
      featured,
      newArrival,
      sortBy,
      sortType,
    ],
  );

  useEffect(() => {
    const controller = new AbortController();

    void refetch(controller.signal);

    return () => {
      controller.abort();
    };
  }, [refetch]);

  return {
    products,
    totalPages,
    totalProducts,
    error,
    loading,
    refetch,
  };
}
