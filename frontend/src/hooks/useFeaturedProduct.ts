import { useCallback, useEffect, useRef, useState } from "react";
import { getFeaturedProduct, type Product } from "../api/products";
import axios from "axios";

function useFeaturedProduct() {
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestRequestId = useRef(0);

  const refetch = useCallback( async(signal?: AbortSignal) => {
    if (signal?.aborted) {
        return;
    }

    const requestId = ++latestRequestId.current
    setError(null)
    setLoading(true)

    try {
        const response = await getFeaturedProduct({ signal });

        if (requestId === latestRequestId.current) {
            setFeaturedProduct(response.data.data)
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.code === "ERR_CANCELED")
            return;

        if (requestId !== latestRequestId.current)
            return;

        if (axios.isAxiosError(error)) {
            setError(error.response?.data?.message ?? error.message)
        } else {
            setError("Could not load featured product");
        }
    }
    finally {
        if (requestId === latestRequestId.current && !signal?.aborted) {
            setLoading(false);
        }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController();
    refetch(controller.signal);

    return () => controller.abort();
  }, [refetch])

  return { featuredProduct, error, loading, refetch }
}

export default useFeaturedProduct