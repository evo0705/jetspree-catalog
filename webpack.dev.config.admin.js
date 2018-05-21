const path = require("path")
const webpack = require("webpack")
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const applicationConfig = require("./config/admin.js")
const applicationText = require("./locales/admin/" + applicationConfig.language + ".json")

module.exports = {
  entry: {
    app:    path.resolve(__dirname, "src/admin/client/index.js"),
    vendor: [
      "react",
      "react-dom",
      "react-redux",
      "redux-thunk",
      "react-router-dom",
      "react-dropzone",
      "redux",
      "redux-form",
      "redux-form-material-ui",
      "material-ui",
    ],
  },

  output: {
    publicPath:    "/",
    path:          path.resolve(__dirname, "public"),
    filename:      "admin-assets/js/[name]-[hash].js",
    chunkFilename: "admin-assets/js/[name]-[hash].js",
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks:  "initial",
          name:    "vendor",
          test:    "vendor",
          enforce: true,
        },
      },
    },
  },

  resolve: {
    alias: {
      src:     path.resolve(__dirname, "src/admin/client"),
      routes:  path.resolve(__dirname, "src/admin/client/routes"),
      modules: path.resolve(__dirname, "src/admin/client/modules"),
      lib:     path.resolve(__dirname, "src/admin/client/lib"),
    },
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
    new ExtractTextPlugin("admin-assets/css/bundle-[contenthash].css"),
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
    publicPath:         path.join(__dirname, "public"),
    contentBase:        path.join(__dirname, "public"),
    historyApiFallback: {
      rewrites: [
        { from:"/*", to:"/admin/index.html"}
      ]
    },
    hot:                true,
  },
}
