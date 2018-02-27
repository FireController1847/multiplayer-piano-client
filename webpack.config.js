const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    app: './src/js/app.js'
  },
  devServer: {
    contentBase: './build'
  },
  plugins: [
    new CleanWebpackPlugin(['build'], { exclude: ['audio'], verbose: true }),
    new UglifyJSPlugin(),
    new HtmlWebpackPlugin({
      template: './src/html/index.html'
    }),
    new ExtractTextPlugin('[name].css')
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: { loader: 'css-loader', options: { minimize: true } }
        })
      }
    ]
  }
};