const {resolve} = require('path')

module.exports = {
  mode: 'production',
  entry: './lib',
  output: {
    library: 'SyncanoClient',
    libraryTarget: 'umd',
    filename: 'index.js',
    path: resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
}
