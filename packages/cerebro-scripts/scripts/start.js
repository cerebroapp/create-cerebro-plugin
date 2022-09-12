import spawn from 'cross-spawn'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { createRequire } from "module";

import paths from '../config/paths.js'

/** Makes the script crash on unhandled rejections instead of silently
 * ignoring them. In the future, promise rejections that are not handled will
 * terminate the Node.js process with a non-zero exit code.
 */
process.on('unhandledRejection', err => { throw err });

const require = createRequire(import.meta.url);
const pkgJson = require(path.resolve("package.json"));


const appName = 'Cerebro'
const homeDir = os.homedir()
const pluginName = pkgJson.name

let symlinkPath

if (process.platform === 'darwin') {
  symlinkPath = path.join(
    homeDir,
    'Library',
    'Application Support',
    appName,
    'plugins',
    'node_modules',
    pluginName
  )
} else if (process.platform === 'win32') {
  symlinkPath = path.join(
    process.env.APPDATA,
    appName,
    'plugins',
    'node_modules',
    pluginName
  )
} else {
  symlinkPath = path.join(
    homeDir,
    '.config',
    appName,
    'plugins',
    'node_modules',
    pluginName
  )
}

console.group('Start plugin development')
if (fs.existsSync(symlinkPath)) {
  console.log('Symlink already exist')
  removeSymlink()
}

console.log('Create symlink')
fs.symlinkSync(paths.pluginPath, symlinkPath, process.platform === 'win32' ? 'junction' : 'file')

function removeSymlink() {
  console.log('Removing symlink')
  fs.unlinkSync(symlinkPath)
}

// Handle ctrl+c to remove symlink to plugin
process.on('SIGHUP', removeSymlink);
process.on('SIGINT', removeSymlink);
process.on('SIGTERM', removeSymlink);
process.on('SIGBREAK', removeSymlink);

console.log('Starting webpack...')
spawn.sync(
  paths.webpackBin, 
  ['--config', paths.webpackConfig, '--watch', '--mode=development'],
  { stdio: 'inherit' }
)
