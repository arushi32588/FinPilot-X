/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#101624',
          dark: '#18181b',
          glass: 'rgba(24, 24, 27, 0.7)',
        },
        primary: {
          DEFAULT: '#2563eb',
          dark: '#1e40af',
        },
        accent: {
          DEFAULT: '#fbbf24',
          orange: '#f59e42',
          violet: '#a21caf',
          emerald: '#10b981',
        },
        card: {
          DEFAULT: 'rgba(24, 24, 27, 0.7)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        glass: '0 4px 32px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}

