/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{html,js}",
    "./preview.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a1a1a',
        secondary: '#f5f5f5',
        accent: '#ff3333',
        background: '#ffffff',
        surface: '#e5e5e5',
        text: '#1a1a1a',
        border: '#1a1a1a',
        success: '#00aa00',
        warning: '#ffaa00',
        error: '#ff0000',
        info: '#0066ff',
      },
      fontFamily: {
        heading: ['&#x27;Space Grotesk&#x27;, 700, 500'],
        body: ['&#x27;IBM Plex Mono&#x27;, 400, 300'],
        accent: ['&#x27;Syne&#x27;, 800'],
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
