var webpack = require('webpack');
var path = require('path');

module.exports = {
	context: path.resolve(__dirname, './src/client'),
  entry: [
    './Container'
  ],
  output: {
    path: path.resolve(__dirname, './public'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
			loaders: ['react-hot', 'babel?presets[]=es2015,presets[]=stage-0,presets[]=react']
    }]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
};