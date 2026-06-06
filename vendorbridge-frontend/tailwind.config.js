module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 
          green: 'var(--brand-primary)', 
          dark: 'var(--brand-hover)',
          glow: 'var(--brand-glow)',
        },
        surface: { 
          base: 'var(--bg-base)', 
          card: 'var(--bg-surface)', 
          elevated: 'var(--bg-elevated)',
          glass: 'var(--bg-glass)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          accent: 'var(--text-accent)',
        },
        subtle: 'var(--border-subtle)',
        'border-green': 'var(--border-green)',
        focus: 'var(--border-focus)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'glow': 'var(--shadow-glow)',
        'card': 'var(--shadow-card)',
      }
    },
  },
  plugins: [],
};
