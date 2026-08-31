import useAddress from "../../hooks/useAddress";
import { createAddress, updateAddress, deleteAddress, type Address } from "../../api/addresses";
import AddressForm from "../../components/AddressForm";
import { useState } from "react";
import { Toast } from "../../components/Toast";

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


function DashboardAddresses() {
    const { addresses, refetch: refetchAddresses } = useAddress();
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    const editingAddress = editingAddressId ? addresses.find(a => a._id === editingAddressId) : null;

    const getAddressFormData = (address: Address | null | undefined): AddressFormData | undefined => {
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
            isDefault: address.isDefault
        };
    };

    const handleAddAddress = async (data: AddressFormData) => {
        try {
            await createAddress(data);
            await refetchAddresses();
            setShowAddressForm(false);
            setToast({ message: "Address added successfully!", type: "success" });
        } catch (error) {
            console.error("Failed to add address:", error);
            setToast({ message: "Failed to add address", type: "error" });
            throw error;
        }
    };

    const handleEditAddress = async (data: AddressFormData) => {
        if (!editingAddressId) return;
        try {
            await updateAddress(editingAddressId, data);
            await refetchAddresses();
            setEditingAddressId(null);
            setShowAddressForm(false);
            setToast({ message: "Address updated successfully!", type: "success" });
        } catch (error) {
            console.error("Failed to update address:", error);
            setToast({ message: "Failed to update address", type: "error" });
            throw error;
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        try {
            await deleteAddress(addressId);
            await refetchAddresses();
            setShowDeleteConfirm(null);
            setToast({ message: "Address removed successfully!", type: "success" });
        } catch (error) {
            console.error("Failed to delete address:", error);
            setToast({ message: "Failed to remove address", type: "error" });
        }
    };

    const handleEditClick = (address: Address) => {
        setEditingAddressId(address._id);
        setShowAddressForm(true);
    };

    const handleCancelEdit = () => {
        setEditingAddressId(null);
        setShowAddressForm(false);
    };

return (
    <div className="animate-fade-in w-full min-w-0">
        {toast && (
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(null)}
            />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                    <h3 className="text-lg font-semibold text-[#222] mb-2">Remove Address?</h3>
                    <p className="text-sm text-[#666] mb-6">
                        Are you sure you want to remove this address? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(null)}
                            className="btn-outline text-[#C9A227] flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => showDeleteConfirm && handleDeleteAddress(showDeleteConfirm)}
                            className="btn-primary flex-1"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Header */}
        <div className="mb-6 sm:mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2
                        className="text-xl sm:text-2xl font-bold text-[#222]"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        Saved Addresses
                    </h2>

                    <p
                        className="mt-1 text-xs sm:text-sm text-[#888]"
                        style={{ fontFamily: "var(--font-sans)" }}
                    >
                        Manage your delivery addresses
                    </p>
                </div>
            </div>
        </div>

        {/* Address Form */}
        {showAddressForm && (
            <div className="bg-white border border-[#e8e4d8] rounded-sm p-4 sm:p-6 md:p-8 w-full max-w-2xl mb-6 sm:mb-8 shadow-sm">
                <div className="mb-5 sm:mb-6">
                    <h3
                        className="text-lg sm:text-xl font-semibold text-[#222]"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        {editingAddress ? "Edit Address" : "Add New Address"}
                    </h3>

                    <p
                        className="text-xs sm:text-sm text-[#888] mt-1"
                        style={{ fontFamily: "var(--font-sans)" }}
                    >
                        {editingAddress ? "Update your delivery details below." : "Enter your delivery details below."}
                    </p>
                </div>

                <AddressForm
                    onSubmit={editingAddress ? handleEditAddress : handleAddAddress}
                    onCancel={handleCancelEdit}
                    initialData={getAddressFormData(editingAddress)}
                    isEditing={!!editingAddress}
                />
            </div>
        )}

        {/* Address List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {addresses && addresses.length > 0 ? (
                <>
                    {addresses.map((address) => (
                        <div
                            key={address._id}
                            className={`
                                bg-white
                                rounded-sm
                                p-4 sm:p-5 md:p-6
                                relative
                                transition-all duration-200
                                hover:shadow-md
                                ${
                                    address.isDefault
                                        ? "border-2 border-[#0F5132]"
                                        : "border border-[#e8e4d8]"
                                }
                            `}
                        >
                            {/* Default Badge */}
                            {address.isDefault && (
                                <span
                                    className="
                                        absolute
                                        top-3 right-3
                                        sm:top-4 sm:right-4
                                        text-[0.55rem] sm:text-[0.6rem]
                                        tracking-widest
                                        uppercase
                                        bg-[#0F5132]
                                        text-white
                                        px-2 py-1
                                        font-medium
                                        rounded-sm
                                    "
                                    style={{ fontFamily: "var(--font-sans)" }}
                                >
                                    Default
                                </span>
                            )}

                            {/* Address Type */}
                            <div className="pr-16 sm:pr-20">
                                <p
                                    className="font-semibold text-[#222] mb-2 capitalize"
                                    style={{ fontFamily: "var(--font-sans)" }}
                                >
                                    {address.addressType || "Address"}
                                </p>
                            </div>

                            {/* Address Details */}
                            <p
                                className="text-sm text-[#666] leading-6 wrap-break-word"
                                style={{ fontFamily: "var(--font-sans)" }}
                            >
                                <span className="font-medium text-[#333]">
                                    {address.firstName} {address.lastName}
                                </span>
                                <br />

                                {address.street}
                                <br />

                                {address.landmark && (
                                    <>
                                        {address.landmark}
                                        <br />
                                    </>
                                )}

                                {address.city}, {address.state}{" "}
                                {address.zipCode}
                                <br />

                                {address.country}
                            </p>

                            {/* Actions */}
                            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-[#f0ede5]">
                                <button
                                    type="button"
                                    onClick={() => handleEditClick(address)}
                                    className="text-xs font-medium text-[#0F5132] hover:text-[#C9A227] transition-colors"
                                    style={{ fontFamily: "var(--font-sans)" }}
                                >
                                    Edit
                                </button>

                                <span className="h-3 w-px bg-[#ddd]" />

                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(address._id)}
                                    className="text-xs font-medium text-[#999] hover:text-red-500 transition-colors"
                                    style={{ fontFamily: "var(--font-sans)" }}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add Address Card */}
                    {!showAddressForm && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingAddressId(null);
                                setShowAddressForm(true);
                            }}
                            className="
                                bg-white
                                border border-dashed border-[#d0ccc0]
                                rounded-sm
                                p-6
                                min-h-47.5
                                flex items-center justify-center
                                cursor-pointer
                                hover:border-[#C9A227]
                                hover:bg-[#fffdf7]
                                transition-all duration-200
                                group
                            "
                        >
                            <div className="text-center">
                                <div
                                    className="
                                        w-11 h-11
                                        border border-[#d0ccc0]
                                        rounded-full
                                        flex items-center justify-center
                                        mx-auto mb-3
                                        group-hover:border-[#C9A227]
                                        group-hover:bg-[#fffaf0]
                                        transition-all
                                    "
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        fill="none"
                                        stroke="#888"
                                        strokeWidth="1.8"
                                        viewBox="0 0 24 24"
                                        className="group-hover:stroke-[#C9A227] transition-colors"
                                    >
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </div>

                                <p
                                    className="text-sm text-[#888] group-hover:text-[#C9A227] transition-colors"
                                    style={{ fontFamily: "var(--font-sans)" }}
                                >
                                    Add Address
                                </p>

                                <p className="text-xs text-[#aaa] mt-1">
                                    Add another delivery location
                                </p>
                            </div>
                        </button>
                    )}
                </>
            ) : (
                !showAddressForm && (
                    <div className="col-span-full bg-white border border-[#e8e4d8] rounded-sm text-center py-12 sm:py-16 px-5">
                        <div
                            className="
                                w-14 h-14
                                mx-auto mb-4
                                rounded-full
                                bg-[#f7f5ef]
                                flex items-center justify-center
                            "
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#C9A227"
                                strokeWidth="1.5"
                            >
                                <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                                <circle cx="12" cy="10" r="2.5" />
                            </svg>
                        </div>

                        <p
                            className="text-base font-medium text-[#444] mb-1"
                            style={{ fontFamily: "var(--font-sans)" }}
                        >
                            No saved addresses
                        </p>

                        <p className="text-sm text-[#999] mb-5">
                            Add an address to make checkout faster.
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                setEditingAddressId(null);
                                setShowAddressForm(true);
                            }}
                            className="btn-outline text-[#C9A227]"
                        >
                            + Add Your First Address
                        </button>
                    </div>
                )
            )}
        </div>
    </div>
);
}

export default DashboardAddresses;
