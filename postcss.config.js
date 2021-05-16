const tailwindcss = require('tailwindcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const plugins = [
  require('postcss-nested'),
  tailwindcss(), autoprefixer(), cssnano()
];

module.exports = {
  plugins
};