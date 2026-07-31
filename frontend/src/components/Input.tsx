import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, type = "text", className = "", ...props }, ref) => {
    const id = useId();

    return (
      <>
        {label && <label htmlFor={id}>{label}</label>}

        <input
          id={id}
          ref={ref}
          type={type}
          className={className}
          {...props}
        />
      </>
    );
  }
);

export default Input;

