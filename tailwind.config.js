/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F0F5F2',
          100: '#DCE6E0',
          200: '#B9CCC1',
          300: '#91AEA0',
          400: '#688F7E',
          500: '#4D7C5F', // Sage green base
          600: '#3A634B',
          700: '#2A4A38',
          800: '#1E3A2B', // Deep forest green
          900: '#14271D',
          950: '#0B1711',
        },
        sage: {
          50: '#F4F7F4',
          100: '#E5EDE5',
          200: '#CDDC CD',
          300: '#AEC4AF',
          400: '#8AA78C',
          500: '#688B6A',
          600: '#527054',
          700: '#415743',
          800: '#344535',
          900: '#2C3A2D',
        },
        sand: {
          50: '#FAF8F5',
          100: '#F3EFE9',
          200: '#E7DFD4',
          300: '#D8CAB8',
          400: '#C7B299',
          500: '#B39A7D',
        },
        warmWhite: '#FBFBF7',
        warmGray: '#F5F4EE',
        charcoal: {
          DEFAULT: '#212529',
          muted: '#495057',
          light: '#6C757D',
        },
        accentLime: '#9EBA5A',
        ecoAlert: {
          success: '#2D6A4F',
          warning: '#D97706',
          error: '#DC2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(30, 58, 43, 0.05)',
        'medium': '0 4px 20px rgba(30, 58, 43, 0.08)',
        'elevated': '0 10px 30px rgba(30, 58, 43, 0.12)',
      }
    },
  },
  plugins: [],
}
