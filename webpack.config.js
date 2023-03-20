require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

// const fs = require('fs');
// const where = path.join(__dirname, 'package.json');
// const manifest = fs.readFileSync(where, 'utf-8');
// const pkg = JSON.parse(manifest);

module.exports = (env, argv) => {
    return ({
        stats: 'minimal', // Keep console output easy to read.
        entry: './runtime/sources/main/index.ts', // Your program entry point

        // Your build destination
        output: {
            path: path.resolve(__dirname, 'deploy', 'build'), filename: 'game.[contenthash].js'
        },

        // Config for your testing server
        devServer: {
            compress: true, allowedHosts: 'all', static: false, client: {
                logging: 'warn', overlay: {
                    errors: true, warnings: false,
                }, progress: true,
            }, port: 5678, host: '0.0.0.0'
        },

        // Web games are bigger than pages, disable the warnings that our game is too big.
        performance: {hints: false},

        // Enable sourcemaps while debugging
        devtool: argv.mode === 'development' ? 'eval-source-map' : undefined,

        // Minify the code when making a final build
        optimization: {
            minimize: argv.mode === 'production', minimizer: [new TerserPlugin({
                terserOptions: {
                    ecma: 6, compress: {drop_console: true}, output: {comments: false, beautify: false},
                }
            }), new CssMinimizerPlugin(),],
        },


        // Tell webpack how to do Typescript
        module: {
            rules: [{
                test: /\.ts(x)?$/, loader: 'ts-loader', exclude: /node_modules/
            }, {
                test: /\.css$/i, use: [{
                    loader: MiniCssExtractPlugin.loader,
                }, 'css-loader',],
            }]
        },

        resolve: {
            extensions: ['.tsx', '.ts', '.js', '.json']
        },

        plugins: [// Make an index.html from the template
            new HtmlWebpackPlugin({
                template: 'raw-assets/browser/index.ejs',
                hash: true,
                minify: true,
                favicon: 'raw-assets/browser/favicon.ico'
            }), // Copy our static assets to the final build
            new CopyPlugin({
                patterns: [{from: 'runtime/asset/', to: 'asset/'}],
            }), // Minify Css
            new MiniCssExtractPlugin({
                filename: '[name].[contenthash].css',
            }), // Display in progress
            // new webpack.ProgressPlugin(),
        ],

    });
}