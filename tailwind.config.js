/**
 * Bina Adult Care design tokens. See DESIGN.md for usage guidance.
 * All text/background pairs used on the site meet WCAG AA contrast.
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px' },
    container: {
      center: true,
      padding: '1.5rem',
      screens: { xl: '1200px' },
    },
    extend: {
      colors: {
        // "Dusty Blue & Soft White" brand palette.
        brand: {
          50: '#EAF1F4', // light dusty tint — icon circles, pills, tab bar
          100: '#E3ECF1', // tint cards
          200: '#A9C5D3', // Soft Blue — feature sections & highlights (use navy text on it)
          300: '#C4D7E0',
          400: '#527D96', // Dusty Blue — icons, accents, rules (exact brand color)
          600: '#517C94', // Dusty Blue for surfaces carrying white text (4.5:1, visually identical to #527D96)
          700: '#426B83', // hover state and text links (5.7:1 on white)
        },
        navy: { DEFAULT: '#263E52', 800: '#2F4C63' }, // Deep Navy — headings, nav, footer
        champagne: { DEFAULT: '#D9C7A3', 600: '#CDB88F' }, // Warm Champagne — premium accents only
        slate: { DEFAULT: '#52636A', muted: '#52636A' }, // body text
        cream: '#F4F7F8', // Soft White — page background
        sand: '#F4F7F8',
        line: { DEFAULT: '#DCE5E9', strong: '#C9D6DC' }, // borders & dividers; strong = form fields
        mist: '#DCE5E0', // supporting text on Deep Navy (footer)
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        script: ['"Dancing Script"', 'cursive'], // logo tagline only
      },
      borderRadius: { card: '1rem', media: '1.25rem', panel: '1.5rem' }, // 16 / 20 / 24px
      boxShadow: {
        soft: '0 1px 3px rgba(38,62,82,0.05), 0 6px 18px -10px rgba(38,62,82,0.12)',
        lift: '0 14px 40px -12px rgba(38,62,82,0.18)',
      },
      maxWidth: { prose: '40rem' },
      transitionTimingFunction: { gentle: 'cubic-bezier(0.22, 0.61, 0.36, 1)' },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'none' } },
        marqueeUp: { from: { transform: 'translateY(0)' }, to: { transform: 'translateY(-50%)' } },
      },
      animation: {
        // ~6s per photo; the two columns roll in opposite directions.
        'marquee-up': 'marqueeUp 36s linear infinite',
        'marquee-down': 'marqueeUp 36s linear infinite reverse',
      },
    },
  },
  plugins: [],
};
