import { useState } from "react";
import { register as userRegister, type RegisterData } from "../api/auth";
import { useForm } from "react-hook-form";
import Input from "./Input";

function Signup() {
  const [error, setError] = useState("");

  const { register, handleSubmit } = useForm<RegisterData>();

  const signup = async (data: RegisterData) => {
    setError("");
    try {
      const response = await userRegister(data);
      if (!response.data) {
        throw new Error(
            `Could not register: ${response.statusText}`
        );
      }
    }
      catch (error) {
    if (error instanceof Error) {
        setError(error.message);
    } else {
        setError("Unknown error");
    }
}
  };
  return (
    <div>
      <h2>Create New Account</h2>

        {error && (
          <p className="text-red-600 text-sm text-center mb-4">
            {error}
          </p>
        )}

      <form onSubmit={handleSubmit(signup)}>
        <Input
          label="Fullname"
          type="text"
          placeholder="e.g., John Doe"
          {...register("fullName", {
            required: "Name is required",
          })}
        />
        <Input
          type="email"
          label="Enter your email"
          {...register("email", {
            required: "Email is required",
            validate: value =>
                /\S+@\S+\.\S+/.test(value) ||
                "Invalid email address"
            })}
        />

        <Input label="Enter your phone number"
            type="tel"
            {...register("phone")}
        />

        <Input 
            type="password"
            label="Enter password"
            {...register("password", {
                required: "Password is required"
            })}
        />

        <button type="submit">Create Account</button>
      </form>
    </div>
  );
}

export default Signup;
