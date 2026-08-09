import client from "./client"

export type ApiResponse<T> = {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
};

export type Variant = {
    _id: string;
    product: string;
    volume: number;
    price: number;
    stock: number;
    isAvailable: boolean;

    createdAt: string;
    updatedAt: string;

};

type VariantData = {
    product?: string;
    volume?: number;
    price?: number;
    stock?: number;
    isAvailable?: boolean;
}

export const getVariants = (ProductId: string) => (
    client.get<ApiResponse<Variant[]>>(`/products/${ProductId}/variants`)
)

export const createVariant = (data: VariantData) => (
    client.post<ApiResponse<Variant>>("/admin/variants", data)
)

export const updateVariant = (data: VariantData, variantId: string) => (
    client.patch<ApiResponse<Variant>>(`/admin/variants/${variantId}`, data)
)