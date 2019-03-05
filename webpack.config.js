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
            template: path.resolve(__dirname, 'src/demo/index.html')
        }),
        new HtmlWebpackIncludeAssetsPlugin({
            assets: [
                "./src/demo/css/demo.css",
                "./src/demo/scripts/stage.js",
                "./src/demo/scripts/elements.js",
                "./src/demo/scripts/inspector.js",
                "./src/demo/scripts/toolbars.js",
                "./src/demo/scripts/sidebars.js",
                "./src/demo/scripts/shapepanel.js"
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
        filename: 'index.js'
    };
    if (options.debug) {
        output.filename = "[name].js";
    }

    var webpack_configs = {
        entry: './src/index.js',
        output: output,
        module: {
            rules: [
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

