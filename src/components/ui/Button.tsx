"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-selah-700 hover:bg-selah-600 text-white border border-selah-600",
  secondary:
    "bg-transparent hover:bg-selah-800 text-selah-300 border border-selah-600",
  danger:
    "bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-800/50",
  ghost:
    "bg-transparent hover:bg-selah-800 text-selah-300 border border-transparent",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", isLoading, className = "", children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg
          text-sm font-medium transition-colors duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
          ${VARIANTS[variant]}
          ${className}
        `}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
