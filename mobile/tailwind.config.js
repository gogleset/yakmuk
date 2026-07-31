/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4D8679",
          soft: "#E4F1ED",
          // 기존 className 호환 → muted 축
          muted: "#7A8783",
          faint: "#7A8783",
        },
        canvas: "#F7F8F8",
        surface: {
          DEFAULT: "#FFFFFF",
          soft: "#F0F5F3",
        },
        ink: "#F5FFFC",
        text: "#1F2A27",
        line: "#D5DED9",
        background: "#F7F8F8",
        foreground: "#1F2A27",
        primary: {
          DEFAULT: "#4D8679",
          foreground: "#F5FFFC",
        },
        secondary: {
          DEFAULT: "#E4F1ED",
          foreground: "#4D8679",
        },
        muted: {
          DEFAULT: "#D5DED9",
          foreground: "#7A8783",
        },
        destructive: {
          DEFAULT: "#C46B5A",
          foreground: "#FFFFFF",
        },
        border: "#D5DED9",
        success: "#4D8679",
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
