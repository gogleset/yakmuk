/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0F6B5C",
          soft: "#D8F0EA",
          // 기존 className 호환 → muted 축
          muted: "#6B7A76",
          faint: "#6B7A76",
        },
        canvas: "#FFFFFF",
        surface: {
          DEFAULT: "#FFFFFF",
          soft: "#F3F7F5",
        },
        ink: "#F5FFFC",
        text: "#1A2E29",
        line: "#D5DED9",
        background: "#FFFFFF",
        foreground: "#1A2E29",
        primary: {
          DEFAULT: "#0F6B5C",
          foreground: "#F5FFFC",
        },
        secondary: {
          DEFAULT: "#D8F0EA",
          foreground: "#0F6B5C",
        },
        muted: {
          DEFAULT: "#D5DED9",
          foreground: "#6B7A76",
        },
        destructive: {
          DEFAULT: "#8B2E2E",
          foreground: "#FFFFFF",
        },
        border: "#D5DED9",
        success: "#0F6B5C",
      },
      borderRadius: {
        lg: "12px",
        md: "10px",
        sm: "8px",
      },
    },
  },
  plugins: [],
};
