"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm text-selah-300">{label}</label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-3 py-2 rounded-lg text-sm
            bg-selah-800 border border-selah-600
            text-white placeholder-selah-500
            focus:outline-none focus:border-selah-400 focus:ring-1 focus:ring-selah-400
            transition-colors duration-150
            ${error ? "border-red-500" : ""}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
