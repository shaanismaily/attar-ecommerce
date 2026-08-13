import { useCallback, useEffect, useState } from "react";
import { addItemToCart as addItemToCartApi, getUserCart, type Cart } from "../api/cart";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

type addItemProps = {
    quantity: number;
    volume: number;
}

function useCart() {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const authStatus = useSelector((state: RootState) => state.auth.status)

    const getGuestCart = (): Cart | null => {
        const stored = localStorage.getItem("cartItems")

        return stored ? JSON.parse(stored) : null;
    }

    const getDatabaseCart = async (signal?: AbortSignal): Promise<Cart> => {
        const response = await getUserCart(signal)
        return response.data.data
    }

    const refetch = useCallback(async (signal?: AbortSignal) => {
        if (signal?.aborted) return;

        setLoading(true);
        setError("");

        try {

            const cartData = authStatus
            ? await getDatabaseCart(signal)
            : getGuestCart();

            if (signal?.aborted) return;

            setCart(cartData);

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
    }, [authStatus]);

    useEffect(() => {
        const controller = new AbortController();

        void refetch(controller.signal);

        return () => {
            controller.abort();
        };
    }, [refetch]);

    
    const addItemToCart = async (
        data: addItemProps,
        productId: string
    ) => {
        if (authStatus) {
            await addItemToCartApi(data, productId);
        } else {
            const existingCart = JSON.parse(
                localStorage.getItem("cartItems") || "[]"
            );

            existingCart.push({
                productId,
                ...data
            });

            localStorage.setItem(
                "cartItems",
                JSON.stringify(existingCart)
            );
        }
    };

    return {
        cart,
        error,
        loading,
        refetch,
        addItemToCart
    };
}

export default useCart;