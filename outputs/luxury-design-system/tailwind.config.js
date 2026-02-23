/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{html,js}",
    "./preview.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a1a2e',
        secondary: '#4a4e69',
        accent: '#c9a227',
        background: '#faf8f5',
        surface: '#f5f0e8',
        text: '#0f0f1a',
        border: '#d4cfc0',
        success: '#225c3d',
        warning: '#c49000',
        error: '#b84c4c',
        info: '#2c5282',
      },
      fontFamily: {
        heading: ['&#x27;Cormorant&#x27;, 600, 400, 300'],
        body: ['&#x27;Crimson Pro&#x27;, 300, 400, 200'],
        accent: ['&#x27;Bodoni Moda&#x27;, 400, 900'],
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
