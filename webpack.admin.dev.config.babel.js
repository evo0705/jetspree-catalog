import webpack from "webpack"
import path from "path"
import HtmlWebpackPlugin from "html-webpack-plugin"
import ExtractTextPlugin from "extract-text-webpack-plugin"

const applicationConfig = require("./config/admin.js")
const applicationText = require("./locales/admin/" + applicationConfig.language + ".json")

const BUILD_DIR = path.resolve(__dirname, "build")
const APP_DIR = path.resolve(__dirname, "src")

export default {
  entry:        APP_DIR + "/admin/client/index.js",

  output:       {
    publicPath:    "/",
    path:          BUILD_DIR,
    filename:      "js/[name]-[hash].js",
    chunkFilename: "js/[name]-[hash].js",
  },

  module:       {
    rules: [
      {
        test:    /\.js?/,
        include: APP_DIR,
        use:     "babel-loader",
      },
      {
        test: /\.css$/,
        use:  ["style-loader", "css-loader"],
      },
      {
        test:    /\.(png|jpg|gif)$/,
        use:     "file-loader?name=images/img-[hash:6].[ext]&publicPath=/",
        exclude: /node_modules/,
      },
    ],
  },

  resolve:      {
    alias: {
      src:     path.resolve(__dirname, "src/admin/client"),
      routes:  path.resolve(__dirname, "src/admin/client/routes"),
      modules: path.resolve(__dirname, "src/admin/client/modules"),
      lib:     path.resolve(__dirname, "src/admin/client/lib"),
    },
  },

  plugins:      [
    new webpack.DefinePlugin({ APPLICATION_CONFIG: JSON.stringify(applicationConfig) }),
    new webpack.DefinePlugin({ APPLICATION_TEXT: JSON.stringify(applicationText) }),
    new ExtractTextPlugin("public/admin-assets/css/bundle-[hash].css"),
    new HtmlWebpackPlugin({
      template: "src/admin/client/index.html",
      language: applicationConfig.language,
      inject:   "body",
      filename: "index.html",
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
    historyApiFallback: true,
  },

  devtool:   "#eval-source-map",
}
