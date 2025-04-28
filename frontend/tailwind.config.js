/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: 'var(--primary)',
        'primary-light': 'var(--primary-light)',
        'card-background': 'var(--card-background)',
        'border-color': 'var(--border-color)',
        'success-color': 'var(--success-color)',
        'warning-color': 'var(--warning-color)',
        'danger-color': 'var(--danger-color)',
      },
    },
  },
  plugins: [],
}