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
        uber: {
          black: "#000000",
          surface: "#0F0F10",
          card: "#161618",
          cardHover: "#1E1E22",
          border: "#242428",
          subtle: "#8E8E93",
          muted: "#636366",
        },
        peach: {
          DEFAULT: "#FF8F6B",
          50: "#FFF4EF",
          100: "#FFE6DC",
          200: "#FFC8B3",
          300: "#FFAA8A",
          400: "#FF8F6B",
          500: "#F97346",
          600: "#DE5424",
          700: "#B83A11",
          glow: "rgba(255, 143, 107, 0.15)",
          border: "rgba(255, 143, 107, 0.35)",
        },
        stock: {
          green: "#10B981",
          red: "#EF4444",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "Inter",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
