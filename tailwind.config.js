/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1F2A24',
        'ink-light': '#2C3B33',
        paper: '#F5F1E6',
        board: {
          light: '#EBECD0',
          dark: '#6B8F4E',
        },
        gold: '#C9A24B',
        ember: '#C1502E',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        mono: ['"Space Mono"', 'monospace'],
        sans: ['"Work Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
