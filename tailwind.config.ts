import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "media",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b1220",
        panel: "#0f172a",
        border: "#1f2937",
        accent: "#06b6d4"
      },
      boxShadow: {
        panel: "0 10px 30px rgba(0,0,0,0.25)"
      }
    }
  },
  plugins: []
};

export default config;

