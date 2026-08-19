import useAddress from "../../hooks/useAddress";
import Input from "../../components/Input";
import { useForm } from "react-hook-form";
import { createAddress, type Address } from "../../api/addresses";
import { useState, useEffect } from "react";

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

type AddressProps = {
  selectedAddressId: string | null;
  setSelectedAddressId: (id: string | null) => void;
  setSelectedAddress: (address: Address | null) => void;
  setStep: (step: number) => void;
};

function AddressStep({
  selectedAddressId,
  setSelectedAddressId,
  setSelectedAddress,
  setStep,
}: AddressProps) {
  const { addresses, loading, error, refetch } = useAddress();

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!selectedAddressId && addresses.length > 0) {
            const defaultAddress =
            addresses.find((address) => address.isDefault) ??
            addresses[0];

            setSelectedAddressId(defaultAddress._id);
            setSelectedAddress(defaultAddress);
    }
    }, [
        addresses,
        selectedAddressId,
        setSelectedAddressId,
        setSelectedAddress,
    ]);

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<AddressFormData>();

  const submit = async (data: AddressFormData) => {
    try {
      const response = await createAddress(data);

      const newAddress = response.data.data;

      // Automatically select newly created address
      setSelectedAddressId(newAddress._id);
      setSelectedAddress(newAddress);

      // Hide form
      setShowForm(false);

      // Clear form
      reset();

      // Refresh addresses
      await refetch();
    } catch (error) {
      console.error("Failed to create address:", error);
    }
  };

  if (loading && !error) {
    return (
      <div className="max-w-350 p-4 lg:p-6">
        Loading addresses...
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="max-w-350 p-4 lg:p-6">
        <p>{error}</p>

        <button
          type="button"
          onClick={() => refetch()}
          className="btn-primary mt-4"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-350 p-4 lg:p-6">
      {/* Existing addresses */}
      {addresses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Select Delivery Address
            </h2>

            <button
              type="button"
              onClick={() => setShowForm((prev) => !prev)}
              className="btn-outline"
            >
              {showForm ? "Cancel" : "+ Add New Address"}
            </button>
          </div>

          {addresses.map((address) => {
            const isSelected = selectedAddressId === address._id;

            return (
              <button
                key={address._id}
                type="button"
                onClick={() => {
                    setSelectedAddressId(address._id)
                    setSelectedAddress(address)
                }}
                className={`w-full text-left border-2 rounded-2xl p-5 transition-all ${
                  isSelected
                    ? "border-[#0F5132] bg-[#FAF8F3]"
                    : "border-[#e8e4d8] bg-white hover:border-[#C9A227]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {address.firstName} {address.lastName}
                    </h3>

                    <p className="mt-2 text-sm">
                      {address.street}
                      {address.landmark && `, ${address.landmark}`}
                    </p>

                    <p className="text-sm">
                      {address.city}, {address.state} - {address.zipCode}
                    </p>

                    <p className="mt-2 text-sm">
                      {address.phone}
                    </p>
                  </div>

                  {/* Selection indicator */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? "border-[#0F5132]"
                        : "border-[#d0ccc0]"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0F5132]" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* No addresses */}
      {addresses.length === 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            Add Delivery Address
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            You don't have any saved addresses yet.
          </p>
        </div>
      )}

      {/* Address form */}
      {(addresses.length === 0 || showForm) && (
        <form
          onSubmit={handleSubmit(submit)}
          className="mt-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="FIRST NAME"
              className="input-luxury"
              {...register("firstName", {
                required: true,
              })}
            />

            <Input
              label="LAST NAME"
              className="input-luxury"
              {...register("lastName")}
            />

            <Input
              label="PHONE NUMBER"
              className="input-luxury"
              {...register("phone", {
                required: true,
              })}
            />

            <Input
              label="PIN CODE"
              className="input-luxury"
              {...register("zipCode", {
                required: true,
              })}
            />

            <Input
              label="CITY"
              className="input-luxury"
              {...register("city", {
                required: true,
              })}
            />

            <Input
              label="STATE"
              className="input-luxury"
              {...register("state", {
                required: true,
              })}
            />

            <div className="md:col-span-2">
              <Input
                label="ADDRESS LINE 1"
                className="input-luxury"
                placeholder="House No., Street"
                {...register("street", {
                  required: true,
                })}
              />
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
              <p className="mb-3">ADDRESS TYPE</p>

              <div className="flex gap-6">
                <Input
                  type="radio"
                  label="HOME"
                  value="home"
                  {...register("addressType", {
                    required: true,
                  })}
                />

                <Input
                  type="radio"
                  label="WORK"
                  value="work"
                  {...register("addressType", {
                    required: true,
                  })}
                />

                <Input
                  type="radio"
                  label="OTHER"
                  value="other"
                  {...register("addressType", {
                    required: true,
                  })}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <Input
                type="checkbox"
                label="DEFAULT ADDRESS"
                {...register("isDefault")}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary mt-6"
          >
            Save Address
          </button>
        </form>
      )}

      {/* Continue */}
      {addresses.length > 0 && (
        <div className="flex justify-end mt-8">
          <button
            type="button"
            disabled={!selectedAddressId}
            onClick={() => setStep(2)}
            className="btn-primary px-12 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

export default AddressStep;