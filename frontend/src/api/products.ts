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

export type CreateProductVariant = Omit<Variant, "_id">;

type Image = {
  url: string;
  publicId: string;
};

type Category = {
  _id: string;
  name: string;
  slug: string;
};

export type FragranceNoteSection = {
  description?: string;
  notes: string[];
};

export type FragranceNotes = {
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

export type CreateProductData = {
  name: string;
  tagline?: string;
  description: string;

  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isPublished: boolean;

  gender: "men" | "women" | "unisex";

  images: File[];

  categoryId: string;

  fragranceNotes: FragranceNotes;

  longevity: string;
  sillage: string;
  concentration: string;

  variants: CreateProductVariant[];
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

export const createProduct = (data: CreateProductData) => {
  const formData = new FormData();

  formData.append("name", data.name);
  if (data.tagline) formData.append("tagline", data.tagline);
  formData.append("description", data.description);
  formData.append("categoryId", data.categoryId);
  formData.append("gender", data.gender);
  formData.append("fragranceNotes", JSON.stringify(data.fragranceNotes));
  formData.append("longevity", data.longevity);
  formData.append("sillage", data.sillage);
  formData.append("concentration", data.concentration);
  formData.append("isFeatured", String(data.isFeatured));
  formData.append("isBestSeller", String(data.isBestSeller));
  formData.append("isNewArrival", String(data.isNewArrival));
  formData.append("variants", JSON.stringify(data.variants));
  formData.append("isPublished", String(data.isPublished));
  data.images.forEach((image) => formData.append("images", image));

  return client.post<ApiResponse<Product>>("/admin/products", formData);
};
