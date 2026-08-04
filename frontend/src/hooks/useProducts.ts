import { useEffect, useCallback, useState, useRef } from "react";
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
    const latestRequestId = useRef(0);

    const refetch = useCallback( async(signal?: AbortSignal) => {
        if (signal?.aborted) {
            return;
        }

        const requestId = ++latestRequestId.current
        setLoading(true);
        setError(null);

        try {
            const response = await getProducts(params, signal);
            if (requestId === latestRequestId.current) {
                setProducts(response.data.data.products)
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.code === "ERR_CANCELED") {
                return;
            }

            if (requestId !== latestRequestId.current) {
                return;
            }

            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message ?? error.message);
            } else {
                setError("Could not load products");
            }
        } finally {
            if (requestId === latestRequestId.current && !signal?.aborted) {
                setLoading(false);
            }
        }
    }, [params]);

    useEffect(() => {
        const controller = new AbortController();
        void Promise.resolve().then(() => refetch(controller.signal));

        return () => controller.abort();
    }, [refetch]);

    return { products, error, loading, refetch };
}
