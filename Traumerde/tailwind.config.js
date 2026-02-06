/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        earth: {
          50: '#faf6f1',
          100: '#f0e6d6',
          200: '#e0ccad',
          300: '#cdaa7d',
          400: '#be8e58',
          500: '#b07a42',
          600: '#9a6337',
          700: '#7d4d2f',
          800: '#68402c',
          900: '#583628',
          950: '#1a1210',
        },
        terra: {
          50: '#fdf4f0',
          100: '#fbe6dc',
          200: '#f7cab8',
          300: '#f0a688',
          400: '#e87c56',
          500: '#e05d33',
          600: '#d14528',
          700: '#ae3522',
          800: '#8c2e21',
          900: '#72291f',
        },
        forest: {
          50: '#f0f7f1',
          100: '#dcedde',
          200: '#bbdbc0',
          300: '#8ec298',
          400: '#5ea56c',
          500: '#3d8950',
          600: '#2c6e3e',
          700: '#245834',
          800: '#1f472b',
          900: '#1a3b24',
          950: '#0d1f12',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
