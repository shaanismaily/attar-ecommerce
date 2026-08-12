import client from "./client";

type addItemProps = {
    quantity: number;
    volume: number;
}

type Product = {
    name: string;
    slug: string;
    images: string[]
}

type Variant = {
    volume: number;
    price: number;
    stock: number;
}

export type Cart = {
    _id: string;
    user: string;
    items: {
        product: Product;
        variant: Variant;
        quantity: number;
        priceAtAddition: number;
    }[]
}

type ApiResponse = {
    statusCode: number;
    data: Cart;
    message: string;
    success: boolean
}

export const addItemToCart = (data: addItemProps, productId: string) => (
    client.post<ApiResponse>(`/cart/items/${productId}`, data)
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