import { type Config } from "tailwindcss"

export default {
  content: ["./index.html", "vite.config.ts", "./src/**/*.{js,ts,jsx,tsx,css}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
