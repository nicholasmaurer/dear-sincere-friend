const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ASSET_PATH = process.env.ASSET_PATH || '/';
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: {
    app: './src/index.js',
    print: './src/print.js'
  },
  devtool: 'inline-source-map',
  devServer: {
  contentBase: './dist'
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      title: 'Dear Sincere Friend',
      hash: true,
      template: './src/index.html',
      filename: './index.html' //relative to root of the application
    }),
    new CopyWebpackPlugin([{ from: 'src/assets', to: './assets'}], { copyUnmodified: true })
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, "dist"),
    publicPath: ASSET_PATH
  },
  module: {
    rules: [
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ["file-loader"]
      },
      {
        test: /\.css$/,
        use: [
        'style-loader',
        'css-loader']
      }
    ]
  }
};
