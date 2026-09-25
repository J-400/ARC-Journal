/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        deepgreen: "#1F4D2E",
        darkgreen: "#2E4A22",
        olive: "#7A8452",
        gold: "#D4AF37",
        cream: "#F5F4F0",
        ink: "#1C1C1A",
      },
      fontFamily: {
        serif: ["Merriweather", "Georgia", "Cambria", "serif"],
        sans: ["Calibri", "Segoe UI", "system-ui", "-apple-system", "sans-serif"],
      },
      maxWidth: {
        prose: "42rem",
        column: "68ch",
      },
      typography: () => ({
        DEFAULT: {
          css: {
            maxWidth: "68ch",
          },
        },
      }),
    },
  },
  plugins: [],
};
