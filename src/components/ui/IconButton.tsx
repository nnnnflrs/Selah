"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-label={label}
        className={`
          inline-flex items-center justify-center w-10 h-10 rounded-full
          bg-selah-800/80 hover:bg-selah-700 border border-selah-600
          text-selah-300 hover:text-white transition-colors duration-150
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
