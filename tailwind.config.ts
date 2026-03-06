import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#f3f4f1', // Crema/Beige Crextio
        foreground: '#1a1a1b',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#1a1a1b',
        },
        primary: {
          DEFAULT: '#ffbf00', // Ámbar T-Cargo
          foreground: '#000000',
        },
        secondary: {
          DEFAULT: '#e5e7eb',
          foreground: '#374151',
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'full': '9999px',
      },
      animation: {
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

export default config
