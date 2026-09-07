/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Warm paper / parchment tones
        paper: {
          50: '#fbf9f4',
          100: '#f6f2e8',
          200: '#ece5d3',
          300: '#ddd2b8',
          400: '#c8b88f',
          500: '#b3a06b',
        },
        // Deep forest green — primary
        forest: {
          50: '#f0f6f1',
          100: '#dcebe0',
          200: '#bcd6c4',
          300: '#8fb89c',
          400: '#5d9170',
          500: '#3f7353',
          600: '#2e5b3f',
          700: '#264933',
          800: '#1f3a29',
          900: '#163020',
        },
        // Terracotta — accent
        terra: {
          50: '#fdf5f1',
          100: '#f9e4d9',
          200: '#f0c7b3',
          300: '#e4a382',
          400: '#d47e56',
          500: '#bf6540',
          600: '#a55134',
          700: '#84402a',
          800: '#6a3322',
          900: '#522a1c',
        },
        // Ink — text
        ink: {
          50: '#f5f5f4',
          100: '#e7e5e4',
          200: '#d1d1cf',
          300: '#a8a8a4',
          400: '#787873',
          500: '#575752',
          600: '#444440',
          700: '#33332f',
          800: '#252522',
          900: '#1a1a18',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(26, 26, 24, 0.06), 0 1px 2px rgba(26, 26, 24, 0.04)',
        'card-hover': '0 4px 12px rgba(26, 26, 24, 0.08), 0 2px 4px rgba(26, 26, 24, 0.04)',
        modal: '0 12px 32px rgba(26, 26, 24, 0.12), 0 4px 8px rgba(26, 26, 24, 0.06)',
      },
    },
  },
  plugins: [],
};
