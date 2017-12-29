const path = require('path');
const nodeExternals = require('webpack-node-externals');
const MinifyPlugin = require('babel-minify-webpack-plugin');
const WebpackMonitor = require('webpack-monitor');

module.exports = {
  entry: './src/index.js',
  target: 'node',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        loader: 'eslint-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new MinifyPlugin(),
    new WebpackMonitor({
      target: '../.monitor.json',
    }),
  ],
};
