import client from "./client";

export type User = {
    _id: string;
    fullName: string;
    email: string;
    role: string;
    phone?: string;

    createdAt: string;
    updatedAt: string;
}

export type RegisterData = {
  fullName: string;
  phone?: string;
  email: string;
  password: string;
}

export interface LoginData {
    email?: string;
    phone?: string;
    password: string;
}

export type PasswordData = {
    oldPassword: string;
    newPassword: string;
}

export type ApiResponse<T> = {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
};

type RequireAtLeastOne<T> = {
  [K in keyof T]: Required<Pick<T, K>> & Partial<Omit<T, K>>;
}[keyof T];

type AccountUpdateFields = {
    fullName?: string;
    email?: string;
    phone?: string;
};

export type AccountData = RequireAtLeastOne<AccountUpdateFields>;

export const register = (data: RegisterData) => {
    return client.post("/users/register", data)
}

export const login = (data: LoginData) => {
    return client.post("/users/login", data)
}

export const logout = () => {
    return client.post("/users/logout")
}

export const refreshAccessToken = () => {
    return client.post("/users/refresh-token")
}

export const changePassword = (data: PasswordData) => {
    return client.post("/users/change-password", data)
}

export const getCurrentUser = (signal?: AbortSignal) => {
    return client.get<ApiResponse<User>>("/users/me", { signal })
}

export const updateAccountDetails = (data: AccountData) => {
    return client.patch("/users/update-account", data)
}
