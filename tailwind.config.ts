import type { Config } from 'tailwindcss';

// Tomato theme tokens from docs/design/cart-helper/project/themes.js (Claude
// Design handoff). Exposed as CSS vars in src/styles/index.css so the other
// 7 themes (crimson / maple / rouge / bordeaux / matcha / navy / cocoa) can
// swap in via `data-ch-theme` on <html> without rebuilding Tailwind.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Theme-driven (CSS vars in styles/index.css)
        page: {
          DEFAULT: 'rgb(var(--ch-page) / <alpha-value>)',
          dark: 'rgb(var(--ch-page-dark) / <alpha-value>)',
        },
        surface: 'rgb(var(--ch-surface) / <alpha-value>)',
        bg: 'rgb(var(--ch-bg) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--ch-ink) / <alpha-value>)',
          60: 'rgb(var(--ch-ink60) / <alpha-value>)',
          30: 'rgb(var(--ch-ink30) / <alpha-value>)',
          10: 'rgb(var(--ch-ink10) / <alpha-value>)',
        },
        chip: {
          1: 'rgb(var(--ch-chip1) / <alpha-value>)',
          2: 'rgb(var(--ch-chip2) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'rgb(var(--ch-success) / <alpha-value>)',
          wash: 'rgb(var(--ch-success-wash) / <alpha-value>)',
        },
        alert: {
          DEFAULT: 'rgb(var(--ch-alert) / <alpha-value>)',
          wash: 'rgb(var(--ch-alert-wash) / <alpha-value>)',
        },
        warn: {
          DEFAULT: 'rgb(var(--ch-warn) / <alpha-value>)',
          wash: 'rgb(var(--ch-warn-wash) / <alpha-value>)',
        },

      },
      fontFamily: {
        sans: [
          '"Noto Sans TC"',
          '"Noto Sans KR"',
          '"Noto Sans JP"',
          'system-ui',
          'sans-serif',
        ],
        num: ['Inter', 'system-ui', 'sans-serif'],
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
      borderRadius: {
        card: '24px',
        chip: '16px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(17, 20, 24, 0.04), 0 4px 12px rgba(17, 20, 24, 0.06)',
        'card-hover': '0 2px 4px rgba(17, 20, 24, 0.06), 0 12px 24px rgba(17, 20, 24, 0.10)',
        nav: '0 -8px 30px -10px rgba(17, 20, 24, 0.18)',
        hero: '0 14px 28px -12px rgb(var(--ch-page) / 0.6)',
        cta: '0 14px 24px -12px rgb(var(--ch-page) / 1)',
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(180deg, rgb(var(--ch-surface) / 0.45) 0%, rgb(var(--ch-bg)) 100%)',
        'primary-gradient':
          'linear-gradient(135deg, rgb(var(--ch-page)) 0%, rgb(var(--ch-page-dark)) 100%)',
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
