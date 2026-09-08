/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Warmes Creme / Stein als Grundfläche
        paper: {
          50: '#fbf9f4',
          100: '#f6f2e9',
          200: '#eee8db',
          300: '#e2dac9',
          400: '#cec3ac',
        },
        // Anthrazit
        ink: {
          300: '#8a877f',
          400: '#6b6862',
          500: '#4a4843',
          600: '#343330',
          700: '#26251f',
          800: '#1c1b18',
          900: '#131211',
        },
        // Waldgrün
        forest: {
          100: '#dfe8e0',
          300: '#8faa93',
          500: '#4a6b52',
          600: '#3b5642',
          700: '#2c4131',
        },
        // Dezentes Bordeaux
        wine: {
          100: '#f0e0e0',
          300: '#b58c8c',
          500: '#7d3f43',
          600: '#653237',
        },
        brass: {
          300: '#d8bd89',
          500: '#a8874c',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Iowan Old Style', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '4px',
      },
      transitionTimingFunction: {
        calm: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        rise: 'rise 420ms cubic-bezier(0.22, 0.61, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};
