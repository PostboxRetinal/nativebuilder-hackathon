/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: '#0F172A',
        'on-primary': '#FFFFFF',
        secondary: '#1E293B',
        accent: '#22C55E',
        background: '#020617',
        foreground: '#F8FAFC',
        muted: '#1A1E2F',
        border: '#334155',
        destructive: '#EF4444',
        ring: '#0F172A',
      },
    },
  },
  plugins: [],
}
