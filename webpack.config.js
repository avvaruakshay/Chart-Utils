const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const extractSass = new ExtractTextPlugin({
  filename: "styles.css",
});

module.exports = {
    entry: './src/index.js',

    plugins: [
        new ExtractTextPlugin("styles.css"),
        new HtmlPlugin({
            filename: 'index.html',
            template: './index.html'
        }),
        extractSass // Enabling HMR
    ],

    module: {
        rules: [{
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    use: "css-loader",
                    fallback: "style-loader"
                })
            },
            {
                test: /\.(scss|sass)$/,
                use: extractSass.extract({
                use: [{
                    loader: "css-loader"
                }, {
                    loader: "sass-loader"
                }],
                fallback: "style-loader"
            })
        }]
        // {
        //     test: /\.(jpe?g|png|gif|svg)$/i,
        //     use: [
        //       'file-loader?name=images/[name].[ext]',
        //       'image-webpack-loader?bypassOnDebug'
        //     ]
        // }]
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js?[hash]'
    },
    watch: true
};