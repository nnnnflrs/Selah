"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";
import styles from "./UserMenu.module.css";

export function UserMenu() {
  const { user, signOut } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const initial = user?.email?.charAt(0).toUpperCase() || "?";

  return (
    <div ref={menuRef} className={styles.wrapper}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.avatarButton}
        aria-label="User menu"
      >
        {initial}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.emailSection}>
            <p className={styles.emailText}>{user?.email}</p>
          </div>
          <Link
            href="/journal"
            onClick={() => setIsOpen(false)}
            className={styles.menuItem}
          >
            <span className={styles.menuItemContent}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              My Journal
            </span>
          </Link>
          <button
            onClick={() => {
              setIsOpen(false);
              signOut();
            }}
            className={styles.signOutItem}
          >
            <span className={styles.menuItemContent}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign out
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
