/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Màu chủ đạo trắng đỏ
        'primary': {
          50: '#fef2f2',   // Trắng hồng rất nhạt
          100: '#fee2e2',  // Trắng hồng nhạt
          200: '#fecaca',  // Hồng nhạt
          300: '#fca5a5',  // Hồng
          400: '#f87171',  // Đỏ nhạt
          500: '#ef4444',  // Đỏ
          600: '#dc2626',  // Đỏ đậm
          700: '#b91c1c',  // Đỏ rất đậm
          800: '#991b1b',  // Đỏ tối
          900: '#7f1d1d',  // Đỏ rất tối
        },
        // Màu burgundy/maroon cho accent
        'burgundy': {
          50: '#fdf2f2',
          100: '#fce7e7',
          200: '#f9d5d5',
          300: '#f4b5b5',
          400: '#ec8888',
          500: '#e15d5d',
          600: '#d13d3d',
          700: '#b91c1c',
          800: '#800020',  // Màu burgundy chính
          900: '#5d001a',  // Burgundy đậm
        },
        // Màu xám cho text và background
        'neutral': {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Giữ lại một số màu cũ để tương thích
        'charcoal': '#262626',
        'sage': {
          50: '#f0f9f0',
          100: '#dcf2dc',
          200: '#bae6ba',
          300: '#86d186',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
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
