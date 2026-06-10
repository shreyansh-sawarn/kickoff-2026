/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#0b0f19",
          card: "#131b2e",
          primary: "#10b981", // vibrant emerald green
          secondary: "#fbbf24", // gold
          accent: "#3b82f6", // blue
          border: "#1e293b",
          textMuted: "#94a3b8",
        }
      }
    },
  },
  plugins: [],
};
