const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/index.js',

    plugins: [
        new webpack.HotModuleReplacementPlugin() // Enabling HMR
    ],

    module: {
        rules: [{
            test: /\.js$/,
            use: 'babel-loader',
            exclude: /node_modules/
        },
        {
            test: /\.js$/,
            use: ['babel-loader'],
            exclude: /node_modules/
        },
        {
            test: /\.css$/,
            use: ['style-loader', 'css-loader', 'postcss-loader']
        },
    ]
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    watch: true
    // devServer: {
    //     hot: true, // Tell th dev-server we're using HMR
    //     contentBase: path.resolve(__dirname, './'),
    //     watchOptions: {
    //         ignored: /node_modules/
    //     }
    // }
};