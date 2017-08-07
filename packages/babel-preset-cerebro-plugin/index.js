'use strict';

const plugins = [
  [
    require.resolve('babel-plugin-transform-object-rest-spread'),
    {
      useBuiltIns: true,
    },
  ],
  [
    require.resolve('babel-plugin-transform-react-jsx'),
    {
      useBuiltIns: true,
    },
  ],
  require('babel-plugin-syntax-jsx'),
  require('babel-plugin-transform-es2015-classes')
]

var env = process.env.BABEL_ENV || process.env.NODE_ENV;

if (env === 'test') {
  plugins.push.apply(plugins, [
    require.resolve('babel-plugin-transform-es2015-modules-commonjs'),
    require.resolve('babel-plugin-dynamic-import-node'),
  ]);
}

module.exports = {
  plugins: plugins
}