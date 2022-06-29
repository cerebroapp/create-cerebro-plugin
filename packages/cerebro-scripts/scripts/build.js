'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

import spawn from 'cross-spawn'
import fs from 'fs'

import paths from '../config/paths.js'

console.log(`Building Cerebro plugin into ${paths.dist}`)

if (!fs.existsSync(paths.dist)) {
  console.log(`   ${paths.dist} directory doesn't exist. Creating`)
  fs.mkdirSync(paths.dist)
}

console.log('    Bundling all files...')
spawn.sync(
  paths.webpackBin,
  ['--config', paths.webpackConfig, '--mode=production'],
  { stdio: 'inherit' }
)

console.log(`    Done! Your plugin is ready to publish`)

