'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const spawn = require('cross-spawn')
const fs = require('fs')

const paths = require('../config/paths')

console.log(`Building Cerebro plugin into ${paths.dist}`)

if (!fs.existsSync(paths.dist)) {
  console.log(`   ${paths.dist} directory doesn't exist. Creating`)
  fs.mkdirSync(paths.dist)
}

console.log('    Bundling all files...')
spawn.sync(
  paths.webpackBin, 
  ['--config', paths.webpackConfig],
  { stdio: 'inherit' }
)

console.log('    Minify build...')
spawn.sync(
  paths.babiliBin,
  [paths.dist, '-d', paths.dist, '--compact', '--no-comments'],
  { stdio: 'inherit' }
)

console.log(`    Done! You plugin is ready to publish`)