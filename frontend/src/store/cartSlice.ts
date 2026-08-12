import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product, Variant } from "../api/products";

type Item = {
    product: Product;
    variant: Variant;
    price: number;
    quantity: number;
};

type AddToCartPayload = {
    product: Product;
    variant: Variant;
    price: number;
    quantity: number;
};

type CartItemIdentifier = {
    productId: string;
    variantId: string;
};

type UpdateQuantityPayload = {
    productId: string;
    variantId: string;
    quantity: number;
};

type InitialStateType = {
    items: Item[];
};

const initialState: InitialStateType = {
    items: []
};

const cartSlice = createSlice({
    name: "cart",
    initialState,

    reducers: {
        addToCart: (
            state,
            action: PayloadAction<AddToCartPayload>
        ) => {
            const {
                product,
                variant,
                price,
                quantity
            } = action.payload;

            const existingItem = state.items.find(
                item =>
                    item.product._id === product._id &&
                    item.variant._id === variant._id
            );

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                state.items.push({
                    product,
                    variant,
                    price,
                    quantity
                });
            }
        },

        removeFromCart: (
            state,
            action: PayloadAction<CartItemIdentifier>
        ) => {
            const { productId, variantId } = action.payload;

            state.items = state.items.filter(
                item =>
                    item.product._id !== productId ||
                    item.variant._id !== variantId
            );
        },

        updateQuantity: (
            state,
            action: PayloadAction<UpdateQuantityPayload>
        ) => {
            const {
                productId,
                variantId,
                quantity
            } = action.payload;

            const existingItem = state.items.find(
                item =>
                    item.product._id === productId &&
                    item.variant._id === variantId
            );

            if (!existingItem) return;

            if (quantity <= 0) {
                state.items = state.items.filter(
                    item =>
                        item.product._id !== productId ||
                        item.variant._id !== variantId
                );
                return;
            }

            existingItem.quantity = quantity;
        },

        clearCart: (state) => {
            state.items = [];
        }
    }
});

export const {
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
} = cartSlice.actions;

export default cartSlice.reducer;