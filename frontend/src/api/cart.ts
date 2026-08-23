import client from "./client";

type Product = {
    _id: string;
    name: string;
    slug: string;
    images: {
        url: string;
        publicId: string;
    }[]
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

export type GuestCartResponse = {
    items: Cart["items"];
    totalAmount: number
}

type CartResponseData = {
    cart: Omit<Cart, "totalAmount">;
    totalAmount: number;
}

type ApiResponse<T> = {
    statusCode: number;
    data: T;
    message: string;
    success: boolean
}

type ItemsProps = {
    variantId: string;
    quantity: number;
}

export const addItemToCart = (quantity: number, variantId?: string) => (
    client.post<ApiResponse<CartResponseData>>(`/cart/items/${variantId}`, { quantity })
)

export const getUserCart = (signal?: AbortSignal) => (
    client.get<ApiResponse<CartResponseData>>("/cart", { signal })
)

export const clearCart = () => (
    client.delete("/cart")
)

export const updateCartItem = (cartItemId: string, quantity: number) => (
    client.patch<ApiResponse<CartResponseData>>(`/cart/items/${cartItemId}`, { quantity })
)

export const removeCartItem = (cartItemId: string) => (
    client.delete<ApiResponse<CartResponseData>>(`/cart/items/${cartItemId}`)
)

export const mergeCart = (items: ItemsProps[]) => (
    client.post<ApiResponse<CartResponseData>>("/cart/merge", { items })
)

export const previewCart = (items: ItemsProps[]) => (
    client.post<ApiResponse<GuestCartResponse>>("/cart/preview", { items })
)
