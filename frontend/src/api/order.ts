import client from "./client";
import type { Address } from "./addresses";

export type OrderStatus =
    | "pending"
    | "packed"
    | "shipped"
    | "delivered"
    | "cancelled";

export type PaymentStatus =
    | "pending"
    | "paid"
    | "failed"
    | "refunded";

export type Order = {
    orderedBy: string;
    totalAmount: number;
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    shippingAddress: Address;
    orderItems: {
        product: {
            _id: string;
            name: string;
            slug: string;
            images: {
                url: string;
                publicId: string;
            }[]
        };
        variant: {
            _id: string;
            volume: number;
            price: number;
            stock: number;
        };
        productName: string;
        volume: number;
        price: number;
        quantity: number;
    };
}

export type OrderData = {
    volume: number;
    quantity: number;
    addressId: string;
}

type UpdateOrderStatusResponse = {
    orderStatus: OrderStatus;
};

type ApiResponse<T> = {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
}

export type OrderParams = {
    page: number;
    limit: number;
    query: string;
    sortType: string;
}

export const createOrder = (data: OrderData, productId: string) => (
    client.post<ApiResponse<Order>>(`/orders/${productId}`, data)
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

export const updateOrderStatus = (orderId: string, updatedStatus: OrderStatus) => (
    client.patch<ApiResponse<UpdateOrderStatusResponse>>(`/admin/orders/${orderId}/status`, { updatedStatus })
)