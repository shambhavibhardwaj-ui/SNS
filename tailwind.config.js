/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#FDFBF7',
          100: '#F9F5EC',
          200: '#F4ECE0',
          300: '#EBDDC9',
        },
        terracotta: {
          100: '#FCEBE6',
          400: '#E87D65',
          500: '#D95C3F',
          600: '#BF482C',
          700: '#94331C',
        },
        saffron: {
          100: '#FEF6E4',
          400: '#F9C74F',
          500: '#F3A228',
          600: '#D68112',
        },
        herb: {
          100: '#EBF5EE',
          400: '#52B788',
          500: '#2D936C',
          600: '#1F7051',
          700: '#164E38',
        },
        village: {
          sky: '#EAF4F4',
          stone: '#5C677D',
          roof: '#C86D51',
          wood: '#8C5835',
          night: '#1A2238',
          nightSky: '#0D1322',
        }
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif', 'system-ui'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      animation: {
        'steam-rise': 'steamRise 3s ease-out infinite',
        'steam-rise-delayed': 'steamRise 3.5s ease-out 1.2s infinite',
        'float-gentle': 'floatGentle 4s ease-in-out infinite',
        'scooter-ride': 'scooterRide 18s linear infinite',
        'pulse-warm': 'pulseWarm 3s ease-in-out infinite',
      },
      keyframes: {
        steamRise: {
          '0%': { transform: 'translateY(0) scale(0.8)', opacity: '0.7' },
          '50%': { transform: 'translateY(-14px) scale(1.1) translateX(4px)', opacity: '0.4' },
          '100%': { transform: 'translateY(-28px) scale(1.4) translateX(-2px)', opacity: '0' },
        },
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        scooterRide: {
          '0%': { transform: 'translateX(-40px) scaleX(1)' },
          '48%': { transform: 'translateX(720px) scaleX(1)' },
          '50%': { transform: 'translateX(720px) scaleX(-1)' },
          '98%': { transform: 'translateX(-40px) scaleX(-1)' },
          '100%': { transform: 'translateX(-40px) scaleX(1)' },
        },
        pulseWarm: {
          '0%, 100%': { opacity: '0.9' },
          '50%': { opacity: '0.5' },
        }
      }
    },
  },
  plugins: [],
};
