/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        // MediCare accent — calm clinical teal
        brand: {
          50: '#effcf9',
          100: '#c9f7ec',
          200: '#96ecdb',
          300: '#5dd9c4',
          400: '#2bbfa8',
          500: '#14a38c', // primary
          600: '#0d8273',
          700: '#0f685d',
          800: '#11534c',
          900: '#12443f',
        },
        ink: {
          50: '#f6f8f8',
          100: '#e9eeee',
          500: '#5b6b6b',
          700: '#2f3a3a',
          900: '#162020',
        },
      },
      fontFamily: {
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,40,40,0.04), 0 8px 24px rgba(16,40,40,0.06)',
        lift: '0 12px 32px rgba(16,40,40,0.12)',
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.25rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseline: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        pulseline: 'pulseline 3s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
};
