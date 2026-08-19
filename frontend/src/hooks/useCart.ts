import { useCallback, useEffect, useState } from "react";
import {
  addItemToCart as addItemToCartApi,
  getUserCart,
  updateCartItem,
  type Cart,
  removeCartItem,
  clearCart as clearDBCart
} from "../api/cart";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

const normalizeCart = (data: {
  cart: Omit<Cart, "totalAmount">;
  totalAmount: number;
}): Cart => ({ ...data.cart, totalAmount: data.totalAmount });

function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

  const authStatus = useSelector((state: RootState) => state.auth.status);

  const getGuestCart = (): Cart | null => {
    const stored = localStorage.getItem("cartItems");

    return stored ? JSON.parse(stored) : null;
  };

  const getDatabaseCart = async (signal?: AbortSignal): Promise<Cart> => {
    const response = await getUserCart(signal);
    return normalizeCart(response.data.data);
  };

  const refetch = useCallback(
    async (signal?: AbortSignal) => {
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
          setError(error.response?.data?.message ?? error.message);
        } else {
          setError("Could not get Cart");
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [authStatus],
  );

  useEffect(() => {
    const controller = new AbortController();

    void refetch(controller.signal);

    return () => {
      controller.abort();
    };
  }, [refetch]);

  const addItemToCart = async (quantity: number, variantId?: string) => {
    if (authStatus) {
      await addItemToCartApi(quantity, variantId);
    } else {
      const existingCart = JSON.parse(
        localStorage.getItem("cartItems") || "[]",
      );

      existingCart.push({
        quantity,
        variantId,
      });

      localStorage.setItem("cartItems", JSON.stringify(existingCart));
    }
  };

  const updateItemQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) {
      return;
    }

    if (updatingItem) return;

    if (!authStatus) {
      try {
        setError("");

        const storedCart = localStorage.getItem("cartItems");

        if (!storedCart) {
          return;
        }

        const existingCart = JSON.parse(storedCart);

        const item = existingCart.find(
          (item: { variantId: string; quantity: number }) =>
            item.variantId === id,
        );

        if (!item) {
          setError("Cart item not found");
          return;
        }

        item.quantity = quantity;

        localStorage.setItem("cartItems", JSON.stringify(existingCart));

        // Update React state
        setCart(existingCart);
      } catch (error) {
        setError("Could not update cart item");
      }

      return;
    }

    try {
      setUpdatingItem(id);

      setLoading(true);
      setError("");

      const response = await updateCartItem(id, quantity);

      setCart(normalizeCart(response.data.data));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message ?? error.message);
      } else {
        setError("Could not update cart item");
      }
    } finally {
      setLoading(false);
      setUpdatingItem(null);
    }
  };

  const removeFromCart = async (id: string) => {

    if (updatingItem) 
        return;

    if (!authStatus) {
      const storedCart = localStorage.getItem("cartItems");

      if (!storedCart) {
        return;
      }

      const newItems = JSON.parse(storedCart).filter(
        (item: { variantId: string; quantity: number }) =>
          item.variantId !== id,
      );

      localStorage.setItem("cartItems", JSON.stringify(newItems))

      setCart(newItems);
      return;
    }

    try {
        setUpdatingItem(id)
        setLoading(true);
        setError("")

        const response = await removeCartItem(id);

        setCart(normalizeCart(response.data.data))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message ?? error.message);
      } else {
        setError("Could not update cart item");
      }
    } finally {
      setLoading(false);
      setUpdatingItem(null);
    }
  };

  const clearCart = async() => {
    if (authStatus) {
      await clearDBCart()
    }
    else {
      localStorage.clear()
    }
  }

  return {
    cart,
    error,
    loading,
    refetch,
    addItemToCart,
    updateItemQuantity,
    removeFromCart,
    updatingItem,
    clearCart
  };
}

export default useCart;
