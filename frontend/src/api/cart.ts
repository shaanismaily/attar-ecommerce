import client from "./client";

type Product = {
    _id: string;
    name: string;
    slug: string;
    images: string[]
}

type Variant = {
    _id: string;
    volume: number;
    price: number;
    stock: number;
}

export type Cart = {
    _id: string;
    user: string;
    items: {
        _id: string;
        product: Product;
        variant: Variant;
        quantity: number;
        priceAtAddition: number;
    }[],
    totalAmount: number;
}

type ApiResponse = {
    statusCode: number;
    data: Cart;
    message: string;
    success: boolean
}

type ItemsProps = {
    variantId: string;
    quantity: number;
}

export const addItemToCart = (quantity: number, variantId?: string) => (
    client.post<ApiResponse>(`/cart/items/${variantId}`, quantity)
)

export const getUserCart = (signal?: AbortSignal) => (
    client.get<ApiResponse>("/cart", { signal })
)

export const clearCart = () => (
    client.delete("/cart")
)

export const updateCartItem = (cartItemId: string, quantity: number) => (
    client.patch<ApiResponse>(`/cart/items/${cartItemId}`, quantity)
)

export const removeCartItem = (cartItemId: string) => (
    client.delete<ApiResponse>(`/cart/items/${cartItemId}`)
)

export const mergeCart = (items: ItemsProps[]) => (
    client.post<ApiResponse>("/cart/merge", items)
)