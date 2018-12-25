module.exports = function (api) {

  api.cache(false);

  const presets = [
    "babel-preset-expo",
    "@babel/preset-typescript"
  ];
  const plugins = [
    ["@babel/plugin-proposal-class-properties", { "loose": true }],
    '@babel/plugin-transform-runtime'
  ];

  return {
    presets,
    plugins
  };
}
