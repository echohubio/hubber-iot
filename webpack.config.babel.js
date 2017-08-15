var path = require('path'); // eslint-disable-line no-var
var nodeExternals = require('webpack-node-externals'); // eslint-disable-line no-var

module.exports = {
  entry: './src/index.js',
  target: 'node',
  output: {
    path: path.join(__dirname, 'dist'),
    library: 'hubber-iot',
    libraryTarget: 'umd',
    filename: 'index.js',
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
};
