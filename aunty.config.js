const path = require("path");
const webpack = require("webpack");
module.exports = {
  type: "react",
  webpack: config => {
    config.plugins.push(
      new webpack.DefinePlugin({
        FB_API_KEY: JSON.stringify(process.env.FB_API_KEY),
        FB_AUTH_DOMAIN: JSON.stringify(process.env.FB_AUTH_DOMAIN),
        FB_DATABASE_URL: JSON.stringify(process.env.FB_DATABASE_URL),
        FB_PROJECT_ID: JSON.stringify(process.env.FB_PROJECT_ID)
      })
    );
    return config;
  },
  babel: config => {
    config.plugins.push("@babel/plugin-proposal-class-properties");
    return config;
  }
};
