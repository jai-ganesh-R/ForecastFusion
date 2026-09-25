/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080c14",
        surface: "#0d1424",
        surfaceBorder: "#1e293b",
        neonCyan: "#00e5ff",
        neonAmber: "#ffb020",
        neonRed: "#ff3b5c",
        neonGreen: "#00e676",
        neonBlue: "#38bdf8",
        deepNavy: "#0a0f1d",
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        sans: ['Inter', 'Space Grotesk', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ticker': 'ticker 30s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 8px rgba(0, 229, 255, 0.6))' },
          '50%': { opacity: 0.5, filter: 'drop-shadow(0 0 2px rgba(0, 229, 255, 0.2))' },
        },
        ticker: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      }
    },
  },
  plugins: [],
}
