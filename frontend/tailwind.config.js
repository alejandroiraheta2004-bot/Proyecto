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
        accent: '#1d4ed8',
        highlight: '#3b82f6',
        bg: '#f6fbfc',
        // Muted más oscuro para mayor legibilidad
        muted: '#1f2937',
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
