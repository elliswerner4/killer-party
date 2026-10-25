import type { Config } from 'tailwindcss'

// Palette: a library after dinner. Green baize walls, claret in the glass,
// candlelight on brass, place cards on the table.
// The token names (noir / blood / gold) predate this palette and are kept so
// every page picks it up without renaming classes.
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Library green: page background and raised surfaces
        noir: { DEFAULT: '#12302A', light: '#1A3D36', dark: '#0C231E' },
        // Claret: primary actions and the murder
        blood: { DEFAULT: '#8E2433', light: '#B0414F', dark: '#5E1520' },
        // Candle brass: small accents only
        gold: { DEFAULT: '#D6A64F', light: '#E6BE6E', dark: '#A97F33' },
        // Parchment: place cards and body text
        parchment: { DEFAULT: '#EFE7D6', dim: '#C9C0AC', ink: '#2A211B' },
        sage: '#9DB3A8',
        // Warm greys tuned for green backgrounds (replaces Tailwind's cool greys)
        gray: {
          100: '#F3EEE3', 200: '#E6DFD0', 300: '#D6CFBF', 400: '#B3B6A6', 500: '#8C9E94',
          600: '#6B7F76', 700: '#3A544C', 800: '#2A443D', 900: '#1C3530',
        },
      },
      fontFamily: {
        display: ['var(--font-fell)', 'Georgia', 'serif'],
        body: ['var(--font-public)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
