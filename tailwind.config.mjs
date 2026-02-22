/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'hb-orange': {
          main: '#FB4C02',
          1: '#E95A29',
          2: '#FB4C02',
          3: '#FFB59E',
          4: '#FFDBCC',
        },
        'hb-black': {
          0: '#0D0D0F',
          1: '#1D1D1F',
          2: '#222426',
          3: '#2D2F36',
          4: '#3A3C44',
        },
        'hb-gray': {
          1: '#494848',
          2: '#636363',
          3: '#6B6B6B',
          4: '#B4B4B4',
          5: '#D4D4D4',
          6: '#E4E4E4',
          7: '#F5F5F5',
          8: '#F7F7F7',
          9: '#F2F2F3',
        },
        'hb-red': {
          1: '#ED525A',
          2: '#FF7979',
        },
        'hb-link': '#25549D',
        'hb-beige': '#FFF8F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'title-4xl': ['72px', { lineHeight: '1', fontWeight: '700' }],
        'title-3xl': ['60px', { lineHeight: '1', fontWeight: '700' }],
        'title-2xl': ['48px', { lineHeight: '1', fontWeight: '700' }],
        'title-xl': ['36px', { lineHeight: '1.2', fontWeight: '700' }],
        'title-lg': ['30px', { lineHeight: '1.2', fontWeight: '700' }],
        'title-md': ['16px', { lineHeight: '1.2', fontWeight: '700' }],
      },
      borderRadius: {
        'hb': '16px',
        'hb-sm': '12px',
        'hb-xs': '8px',
      },
      boxShadow: {
        'hb-card': '0 4px 24px rgba(0,0,0,0.06)',
        'hb-hover': '0 20px 40px rgba(0,0,0,0.12)',
        'hb-sm': '0 8px 24px rgba(0,0,0,0.08)',
        'hb-glow': '0 0 60px rgba(251, 76, 2, 0.15)',
        'hb-glow-lg': '0 0 100px rgba(251, 76, 2, 0.2)',
        'hb-glow-sm': '0 0 30px rgba(251, 76, 2, 0.12)',
        'hb-glass': '0 8px 32px rgba(0,0,0,0.3)',
        'hb-dark-card': '0 4px 24px rgba(0,0,0,0.4)',
        'hb-dark-hover': '0 20px 40px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-dark-hero': 'linear-gradient(180deg, #0D0D0F 0%, #1D1D1F 60%, #222426 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'gradient-orange-glow': 'radial-gradient(ellipse at center, rgba(251,76,2,0.15) 0%, transparent 70%)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(251, 76, 2, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(251, 76, 2, 0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(251, 76, 2, 0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(251, 76, 2, 0.25)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
