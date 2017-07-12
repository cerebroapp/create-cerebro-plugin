'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const spawn = require('cross-spawn')
const path = require('path')
const fs = require('fs')

const paths = require('../config/paths')

const appName = process.argv[2] === 'dev' ? 'Electron' : 'Cerebro'

const homeDir = require('os').homedir()

const pluginName = require(path.join(paths.pluginPath, 'package.json')).name

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
    appname,
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

console.log('Start plugin development')
if (fs.existsSync(symlinkPath)) {
  console.log('   Symlink already exist')
  removeSymlink()
}

console.log('   Create symlink')
fs.symlinkSync(paths.pluginPath, symlinkPath)

// Handle ctrl+c to remove symlink to plugin
process.on('SIGHUP', removeSymlink);
process.on('SIGINT', removeSymlink);
process.on('SIGTERM', removeSymlink);
process.on('SIGBREAK', removeSymlink);


console.log('   Starting webpack...')
const result = spawn.sync(
  paths.webpackBin, 
  ['--config', paths.webpackConfig, '--watch'],
  { stdio: 'inherit' }
)

function removeSymlink() {
  console.log('   Removing symlink')
  fs.unlinkSync(symlinkPath)
}
