/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { cairo: ['Cairo', 'sans-serif'] },
      colors: {
        brand: {
          50: '#f5f2ff', 100: '#ece7ff', 200: '#dcd2ff', 300: '#c5adff',
          400: '#aa80ff', 500: '#8b52ff', 600: '#6d3df5', 700: '#572bd8',
          800: '#4926af', 900: '#3d238b', 950: '#251354'
        },
      },
      boxShadow: {
        soft: '0 8px 30px rgba(31, 24, 67, 0.08)',
        lift: '0 16px 44px rgba(31, 24, 67, 0.14)',
        glow: '0 12px 35px rgba(109, 61, 245, 0.28)',
      },
      borderRadius: { '4xl': '2rem' },
    },
  },
  plugins: [],
};
