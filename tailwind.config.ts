import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#E6F6F0', 500: '#0E9F7E', 600: '#0B8468' },
        secondary: { 500: '#1F3A5F' },
        accent: { 500: '#F5A524' },
        neutral: {
          0: '#FFFFFF',
          100: '#F4F5F7',
          400: '#9AA0AA',
          700: '#3D434D',
          900: '#111418',
        },
        success: { 500: '#16A34A' },
        warning: { 500: '#D97706' },
        danger: { 500: '#DC2626' },
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
      },
    },
  },
  plugins: [],
} satisfies Config;
