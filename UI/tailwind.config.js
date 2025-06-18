/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {      colors: {
        'charcoal': '#111827',
        'pastel-lavender': '#d6ccf2',
        'sky-blue': '#c3e0f0',
        'off-white': '#800020', // Màu đỏ booc đô chủ đạo
        'soft-beige': '#A0001C', // Màu đỏ booc đô đậm
        'reddish-brown': '#800020', // Màu đỏ booc đô
        'light-reddish-brown': '#B22B47', // Màu đỏ booc đô nhạt
        'burgundy': '#800020', // Burgundy chính
        'light-burgundy': '#B22B47', // Burgundy nhạt
        'dark-burgundy': '#5D001A', // Burgundy đậm
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'body': ['Inter', 'Lato', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-dot': 'pulseDot 1.4s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
