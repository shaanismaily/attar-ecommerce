import { useCallback, useEffect, useState } from "react";
import { getUserCart, type Cart } from "../api/cart";
import axios from "axios";

function useCart() {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const refetch = useCallback(async (signal?: AbortSignal) => {
        if (signal?.aborted) return;

        setLoading(true);
        setError("");

        try {
            const response = await getUserCart(signal);

            if (signal?.aborted) return;

            setCart(response.data.data);
        } catch (error) {
            if (axios.isCancel(error)) {
                return;
            }

            if (signal?.aborted) {
                return;
            }

            if (axios.isAxiosError(error)) {
                setError(
                    error.response?.data?.message ?? error.message
                );
            } else {
                setError("Could not get Cart");
            }
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        void refetch(controller.signal);

        return () => {
            controller.abort();
        };
    }, [refetch]);

    return {
        cart,
        error,
        loading,
        refetch
    };
}

export default useCart;