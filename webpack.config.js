const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    app: './src/js/script.js',
    Client: './src/js/Client.js',
    Color: './src/js/Color.js',
    NoteQuota: './src/js/NoteQuota.js',
    util: './src/js/util.js',
    workerTimer: './src/js/workerTimer.js'
  },
  devServer: {
    contentBase: './build'
  },
  plugins: [
    new CleanWebpackPlugin(['build'], { exclude: ['audio', 'jquery.min.js', 'lame.min.js'], verbose: true }),
    new HtmlWebpackPlugin({
      template: './src/html/index.html'
    }),
    new ExtractTextPlugin('[name].css')
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build'),
    publicPath: "/piano/"
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
  },
  optimization: {
    minimize: false
  }
};