import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F6F0',
          100: '#CDEEDF',
          200: '#9DDCBE',
          500: '#0E9F7E',
          600: '#0B8468',
          700: '#076B53',
          800: '#054F3D',
        },
        secondary: {
          50: '#EEF2F7',
          500: '#1F3A5F',
          700: '#162844',
        },
        accent: {
          50: '#FEF6E3',
          500: '#F5A524',
        },
        neutral: {
          0: '#FFFFFF',
          50: '#FAFBFC',
          100: '#F4F5F7',
          200: '#E5E7EB',
          400: '#9AA0AA',
          700: '#3D434D',
          900: '#111418',
        },
        success: { 50: '#E8F7EE', 500: '#16A34A' },
        warning: { 50: '#FEF6E3', 500: '#D97706' },
        danger: { 50: '#FDECEC', 500: '#DC2626' },
        brand: { warm50: '#FFF6E6' },
      },
      fontFamily: {
        sans: [
          '"Noto Sans TC"',
          '"Noto Sans KR"',
          '"Noto Sans JP"',
          'system-ui',
          'sans-serif',
        ],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': '11px',
        xs: '13px',
        sm: '15px',
        base: '17px',
        xl: '22px',
        '3xl': '28px',
        hero: ['52px', { lineHeight: '1', letterSpacing: '-0.02em' }],
      },
      boxShadow: {
        card: '0 1px 2px rgba(17, 20, 24, 0.04), 0 4px 12px rgba(17, 20, 24, 0.06)',
        'card-hover': '0 2px 4px rgba(17, 20, 24, 0.06), 0 12px 24px rgba(17, 20, 24, 0.10)',
        nav: '0 -1px 0 rgba(17, 20, 24, 0.06), 0 -8px 24px rgba(17, 20, 24, 0.06)',
        hero: '0 8px 32px rgba(14, 159, 126, 0.18)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #F4F5F7 100%)',
        'primary-gradient': 'linear-gradient(135deg, #0E9F7E 0%, #0B8468 100%)',
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'pop-in': 'pop-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
