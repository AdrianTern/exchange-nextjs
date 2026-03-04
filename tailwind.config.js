/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#6366f1',
          accent: '#ec4899',
          success: '#22c55e',
          warning: '#f59e0b',
        }
      },
    },
  },
  plugins: [],
}
