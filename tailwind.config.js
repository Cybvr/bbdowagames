/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--color-border)",
        input: "var(--color-border)",
        ring: "var(--color-blue)",
        background: "var(--color-bg)",
        foreground: "var(--color-text-main)",
        primary: {
          DEFAULT: "var(--color-green)",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "var(--color-page-bg)",
          foreground: "var(--color-text-main)",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "var(--color-page-bg)",
          foreground: "var(--color-text-muted)",
        },
        accent: {
          DEFAULT: "var(--color-page-bg)",
          foreground: "var(--color-blue)",
        },
        popover: {
          DEFAULT: "var(--color-bg)",
          foreground: "var(--color-text-main)",
        },
        card: {
          DEFAULT: "var(--color-bg)",
          foreground: "var(--color-text-main)",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "8px",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
