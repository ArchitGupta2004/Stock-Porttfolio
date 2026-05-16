export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0F172A',
          card: '#1E293B',
          text: '#F8FAFC',
          muted: '#94A3B8',
          border: '#334155'
        },
        brand: {
          primary: '#3B82F6',
          secondary: '#10B981',
          danger: '#EF4444'
        }
      }
    },
  },
  plugins: [],
}
