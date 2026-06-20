/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bitumen: "#1C1B17",
        bitumen2: "#262420",
        cement: "#F5F1E8",
        cement2: "#EAE3D3",
        safety: "#E8A33D",
        safetyDark: "#C9842A",
        tarp: "#3D5C45",
        tarpLight: "#4F7359",
        rust: "#A8472E",
        steel: "#5B6770",
      },
      fontFamily: {
        display: ["Archivo Black", "Archivo", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
}
