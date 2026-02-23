/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{html,js}",
    "./preview.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0d9488',
        secondary: '#7c3aed',
        accent: '#22d3ee',
        background: '#0c0c0c',
        surface: '#1a1a1a',
        text: '#e5e5e5',
        border: '#262626',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        heading: ['Orbitron', 700, 500, 400],
        body: ['Rajdhani', 400, 500, 300],
        accent: ['Audiowide', 400],
      },
      fontSize: {
        'heading-xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'heading-lg': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'heading-md': ['1.75rem', { lineHeight: '1.3', letterSpacing: '0' }],
        'heading-sm': ['1.25rem', { lineHeight: '1.4', letterSpacing: '0' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body-md': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
      },
      borderRadius: {
        'theme': '0.25rem',
        'theme-lg': '0.5rem',
      },
      boxShadow: {
        'theme': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'theme-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [],
}
