/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        campus: {
          950: '#0c1222',
          900: '#111827',
          800: '#1e293b',
          accent: '#38bdf8',
          mint: '#34d399',
        },
      },
      boxShadow: {
        seat: '0 2px 8px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
};
