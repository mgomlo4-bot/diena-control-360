/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e40af',
          light: '#1d4ed8',
          dark: '#1e3a8a',
        },
        background: {
          DEFAULT: '#0f172a',
          surface: '#1e293b',
          card: '#334155',
          accent: '#3b82f6',
        },
      },
    },
  },
  plugins: [],
};