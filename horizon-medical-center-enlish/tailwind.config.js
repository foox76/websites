/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      colors: {
        'brand-teal': {
          DEFAULT: '#008080',
          light: '#00A0A0',
          dark: '#004d4d',
        },
        'brand-gold': {
          DEFAULT: '#c59d5f',
          light: '#e0c088',
          dark: '#b38d54',
        },
        'brand-dark': '#1a1a1a',
        'brand-gray': '#f4f4f4',
        'brand-whatsapp': {
          DEFAULT: '#25D366',
          dark: '#128C7E',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gold-gradient': 'linear-gradient(135deg, #c59d5f 0%, #e0c088 50%, #b38d54 100%)',
        'teal-gradient': 'linear-gradient(135deg, #008080 0%, #00A0A0 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glow-gold': '0 0 20px rgba(197, 157, 95, 0.3)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-right': {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'shimmer-gold': {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'menu-slide-down': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'tick-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'menu-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'menu-link-slide': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'fade-in-right': 'fade-in-right 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'scale-in': 'scale-in 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'shimmer-gold': 'shimmer-gold 3s linear infinite',
        'pulse-soft': 'pulse-soft 3s infinite',
        'menu-slide-down': 'menu-slide-down 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'tick-up': 'tick-up 0.5s ease-out forwards',
        'menu-fade-in': 'menu-fade-in 0.3s ease-out forwards',
        'menu-link-slide': 'menu-link-slide 0.5s ease-out forwards',
      }
    },
  },
  plugins: [],
}