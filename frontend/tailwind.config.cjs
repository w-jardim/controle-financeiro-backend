module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0B0B0B',
          surface: '#0F172A',
          border: '#2B2B2B',
          text: '#E5E7EB',
          muted: '#9CA3AF',
          primary: '#3B82F6',
          'primary-hover': '#2563EB',
          danger: '#C1121F',
          'danger-hover': '#A10E1A',
          premium: '#D4AF37',
          success: '#22C55E',
          'success-hover': '#16A34A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
