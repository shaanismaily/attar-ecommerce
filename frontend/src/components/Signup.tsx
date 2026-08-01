import { useState } from "react";
import { register as userRegister, type RegisterData } from "../api/auth";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import Input from "./Input";

function Signup() {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>();

  const signup = async (data: RegisterData) => {
    setError("");
    try {
      const response = await userRegister(data);
      if (!response.data) {
        throw new Error(`Could not register: ${response.statusText}`);
      }
      navigate("/");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unknown error");
      }
    }
  };
  return (
    <section className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md rounded-2xl bg-(--color-ivory) p-6 shadow-2xl sm:p-8">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-semibold text-(--color-emerald)">Create New Account</h1>
          <p className="mt-2 text-sm text-(--color-stone)">
            Sign up to begin your fragrance journey.
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-center text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <p className="text-(--color-emerald) text-center text-sm mb-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-500 hover:underline font-medium"
          >
            Login
          </Link>
        </p>

        <form className="space-y-5" onSubmit={handleSubmit(signup)}>
          <div className="space-y-4">
          <Input
            type="text"
            placeholder="Full Name"
            className="input-luxury rounded-md"
            autoComplete="name"
            {...register("fullName", {
              required: "Name is required",
            })}
          />
          {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}
          <Input
            type="email"
            placeholder="Email address"
            className="input-luxury rounded-md"
            autoComplete="email"
            {...register("email", {
              required: "Email is required",
              validate: (value) =>
                /\S+@\S+\.\S+/.test(value) || "Invalid email address",
            })}
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}

          <Input
            placeholder="Phone number (optional)"
            className="input-luxury rounded-md"
            type="tel"
            autoComplete="tel"
            {...register("phone")}
          />

          <Input
            type="password"
            placeholder="Password"
            className="input-luxury rounded-md"
            autoComplete="new-password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />
          {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}

          </div>
          <button className="btn-primary w-full rounded-md" 
          type="submit">Create Account</button>
        </form>
      </div>
    </section>
  );
}

export default Signup;
