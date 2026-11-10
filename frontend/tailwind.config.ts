import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
        bg: "#161826",
        surface: "#232532",
        text: "#e9e9ed",
        accent: {
          100: "#e6faf7",
          200: "#c2f1eb",
          300: "#93e3da",
          400: "#5fcfc4",
          500: "#2fb8ac",
          600: "#26978e",
          700: "#1d746d",
          800: "#15534e",
          900: "#0f3733"
        }
      }
    }
  }
} satisfies Config;
