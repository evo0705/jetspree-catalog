import webpack from "webpack"
import path from "path"
import HtmlWebpackPlugin from "html-webpack-plugin"
import ExtractTextPlugin from "extract-text-webpack-plugin"

const applicationConfig = require("./config/admin.js")
const applicationText = require("./locales/admin/" + applicationConfig.language + ".json")

const BUILD_DIR = path.resolve(__dirname, "build")
const APP_DIR = path.resolve(__dirname, "src")

export default {
  entry: APP_DIR + "/admin/client/index.js",

  output: {
    publicPath:    "/",
    path:          BUILD_DIR,
    filename:      "js/[name]-[hash].js",
    chunkFilename: "js/[name]-[hash].js",
  },

  resolve: {
    alias: {
      src:     path.resolve(__dirname, "src/admin/client"),
      routes:  path.resolve(__dirname, "src/admin/client/routes"),
      modules: path.resolve(__dirname, "src/admin/client/modules"),
      lib:     path.resolve(__dirname, "src/admin/client/lib"),
      ApiClient: path.resolve(__dirname, 'src/api-client'),
    },
    extensions: [".js", ".json", ".jsx"]
  },

  module: {
    rules: [
      {
        test:    /\.(js|jsx)$/,
        exclude: /node_modules/,
        use:     ["babel-loader"],
      }, {
        test:    /\.css$/,
        include: [path.resolve(__dirname, "public")],
        use:     ExtractTextPlugin.extract({
          use: [
            {
              loader:  "css-loader",
              options: {
                modules:       false,
                importLoaders: true,
              },
            },
          ],
        }),
      }, {
        test:    /\.css$/,
        exclude: /node_modules|public/,
        use:     ExtractTextPlugin.extract({
          use: [
            {
              loader:  "css-loader",
              options: {
                modules:        true,
                importLoaders:  true,
                localIdentName: "[name]__[local]___[hash:base64:5]",
              },
            },
          ],
        }),
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({ APPLICATION_CONFIG: JSON.stringify(applicationConfig) }),
    new webpack.DefinePlugin({ APPLICATION_TEXT: JSON.stringify(applicationText) }),
    new ExtractTextPlugin("css/bundle-[hash].css"),
    new HtmlWebpackPlugin({
      template: "src/admin/client/index.html",
      language: applicationConfig.language,
      inject:   "body",
      filename: "admin/index.html",
    }),
    new webpack.BannerPlugin({
      banner:    `Created: ${new Date().toUTCString()}`,
      raw:       false,
      entryOnly: false,
    }),
    new webpack.DefinePlugin({
      "process.env": {
        API_BASE_URL:       JSON.stringify(process.env.API_BASE_URL || "http://localhost:3001/api/v1"),
        API_WEB_SOCKET_URL: JSON.stringify(process.env.API_WEB_SOCKET_URL || "ws://localhost:3001"),
      },
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],

  devServer: {
    contentBase:        path.join(__dirname, "public"),
    historyApiFallback: {
      rewrites: [
        { from: "/admin/*", to: "/admin/index.html" },
      ],
    },
  },

  devtool: "#eval-source-map",
}
