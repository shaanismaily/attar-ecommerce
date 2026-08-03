import client from "./client";
import type { AxiosRequestConfig } from "axios";

export type Category = {
  _id: string;
  name: string;
  slug: string;
};
export type Product = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isPublished: boolean;
  images: {
    url: string;
    publicId: string;
  }[];
  category: Category;

  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
};

export const getProducts = (
  params?: Record<string, unknown>,
  signal?: AbortSignal,
) => {
  return client.get<ApiResponse<Product[]>>("/products", {
    params,
    signal,
  });
};

export const getProduct = () => {
  return client.get<ApiResponse<Product>>("/products/:slug");
};

export const getFeaturedProduct = (config?: AxiosRequestConfig) =>
    client.get<ApiResponse<Product>>("/products/featured", config);
