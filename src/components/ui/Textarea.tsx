"use client";

import { TextareaHTMLAttributes, forwardRef } from "react";
import styles from "./Textarea.module.css";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className={styles.wrapper}>
        {label && (
          <label className={styles.label}>{label}</label>
        )}
        <textarea
          ref={ref}
          className={`${styles.textarea} ${error ? styles.textareaError : ""} ${className}`}
          {...props}
        />
        {error && <p className={styles.error}>{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
