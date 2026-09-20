import { useState } from "react";
import { useForm } from "react-hook-form";
import type { CreateProductData } from "../api/products";
import Input from "./Input";

export type ProductCategoryOption = { _id: string; name: string };

type ProductFormValues = Omit<
  CreateProductData,
  "images" | "fragranceNotes"
> & {
  images: FileList;
  topNotes: string;
  topDescription?: string;
  heartNotes: string;
  heartDescription?: string;
  baseNotes: string;
  baseDescription?: string;
};

type ProductFormProps = {
  categories: ProductCategoryOption[];
  onSubmit: (data: CreateProductData) => Promise<unknown>;
  onCancel?: () => void;
};

const splitNotes = (value: string) =>
  value
    .split(",")
    .map((note) => note.trim())
    .filter(Boolean);

const errorMessage = (message?: string) => message ?? "Invalid value";

function ProductForm({ categories, onSubmit, onCancel }: ProductFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    defaultValues: {
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: false,
      isPublished: true,
    },
  });

  const submitProduct = async (data: ProductFormValues) => {
    setSubmitError(null);
    try {
      await onSubmit({
        name: data.name.trim(),
        tagline: data.tagline?.trim() || undefined,
        description: data.description.trim(),
        categoryId: data.categoryId,
        gender: data.gender,
        images: Array.from(data.images),
        fragranceNotes: {
          top: {
            description: data.topDescription?.trim() || undefined,
            notes: splitNotes(data.topNotes),
          },
          heart: {
            description: data.heartDescription?.trim() || undefined,
            notes: splitNotes(data.heartNotes),
          },
          base: {
            description: data.baseDescription?.trim() || undefined,
            notes: splitNotes(data.baseNotes),
          },
        },
        longevity: data.longevity.trim(),
        sillage: data.sillage.trim(),
        concentration: data.concentration.trim(),
        isFeatured: data.isFeatured,
        isBestSeller: data.isBestSeller,
        isNewArrival: data.isNewArrival,
        isPublished: data.isPublished,
      });
      reset();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to save product.",
      );
    }
  };

  const noteValidation = (value: string) =>
    splitNotes(value).length > 0 || "Enter at least one note";

  return (
    <form onSubmit={handleSubmit(submitProduct)} className="mt-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <Input
            label="PRODUCT NAME"
            className="input-luxury"
            {...register("name", { required: "Product name is required" })}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">
              {errorMessage(errors.name.message)}
            </p>
          )}
        </div>
        <div>
          <Input
            label="TAGLINE (OPTIONAL)"
            className="input-luxury"
            {...register("tagline")}
          />
        </div>

        <div className="md:col-span-2">
          <label
            className="mb-2 block text-[0.68rem] tracking-[0.15em] uppercase text-[#888]"
            htmlFor="product-description"
          >
            DESCRIPTION
          </label>
          <textarea
            id="product-description"
            className="input-luxury min-h-28 w-full"
            {...register("description", {
              required: "Product description is required",
            })}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">
              {errorMessage(errors.description.message)}
            </p>
          )}
        </div>

        <div>
          <label
            className="mb-2 block text-[0.68rem] tracking-[0.15em] uppercase text-[#888]"
            htmlFor="product-category"
          >
            CATEGORY
          </label>
          <select
            id="product-category"
            className="input-luxury w-full"
            defaultValue=""
            {...register("categoryId", { required: "Category is required" })}
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-500">
              {errorMessage(errors.categoryId.message)}
            </p>
          )}
        </div>
        <div>
          <Input
            label="IMAGES"
            type="file"
            multiple
            accept="image/*"
            className="input-luxury"
            {...register("images", {
              validate: (files) =>
                files?.length > 0 || "At least one image is required",
            })}
          />
          {errors.images && (
            <p className="mt-1 text-sm text-red-500">
              {errorMessage(errors.images.message)}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <p
            className="mb-3 text-sm font-semibold text-[#222]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            GENDER
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            <Input
              type="radio"
              label="MEN"
              value="men"
              {...register("gender", { required: "Gender is required" })}
            />
            <Input
              type="radio"
              label="WOMEN"
              value="women"
              {...register("gender", { required: "Gender is required" })}
            />
            <Input
              type="radio"
              label="UNISEX"
              value="unisex"
              {...register("gender", { required: "Gender is required" })}
            />
          </div>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-500">
              {errorMessage(errors.gender.message)}
            </p>
          )}
        </div>

        <div>
          <Input
            label="SILLAGE"
            className="input-luxury"
            {...register("sillage", { required: "Sillage is required" })}
          />
          {errors.sillage && (
            <p className="mt-1 text-sm text-red-500">
              {errorMessage(errors.sillage.message)}
            </p>
          )}
        </div>
        <div>
          <Input
            label="CONCENTRATION"
            className="input-luxury"
            {...register("concentration", {
              required: "Concentration is required",
            })}
          />
          {errors.concentration && (
            <p className="mt-1 text-sm text-red-500">
              {errorMessage(errors.concentration.message)}
            </p>
          )}
        </div>
        <div>
          <Input
            label="LONGEVITY"
            className="input-luxury"
            {...register("longevity", { required: "Longevity is required" })}
          />
          {errors.longevity && (
            <p className="mt-1 text-sm text-red-500">
              {errorMessage(errors.longevity.message)}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <p
            className="mb-1 text-sm font-semibold text-[#222]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            FRAGRANCE NOTES
          </p>
          <p className="mb-3 text-xs text-[#888]">
            Separate notes with commas. Each layer requires at least one note.
          </p>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {(
              [
                ["top", "TOP NOTES"],
                ["heart", "HEART NOTES"],
                ["base", "BASE NOTES"],
              ] as const
            ).map(([tier, label]) => (
              <div key={tier} className="rounded border border-[#e8e4d8] p-4">
                <Input
                  label={label}
                  placeholder="Bergamot, lemon"
                  className="input-luxury"
                  {...register(`${tier}Notes`, { validate: noteValidation })}
                />
                {errors[`${tier}Notes`] && (
                  <p className="mt-1 text-sm text-red-500">
                    {errorMessage(errors[`${tier}Notes`]?.message)}
                  </p>
                )}
                <Input
                  label="DESCRIPTION (OPTIONAL)"
                  className="input-luxury mt-3"
                  {...register(`${tier}Description`)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-3 md:col-span-2">
          <Input label="FEATURED" type="checkbox" {...register("isFeatured")} />
          <Input
            label="BEST SELLER"
            type="checkbox"
            {...register("isBestSeller")}
          />
          <Input
            label="NEW ARRIVAL"
            type="checkbox"
            {...register("isNewArrival")}
          />
          <Input
            label="PUBLISHED"
            type="checkbox"
            {...register("isPublished")}
          />
        </div>
      </div>

      {submitError && (
        <p role="alert" className="mt-4 text-sm text-red-500">
          {submitError}
        </p>
      )}
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary min-h-11 flex-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Product"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-outline min-h-11 flex-1"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default ProductForm;
