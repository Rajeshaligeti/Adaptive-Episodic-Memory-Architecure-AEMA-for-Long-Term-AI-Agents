/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          sidebar: "#0F172A", // Deep Navy/Charcoal
          sidebarHover: "#1E293B",
          primary: "#2563EB", // Rich research blue
          primaryHover: "#1D4ED8",
          accent: "#6366F1", // Indigo
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#EF4444",
          surface: "#F8FAFC",
          card: "#FFFFFF"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
