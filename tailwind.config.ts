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
        night: {
          DEFAULT: "#09090B",
          black: "#09090B",
          card: "#18181B",
          elevated: "#202024",
          border: "#27272A",
          muted: "#71717A",
          subtle: "#A1A1AA",
        },
        amber: {
          electric: "#F59E0B",
          glow: "#D97706",
        },
        emerald: {
          stock: "#10B981",
          glow: "#059669",
        },
        crimson: {
          danger: "#EF4444",
          dim: "#7F1D1D",
        },
      },
      fontFamily: {
        sans: ["Inter", "Geist", "system-ui", "-apple-system", "sans-serif"],
      },
      animation: {
        "pulse-fast": "pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.25s ease-out forwards",
        "slide-up": "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
