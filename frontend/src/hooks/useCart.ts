import { useCallback, useEffect, useState, useRef } from "react";
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
}): Cart => {
  // Populated references can be null when a product or variant was deleted.
  const items = data.cart.items.filter((item) => item.product && item.variant);
  const totalAmount = items.reduce(
    (total, item) => total + item.priceAtAddition * item.quantity,
    0,
  );

  return { ...data.cart, items, totalAmount };
};

type GuestCartItem = {
  variantId: string;
  quantity: number;
  // These snapshots let the cart survive a temporary API restart during local development.
  product?: Cart["items"][number]["product"];
  variant?: Cart["items"][number]["variant"];
  priceAtAddition?: number;
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

  const cart = useSelector((state: RootState) => state.cart);
  const authStatus = useSelector((state: RootState) => state.auth.status);
  const dispatch = useDispatch();

  const quantityTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );

  const getGuestCart = async (): Promise<Cart | null> => {
    const items = readGuestCartItems();

    if (items.length === 0) {
      return null;
    }

    try {
      const response = await previewCart(items);
      const { items: previewItems, totalAmount } = response.data.data;

      const itemsWithId = previewItems.map((item) => ({
        ...item,
        _id: item.variant._id,
      }));

      return {
        _id: "guest",
        user: "guest",
        items: itemsWithId,
        totalAmount,
      };
    } catch (error) {
      // Keep a guest cart usable while the API is restarting. It will be refreshed with current stock and prices on the next successful request.
      const cachedItems = items.flatMap((item) =>
        item.product && item.variant && item.priceAtAddition !== undefined
          ? [
              {
                _id: item.variant._id,
                product: item.product,
                variant: item.variant,
                quantity: item.quantity,
                priceAtAddition: item.priceAtAddition,
              },
            ]
          : [],
      );

      if (cachedItems.length === items.length) {
        return {
          _id: "guest",
          user: "guest",
          items: cachedItems,
          totalAmount: cachedItems.reduce(
            (total, item) => total + item.priceAtAddition * item.quantity,
            0,
          ),
        };
      }

      throw error;
    }
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

    if (!variant.isAvailable || variant.stock < quantity) {
      setError(
        !variant.isAvailable
          ? "This variant is currently unavailable"
          : "This variant does not have enough stock",
      );
      return;
    }

    // -------------------------
    // Guest cart
    // -------------------------
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
          product,
          variant,
          priceAtAddition: variant.price,
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

    // -------------------------
    // Authenticated cart
    // -------------------------

    const existingItem = cart.items.find(
      (item) => item.variant._id === variant._id,
    );

    const previousQuantity = existingItem?.quantity;

    dispatch(
      addToCart({
        product,
        variant,
        priceAtAddition: variant.price,
        quantity,
      }),
    );

    try {
      await addItemToCartApi(quantity, variant._id);
    } catch (error) {
      if (previousQuantity !== undefined) {
        dispatch(
          updateQuantity({
            itemId: variant._id,
            quantity: previousQuantity,
          }),
        );
      } else {
        dispatch(removeFromReduxCart(variant._id));
      }

      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || error.message);
      } else {
        setError("Could not add item to cart");
      }
    }
  };

  const updateItemQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return;

    setError("");

    // -------------------------
    // Guest cart
    // -------------------------
    if (!authStatus) {
      try {
        const existingCart = readGuestCartItems();

        if (existingCart.length === 0) return;

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

    // -------------------------
    // Authenticated cart
    // -------------------------

    const existingItem = cart.items.find(
      (item) => item._id === id || item.variant._id === id,
    );

    if (!existingItem) {
      setError("Cart item not found");
      return;
    }

    const previousQuantity = existingItem.quantity;

    // 1. Update UI immediately
    dispatch(
      updateQuantity({
        itemId: id,
        quantity,
      }),
    );

    // 2. Cancel previous timer for this item
    if (quantityTimers.current[id]) {
      clearTimeout(quantityTimers.current[id]);
    }

    // 3. Wait until user stops clicking
    quantityTimers.current[id] = setTimeout(async () => {
      try {
        await updateCartItem(id, quantity);
      } catch (error) {
        dispatch(
          updateQuantity({
            itemId: id,
            quantity: previousQuantity,
          }),
        );
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message ?? error.message);
        } else {
          setError("Could not update cart item");
        }

        // Sync with server if update fails
        void refetch();
      }
    }, 400);
  };

  const removeFromCart = async (id: string) => {
    setError("");
    // ------------------------- // Guest cart // -------------------------
    if (!authStatus) {
      const newItems = readGuestCartItems().filter(
        (item) => item.variantId !== id,
      );
      localStorage.setItem("cartItems", JSON.stringify(newItems));
      dispatch(removeFromReduxCart(id));
      return;
    }
    // ------------------------- // Authenticated cart // ------------------------- //
    const existingItem = cart.items.find(
      (item) => item._id === id || item.variant._id === id,
    );
    if (!existingItem) {
      setError("Cart item not found");
      return;
    }
    // Optimistic update
    dispatch(removeFromReduxCart(id));
    try {
      await removeCartItem(id);
    } catch (error) {
      dispatch(
        addToCart({
          product: existingItem.product as Product,
          variant: existingItem.variant as Variant,
          priceAtAddition: existingItem.priceAtAddition,
          quantity: existingItem.quantity,
        }),
      );
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message ?? error.message);
      } else {
        setError("Could not remove cart item");
      }
    }
  };

  const clearCart = async () => {
    setError("");
    // Save current cart before clearing it
    const previousItems = [...cart.items];
    // Optimistic update
    dispatch(clearReduxCart());
    try {
      if (authStatus) {
        await clearDBCart();
      } else {
        localStorage.removeItem("cartItems");
      }
    } catch (error) {
      // Rollback the entire cart
      dispatch(
        setCart({
          items: previousItems,
          totalAmount: previousItems.reduce(
            (total, item) => total + item.priceAtAddition * item.quantity,
            0,
          ),
        }),
      );
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
    clearCart,
  };
}

export default useCart;
