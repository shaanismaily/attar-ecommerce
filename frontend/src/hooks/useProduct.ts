import axios from "axios";
import { getProduct, type Product } from "../api/products";
import { useCallback, useEffect, useState } from "react";

function useProduct(slug: string) {
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    const refetch = useCallback( async() => {
        try {
            setLoading(true);
            setError("");
    
            const response = await getProduct(slug);
            setProduct(response.data.data);

        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message ?? error.message)
            } else {
                setError("Could not load product")
            }
        } finally {
            setLoading(false);
        }

    }, [slug])

    useEffect(() => {
        refetch()
    }, [refetch]);

    return {product, error, loading, refetch}
}

export default useProduct