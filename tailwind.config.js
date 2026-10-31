/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        khmer: ['"Noto Sans Khmer"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        emmi: {
          wine: "#7b1e3a",
          berry: "#a62b4e",
          blush: "#fbe9ee",
          ink: "#230c14",
          gold: "#d4af37",
          darkWine: "#3e1321",
        },
      },
    },
  },
  plugins: [],
};
