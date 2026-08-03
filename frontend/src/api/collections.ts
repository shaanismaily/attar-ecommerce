import client from "./client";
import type { AxiosRequestConfig } from "axios";

export type Collection = {
    _id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    isActive: boolean;
    productCount: number;
    createdAt: string;
    updatedAt: string;
};

type ApiResponse<T> = {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
};

type CategoryData = {
    name: string;
    description: string;
    isActive: boolean;
    image: File
}

type RequireAtLeastOne<T> = {
  [K in keyof T]: Required<Pick<T, K>> & Partial<Omit<T, K>>;
}[keyof T];

type UpdateCategoryFields = {
    name?: string;
    description?: string;
    isActive?: boolean;
};

export type UpdateCategoryData = RequireAtLeastOne<UpdateCategoryFields>;

export const getAllCollections = (config?: AxiosRequestConfig) => {
    return client.get<ApiResponse<Collection[]>>("/categories", config);
}

export const getCollectionById = (categoryId: string) => {
    return client.get<ApiResponse<Collection>>(`/categories/${categoryId}`)
}

export const createCategory = (data: CategoryData) => {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("isActive", String(data.isActive));
    formData.append("image", data.image);

    return client.post<ApiResponse<Collection>>("/admin/categories", formData);
};

export const updateCategory = (categoryId: string, data: UpdateCategoryData) => {
    return client.patch<ApiResponse<Collection>>(`/admin/categories/${categoryId}`, data)
}

export const updateImage = (image: File, categoryId: string) => {
    const formData = new FormData();

    formData.append("image", image);

    return client.patch(
        `/admin/categories/${categoryId}/image`,
        formData
    );
};

export const deleteCategory = (categoryId: string) => {
    return client.delete(`/admin/categories/${categoryId}`)
}
