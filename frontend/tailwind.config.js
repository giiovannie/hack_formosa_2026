/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#F97316',
          light: '#EA580C',
          hover: '#FB923C',
          blue: '#183A51',
          green: '#1D4D3A',
          'green-hover': '#163E2F',
        },
        surface: {
          light: '#F8F9FA',
          'card-light': '#FFFFFF',
          dark: '#0B0F17',
          'card-dark': '#151D2A',
          borderLight: '#E2E8F0',
          borderDark: '#263346',
        },
        status: {
          success: { light: '#10B981', dark: '#34D399' },
          warning: { light: '#F59E0B', dark: '#FBBF24' },
          danger: { light: '#EF4444', dark: '#F87171' },
          info: { light: '#8B5CF6', dark: '#A78BFA' },
        },
      },
    },
  },
  plugins: [],
}
