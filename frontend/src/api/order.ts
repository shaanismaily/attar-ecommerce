import client from "./client";

export type Order = {
    orderedBy: string;
    totalAmount: number;
    orderStatus: "pending" | "packed" | "shipped" | "delivered" | "cancelled";
    paymentStatus: "pending" | "paid" | "failed" | "refunded";
    shippingAddress: string;
    orderItems: {
        product: {
            _id: string;
            name: string;
            slug: string;
            images: {
                url: string;
                publidId: string;
            }[]
        };
        variant: {
            _id: string;
            volume: number;
            price: number;
            stock: number;
        };
        productName: string;
        volume: string;
        price: number;
        quantity: number;
    };
}

type OrderData = {
    volume: number;
    quantity: number;
    addressId: string;
}

type ApiResponse<T> = {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
}

type OrderParams = {
    page: number;
    limit: number;
    query: string;
    sortType: string;
}

export const createOrder = (data: OrderData, productId: string) => (
    client.post(`/orders/${productId}`, data)
)

export const getOrders = (signal?: AbortSignal) => (
    client.get<ApiResponse<Order[]>>("/orders/me", { signal })
)

export const getOrder = (orderId: string, signal?: AbortSignal) => (
    client.get<ApiResponse<Order>>(`/orders/${orderId}`, { signal })
)

export const cancelOrder = (orderId: string) => (
    client.patch<ApiResponse<Order>>(`/orders/${orderId}/cancel`)
)

export const getAllOrders = (params: OrderParams, signal?: AbortSignal) => (
    client.get<ApiResponse<Order[]>>("/admin/orders", {
        params,
        signal
    })
)

export const updateOrderStatus = (orderId: string, status: string) => (
    client.patch(`/admin/orders/${orderId}/status`, { status })
)