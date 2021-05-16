const _ = require("lodash");
const moment = require("moment");
const { spawnSync } = require("child_process");
const purgeCssPlugin = require("eleventy-plugin-purgecss");

const compilePostcss = () => {
  console.log("Compiling postcss..");
  const postcss_job = spawnSync("./node_modules/.bin/postcss", [
    "src/_includes/postcss/*.pcss",
    "--dir",
    "public/css",
    "--ext",
    "css",
  ]);
  if (postcss_job.status !== 0) {
    console.log(postcss_job.stderr.toString());
    console.log(postcss_job.status.toString());
  }
};

const markdownLib = () => {
  const md = require("markdown-it");
  const mdImgPlugin = require("markdown-it-block-image");
  const mdAnchor = require("markdown-it-anchor");
  const mdClass = require("@toycode/markdown-it-class");

  let markdownRenderer = md({
    html: true,
  });

  const mdClassMap = {};
  const mdTags = [
    "h1",
    "h2",
    "h3",
    "p",
    "a",
    "ul",
    "ol",
    "li",
    "pre",
    "code",
    "img",
  ];
  mdTags.map((mdTag) => _.set(mdClassMap, mdTag, "markdown"));

  markdownRenderer.use(mdImgPlugin, {
    outputContainer: "div",
    containerClassName: "image-container",
  });
  markdownRenderer.use(mdAnchor, {
    permalink: true,
    permalinkSymbol: "↩",
  });
  markdownRenderer.use(mdClass, mdClassMap);

  return markdownRenderer;
};

const allTagsColletion = (collection) => {
  const allTags = _.chain(collection.getAllSorted())
    .filter((post) => _.eq(_.get(post, "data.type"), "post"))
    .map((post) => _.get(post, "data.tags"))
    .flatten()
    .uniq()
    .sort()
    .value();
  console.log(allTags);
  return allTags;
};

const postsByYearCollection = (collection) => {
  const postsByYear = _.chain(collection.getAllSorted())
    .filter((post) => _.eq(_.get(post, "data.type"), "post"))
    .groupBy((post) => post.date.getFullYear())
    .toPairs()
    .reverse()
    .value();
  return postsByYear;
};

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("./src/css/");
  eleventyConfig.addPassthroughCopy("./src/img");
  eleventyConfig.addCollection("postsByYear", postsByYearCollection);
  eleventyConfig.addCollection("allTags", allTagsColletion);

  eleventyConfig.addShortcode("postCard", (postTitle) => {
    return ``;
  });

  eleventyConfig.on("afterBuild", () => {
    compilePostcss();
  });
  eleventyConfig.addPlugin(purgeCssPlugin, {
    config: "./purgecss.config.js",
    quiet: false,
  });

  eleventyConfig.addFilter("prettyDate", (date) => {
    return moment(date).format("Do MMM, YYYY");
  });

  eleventyConfig.setLibrary("md", markdownLib());

  return {
    dir: {
      input: "src",
      output: "public",
    },
  };
};
