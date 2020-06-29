const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const uglifyJsPlugin = require('uglifyjs-webpack-plugin');
// const CopyPlugin = require('copy-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = (_env, options) => {
    console.log("Options: ", options);
    var isDevelopment = options.mode == "development"
    var plugins = [
        // new uglifyJsPlugin(),
        // new BundleAnalyzerPlugin(),
        new CleanWebpackPlugin(),
        // new webpack.ProvidePlugin({ $: "jquery", jQuery: "jquery" }),
        new webpack.HotModuleReplacementPlugin()
    ];
    if (!isDevelopment) {
        plugins.splice(0, 0, new uglifyJsPlugin());
    }

    var webpack_configs = {
        entry: {
            lib: './src/index.ts',
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'sistine.js',
            library: 'Sistine',
            libraryTarget: 'umd',
            libraryExport: 'default',
            // publicPath: "/static",
        },
        optimization: {
            runtimeChunk: true
        },
        module: {
            rules: [
                // The rule for rendering page-hbs.html from a handlebars template.
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
                    test: /\.(png|svg|jpg|gif)$/,
                    use: [ 'url-loader' ]
                }
            ]
        },
        plugins: plugins,
        resolve: {
            extensions: ['.js', '.jsx', '.ts', ]
        }
    };
    if (isDevelopment) {
        webpack_configs.devtool = 'inline-source-map';
    }
    return webpack_configs;
};

