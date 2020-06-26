const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const uglifyJsPlugin = require('uglifyjs-webpack-plugin');
// const CopyPlugin = require('copy-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// Read Samples first
function readdir(path) {
    var items = fs.readdirSync(path);
    return items.map(function(item) {
        var file = path;
        if (item.startsWith("/") || file.endsWith("/")) {
            file += item;
        } else {
            file += ('/' + item);
        }
        var stats = fs.statSync(file);
        return {'file': file, 'name': item, 'stats': stats};
    });
}

module.exports = (env, options) => {
    console.log("Options: ", options);
    var isDevelopment = options.mode == "development"
    var plugins = [
        // new uglifyJsPlugin(),
        // new BundleAnalyzerPlugin(),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: "Demo List Page",
            myPageHeader: "Demo List",
            template: path.resolve(__dirname, 'src/demos/index.html'),
        }),
        new HtmlWebpackPlugin({
            inject: "head",
            title: "SVG Comparison Demo",
            myPageHeader: "SVG Comparison Demo",
            template: path.resolve(__dirname, 'src/demos/svgcmp/index.html'),
            filename: "svgcmp.html"
        }),
        new HtmlWebpackPlugin({
            title: "Painting Application Demo",
            myPageHeader: "Painting Application Demo",
            template: path.resolve(__dirname, 'src/demos/paint/index.ejs'),
            filename: "paint.html"
        }),
        new HtmlWebpackTagsPlugin({
            files: [ "svgcmp.html" ],
            tags: [
                "./src/ext/spectrum/spectrum.css",
                "./src/ext/slider/jquery.limitslider.js",
                "./src/ext/spectrum/spectrum.js",

                "./src/demos/svgcmp/css/svgcmp.css",
                "./src/demos/svgcmp/scripts/svgcmp.js",
            ],
            append: true
        }),
        new HtmlWebpackTagsPlugin({
            files: [ "paint.html" ],
            tags: [
                "./src/ext/spectrum/spectrum.css",
                "./src/ext/slider/jquery.limitslider.js",
                "./src/ext/spectrum/spectrum.js",

                "./src/demos/paint/css/paint.css",
                "./src/demos/paint/css/sidebars.css",
                "./src/demos/paint/css/menubar.css",
                "./src/demos/paint/css/toolbars.css",
                "./src/demos/paint/css/panels.css",
                "./src/demos/paint/scripts/App.js",
                "./src/demos/paint/scripts/components/Panel.js",
                "./src/demos/paint/scripts/components/ShapesPanel.js",
                "./src/demos/paint/scripts/components/Toolbar.js",
                "./src/demos/paint/scripts/components/NumericSlider.js",
                "./src/demos/paint/scripts/components/FillPropertiesPanel.js",
                "./src/demos/paint/scripts/components/TextPropertiesPanel.js",
                "./src/demos/paint/scripts/components/LayoutPropertiesPanel.js",
                "./src/demos/paint/scripts/components/StrokePropertiesPanel.js",
                "./src/demos/paint/scripts/components/PaintStylePanel.js",
                "./src/demos/paint/scripts/components/GradientStylePanel.js",
                "./src/demos/paint/scripts/components/Sidebar.js",
                "./src/demos/paint/scripts/events.js",
                "./src/demos/paint/scripts/actions.js",
                "./src/demos/paint/scripts/stage.js",
            ],
            append: true
        }),
        // new webpack.ProvidePlugin({ $: "jquery", jQuery: "jquery" }),
        new webpack.HotModuleReplacementPlugin()
    ];
    if (!isDevelopment) {
        plugins.splice(0, 0, new uglifyJsPlugin());
    }

    var output = {
        library: 'Sistine',
        libraryTarget: 'umd',
        libraryExport: 'default',
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js'
    };
    if (isDevelopment) {
        output.filename = "[name].js";
    }

    var webpack_configs = {
        entry: './src/index.ts',
        output: output,
        module: {
            rules: [
                // The rule for rendering index.html from an ejs template.
                {
                  // test: /\/src\/demos\/.*index.ejs$/,
                  test: /\/src\/.*index.ejs$/,
                  use: [{
                    loader: 'extract-loader'
                  },
                  {
                    loader: 'html-loader',
                    options: {
                      // interpolate: 'require'
                    }
                  },
                  {
                    loader: 'render-template-loader',
                    options: {
                      engine: 'ejs',
                      locals: {
                        title: 'Render Template Loader',
                        desc: 'Rendering templates with a Webpack loader since 2017'
                      },
                      engineOptions: function (info) {
                        // Ejs wants a filename for partials rendering.
                        // (Configuring a "views" option can also be done.)
                        return { filename: info.filename }
                      }
                    }
                  }]
                },
                // The rule for rendering page-hbs.html from a handlebars template.
                {
                  test: /\.hbs$/,
                  use: [{
                    loader: 'file-loader?name=[name]-[ext].html'
                  },
                  {
                    loader: 'extract-loader'
                  },
                  {
                    loader: 'render-template-loader',
                    options: {
                      engine: 'handlebars',
                      init: function (engine, info) {
                        engine.registerPartial(
                          'body',
                          fs.readFileSync('./src/body.hbs').toString()
                        )
                      },
                      locals: {
                        title: 'Rendered with Handlebars!',
                        desc: 'Partials Support'
                      },
                    }
                  }]
                },
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: ['babel-loader']
                },
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: ['ts-loader']
                },
                {
                    test: /\.module\.s(a|c)ss$/,
                    loader: [
                      isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
                      {
                        loader: 'css-loader',
                        options: {
                          modules: true,
                          sourceMap: isDevelopment
                        }
                      },
                      {
                        loader: 'sass-loader',
                        options: {
                          sourceMap: isDevelopment
                        }
                      }
                    ]
                },
                {
                    test: /\.(png|svg|jpg|gif)$/,
                    use: [ 'url-loader' ]
                }
            ]
        },
        plugins: plugins,
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss']
        }
    };
    if (isDevelopment) {
        webpack_configs.devtool = 'inline-source-map';
        webpack_configs.devServer = {
            hot: true,
            before: function(app, server) {
                app.get(/\/dir\/.*/, function(req, res) {
                    var path = "./" + req.path.substr(5);
                    console.log("Listing dir: ", path);
                    var listing = readdir(path);
                    res.json({ entries: listing });
                });
            }
        }
    }
    return webpack_configs;
};

