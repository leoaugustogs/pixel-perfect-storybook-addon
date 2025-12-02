module.exports = {
  presets: [
    "@babel/preset-env",
    "@babel/preset-typescript",
    "@babel/preset-react",
  ],
  env: {
    cjs: {
      plugins: [
        [
          "babel-plugin-add-import-extension",
          {
            extension: "cjs",
          },
        ],
      ],
    },
    esm: {
      presets: [
        [
          "@babel/preset-env",
          {
            modules: false,
          },
        ],
      ],
    },
  },
};
