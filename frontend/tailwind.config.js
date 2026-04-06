/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        display: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
      colors: {
        uni: {
          navy: '#15233f',
          blue: '#1e4d8c',
          gold: '#c5a059',
          cream: '#f8f6f1',
        },
        campus: {
          950: '#0c1222',
          900: '#111827',
          800: '#1e293b',
          accent: '#1e4d8c',
          mint: '#34d399',
        },
      },
      boxShadow: {
        seat: '0 2px 8px rgba(0,0,0,0.25)',
        portal: '0 1px 3px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
