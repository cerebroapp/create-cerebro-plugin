'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const spawn = require('cross-spawn')
const fs = require('fs-extra');

const paths = require('../config/paths')

if (fs.existsSync(paths.dist)) {
  console.log(`Removing ${paths.dist}...`)
  fs.removeSync(paths.dist)
  console.log(`Done!`)
}