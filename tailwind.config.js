const { blue } = require("tailwindcss/colors");
const colors = require("tailwindcss/colors");

const gruvbox = {
  dark: {
    hard: "#1D2021",
    0: "#282828",
    soft: "#32302F",
    1: "#3c3836",
    2: "#504945",
    3: "#665C54",
    4: "#7C6F64",
  },
  gray: "#928374",
  light: {
    hard: "#F9F5D7",
    soft: "#F2E5BC",
    0: "#FBF1C7",
    1: "#EBDBB2",
    2: "#D5C4A1",
    3: "#BDAE93",
    4: "#A89984",
  },
  red: {
    bright: "#FB4934",
    neutral: "#CC241D",
    faded: "#9D0006",
  },
  green: {
    bright: "#B8BB26",
    neutral: "#98971A",
    faded: "#79740E",
  },
  yellow: {
    bright: "#FABD2F",
    neutral: "#D79921",
    faded: "#B57614",
  },
  blue: {
    bright: "#83A598",
    neutral: "#458588",
    faded: "#076678",
  },
  purple: {
    bright: "#D3869B",
    neutral: "#B16286",
    faded: "#8F3F71",
  },
  aqua: {
    bright: "#8EC07C",
    neutral: "#689D6A",
    faded: "#427B58",
  },
  orange: {
    bright: "#FE8019",
    neutral: "#D65D0E",
    faded: "#AF3A03",
  },
};

module.exports = {
  purge: {
    content: ["./src/**/*.html"],
    css: ["./public/**/*.css"],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
    colors: {
      black: gruvbox.dark.hard,
      white: colors.white,
      paper: gruvbox.light[0],
      primary: gruvbox.dark[0],
      secondary: gruvbox.red.neutral,
    ...gruvbox},
    fontFamily: {
      sans: [
        // "Arvo",
        // "Merriweather",
        "Roboto Slab",
        "system-ui",
        "sans-serif",
      ],
    },
  },
  variants: {},
  plugins: [],
};
