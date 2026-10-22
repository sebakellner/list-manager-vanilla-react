import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "outline" | "primary" | "icon";
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "outline", type = "button", className = "", ...props },
  ref,
) {
  const variantClass = variant === "outline" ? "" : ` btn--${variant}`;

  return (
    <button
      ref={ref}
      type={type}
      className={`btn${variantClass}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
});

export default Button;
