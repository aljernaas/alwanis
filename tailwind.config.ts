
import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'pacifico': ['Pacifico', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
