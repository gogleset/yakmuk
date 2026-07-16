/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1B4D3E',
          soft: '#DCEADF',
          muted: '#4A5A52',
          faint: '#6B7A72',
        },
        canvas: '#F3EFE6',
        ink: '#F7F3EA',
        line: '#D5CFC2',
        // shadcn semantic aliases (기존 brand와 동일 계열)
        background: '#F3EFE6',
        foreground: '#1B4D3E',
        primary: {
          DEFAULT: '#1B4D3E',
          foreground: '#F7F3EA',
        },
        secondary: {
          DEFAULT: '#DCEADF',
          foreground: '#1B4D3E',
        },
        muted: {
          DEFAULT: '#D5CFC2',
          foreground: '#6B7A72',
        },
        destructive: {
          DEFAULT: '#8B2E2E',
          foreground: '#FFFFFF',
        },
        border: '#D5CFC2',
      },
      borderRadius: {
        lg: '12px',
        md: '10px',
        sm: '8px',
      },
    },
  },
  plugins: [],
};
