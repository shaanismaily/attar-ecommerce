import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../../components/Input";
import useUser from "../../hooks/useUser";
import { Toast } from "../../components/Toast";
import type { AccountData } from "../../api/auth";


function DashboardSettings() {

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
    const { user, updateUserDetails } = useUser();
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        if (user) {
            reset({
                fullName: user.fullName || "",
                email: user.email || "",
                phone: user.phone || ""
            });
        }
    }, [user, reset]);

    const handleFormSubmit = async (data: any) => {
        try {
            await updateUserDetails(data as AccountData);
            setToast({ message: "Changes updated successfully!", type: "success" });
        } catch (error) {
            setToast({ message: "Failed to update changes", type: "error" });
        }
    };
    
  return (
    <div className="animate-fade-in">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type}
          onClose={() => setToast(null)}
        />
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
