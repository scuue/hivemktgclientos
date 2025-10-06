/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        hive: {
          yellow: '#FFCC00',
          black: '#000000',
          darkGray: '#1a1a1a',
          mediumGray: '#2a2a2a',
          lightGray: '#3a3a3a',
        },
      },
      boxShadow: {
        'hive': '0 4px 6px -1px rgba(255, 204, 0, 0.1), 0 2px 4px -1px rgba(255, 204, 0, 0.06)',
        'hive-lg': '0 10px 15px -3px rgba(255, 204, 0, 0.2), 0 4px 6px -2px rgba(255, 204, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
