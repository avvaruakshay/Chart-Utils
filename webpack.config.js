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
            use: ['babel-loader'],
            exclude: /node_modules/
        },
        {
          test: /\.(sass|scss)$/,
          use: ['sass-loader', 'node-sass']
        },
        {
            test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
            use: [{
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'fonts/',    // where the fonts will go
                publicPath: '../'       // override the default path
              }
            }]
        },
        {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }]
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    watch: true
};