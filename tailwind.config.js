/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#F7F7F5',       // Off-white paper
          surface: '#FFFFFF',  // Clean white
          text: '#1A1A1A',     // Charcoal
          gold: '#D4AF37',     // Premium Gold
          'gold-light': '#F3E5AB',
          'gold-dark': '#B4941F',
        }
      },
      fontFamily: {
        serif: ['"EB Garamond"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
