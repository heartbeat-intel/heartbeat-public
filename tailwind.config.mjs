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
          1: '#1D1D1F',
          2: '#222426',
          3: '#2D2F36',
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
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(251, 76, 2, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(251, 76, 2, 0.5)' },
        },
      },
    },
  },
  plugins: [],
};
