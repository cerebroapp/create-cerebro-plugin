'use strict';

import path from 'path'
import fs from 'fs'

const pluginPath = path.resolve()
const dist = path.resolve('dist')
const __dirname = path.join(pluginPath, 'node_modules', 'cerebro-scripts')

const webpackBin = path.join(__dirname, 'node_modules', '.bin', 'webpack')

let webpackConfig = ''
if (fs.existsSync(path.join(pluginPath, 'webpack.config.js'))) {
	webpackConfig = path.join(pluginPath, 'webpack.config.js')
} else {
	webpackConfig = path.join(__dirname, 'config', 'webpack.config.js')
}

const babiliBin = path.join(__dirname, 'node_modules', '.bin', 'babili')

const testsSetup = path.resolve(pluginPath, 'setupTests.js')

const appPackageJson = path.resolve(pluginPath, 'package.json')


export default {
	appPackageJson,
	pluginPath, dist,
	webpackBin, webpackConfig,
	babiliBin, testsSetup
}