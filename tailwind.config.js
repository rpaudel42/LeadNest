/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // ← enable dark mode by adding a 'dark' class to <html>
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef7ff',
          100: '#d6ebff',
          200: '#b5d8ff',
          300: '#86bdff',
          400: '#5298ff',
          500: '#2c78ff',   // primary
          600: '#1e5fed',
          700: '#174acc',
          800: '#153ea1',
          900: '#13377f',
        },
        accent: {
          50:  '#f5fff8',
          100: '#e7ffef',
          200: '#c9ffdc',
          300: '#9effbf',
          400: '#61fe99',
          500: '#34d179',   // secondary
          600: '#25a85f',
          700: '#1f854e',
          800: '#1d6a41',
          900: '#184f33',
        },
        surface: {
          DEFAULT: '#ffffff',
          soft: '#f7f7fb',
          ring: '#e5e7eb',
          dark: '#0b0c10',
          darkSoft: '#0f1117'
        }
      },
      boxShadow: {
        soft: '0 2px 12px rgba(15, 23, 42, 0.06)',
        lift: '0 10px 30px rgba(15, 23, 42, 0.10)'
      },
      borderRadius: {
        xl: '14px',
        '2xl': '20px'
      }
    }
  },
  plugins: [],
}
