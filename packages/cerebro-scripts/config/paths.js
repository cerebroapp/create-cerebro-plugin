'use strict';

const path = require('path')

const pluginPath = path.resolve()
const dist = path.resolve('dist')

const webpackBin = path.join(__dirname, '..', 'node_modules', '.bin', 'webpack')
const webpackConfig = path.join(__dirname, '..', 'config', 'webpack.config.js')

const babiliBin = path.join(__dirname, '..', 'node_modules', '.bin', 'babili')

const testsSetup = path.resolve(pluginPath, 'setupTests.js')

const appPackageJson = path.resolve(pluginPath, 'package.json')


module.exports = {
	appPackageJson,
	pluginPath, dist,
	webpackBin, webpackConfig,
	babiliBin, testsSetup
}