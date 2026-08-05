/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        coral: {
          400: '#FF8E72',
          500: '#FF6B6B',
          600: '#EE5253',
        },
        peach: {
          300: '#FFC0AD',
          400: '#FFA07A',
          500: '#FF8A65',
        },
        sunshine: {
          400: '#FFE066',
          500: '#FFD166',
        },
        mint: {
          400: '#2EC4B6',
          500: '#06D6A0',
        },
        berry: {
          400: '#B5179E',
          500: '#7209B7',
        },
        sky: {
          400: '#4EA8DE',
          500: '#4895EF',
        }
      },
      fontFamily: {
        sans: ['Nunito', 'Outfit', 'Inter', 'system-ui', 'sans-serif'],
        hand: ['"Patrick Hand"', 'cursive', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      keyframes: {
        wobble: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-1.5deg) scale(1.01)' },
          '75%': { transform: 'rotate(1.5deg) scale(1.01)' },
        },
        pop: {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '50%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        flip: {
          '0%': { transform: 'scaleY(1)', opacity: '1' },
          '50%': { transform: 'scaleY(0)', opacity: '0.4' },
          '100%': { transform: 'scaleY(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      },
      animation: {
        wobble: 'wobble 0.4s ease-in-out',
        pop: 'pop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        flip: 'flip 0.3s ease-in-out',
        float: 'float 4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
