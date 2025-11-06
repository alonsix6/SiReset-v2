/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Reset Brand Colors
        'reset-black': '#000000',
        'reset-white': '#FFFFFF',
        'reset-neon': '#00FF85',
        'reset-cyan': '#00E5FF',
        'reset-violet': '#6F42C1',
        'reset-purple': '#9B59B6',
        'reset-magenta': '#FF0080',
        'reset-blue': '#0052CC',
        'reset-blue-light': '#00A3FF',
        'reset-gray-dark': '#1A1A1A',
        'reset-gray-medium': '#333333',
        'reset-gray': '#666666',
        'reset-gray-light': '#AAAAAA',
        'reset-gray-lighter': '#E5E5E5',
      },
      fontFamily: {
        'display': ['Bebas Neue', 'Anton', 'Archivo Black', 'sans-serif'],
        'body': ['Montserrat', 'Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': ['120px', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
        'display': ['72px', { lineHeight: '1.0', letterSpacing: '-0.02em' }],
        'display-md': ['64px', { lineHeight: '1.0', letterSpacing: '-0.02em' }],
        'display-sm': ['48px', { lineHeight: '1.05', letterSpacing: '-0.01em' }],
        'heading-xl': ['36px', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'heading-lg': ['28px', { lineHeight: '1.2', letterSpacing: '-0.005em' }],
        'heading': ['24px', { lineHeight: '1.3' }],
        'body-lg': ['18px', { lineHeight: '1.6' }],
        'body': ['16px', { lineHeight: '1.6' }],
        'body-sm': ['14px', { lineHeight: '1.5' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        'reset': '12px',
        'reset-sm': '8px',
        'reset-lg': '16px',
      },
      boxShadow: {
        'reset-sm': '0 4px 16px rgba(0, 255, 133, 0.1)',
        'reset': '0 8px 32px rgba(0, 255, 133, 0.15)',
        'reset-lg': '0 16px 48px rgba(0, 255, 133, 0.25)',
        'reset-neon': '0 0 20px rgba(0, 255, 133, 0.5)',
        'reset-cyan': '0 0 20px rgba(0, 229, 255, 0.5)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        pulseNeon: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #00FF85 0%, #00E5FF 100%)',
        'gradient-purple': 'linear-gradient(135deg, #6F42C1 0%, #9B59B6 100%)',
        'gradient-dark': 'linear-gradient(180deg, #000000 0%, #1A1A1A 100%)',
      },
    },
  },
  plugins: [],
}
