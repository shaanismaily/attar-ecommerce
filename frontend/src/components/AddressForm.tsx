import { useForm } from "react-hook-form";
import Input from "./Input";
import { Toast } from "./Toast";
import { useState } from "react";

type AddressFormData = {
  firstName: string;
  lastName: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  zipCode: string;
  addressType: "home" | "work" | "other";
  isDefault: boolean;
};

interface AddressFormProps {
  onSubmit: (data: AddressFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: AddressFormData;
  isEditing?: boolean;
}

function AddressForm({ onSubmit, onCancel, initialData, isEditing = false }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddressFormData>({
    defaultValues: initialData
  });
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const handleFormSubmit = async (data: AddressFormData) => {
    try {
      await onSubmit(data);
      reset();
      setToast({ message: "Address saved successfully!", type: "success" });
    } catch (error) {
      setToast({ message: "Failed to save address", type: "error" });
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-8 lg:mt-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-4">
          <div>
            <Input
              label="FIRST NAME"
              className="input-luxury"
              {...register("firstName", {
                required: "First name is required",
              })}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">
                {typeof errors.firstName.message === "string"
                  ? errors.firstName.message
                  : "Invalid"}
              </p>
            )}
          </div>

          <div>
            <Input
              label="LAST NAME"
              className="input-luxury"
              {...register("lastName", {
                required: "Last name is required",
              })}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">
                {typeof errors.lastName.message === "string"
                  ? errors.lastName.message
                  : "Invalid"}
              </p>
            )}
          </div>

          <div>
            <Input
              label="PHONE NUMBER"
              className="input-luxury"
              {...register("phone", {
                required: "Phone is required",
              })}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {typeof errors.phone.message === "string"
                  ? errors.phone.message
                  : "Invalid"}
              </p>
            )}
          </div>

          <div>
            <Input
              label="PIN CODE"
              className="input-luxury"
              {...register("zipCode", {
                required: "Pin code is required",
              })}
            />
            {errors.zipCode && (
              <p className="text-red-500 text-sm mt-1">
                {typeof errors.zipCode.message === "string"
                  ? errors.zipCode.message
                  : "Invalid"}
              </p>
            )}
          </div>

          <div>
            <Input
              label="CITY"
              className="input-luxury"
              {...register("city", {
                required: "City is required",
              })}
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">
                {typeof errors.city.message === "string"
                  ? errors.city.message
                  : "Invalid"}
              </p>
            )}
          </div>

          <div>
            <Input
              label="STATE"
              className="input-luxury"
              {...register("state", {
                required: "State is required",
              })}
            />
            {errors.state && (
              <p className="text-red-500 text-sm mt-1">
                {typeof errors.state.message === "string"
                  ? errors.state.message
                  : "Invalid"}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <Input
              label="ADDRESS LINE 1"
              className="input-luxury"
              placeholder="House No., Street"
              {...register("street", {
                required: "Street address is required",
              })}
            />
            {errors.street && (
              <p className="text-red-500 text-sm mt-1">
                {typeof errors.street.message === "string"
                  ? errors.street.message
                  : "Invalid"}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <Input
              label="ADDRESS LINE 2 (OPTIONAL)"
              className="input-luxury"
              placeholder="Area, Landmark"
              {...register("landmark")}
            />
          </div>

          <div className="md:col-span-2">
            <p
              className="text-sm lg:text-md font-semibold text-[#222] mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ADDRESS TYPE
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-3">
              <Input
                type="radio"
                label="HOME"
                value="home"
                {...register("addressType", {
                  required: "Address type is required",
                })}
              />

              <Input
                type="radio"
                label="WORK"
                value="work"
                {...register("addressType", {
                  required: "Address type is required",
                })}
              />

              <Input
                type="radio"
                label="OTHER"
                value="other"
                {...register("addressType", {
                  required: "Address type is required",
                })}
              />
            </div>
            {errors.addressType && (
              <p className="text-red-500 text-sm mt-1">
                {typeof errors.addressType.message === "string"
                  ? errors.addressType.message
                  : "Invalid"}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <Input
              type="checkbox"
              label="DEFAULT ADDRESS"
              {...register("isDefault")}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex-1 min-h-11 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : isEditing ? "Update Address" : "Save Address"}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-outline text-[#C9A227] flex-1 min-h-11"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </>
  );
}

export default AddressForm;
