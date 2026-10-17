import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { ink: 'var(--ink-950)', paper: 'var(--paper-50)', volt: 'var(--volt-400)' },
      maxWidth: { site: '1320px' },
    },
  },
  plugins: [],
} satisfies Config;
