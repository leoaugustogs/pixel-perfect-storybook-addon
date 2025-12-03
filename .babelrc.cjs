module.exports = {
  presets: [
    "@babel/preset-typescript",
    "@babel/preset-react",
  ],
  env: {
    cjs: {
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              node: "14",
            },
            exclude: [
              "@babel/plugin-transform-regenerator",
              "@babel/plugin-transform-async-to-generator"
            ]
          }
        ],
      ],
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
            targets: {
              esmodules: true,
            },
            bugfixes: true,
            exclude: [
              "@babel/plugin-transform-regenerator",
              "@babel/plugin-transform-async-to-generator"
            ]
          },
        ],
      ],
    },
  },
};