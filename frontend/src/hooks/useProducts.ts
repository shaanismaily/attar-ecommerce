import { useEffect, useCallback, useState } from "react";
import axios from "axios";
import { getProducts, type Gender, type Product, type SortOption } from "../api/products";

export type ProductQueryParams = {
  page?: number;
  limit?: number;
  query?: string;
  category?: string;
  bestSeller?: boolean;
  featured?: boolean;
  newArrival?: boolean;
  sortBy?: SortOption;
  gender?: Gender | Gender[];
  minPrice?: number;
  maxPrice?: number;
};

export default function useProducts(params?: ProductQueryParams) {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  const {
    page,
    limit,
    query,
    category,
    bestSeller,
    featured,
    newArrival,
    sortBy,
    gender,
    minPrice,
    maxPrice,
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
            gender: Array.isArray(gender) ? gender.join(",") : gender,
            minPrice,
            maxPrice,
          },
          signal,
        );

        const payload = response.data.data;

        if (signal?.aborted) return;

        setProducts(payload.products ?? []);
        setTotalProducts(payload.totalProducts ?? 0);
        setTotalPages(payload.totalPages ?? 0);
        setPriceRange([
          payload.priceRange?.min ?? 0,
          payload.priceRange?.max ?? 10000,
        ]);
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
      gender,
      minPrice,
      maxPrice,
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
    priceRange,
    error,
    loading,
    refetch,
  };
}
