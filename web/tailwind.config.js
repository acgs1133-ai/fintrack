/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "bg-base": "#0D0D0D",
        "bg-card": "#161616",
        "bg-hover": "#1E1E1E",
        border: "rgba(255,255,255,0.07)",
        "text-primary": "#F4F4F5",
        "text-secondary": "#A1A1AA",
        "text-muted": "#52525B",
        "accent-green": "#22C55E",
        "accent-red": "#EF4444",
        "accent-blue": "#3B82F6",
        "accent-yellow": "#EAB308",
        "accent-purple": "#A855F7",
        "accent-orange": "#F97316",
        "accent-cyan": "#06B6D4",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      fontSize: {
        muted: "12px",
        "body-sm": "13px",
        body: "14px",
        subtitle: "16px",
        title: "20px",
        hero: "28px",
        saldo: "36px",
      },
    },
  },
  plugins: [],
};
