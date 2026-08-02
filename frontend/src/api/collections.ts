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

type categoryData = {
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

export type updateCategoryData = RequireAtLeastOne<UpdateCategoryFields>;

export const getAllCollections = (config?: AxiosRequestConfig) =>
    client.get<ApiResponse<Collection[]>>("/categories", config);

export const getCollectionById = () => {
    client.get("/categories/:categoryId")
}

export const createCategory = (data: categoryData) => {
    client.post("/admin/categories", data)
}

export const updateCategory = (data: updateCategoryData) => {
    client.patch("/admin/categories/:categoryId", data)
}

export const updateImage = (image: File) => {
    client.patch("/admin/categories/:categoryId/image", image)
}

export const deleteCategory = () => {
    client.delete("/admin/categories/:categoryId")
}
