import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-archivo)", "sans-serif"],
        display: ["var(--font-archivo-black)", "sans-serif"],
      },
      colors: {
        // Project palette
        'bright-blue':    '#0e3f6b',
        'sky-blue':       '#02A9FF',
        'red-accent':     '#EF233C',
        'dark-navy':      '#0B1622',
        'light-navy':     '#151F2E',
        'muted-blue':     '#8BA0B2',
        'white-purple':   '#cfcfe8',
        'light-purple':   '#a1a1ce',
        'blue-purple':    '#373766',
        'dark-purple':    '#36366e',
        'darker-purple':  '#353570',
        // shadcn CSS-variable tokens (required for @apply in v3)
        border:      'var(--border)',
        input:       'var(--input)',
        ring:        'var(--ring)',
        background:  'var(--background)',
        foreground:  'var(--foreground)',
        primary: {
          DEFAULT:    'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT:    'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT:    'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT:    'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT:    'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT:    'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT:    'var(--card)',
          foreground: 'var(--card-foreground)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
export default config