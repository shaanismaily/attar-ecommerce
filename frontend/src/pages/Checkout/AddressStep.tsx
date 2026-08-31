import useAddress from "../../hooks/useAddress";
import {
  createAddress,
  updateAddress,
  deleteAddress,
  type Address,
} from "../../api/addresses";
import { useState, useEffect } from "react";
import AddressForm from "../../components/AddressForm";

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
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );

  const getAddressFormData = (
    address: Address | null,
  ): AddressFormData | undefined => {
    if (!address) return undefined;

    return {
      firstName: address.firstName,
      lastName: address.lastName || "",
      phone: address.phone,
      street: address.street,
      landmark: address.landmark,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      addressType: address.addressType,
      isDefault: address.isDefault,
    };
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleUpdate = async (data: AddressFormData) => {
    if (!editingAddress) return;

    try {
      const response = await updateAddress(editingAddress._id, data);

      const updatedAddress = response.data.data;

      // If the edited address is currently selected,
      // update the checkout selection too.
      if (selectedAddressId === editingAddress._id) {
        setSelectedAddress(updatedAddress);
      }

      setEditingAddress(null);
      setShowForm(false);

      await refetch();
    } catch (error) {
      console.error("Failed to update address:", error);
      throw error;
    }
  };

  const handleDelete = async (addressId: string) => {
    try {
      await deleteAddress(addressId);

      // If deleted address was selected,
      // clear the checkout selection.
      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
        setSelectedAddress(null);
      }

      setShowDeleteConfirm(null);

      await refetch();
    } catch (error) {
      console.error("Failed to delete address:", error);
    }
  };

  useEffect(() => {
    if (!selectedAddressId && addresses.length > 0) {
      const defaultAddress =
        addresses.find((address) => address.isDefault) ?? addresses[0];

      setSelectedAddressId(defaultAddress._id);
      setSelectedAddress(defaultAddress);
    }
  }, [addresses, selectedAddressId, setSelectedAddressId, setSelectedAddress]);

  const submit = async (data: AddressFormData) => {
    try {
      const response = await createAddress(data);
      const newAddress = response.data.data;

      // Automatically select newly created address
      setSelectedAddressId(newAddress._id);
      setSelectedAddress(newAddress);

      // Hide form
      setShowForm(false);

      // Refresh addresses
      await refetch();
    } catch (error) {
      console.error("Failed to create address:", error);
      throw error;
    }
  };

  if (loading && !error) {
    return <div className="max-w-350 p-4 lg:p-6">Loading addresses...</div>;
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
            <h2 className="text-xl font-semibold">Select Delivery Address</h2>

            <button
              type="button"
              onClick={() => setShowForm((prev) => !prev)}
              className="btn-outline text-[#C9A227]"
            >
              {showForm ? "Cancel" : "+ Add New Address"}
            </button>
          </div>

          {addresses.map((address) => {
            const isSelected = selectedAddressId === address._id;

            return (
              <div
                key={address._id}
                className={`
        w-full
        text-left
        border-2
        rounded-2xl
        p-4 sm:p-5
        transition-all
        ${
          isSelected
            ? "border-[#0F5132] bg-[#FAF8F3]"
            : "border-[#e8e4d8] bg-white"
        }
      `}
              >
                {/* Selectable Address Area */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAddressId(address._id);
                    setSelectedAddress(address);
                  }}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-[#222]">
                          {address.firstName} {address.lastName}
                        </h3>

                        {address.isDefault && (
                          <span className="text-[10px] tracking-wider uppercase bg-[#0F5132] text-white px-2 py-1 rounded-sm">
                            Default
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-[#666] leading-6">
                        {address.street}
                        {address.landmark && `, ${address.landmark}`}
                      </p>

                      <p className="text-sm text-[#666]">
                        {address.city}, {address.state} - {address.zipCode}
                      </p>

                      <p className="mt-2 text-sm text-[#666]">
                        {address.phone}
                      </p>
                    </div>

                    {/* Selection indicator */}
                    <div
                      className={`
              shrink-0
              w-5 h-5
              rounded-full
              border-2
              flex items-center justify-center
              mt-1
              ${isSelected ? "border-[#0F5132]" : "border-[#d0ccc0]"}
            `}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#0F5132]" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#e8e4d8]">
                  <button
                    type="button"
                    onClick={() => handleEdit(address)}
                    className="
            text-xs
            font-medium
            tracking-wide
            text-[#0F5132]
            hover:text-[#C9A227]
            transition-colors
          "
                  >
                    Edit
                  </button>

                  <span className="w-px h-3 bg-[#d8d4ca]" />

                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(address._id)}
                    className="
            text-xs
            font-medium
            tracking-wide
            text-[#999]
            hover:text-red-500
            transition-colors
          "
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No addresses */}
      {addresses.length === 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Add Delivery Address</h2>

          <p className="text-sm text-gray-500 mt-1">
            You don't have any saved addresses yet.
          </p>
        </div>
      )}

      {/* Address form */}
      {(addresses.length === 0 || showForm) && (
        <AddressForm
          onSubmit={editingAddress ? handleUpdate : submit}
          onCancel={() => {
            setShowForm(false);
            setEditingAddress(null);
          }}
          initialData={getAddressFormData(editingAddress)}
          isEditing={!!editingAddress}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3
              className="text-lg font-semibold text-[#222]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Remove Address?
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#666]">
              Are you sure you want to remove this address? This action cannot
              be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-outline flex-1 text-[#C9A227]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 rounded-sm bg-[#0F5132] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#0b4027]"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
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
