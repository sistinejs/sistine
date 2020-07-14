const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackTagsPlugin = require("html-webpack-tags-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const uglifyJsPlugin = require("uglifyjs-webpack-plugin");
// const CopyPlugin = require("copy-webpack-plugin");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

// Read Samples first
function readdir(path) {
  const items = fs.readdirSync(path);
  return items.map(function(item) {
    const file = path;
    if (item.startsWith("/") || file.endsWith("/")) {
      file += item;
    } else {
      file += ("/" + item);
    }
    const stats = fs.statSync(file);
    return {"file": file, "name": item, "stats": stats};
  });
}

module.exports = (_env, options) => {
  console.log("Options: ", options);
  const isDevelopment = options.mode == "development";
  const plugins = [
    // new uglifyJsPlugin(),
    // new BundleAnalyzerPlugin(),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: "Demo List Page",
      myPageHeader: "Demo List",
      chunks: ["home"],
      inject: false,
      filename: path.resolve(__dirname, "dist/demos/index.html"),
      template: path.resolve(__dirname, "demos/index.html"),
    }),
    new HtmlWebpackPlugin({
      inject: false,
      title: "SVG Comparison Demo",
      myPageHeader: "SVG Comparison Demo",
      filename: path.resolve(__dirname, "dist/demos/svgcmp/index.html"),
      template: path.resolve(__dirname, "demos/svgcmp/index.html"),
      chunks: ["svgcmp"]
    }),
    new HtmlWebpackTagsPlugin({
      files: [ "svgcmp.html" ],
      tags: [
        "./ext/spectrum/spectrum.css",
        "./ext/slider/jquery.limitslider.js",
        "./ext/spectrum/spectrum.js",

        "./src/svgcmp/css/svgcmp.css",
        "./src/svgcmp/scripts/svgcmp.js",
      ],
      append: true
    }),
    /*
    new HtmlWebpackPlugin({
      inject: false,
      title: "Painting Application Demo",
      myPageHeader: "Painting Application Demo",
      filename: path.resolve(__dirname, "dist/demos/paint/index.html"),
      template: path.resolve(__dirname, "demos/paint/index.html"),
      chunks: ["paint"]
    }),
    new HtmlWebpackTagsPlugin({
      files: [ "paint.html" ],
      tags: [
        "./src/ext/spectrum/spectrum.css",
        "./src/ext/slider/jquery.limitslider.js",
        "./src/ext/spectrum/spectrum.js",

        "./src/paint/css/paint.css",
        "./src/paint/css/sidebars.css",
        "./src/paint/css/menubar.css",
        "./src/paint/css/toolbars.css",
        "./src/paint/css/panels.css",
        "./src/paint/scripts/App.js",
        "./src/paint/scripts/components/Panel.js",
        "./src/paint/scripts/components/ShapesPanel.js",
        "./src/paint/scripts/components/Toolbar.js",
        "./src/paint/scripts/components/NumericSlider.js",
        "./src/paint/scripts/components/FillPropertiesPanel.js",
        "./src/paint/scripts/components/TextPropertiesPanel.js",
        "./src/paint/scripts/components/LayoutPropertiesPanel.js",
        "./src/paint/scripts/components/StrokePropertiesPanel.js",
        "./src/paint/scripts/components/PaintStylePanel.js",
        "./src/paint/scripts/components/GradientStylePanel.js",
        "./src/paint/scripts/components/Sidebar.js",
        "./src/paint/scripts/events.js",
        "./src/paint/scripts/actions.js",
        "./src/paint/scripts/stage.js",
      ],
      append: true
    }),
    */
    // new webpack.ProvidePlugin({ $: "jquery", jQuery: "jquery" }),
    new webpack.HotModuleReplacementPlugin()
  ];
  if (!isDevelopment) {
    plugins.splice(0, 0, new uglifyJsPlugin());
  }

  var webpackConfigs = {
    entry: {
      lib: "./src/index.ts",
      demos: "./src/index.ts",
      svgcmp: "./src/svgcmp/index.ts",
      // paint: "./src/paint/index.ts",
    },
    optimization: {
      splitChunks: {
        chunks: "all"
      },
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "sistine.js",
      library: "Sistine",
      libraryTarget: "umd",
      libraryExport: "default",
      umdNamedDefine: true,
      // publicPath: "/static",
    },
    module: {
      rules: [
        // The rule for rendering page-hbs.html from a handlebars template.
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ["babel-loader"]
        },
        {
          test: /\.ts$/,
          exclude: [
            /node_modules/,
          ],
          use: ["ts-loader"]
        },
        {
          test: /\.module\.s(a|c)ss$/,
          loader: [
            isDevelopment ? "style-loader" : MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                modules: true,
                sourceMap: isDevelopment
              }
            },
            {
              loader: "sass-loader",
              options: {
                sourceMap: isDevelopment
              }
            }
          ]
        },
        {
          test: /\.s(a|c)ss$/,
          exclude: /\.module.(s(a|c)ss)$/,
          loader: [
            isDevelopment ? "style-loader" : MiniCssExtractPlugin.loader,
            "css-loader",
            {
            loader: "sass-loader",
            options: {
              sourceMap: isDevelopment
            }
            }
          ]
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: [ "url-loader" ]
        }
      ]
    },
    plugins: plugins,
    resolve: {
      extensions: [".js", ".jsx", ".ts", ".tsx", ".scss"]
    }
  };
  if (isDevelopment) {
    webpackConfigs.devtool = "inline-source-map";
    webpackConfigs.devServer = {
      hot: true,
      serveIndex: true,
      before: function(app, server) {
        app.get(/\/dir\/.*/, function(req, res) {
          const path = "./" + req.path.substr(5);
          console.log("Listing dir: ", path);
          const listing = readdir(path);
          res.json({ entries: listing });
        });
      }
    }
  }
  return webpackConfigs;
};
