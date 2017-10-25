const path = require('path')
const webpack = require('webpack')

module.exports = [
  {
    entry: './src',
    target: 'web',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'syncano-client.js',
      library: 'SyncanoClient'
    },
    module: {
      rules: [{test: /\.js$/, exclude: /node_modules/, use: ['babel-loader']}]
    },
    plugins: [
      new webpack.LoaderOptionsPlugin({
        minimize: false,
        debug: false
      }),
      new webpack.optimize.UglifyJsPlugin({
        beautify: true,
        mangle: {
          screw_ie8: true, // eslint-disable-line camelcase
          keep_fnames: true // eslint-disable-line camelcase
        },
        comments: false
      })
    ]
  },
  {
    name: 'uglified',
    entry: './src',
    target: 'web',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'syncano-client.min.js',
      library: 'SyncanoClient'
    },
    module: {
      rules: [{test: /\.js$/, exclude: /node_modules/, use: ['babel-loader']}]
    },
    plugins: [
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
      }),
      new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        mangle: {
          screw_ie8: true, // eslint-disable-line camelcase
          keep_fnames: true // eslint-disable-line camelcase
        },
        comments: false
      })
    ]
  }
]
