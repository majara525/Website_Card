/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{svelte,ts}"],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'Arial', 'sans-serif']
      },
      colors: {
        college: {
          red: "#b92b31",
          dark: "#821b20",
          gold: "#fbc23a",
          paper: "#f6f2ef"
        }
      }
    }
  },
  plugins: []
};
