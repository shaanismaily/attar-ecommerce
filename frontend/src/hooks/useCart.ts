import { useCallback, useEffect, useState } from "react";
import {
  addItemToCart as addItemToCartApi,
  getUserCart,
  updateCartItem,
  type Cart,
  removeCartItem,
  clearCart as clearDBCart,
  previewCart
} from "../api/cart";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

const normalizeCart = (data: {
  cart: Omit<Cart, "totalAmount">;
  totalAmount: number;
}): Cart => ({ ...data.cart, totalAmount: data.totalAmount });

type GuestCartItem = {
  variantId: string;
  quantity: number;
};

const readGuestCartItems = (): GuestCartItem[] => {
  const stored = localStorage.getItem("cartItems");
  if (!stored) return [];

  try {
    const items: unknown = JSON.parse(stored);
    if (!Array.isArray(items)) return [];

    return items.filter(
      (item): item is GuestCartItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as GuestCartItem).variantId === "string" &&
        Number.isInteger((item as GuestCartItem).quantity) &&
        (item as GuestCartItem).quantity > 0,
    );
  } catch {
    localStorage.removeItem("cartItems");
    return [];
  }
};

function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

  const authStatus = useSelector((state: RootState) => state.auth.status);

  const getGuestCart = async (): Promise<Cart | null> => {
    const items = readGuestCartItems();
    if (items.length === 0) return null;

    const response = await previewCart(items);
    const { items: previewItems, totalAmount } = response.data.data;

    return {
      _id: "guest",
      user: "guest",
      items: previewItems,
      totalAmount,
    };
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
          : await getGuestCart();

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
      const response = await addItemToCartApi(quantity, variantId);
      setCart(normalizeCart(response.data.data));
    } else {
      if (!variantId) {
        setError("Please select a variant");
        return;
      }

      const existingCart = readGuestCartItems();
      const existingItem = existingCart.find(
        (item) => item.variantId === variantId,
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        existingCart.push({ quantity, variantId });
      }

      localStorage.setItem("cartItems", JSON.stringify(existingCart));
      await refetch();
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

        const existingCart = readGuestCartItems();
        if (existingCart.length === 0) {
          return;
        }

        const item = existingCart.find((item) => item.variantId === id);

        if (!item) {
          setError("Cart item not found");
          return;
        }

        item.quantity = quantity;

        localStorage.setItem("cartItems", JSON.stringify(existingCart));
        await refetch();
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
      const newItems = readGuestCartItems().filter(
        (item) => item.variantId !== id,
      );

      localStorage.setItem("cartItems", JSON.stringify(newItems));

      await refetch();
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
      await clearDBCart();
      setCart(null);
    }
    else {
      localStorage.removeItem("cartItems");
      setCart(null);
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
