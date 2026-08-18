import client from "./client";

export type AddressType = "home" | "work" | "other";

export type Address = {
    _id: string
    user: string;
    firstName: string;
    lastName?: string;
    phone: string;
    street: string;
    landmark?: string;
    city: string;
    state: string;
    country: "India";
    zipCode: string;
    addressType: AddressType;
    isDefault: boolean;

    createdAt?: string;
    updatedAt?: string;
}

type ApiResponse<T> = {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;
}

export type AddressData = {
    firstName: string;
    lastName?: string; 
    phone: string;
    zipCode: string; 
    state: string; 
    city: string; 
    landmark?: string; 
    street: string; 
    addressType: AddressType;
    isDefault: boolean;
}

type RequireAtLeastOne<T> = {
  [K in keyof T]: Required<Pick<T, K>> & Partial<Omit<T, K>>;
}[keyof T];

type UpdateAddressFields = {
    street: string;
    landmark: string;
    city: string;
    state: string;
    addressType: AddressType;
    zipCode: string;
}

export type UpdateAddressData = RequireAtLeastOne<UpdateAddressFields>

export const createAddress = (data: AddressData) => (
    client.post<ApiResponse<Address>>("/address", data)
)

export const getAddresses = (signal?: AbortSignal) => (
    client.get<ApiResponse<Address[]>>("/address", { signal })
)

export const getAddressById = (addressId: string, signal?: AbortSignal) => (
    client.get<ApiResponse<Address>>(`/address/${addressId}`, { signal })
)

export const updateAddress = (addressId: string, data: UpdateAddressData) => (
    client.patch<ApiResponse<Address>>(`/address/${addressId}`, data)
)

export const setDefaultAddress = (addressId: string) => (
    client.patch<ApiResponse<Address>>(`/address/${addressId}/default`)
)

export const deleteAddress = (addressId: string) => (
    client.delete<ApiResponse<null>>(`/address/${addressId}`)
)