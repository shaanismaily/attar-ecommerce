import { forwardRef, useId, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, type = "text", className = "", ...props }, ref) => {
    const id = useId();
    const [showPassword, setShowPassword] = useState(false);

    if (type === "checkbox" || type === "radio") {
      return (
        <label
          htmlFor={id}
          className="
                inline-flex
                items-center
                gap-3
                cursor-pointer
                select-none
                group
            "
        >
          <input
            id={id}
            ref={ref}
            type={type}
            className={`
                    peer
                    sr-only
                    ${className}
                `}
            {...props}
          />

          <span
            className={`
              relative
              flex
              h-4
              w-4
              shrink-0
              items-center
              justify-center
              border
              border-[#cfc9ba]
              bg-white
              transition-all
              duration-200

              ${type === "checkbox" ? "rounded-[3px]" : "rounded-full"}

              peer-checked:border-[#0F5132]
              peer-checked:bg-[#0F5132]

              peer-focus-visible:ring-2
              peer-focus-visible:ring-[#C9A227]/30

              group-hover:border-[#C9A227]

              peer-checked:after:block
              peer-checked:after:h-2
              peer-checked:after:w-1
              peer-checked:after:rotate-45
              peer-checked:after:border-b-2
              peer-checked:after:border-r-2
              peer-checked:after:border-white
            `}
          />

          {label && (
            <span
              className="
                        text-[0.7rem]
                        sm:text-xs
                        font-medium
                        tracking-[0.12em]
                        uppercase
                        text-[#555]
                        transition-colors
                        duration-200
                        group-hover:text-[#0F5132]
                        peer-checked:text-[#222]
                    "
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {label}
            </span>
          )}
        </label>
      );
    }

    return (
      <div>
        {label && (
          <label
            htmlFor={id}
            className="block text-[0.68rem] tracking-[0.15em] uppercase text-[#888] mb-2"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {label}
          </label>
        )}

        <div className="relative">
          <input
            id={id}
            ref={ref}
            type={type === "password" && showPassword ? "text" : type}
            className={`w-full min-w-0 ${type === "password" ? "pr-10" : ""} ${className}`}
            {...props}
          />

          {type === "password" && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-(--color-stone) transition-colors hover:text-(--color-emerald) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-gold)/50"
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
