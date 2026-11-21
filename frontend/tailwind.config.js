/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        panel: "0 1px 3px rgb(18 24 40 / 5%), 0 8px 24px rgb(18 24 40 / 4%)",
      },
    },
  },
  plugins: [],
};
