/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{html,js}",
    "./preview.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7c3aed',
        secondary: '#f472b6',
        accent: '#fbbf24',
        background: '#fefce8',
        surface: '#fef3c7',
        text: '#1f2937',
        border: '#fde68a',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        heading: ['Fredoka One', 400],
        body: ['Quicksand', 500, 400, 700],
        accent: ['Patrick Hand', 400],
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
