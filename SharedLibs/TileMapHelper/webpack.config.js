const path = require("path");
const root = __dirname;
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = function (env, argv) {
  const isDev = argv.mode === "development";

  return {
    context: path.join(root, "src"),
    entry: "./index.ts",
    output: {
      library: {
        name: "TileMapHelper",
        type: "umd",
      },
      filename: "TileMapHelper.js",
      path: path.resolve(root, "../../Extensions/TileMap/helper/"),
      globalObject: '(typeof self !== "undefined" ? self : this)',
    },
    plugins: [new CleanWebpackPlugin()],
    resolve: {
      extensions: [".ts"],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    devtool: isDev ? "eval-source-map" : "source-map",
  };
  module.exports = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true,
        },
      }),
    ],
  },
};
};