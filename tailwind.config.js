/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#93cd3f',
          dark: '#7ab32f',
          light: '#a8d95f',
        },
        secondary: {
          DEFAULT: '#79378b',
          dark: '#612d70',
          light: '#8f42a5',
        },
        gray: {
          750: '#2d3748',
        },
      },
    },
  },
  plugins: [],
};
