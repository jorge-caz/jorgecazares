/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff3333',
          light: '#ff6666',
          dark: '#cc0000',
        },
        dark: {
          DEFAULT: '#121212',
          light: '#1e1e1e',
          lighter: '#2d2d2d',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
