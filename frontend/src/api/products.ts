import client from "./client";
import type { AxiosRequestConfig } from "axios";

export type SortOption =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "newest";

export type Gender = "men" | "women" | "unisex";

export type Variant = {
  _id: string;
  volume: number;
  price: number;
  stock: number;
  isAvailable: boolean;
};

type Image = {
  url: string;
  publicId: string;
};

type Category = {
  _id: string;
  name: string;
  slug: string;
};

type FragranceNoteSection = {
  description?: string;
  notes: string[];
};

type FragranceNotes = {
  top: FragranceNoteSection;
  heart: FragranceNoteSection;
  base: FragranceNoteSection;
};

export type Product = {
  _id: string;
  name: string;
  slug: string;
  tagline?: string;
  description: string;

  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isPublished: boolean;

  gender: Gender;

  images: Image[];
  category: Category;
  variants: Variant[];

  fragranceNotes: FragranceNotes;

  longevity: string;
  sillage: string;
  concentration: string;

  startingPrice?: number;
};

export type RelatedProduct = Pick<
  Product,
  "_id" | "name" | "slug" | "images" | "category"
> & {
  startingPrice: number;
};

export type ProductListResponse = {
  products: Product[];
  page: number;
  limit: number;
  totalProducts: number;
  totalPages: number;
  priceRange: {
    min: number;
    max: number;
  };
};

export type ProductDetailResponse = {
  product: Product;
  relatedProducts: RelatedProduct[];
};

export type ApiResponse<T> = {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
};

export const getProducts = (
  params?: Record<string, unknown>,
  signal?: AbortSignal
) =>
  client.get<ApiResponse<ProductListResponse>>("/products", {
    params,
    signal,
  });

export const getProduct = (slug: string) =>
  client.get<ApiResponse<ProductDetailResponse>>(`/products/${slug}`);

export const getFeaturedProduct = (config?: AxiosRequestConfig) =>
  client.get<ApiResponse<Product>>("/products/featured", config);