import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, type = "text", className = "", ...props }, ref) => {
    const id = useId();

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

        <input
          id={id}
          ref={ref}
          type={type}
          className={`w-full min-w-0 ${className}`}
          {...props}
        />
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
