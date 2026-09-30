/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    screens: {
      xs: '420px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    extend: {
      colors: {
        motorsport: {
          bg: '#090A0D',
          card: '#13151A',
          border: '#262933',
          red: '#EF4444',
          'red-dark': '#B91C1C',
          silver: '#94A3B8'
        }
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        racing: ['"Montserrat"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      }
    },
  },
  plugins: [],
};
