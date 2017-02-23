var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: [
    './src/client/game.js',
		'webpack-hot-middleware/client'
  ],
  output: {
    path: __dirname + '/public',
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
			loaders: ['react-hot', 'babel?presets[]=es2015,presets[]=react']
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
	]
};