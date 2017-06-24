var Webpack = require('webpack');
var path = require('path');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');
var buildPath = path.resolve(__dirname, 'public', 'build');
var mainPath = path.resolve(__dirname, 'app', 'Container');

var config = {

  // We change to normal source mapping
  devtool: 'source-map',
  entry: mainPath,
  output: {
    path: buildPath,
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: [nodeModulesPath],
            query: {
                presets: ['es2015', 'stage-0', 'react']
            }
    },{
      test: /\.css$/,
      loader: 'style!css'
    }]
  },
    resolve : {
        extensions: ['', '.js', '.jsx']
    },
    
    plugins: [
        new Webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        new Webpack.optimize.UglifyJsPlugin()
    ]
};

module.exports = config;