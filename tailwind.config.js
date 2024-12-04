/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'modal-slide-in': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-out': {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(-100%)' },
        },
      },
      animation: {
        'modal-slide-in': 'modal-slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-out': 'slide-out 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
};