'use strict';

const path = require('path')

const pluginPath = path.resolve()
const dist = path.resolve('dist')

const webpackBin = path.join(__dirname, '..', 'node_modules', '.bin', 'webpack')
const webpackConfig = path.join(__dirname, '..', 'config', 'webpack.config.js')

const babiliBin = path.join(__dirname, '..', 'node_modules', '.bin', 'babili')


module.exports = {
	pluginPath, dist,
	webpackBin, webpackConfig,
	babiliBin
}