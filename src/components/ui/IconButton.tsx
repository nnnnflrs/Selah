"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import styles from "./IconButton.module.css";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-label={label}
        className={`${styles.iconButton} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
