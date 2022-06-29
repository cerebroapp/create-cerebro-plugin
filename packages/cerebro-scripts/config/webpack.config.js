import webpack from  'webpack'
import path from  'path'

import paths from  './paths.js'

export default {
  entry: {
    index: './src/index'
  },

  target: 'electron19-renderer',

  output: {
    path: paths.dist,
    library: {
      type: 'commonjs2'
    },
    filename: 'index.js'
  },
  resolve: {
    extensions: ['.js'],
    modules: [
      path.resolve('./src'),
      path.resolve('./node_modules'),
    ]
  },
  target: 'electron-renderer',
  externals: ['nodobjc'],
  module: {
    rules: [{
      test: /\.jsx?$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', { targets: "defaults" }]
          ],
          plugins: ['@babel/plugin-proposal-class-properties']
        }
      },
      exclude: (modulePath) => (
        modulePath.match(/node_modules/) && !modulePath.match(/node_modules[\/\\]cerebro-/)
      )
    }, {
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }, {
      test: /\.png$/,
      type: 'asset/inline'
    }]
  },
  plugins: [
    // Use react and ReactDOM flom global variables 
    // instead of adding them to each plugin separately
    new webpack.ProvidePlugin({
      'window.React': 'react',
      'window.ReactDOM': 'react-dom'
    })
  ]
};
