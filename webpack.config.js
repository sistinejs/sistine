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

        "./demos/svgcmp/css/svgcmp.css",
        "./demos/svgcmp/scripts/svgcmp.js",
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
        "./demos/ext/spectrum/spectrum.css",
        "./demos/ext/slider/jquery.limitslider.js",
        "./demos/ext/spectrum/spectrum.js",

        "./demos/paint/css/paint.css",
        "./demos/paint/css/sidebars.css",
        "./demos/paint/css/menubar.css",
        "./demos/paint/css/toolbars.css",
        "./demos/paint/css/panels.css",
        "./demos/paint/scripts/App.js",
        "./demos/paint/scripts/components/Panel.js",
        "./demos/paint/scripts/components/ShapesPanel.js",
        "./demos/paint/scripts/components/Toolbar.js",
        "./demos/paint/scripts/components/NumericSlider.js",
        "./demos/paint/scripts/components/FillPropertiesPanel.js",
        "./demos/paint/scripts/components/TextPropertiesPanel.js",
        "./demos/paint/scripts/components/LayoutPropertiesPanel.js",
        "./demos/paint/scripts/components/StrokePropertiesPanel.js",
        "./demos/paint/scripts/components/PaintStylePanel.js",
        "./demos/paint/scripts/components/GradientStylePanel.js",
        "./demos/paint/scripts/components/Sidebar.js",
        "./demos/paint/scripts/events.js",
        "./demos/paint/scripts/actions.js",
        "./demos/paint/scripts/stage.js",
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
      demos: "./demos/index.ts",
      svgcmp: "./demos/svgcmp/index.ts",
      // paint: "./demos/paint/index.ts",
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
