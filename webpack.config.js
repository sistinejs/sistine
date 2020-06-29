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
            chunks: ['home'],
            template: path.resolve(__dirname, 'demos/index.html'),
        }),
        new HtmlWebpackPlugin({
            inject: "head",
            title: "SVG Comparison Demo",
            myPageHeader: "SVG Comparison Demo",
            template: path.resolve(__dirname, 'demos/svgcmp/index.html'),
            filename: "svgcmp.html",
            chunks: ['svgcmp']
        }),
        new HtmlWebpackPlugin({
            title: "Painting Application Demo",
            myPageHeader: "Painting Application Demo",
            template: path.resolve(__dirname, 'demos/paint/index.ejs'),
            filename: "paint.html",
            chunks: ['paint']
        }),
        new HtmlWebpackTagsPlugin({
            files: [ "svgcmp.html" ],
            tags: [
                "./demos/ext/spectrum/spectrum.css",
                "./demos/ext/slider/jquery.limitslider.js",
                "./demos/ext/spectrum/spectrum.js",

                "./demos/svgcmp/css/svgcmp.css",
                "./demos/svgcmp/scripts/svgcmp.js",
            ],
            append: true
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
        publicPath: "/static",
        filename: 'index.[name].js'
    };

    var webpack_configs = {
        entry: {
            lib: './src/index.ts',
            demos: './demos/index.ts',
            svgcmp: './demos/svgcmp/index.ts',
            paint: './demos/paint/index.ts',
        },
        optimization: {
            splitChunks: {
                chunks: 'all'
            },
        },
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

