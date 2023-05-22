/** @type { import('@storybook/react-webpack5').StorybookConfig } */

import webpackConfig from "../packages/extension/webpack.config.cjs";

const config = {
  "stories": [
    "../packages/**/*.mdx",
    "../packages/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions"
  ],
  "framework": {
    "name": "@storybook/react-webpack5",
    "options": {}
  },
  "docs": {
    "autodocs": "tag"
  },
  webpackFinal: async (config) => {
    return {
      ...config,
      resolve: { ...config.resolve, alias: {...config.resolve.alias, ...webpackConfig.resolve.alias} },
    };
  },
};
export default config;