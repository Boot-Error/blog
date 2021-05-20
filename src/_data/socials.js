const _ = require("lodash");

const social = (service, username, icon, url, weight) => {
  return {
    service: service,
    username: username,
    icon: icon,
    url: url,
    weight: weight || 1,
  };
};

const setupSocialLinks = (socials) => {
  return _.reduce(
    socials,
    (res, val) => {
      const service = val.service;
      _.unset(val, service);
      _.set(res, service, val);
      return res;
    },
    {}
  );
};

module.exports = setupSocialLinks([
  social("twitter", "@b00terr", "twitter.svg", "https://twitter.com/b00terr"),
  social("github", "Boot-Error", "github.svg", "https://github.com/Boot-Error"),
]);
