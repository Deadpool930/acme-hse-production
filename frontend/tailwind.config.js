/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#020617", // Deep Slate / Dark blue for premium feel
        card: "rgba(30, 41, 59, 0.7)", // Glassmorphism base
        accent: "#38bdf8", // Sky blue for primary actions
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
