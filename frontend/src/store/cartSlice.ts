import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product, Variant } from "../api/products";
import type { Cart } from "../api/cart";

type CartItem = Cart["items"][number];

type AddToCartPayload = {
    product: Product;
    variant: Variant;
    priceAtAddition: number;
    quantity: number;
};

type CartState = {
    items: CartItem[];
    totalAmount: number;
    initialized: boolean;
};

const initialState: CartState = {
    items: [],
    totalAmount: 0,
    initialized: false,
};

const calculateTotal = (items: CartItem[]) => {
    return items.reduce(
        (total, item) =>
            total + item.priceAtAddition * item.quantity,
        0
    );
};

const cartSlice = createSlice({
    name: "cart",

    initialState,

    reducers: {
        setCart: (
            state,
            action: PayloadAction<{
                items: CartItem[];
                totalAmount: number;
            }>
        ) => {
            state.items = action.payload.items;
            state.totalAmount = action.payload.totalAmount;
            state.initialized = true;
        },

        addToCart: (
            state,
            action: PayloadAction<AddToCartPayload>
        ) => {
            const {
                product,
                variant,
                priceAtAddition,
                quantity,
            } = action.payload;

            const existingItem = state.items.find(
                item =>
                    item.variant._id === variant._id
            );

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                state.items.push({
                    _id: `guest-${variant._id}`,
                    product,
                    variant,
                    priceAtAddition,
                    quantity,
                });
            }

            state.totalAmount = calculateTotal(
                state.items
            );
        },

        updateQuantity: (
            state,
            action: PayloadAction<{
                itemId: string;
                quantity: number;
            }>
        ) => {
            const {
                itemId,
                quantity,
            } = action.payload;

            const item = state.items.find(
                item =>
                    item._id === itemId ||
                    item.variant._id === itemId
            );

            if (!item) return;

            if (quantity <= 0) {
                state.items = state.items.filter(
                    item =>
                        item._id !== itemId &&
                        item.variant._id !== itemId
                );
            } else {
                item.quantity = quantity;
            }

            state.totalAmount = calculateTotal(
                state.items
            );
        },

        removeFromCart: (
            state,
            action: PayloadAction<string>
        ) => {
            const itemId = action.payload;

            state.items = state.items.filter(
                item =>
                    item._id !== itemId &&
                    item.variant._id !== itemId
            );

            state.totalAmount = calculateTotal(
                state.items
            );
        },

        clearCart: state => {
            state.items = [];
            state.totalAmount = 0;
        },

        setInitialized: (
            state,
            action: PayloadAction<boolean>
        ) => {
            state.initialized = action.payload;
        },
    },
});

export const {
    setCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    setInitialized,
} = cartSlice.actions;

export default cartSlice.reducer;