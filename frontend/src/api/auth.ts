import client from "./client";

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

export const getCurrentUser = () => {
    return client.get("/users/me")
}

export const updateAccountDetails = (data: AccountData) => {
    return client.patch("/users/update-account", data)
}
