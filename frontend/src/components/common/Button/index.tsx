import React from "react";

type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

function Button({
  children,
  variant = "primary",
  size = "medium",
  isLoading = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`button button-${variant} button-${size} ${className}`}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
}

export default Button;
