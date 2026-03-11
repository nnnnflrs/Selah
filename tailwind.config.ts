import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        selah: {
          950: "#050510",
          900: "#0a0a1a",
          800: "#10102a",
          700: "#1a1a3a",
          600: "#2a2a4a",
          500: "#3a3a5a",
          400: "#5a5a7a",
          300: "#8a8aaa",
        },
        glow: {
          happy: "#FFD700",
          sad: "#4169E1",
          anxious: "#9932CC",
          grateful: "#00CED1",
          frustrated: "#DC143C",
          sleepless: "#6A5ACD",
          hopeful: "#98FB98",
          nostalgic: "#DEB887",
        },
      },
      boxShadow: {
        glow: "0 0 15px 5px var(--glow-color, #00f0ff)",
        "glow-sm": "0 0 8px 2px var(--glow-color, #00f0ff)",
        "glow-lg": "0 0 25px 10px var(--glow-color, #00f0ff)",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.15)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
