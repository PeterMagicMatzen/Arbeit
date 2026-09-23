/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  presets: [require("@relume_io/relume-tailwind")],
  theme: {
    // Override the preset's container.screens: it uses "100%" for sm/md,
    // which is not a valid min-width media-query value and breaks CSS
    // minification. Use real breakpoints instead.
    container: {
      center: true,
      screens: {
        sm: "480px",
        md: "768px",
        lg: "992px",
        xl: "1280px",
      },
    },
    extend: {
      gradientColorStops: ({ theme }) => theme("colors"),
      fontSize: {
        h1: ["3.5rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        h2: ["3rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        h3: ["2.5rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        h4: ["2rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        h5: ["1.5rem", { lineHeight: "1.4", letterSpacing: "-0.01em" }],
        h6: ["1.25rem", { lineHeight: "1.4", letterSpacing: "-0.01em" }],
        large: ["1.25rem", { lineHeight: "1.5" }],
        medium: ["1.125rem", { lineHeight: "1.5" }],
        regular: ["1rem", { lineHeight: "1.5" }],
        small: ["0.875rem", { lineHeight: "1.5" }],
        tiny: ["0.75rem", { lineHeight: "1.5" }],
      },
      colors: {
        scheme: {
          background: "#0b1110",
          foreground: "#0b1110",
          text: "#fdf1e1",
          border: "rgba(253,241,225,0.16)",
          "btn-text": "#111411",
        },
      },
      borderRadius: {
        button: "999px",
        card: "0rem",
        image: "0rem",
        form: "0rem",
        badge: "0rem",
        checkbox: "0rem",
        carousel: "0rem",
        dropdown: "0rem",
      },
    },
  },
  plugins: [],
};
