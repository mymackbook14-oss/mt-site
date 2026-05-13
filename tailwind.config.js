/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandDark: '#0f172a',
        brandTeal: '#2dd4bf',
      }
    },
  },
  plugins: [],
}