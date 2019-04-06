const path = require('path');
const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const uglifyJsPlugin = require('uglifyjs-webpack-plugin');
// const CleanWebpackPlugin = require("clean-webpack-plugin");

module.exports = (env, options) => {
    console.log("Options: ", options);
    var plugins = [
        // new uglifyJsPlugin(),
        // new CleanWebpackPlugin('dist'),
        new HTMLWebpackPlugin({
            title: "Demo List Page",
            myPageHeader: "Demo List",
            template: path.resolve(__dirname, 'src/demos/index.ejs'),
        }),


        // Items for svgcmp demo
        new HTMLWebpackPlugin({
            hash: true,
            title: "SVG Comparison Demo",
            myPageHeader: "SVG Comparison Demo",
            template: path.resolve(__dirname, 'src/demos/svgcmp/index.ejs'),
            filename: "svgcmp.html"
        }),
        new HtmlWebpackIncludeAssetsPlugin({
            files: [ "svgcmp.html" ],
            assets: [
                "./src/ext/spectrum/spectrum.css",
                "./src/ext/slider/jquery.limitslider.js",
                "./src/ext/spectrum/spectrum.js",

                "./src/demos/svgcmp/css/svgcmp.css",
            ],
            append: true
        }),


        // Items for paint demo
        new HTMLWebpackPlugin({
            hash: true,
            title: "Painting Application Demo",
            myPageHeader: "Painting Application Demo",
            template: path.resolve(__dirname, 'src/demos/paint/index.ejs'),
            filename: "paint.html"
        }),
        new HtmlWebpackIncludeAssetsPlugin({
            files: [ "paint.html" ],
            assets: [
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
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),
        new webpack.HotModuleReplacementPlugin()
    ];
    if (options.mode == "production") {
        plugins.splice(0, 0, new uglifyJsPlugin());
    } else if (options.debug) {
        const CleanWebpackPlugin = require("clean-webpack-plugin");
        plugins.splice(0, 0, new CleanWebpackPlugin('dist'));
    }

    var output = {
        library: 'Sistine',
        libraryTarget: 'umd',
        libraryExport: 'default',
        path: path.resolve(__dirname, 'dist'),
        filename: '/index.js'
    };
    if (options.debug) {
        output.filename = "[name].js";
    }

    var webpack_configs = {
        entry: './src/index.js',
        output: output,
        module: {
            rules: [
                // The rule for rendering index.html from an ejs template.
                {
                  test: /\/src\/demos\/.*index.ejs$/,
                  use: [{
                    loader: 'extract-loader'
                  },
                  {
                    loader: 'html-loader',
                    options: {
                      interpolate: 'require'
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
                    test: /\.scss$/,
                    use: [
                        'style-loader', 
                        'css-loader', 
                        'postcss-loader', 
                        'sass-loader'
                    ]
                },
                {
                    test: /\.(png|svg|jpg|gif)$/,
                    use: [ 'url-loader' ]
                }
            ]
        },
        plugins: plugins
    };
    if (options.debug) {
        options.devtool = 'inline-source-map';
        options.devServer = { hot: true };
        options.resolve = { extensions: ['.js', '.jsx'] };
    }
    return webpack_configs;
};

