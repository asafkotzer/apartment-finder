const path = require('path');
const inputPath = path.resolve(__dirname, 'management', 'client');
const outputPath = path.resolve(__dirname, 'management', 'public');
const webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  entry: {
    app: [path.resolve(inputPath, 'app.jsx')]
  },
  output: {
    path: outputPath,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
        query:
        {
          presets: ['react', 'stage-0', 'es2015']
        }
      },
      {
        test: /\.html$/,
        loader: 'file?name=[name].[ext]'
      },
      {
        test: /\.scss$|\.css$/,
        loader: 'style!css!sass'
      },
      {
        test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.eot$/,
        loader: 'file'
      }
    ]
  },
  plugins: [ 
    new webpack.ProvidePlugin({
      Promise: 'imports?this=>global!exports?global.Promise!es6-promise',
      fetch: 'imports?this=>global!exports?global.fetch!isomorphic-fetch'
    })
  ]

};
