import client from "./client";
import type { AxiosRequestConfig } from "axios";

export type Category = {
  _id: string;
  name: string;
  slug: string;
};

export type ProductListResponse = {
  data: {
    products: Product[];
  }
    page: number;
    limit: number;
    totalProducts: number;
    totalPages: number;
};

export type ApiResponse = {
  statusCode: number;
  data: Product;
  message: string;
  success: boolean;
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

  relatedProducts?: Product[]
};


export const getProducts = (
  params?: Record<string, unknown>,
  signal?: AbortSignal,
) => {
  return client.get<ProductListResponse>("/products", {
    params,
    signal,
  });
};

export const getProduct = (slug: string) => {
  return client.get<ApiResponse>(`/products/${slug}`);
};

export const getFeaturedProduct = (config?: AxiosRequestConfig) =>
    client.get<ApiResponse>("/products/featured", config);
