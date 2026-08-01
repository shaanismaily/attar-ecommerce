import { useState } from "react";
import { login as userLogin } from "../api/auth";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import type { LoginData } from "../api/auth";
import { useForm } from "react-hook-form";
import { login as storeLogin } from "../store/authSlice";
import Input from "./Input";
import axios from "axios";

type LoginFormData = {
  identifier: string;
  password: string;
};

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const { register, handleSubmit } = useForm<LoginFormData>();

  const login = async (data: LoginFormData) => {
    setError("");

    try {
      const payload: LoginData = data.identifier.includes("@")
        ? {
            email: data.identifier,
            password: data.password,
          }
        : {
            phone: data.identifier,
            password: data.password,
          };

      const response = await userLogin(payload);

      dispatch(storeLogin(response.data.data.user));
      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message ?? "Login failed");
      } else {
        setError("Something went wrong");
      }
    }
  };

  return (
    <section className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md rounded-2xl bg-(--color-ivory) p-6 shadow-2xl sm:p-8">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-semibold text-(--color-emerald)">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-(--color-stone)">
            Sign in to continue your fragrance journey.
          </p>
        </div>

        {error && (
          <p
            className="mb-4 rounded-md bg-red-50 px-3 py-2 text-center text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}

        <p className="text-(--color-emerald) text-center text-sm mb-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-500 hover:underline font-medium"
          >
            Sign Up
          </Link>
        </p>

        <form className="space-y-5" onSubmit={handleSubmit(login)}>
          <div className="space-y-4">
            <Input
              type="text"
              className="input-luxury rounded-md"
              placeholder="Email or phone"
              autoComplete="username"
              {...register("identifier", {
                required: "Email or phone is required",
              })}
            />

            <Input
              type="password"
              className="input-luxury rounded-md"
              placeholder="Password"
              autoComplete="current-password"
              {...register("password", {
                required: "Password is required",
              })}
            />
          </div>

          <button className="btn-primary w-full rounded-md" type="submit">
            Sign in
          </button>
        </form>
      </div>
    </section>
  );
}

export default Login;
