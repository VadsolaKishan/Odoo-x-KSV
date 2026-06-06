/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f8ff',
          100: '#eef3ff',
          200: '#dce6ff',
          300: '#bdd0ff',
          400: '#91b0ff',
          500: '#5b84ff', // Premium Blue/Indigo
          600: '#3860f4',
          700: '#2547dd',
          800: '#1d39b5',
          900: '#1e348f',
          950: '#111e58',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#0b0f19',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 4px 20px -2px rgba(17, 24, 39, 0.05), 0 2px 8px -1px rgba(17, 24, 39, 0.03)',
        'premium-hover': '0 12px 30px -4px rgba(17, 24, 39, 0.08), 0 4px 12px -2px rgba(17, 24, 39, 0.04)',
        'dark-premium': '0 4px 20px -2px rgba(0, 0, 0, 0.3), 0 2px 8px -1px rgba(0, 0, 0, 0.2)',
        'dark-hover': '0 12px 30px -4px rgba(0, 0, 0, 0.4), 0 4px 12px -2px rgba(0, 0, 0, 0.25)',
      }
    },
  },
  plugins: [],
}
