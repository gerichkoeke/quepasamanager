/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#4D2DB7',
        'cw-bg-light': '#f4f6f8',
        'cw-bg-dark': '#1A1D24',
        'cw-surface-light': '#ffffff',
        'cw-surface-dark': '#242830',
        'cw-border-light': '#e5e7eb',
        'cw-border-dark': '#2F333D',
      },
    },
  },
  plugins: [],
};
