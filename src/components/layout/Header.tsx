"use client";

import { useState } from "react";
import Image from "next/image";
import { DatePicker } from "./DatePicker";
import { SignInButton } from "@/components/auth/SignInButton";
import { UserMenu } from "@/components/auth/UserMenu";
import { Modal } from "@/components/ui/Modal";
import { useAuthStore } from "@/stores/authStore";
import styles from "./Header.module.css";

function AboutModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.modalBody}>
        <div className={styles.modalTitleRow}>
          <h2 className={styles.modalTitle}>
            Selah<span className={styles.modalTitleDot}>.</span>
          </h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className={styles.modalDescription}>
          Selah is an anonymous voice journal where your recordings are pinned
          to locations on a 3D globe. Share how you feel, listen to others
          around the world, and leave a trace without revealing who you are.
        </p>

        <div className={styles.featureList}>
          <div className={styles.featureRow}>
            <div className={`${styles.featureIcon} ${styles.featureIconGrateful}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00CED1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              </svg>
            </div>
            <div>
              <h3 className={styles.featureTitle}>Record</h3>
              <p className={styles.featureDesc}>
                Capture a voice note and tag it with an emotion. One recording
                per day.
              </p>
            </div>
          </div>

          <div className={styles.featureRow}>
            <div className={`${styles.featureIcon} ${styles.featureIconHopeful}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#98FB98" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div>
              <h3 className={styles.featureTitle}>Pin</h3>
              <p className={styles.featureDesc}>
                Your recording is placed on the globe at your chosen location
                for the world to discover.
              </p>
            </div>
          </div>

          <div className={styles.featureRow}>
            <div className={`${styles.featureIcon} ${styles.featureIconNostalgic}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DEB887" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <div>
              <h3 className={styles.featureTitle}>Listen</h3>
              <p className={styles.featureDesc}>
                Explore anonymous stories from around the world. Leave comments
                and connect through sound.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <p className={styles.footerTagline}>
            Pause. Breathe. Speak.
          </p>
          <a
            href="https://github.com/nnnnflrs/Selah"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.githubLink}
            aria-label="GitHub"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>
    </Modal>
  );
}

export function Header() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logoGroup}>
            <h1>
              <Image src="/selah-logo-white.png" alt="Selah" width={180} height={24} className={styles.logoImage} priority />
            </h1>
            <button
              onClick={() => setShowAbout(true)}
              className={styles.infoButton}
              aria-label="About Selah"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </button>
          </div>
          <div className={styles.rightGroup}>
            {!isLoading && (
              isAuthenticated ? <UserMenu /> : <SignInButton />
            )}
            <DatePicker />
          </div>
        </div>
      </header>

      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );
}
