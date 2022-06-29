'use strict';

process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

import jest from 'jest'
const argv = process.argv.slice(2);

// Watch unless on CI or in coverage mode
if (!process.env.CI && argv.indexOf('--coverage') < 0) {
  argv.push('--watch');
}

// @remove-on-eject-begin
// This is not necessary after eject because we embed config into package.json.
import createJestConfig from './utils/createJestConfig.js';
import path from 'path';
import paths from '../config/paths.js';

argv.push(
  '--config',
  JSON.stringify(
    createJestConfig(
      relativePath => path.resolve(relativePath),
      paths.pluginPath
    )
  )
);
jest.run(argv);