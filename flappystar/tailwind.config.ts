import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        primary: '#FFD700',
        accent: '#7C3AED',
        surface: 'rgba(255,255,255,0.04)',
        'surface-border': 'rgba(255,255,255,0.08)',
        'text-primary': '#FFFFFF',
        'text-muted': '#A1A1AA',
        'pipe-dark': '#1e0a3c',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'gold-shimmer': 'gold-shimmer 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'star-twinkle': 'star-twinkle 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'gold-shimmer': {
          '0%, 100%': {
            backgroundPosition: '200% center',
          },
          '50%': {
            backgroundPosition: '-200% center',
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '0.8',
            transform: 'scale(1.02)',
          },
        },
        'star-twinkle': {
          '0%, 100%': {
            opacity: '0.3',
          },
          '50%': {
            opacity: '1',
          },
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
      },
      backgroundImage: {
        'gold-gradient':
          'linear-gradient(90deg, #FFD700 0%, #FFF8DC 25%, #FFD700 50%, #FFF8DC 75%, #FFD700 100%)',
        'space-gradient':
          'radial-gradient(ellipse at center, #0a0a1f 0%, #0a0a0f 50%, #050508 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
