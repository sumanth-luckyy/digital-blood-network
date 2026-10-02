/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blood: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#C62828', // Primary deep medical red
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        navy: {
          50: '#f0f4f9',
          100: '#e1e9f2',
          200: '#c3d3e5',
          300: '#95b3d3',
          400: '#618ebe',
          500: '#3d70a5',
          600: '#2d5786',
          700: '#25466d',
          800: '#213b5b',
          900: '#17233C', // Secondary dark navy
          950: '#0e1524',
        },
        canvas: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
