import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    '../../apps/web/src/**/*.{js,ts,jsx,tsx}',
    '../../apps/web/index.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f97316',
        'primary-hover': '#ea580c',
        'background-light': '#f8fafc',
        'background-dark': '#0f172a',
        secondary: '#64748b',
        success: '#22c55e',
        warning: '#facc15',
        error: '#ef4444',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        'DEFAULT': '12px',
        'xl': '16px',
        '2xl': '24px',
      },
      boxShadow: {
        'card': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'card-dark': 'none',
      },
    },
  },
  plugins: [],
}

export default config