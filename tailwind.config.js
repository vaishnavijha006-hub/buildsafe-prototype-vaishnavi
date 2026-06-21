/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Dark theme surfaces
        dark: "#0a0a0a",
        surface: "#141414",
        surface2: "#1a1a1a",
        surface3: "#222222",
        border: "#2a2a2a",
        // Primary emerald accent
        primary: "#10b981",
        primaryDark: "#059669",
        primaryLight: "#34d399",
        primaryMuted: "rgba(16,185,129,0.12)",
        // Text
        textPrimary: "#ffffff",
        textSecondary: "#a1a1aa",
        textMuted: "#71717a",
        // Status colors
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        dangerMuted: "rgba(239,68,68,0.12)",
        warningMuted: "rgba(245,158,11,0.12)",
        // Legacy aliases (kept for gradual migration)
        bitumen: "#0a0a0a",
        bitumen2: "#141414",
        cement: "#e4e4e7",
        cement2: "#f4f4f5",
        safety: "#10b981",
        safetyDark: "#059669",
        tarp: "#10b981",
        tarpLight: "#34d399",
        rust: "#ef4444",
        steel: "#71717a",
      },
      fontFamily: {
        display: ["Archivo Black", "Archivo", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "glow-green": "0 0 20px rgba(16,185,129,0.15)",
        "glow-green-sm": "0 0 8px rgba(16,185,129,0.2)",
      },
    },
  },
  plugins: [],
};
