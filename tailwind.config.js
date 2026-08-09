/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        primary: '#0F172A',
        'on-primary': '#FFFFFF',
        secondary: '#1E293B',
        accent: '#22C55E',
        'on-accent': '#02140B',
        'accent-muted': '#1A3A2A',
        background: '#020617',
        surface: '#0B1120',
        foreground: '#F8FAFC',
        muted: '#1A1E2F',
        'muted-foreground': '#94A3B8',
        border: '#334155',
        destructive: '#EF4444',
        ring: '#0F172A',
      },
    },
  },
  plugins: [],
}
