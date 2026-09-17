import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../../components/Input";
import useUser from "../../hooks/useUser";
import type { AccountData } from "../../api/auth";

type ProfileFormData = {
  fullName: string;
  email: string;
  phone: string;
};

function DashboardSettings() {

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileFormData>();
    const { user, updateUserDetails } = useUser();
    const [alert, setAlert] = useState<{ title: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        if (user) {
            reset({
                fullName: user.fullName || "",
                email: user.email || "",
                phone: user.phone || ""
            });
        }
    }, [user, reset]);

    const handleFormSubmit = async (data: ProfileFormData) => {
        try {
        await updateUserDetails(data as AccountData);
            setAlert({ title: "Profile updated successfully", type: "success" });
      } catch {
            setAlert({ title: "Profile could not be updated", type: "error" });
        }
    };
    
  return (
    <div className="animate-fade-in">
      {alert && (
        <div
          className={`mb-6 flex items-center gap-3 rounded-md border px-4 py-3 text-sm ${
            alert.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
          role="alert"
        >
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
              alert.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
            aria-hidden="true"
          >
            {alert.type === "success" ? "✓" : "!"}
          </span>
          <p className="flex-1 font-medium">{alert.title}</p>
          <button
            type="button"
            onClick={() => setAlert(null)}
            className="rounded p-1 text-current/70 transition-colors hover:bg-black/5 hover:text-current focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
            aria-label="Close alert"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      )}
      <h2
        className="text-2xl font-bold text-[#222] mb-8"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Account Settings
      </h2>

      {/* Personal Information Section */}
      <div className="bg-white border border-[#e8e4d8] p-8 max-w-lg mb-8">
        <h3
          className="font-semibold text-[#222] mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Personal Information
        </h3>
        <form 
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-5">
          <div>
            <Input 
                label="Full Name"
                className="input-luxury"
                {...register("fullName", {
                    required: "Full Name is required"
                })}
            />
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{typeof errors.fullName.message === 'string' ? errors.fullName.message : 'Invalid input'}</p>}
          </div>
          <div>
            <Input 
                label="Email"
                type="email"
                className="input-luxury"
                {...register("email", {
                    required: "Email is required",
                    pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                    }
                })}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{typeof errors.email.message === 'string' ? errors.email.message : 'Invalid input'}</p>}
          </div>
          <div>
            <Input 
                label="Phone"
                type="tel"
                className="input-luxury"
                {...register("phone")}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{typeof errors.phone.message === 'string' ? errors.phone.message : 'Invalid input'}</p>}
          </div>
          <button 
            disabled={isSubmitting}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default DashboardSettings;
