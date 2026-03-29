import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        blood: { DEFAULT: '#8B0000', light: '#B22222', dark: '#4A0000' },
        gold: { DEFAULT: '#C9A84C', light: '#E0C068', dark: '#A08030' },
        noir: { DEFAULT: '#1a1a2e', light: '#2d2d44', dark: '#0f0f1a' },
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        body: ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
