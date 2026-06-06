module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 
          green: '#10b981', 
          dark: '#059669',
          glow: 'rgba(16, 185, 129, 0.15)',
        },
        surface: { 
          base: '#0a0f0d', 
          card: '#111917', 
          elevated: '#1a2e25',
          glass: 'rgba(26, 46, 37, 0.7)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'glow': '0 0 20px rgba(16, 185, 129, 0.2)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
};
