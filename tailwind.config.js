/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#131e3a',
        accent: '#038cb2',
        highlight: '#f39c12',
        bg: '#f6fbfc',
        muted: '#9aa5ad',
        success: '#e6fbf0',
        error: '#fff0f0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
