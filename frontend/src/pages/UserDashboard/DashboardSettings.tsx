import { useForm } from "react-hook-form";
import Input from "../../components/Input";


function DashboardSettings() {

    const { register, handleSubmit } = useForm()

  return (
    <div className="animate-fade-in">
      <h2
        className="text-2xl font-bold text-[#222] mb-8"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Account Settings
      </h2>
      <div className="bg-white border border-[#e8e4d8] p-8 max-w-lg">
        <h3
          className="font-semibold text-[#222] mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Personal Information
        </h3>
        <form className="space-y-5">
          <div>
            <Input 
                label="Full Name"
                className="input-luxury"
                {...register("fullName", {
                    required: "Full Name is required"
                })}
            />
          </div>
          <div>
            <Input 
                label="Email"
                className="input-luxury"
                {...register("email", {
                    required: "Email is required"
                })}
            />
          </div>
          <div>
            <Input 
                label="Phone"
                className="input-luxury"
                {...register("phone")}
            />
          </div>
          <button className="btn-primary w-full">Save Changes</button>
        </form>
      </div>
    </div>
  );
}

export default DashboardSettings;
