/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: '#ebeeed',
        'surface-card': '#ffffff',
        'surface-muted': '#f0f4f1',
        'surface-frosted': 'rgba(211,226,214,0.8)',
        primary: '#1f2421',
        sage: {
          50: '#f4f7f4',
          100: '#e5ece6',
          200: '#d3dfd5',
          300: '#b5ccb9',
          400: '#8fae96',
          500: '#6e8c75',
          600: '#55705b',
          700: '#425647',
          800: '#314035',
          900: '#1f2b23',
        },
        charcoal: {
          DEFAULT: '#1f2421',
          light: '#2a302d',
          hover: '#141715',
        },
        status: {
          ok: '#10b981',
          warn: '#d97706',
          crit: '#dc2626',
          info: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2.25rem',
        pill: '9999px',
      },
      boxShadow: {
        subtle: '0 2px 8px -2px rgba(31,36,33,0.04), 0 1px 3px -1px rgba(31,36,33,0.02)',
        card: '0 4px 20px -4px rgba(31,36,33,0.05), 0 0 0 1px rgba(215,225,218,0.6)',
        stage: '0 24px 48px -12px rgba(66,86,71,0.08)',
        'pill-dark': '0 8px 24px -4px rgba(30,36,33,0.30)',
      },
      backdropBlur: {
        xs: '4px',
      },
    },
  },
  plugins: [],
}
