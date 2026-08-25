import { useCallback, useEffect, useState } from "react";
import {
  addItemToCart as addItemToCartApi,
  getUserCart,
  updateCartItem,
  type Cart,
  removeCartItem,
  clearCart as clearDBCart,
  previewCart,
} from "../api/cart";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store/store";
import {
  setCart,
  clearCart as clearReduxCart,
  addToCart,
  updateQuantity,
  removeFromCart as removeFromReduxCart,
} from "../store/cartSlice";
import type { Product, Variant } from "../api/products";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

  const cart = useSelector((state: RootState) => state.cart);
  const authStatus = useSelector((state: RootState) => state.auth.status);
  const dispatch = useDispatch();

  const getGuestCart = async (): Promise<Cart | null> => {
    const items = readGuestCartItems();

    if (items.length === 0) {
      return null;
    }

    const response = await previewCart(items);

    const { items: previewItems, totalAmount } = response.data.data;

    const itemsWithId = previewItems.map(item => ({
        ...item,
        _id: item.variant._id,
    }));

    return {
      _id: "guest",
      user: "guest",
      items: itemsWithId,
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

        if (cartData) {
          dispatch(
            setCart({
              items: cartData.items,
              totalAmount: cartData.totalAmount,
            }),
          );
        } else {
          dispatch(
            setCart({
              items: [],
              totalAmount: 0,
            }),
          );
        }
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

  const addItemToCart = async ({
    product,
    variant,
    quantity,
  }: {
    product: Product;
    variant: Variant;
    quantity: number;
  }) => {
    setError("");

    if (!authStatus) {
      const existingCart = readGuestCartItems();

      const existingItem = existingCart.find(
        (item) => item.variantId === variant._id,
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        existingCart.push({
          variantId: variant._id,
          quantity,
        });
      }

      localStorage.setItem("cartItems", JSON.stringify(existingCart));

      dispatch(
        addToCart({
          product,
          variant,
          priceAtAddition: variant.price,
          quantity,
        }),
      );

      return;
    }

    try {
      setLoading(true);

      const response = await addItemToCartApi(quantity, variant._id);

      const cart = normalizeCart(response.data.data);

      dispatch(
        setCart({
          items: cart.items,
          totalAmount: cart.totalAmount,
        }),
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || error.message);
      } else {
        setError("Could not add items to cart");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) {
      return;
    }

    if (updatingItem) return;

    if (!authStatus) {
      try {
        setUpdatingItem(id);
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

        dispatch(
          updateQuantity({
            itemId: id,
            quantity,
          }),
        );
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

      const cart = normalizeCart(response.data.data);

      dispatch(
        setCart({
          items: cart.items,
          totalAmount: cart.totalAmount,
        }),
      );
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
    if (!authStatus) {
      const newItems = readGuestCartItems().filter(
        (item) => item.variantId !== id,
      );

      localStorage.setItem("cartItems", JSON.stringify(newItems));

      dispatch(removeFromReduxCart(id));
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await removeCartItem(id);
      const cart = normalizeCart(response.data.data);

      dispatch(
        setCart({
          items: cart.items,
          totalAmount: cart.totalAmount,
        }),
      );
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

  const clearCart = async () => {
    try {
      setError("");

      if (authStatus) {
        await clearDBCart();
      } else {
        localStorage.removeItem("cartItems");
      }

      dispatch(clearReduxCart());
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message ?? error.message);
      } else {
        setError("Could not clear cart");
      }
    }
  };

  return {
    cart,
    error,
    loading,
    refetch,
    addItemToCart,
    updateItemQuantity,
    removeFromCart,
    updatingItem,
    clearCart,
  };
}

export default useCart;
