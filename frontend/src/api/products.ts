import client from "./client";
import type { AxiosRequestConfig } from "axios";

export type Category = {
  _id: string;
  name: string;
  slug: string;
};

export type Variant = [
  {
    _id: string;
    volume: number;
    price: number;
    stock: number;
    isAvailable: boolean;
  }
]

export type ProductListResponse = {
  data: {
    products: Product[];
  }
    page: number;
    limit: number;
    totalProducts: number;
    totalPages: number;
};

export type RelatedProductResponse = {
  _id: string;
  name: string;
  slug: string;
  images: [
    {
      url: string;
      publicId: string;
    }
  ];
  startingPrice: number;
  category: {
    name: string;
    slug: string;
  }
}

export type ApiResponse<T> = {
  statusCode: number;
  data: T;
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
  variants: Variant;

  createdAt: string;
  updatedAt: string;

  relatedProducts?: RelatedProductResponse[]
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
  return client.get<ApiResponse<Product>>(`/products/${slug}`);
};

export const getFeaturedProduct = (config?: AxiosRequestConfig) =>
    client.get<ApiResponse<Product>>("/products/featured", config);
