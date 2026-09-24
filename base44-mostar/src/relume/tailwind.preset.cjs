/**
 * Tailwind v3 preset that mirrors the Relume Tailwind v4 theme (reference/DESIGN.md,
 * react/globals.css) so the exported components render with their original class names.
 */
const plugin = require("tailwindcss/plugin");

const mix = (hex) => (pct) => `color-mix(in srgb, ${hex}, transparent ${100 - pct}%)`;
const white = mix("#ffffff");
const darkest = mix("#040709");

const typeStep = (name, lineHeight, letterSpacing) => [
  `var(--text-${name})`,
  letterSpacing ? { lineHeight, letterSpacing } : { lineHeight },
];

module.exports = {
  theme: {
    screens: {
      sm: "480px",
      md: "768px",
      lg: "992px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        white: "#ffffff",
        "white-5": white(5),
        "white-10": white(10),
        "white-15": white(15),
        "white-20": white(20),
        "white-30": white(30),
        "white-40": white(40),
        "white-50": white(50),
        "white-60": white(60),
        neutral: {
          DEFAULT: "#818384",
          lightest: "#f2f2f2",
          lighter: "#d9d9da",
          light: "#b3b4b5",
          dark: "#4f5152",
          darker: "#1d1f21",
          darkest: "#040709",
          "darkest-5": darkest(5),
          "darkest-10": darkest(10),
          "darkest-15": darkest(15),
          "darkest-20": darkest(20),
          "darkest-30": darkest(30),
          "darkest-40": darkest(40),
          "darkest-50": darkest(50),
          "darkest-60": darkest(60),
        },
        korma: {
          DEFAULT: "#8b4513",
          lightest: "#f3ece7",
          lighter: "#e7d9cf",
          light: "#ad7c59",
          dark: "#6f370f",
          darker: "#371b07",
          darkest: "#291405",
        },
        "golden-grass": {
          DEFAULT: "#daa520",
          lightest: "#fbf6e8",
          lighter: "#f7edd2",
          light: "#e5c062",
          dark: "#ae8419",
          darker: "#57420c",
          darkest: "#413109",
        },
        "sea-green": {
          DEFAULT: "#2e8b57",
          lightest: "#eaf3ee",
          lighter: "#d5e7dd",
          light: "#6cad89",
          dark: "#246f45",
          darker: "#123722",
          darkest: "#0d291a",
        },
        "steel-blue": {
          DEFAULT: "#4682b4",
          lightest: "#ecf2f7",
          lighter: "#dae6f0",
          light: "#7da7ca",
          dark: "#386890",
          darker: "#1c3448",
          darkest: "#152736",
        },
        scheme: {
          background: "var(--color-scheme-background)",
          foreground: "var(--color-scheme-foreground)",
          text: "var(--color-scheme-text)",
          accent: "var(--color-scheme-accent)",
          border: "var(--color-scheme-border)",
          "btn-text": "var(--color-scheme-btn-text)",
        },
      },
      fontSize: {
        h1: typeStep("h1", "1.1", "0.01em"),
        h2: typeStep("h2", "1.2", "0.01em"),
        h3: typeStep("h3", "1.2", "0.01em"),
        h4: typeStep("h4", "1.2", "0.01em"),
        h5: typeStep("h5", "1.2", "0.01em"),
        h6: typeStep("h6", "1.2", "0.01em"),
        large: typeStep("large", "1.6"),
        medium: typeStep("medium", "1.6"),
        regular: typeStep("regular", "1.6"),
        small: typeStep("small", "1.6"),
        tiny: typeStep("tiny", "1.6"),
      },
      borderRadius: {
        button: "6.25rem",
        card: "0rem",
        checkbox: "0.25rem",
        carousel: "6.25rem",
        form: "0.75rem",
        badge: "6.25rem",
        image: "0rem",
      },
      maxWidth: {
        xxs: "20rem",
        xs: "25rem",
        sm: "30rem",
        md: "35rem",
        lg: "48rem",
        xl: "64rem",
        xxl: "80rem",
      },
      spacing: {
        18: "4.5rem",
        30: "7.5rem",
      },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant("alternate", ".alternate &");
      addVariant("badge-alt", ".badge-alt &");
      addVariant("btn-dark", ".btn-dark &");
      addVariant("btn-light", ".btn-light &");
    }),
  ],
};
