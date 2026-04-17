import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Space Grotesk'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "Consolas", "monospace"],
      },
      colors: {
        jury: {
          green: "#00ffa3",
          "green-hover": "#00cc82",
          bg: "#050505",
          surface: "#111111",
          "surface-alt": "#1a1a1a",
          border: "#222222",
          text: "#e0e0e0",
          muted: "#777777",
        },
      },
      keyframes: {
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-green": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(0, 255, 163, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(0, 255, 163, 0)" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.4s ease-out both",
        "pulse-green": "pulse-green 2s infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
