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
          className="flex items-center gap-2 cursor-pointer"
        >
          <input
            id={id}
            ref={ref}
            type={type}
            className={className}
            {...props}
          />

          {label && (
            <span className="text-sm">
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
          className={className}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

