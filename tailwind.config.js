const colors = require('tailwindcss/colors')

module.exports = {
  purge: {
    content: ['./src/**/*.html']
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
    colors: {
      black: colors.black,
      blue: colors.blue,
      yellow: colors.yellow,
      white: colors.white,
      gray: colors.gray,
      paper: '#f4f1de',
      primary: '#798897',
      // primary: colors.black,
      secondary: '#C2675E',
      gruvred: '#e76f51',
      gruvorange: '#f4a261',
      gruvyellow: '#e9c46a',
      gruvgreen: '#2a9d8f',
      gruvblue: '#264653'
    }
  },
  variants: {},
  plugins: [],
}