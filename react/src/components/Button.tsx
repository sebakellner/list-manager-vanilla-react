import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "outline" | "primary" | "icon";
  busy?: boolean;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "outline",
    type = "button",
    className = "",
    busy = false,
    disabled,
    children,
    ...props
  },
  ref,
) {
  const variantClass = variant === "outline" ? "" : ` btn--${variant}`;

  return (
    <button
      ref={ref}
      type={type}
      className={`btn${variantClass}${className ? ` ${className}` : ""}`}
      {...props}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
    >
      {busy ? (
        <>
          <span className="btn__spinner" aria-hidden="true" />
          <span className="btn__content--busy">{children}</span>
        </>
      ) : children}
    </button>
  );
});

export default Button;
