import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        // Brand — Ruby Estate
        brand: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
        },
        accent: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        // Semantic tokens — read from CSS vars so dark mode swaps automatically
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          soft: "rgb(var(--ink-soft) / <alpha-value>)",
          muted: "rgb(var(--ink-muted) / <alpha-value>)",
          subtle: "rgb(var(--ink-subtle) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          soft: "rgb(var(--surface-soft) / <alpha-value>)",
          sunken: "rgb(var(--surface-sunken) / <alpha-value>)",
          raised: "rgb(var(--surface-raised) / <alpha-value>)",
        },
        line: "rgb(var(--line) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
      },
      fontSize: {
        "display-xl": ["clamp(2.75rem, 6vw, 4.75rem)", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2.25rem, 4.5vw, 3.5rem)", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
        "display-md": ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(12,10,9,0.04), 0 4px 12px rgba(12,10,9,0.04)",
        card: "0 1px 3px rgba(12,10,9,0.06), 0 8px 24px -8px rgba(12,10,9,0.08)",
        lift: "0 2px 8px rgba(12,10,9,0.08), 0 24px 40px -16px rgba(185,28,28,0.22)",
        glow: "0 0 0 1px rgba(220,38,38,0.28), 0 20px 48px -12px rgba(220,38,38,0.38)",
        neumorph:
          "6px 6px 16px rgba(12,10,9,0.08), -6px -6px 16px rgba(255,255,255,0.9)",
        "neumorph-inset":
          "inset 3px 3px 8px rgba(12,10,9,0.08), inset -3px -3px 8px rgba(255,255,255,0.9)",
        "neumorph-dark":
          "6px 6px 16px rgba(0,0,0,0.45), -6px -6px 16px rgba(255,255,255,0.03)",
        "neumorph-dark-inset":
          "inset 3px 3px 8px rgba(0,0,0,0.45), inset -3px -3px 8px rgba(255,255,255,0.03)",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #7f1d1d 0%, #dc2626 45%, #f97316 100%)",
        "gradient-warm": "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
        "gradient-mesh":
          "radial-gradient(at 20% 0%, #fee2e2 0px, transparent 50%), radial-gradient(at 80% 0%, #fef3c7 0px, transparent 50%), radial-gradient(at 50% 100%, #ffe4e6 0px, transparent 50%)",
        "gradient-mesh-dark":
          "radial-gradient(at 20% 0%, rgba(127,29,29,0.25) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(146,64,14,0.25) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(127,29,29,0.25) 0px, transparent 50%)",
        grid: "linear-gradient(to right, #e7e5e4 1px, transparent 1px), linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "shimmer-skeleton": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "aurora-blob": {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(30px,-20px) scale(1.15)" },
          "66%": { transform: "translate(-20px,20px) scale(0.95)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        shimmer: "shimmer 2.5s linear infinite",
        "shimmer-skeleton": "shimmer-skeleton 1.8s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2s ease-out infinite",
        marquee: "marquee 40s linear infinite",
        "gradient-x": "gradient-x 8s ease infinite",
        "aurora-blob": "aurora-blob 18s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
