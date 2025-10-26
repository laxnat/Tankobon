import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bright-blue': '#0e3f6b', 
        'sky-blue': '#02A9FF', 
        'red-accent': '#EF233C', 
        'dark-navy': '#0B1622', 
        'light-navy': '#151F2E', 
        'muted-blue': '#8BA0B2',
        'white-purple': '#cfcfe8',
        'light-purple': '#a1a1ce',
        'blue-purple': '#373766',
        'dark-purple': '#36366e',
        'darker-purple': '#353570' 
      }
    },
  },
  plugins: [],
}
export default config