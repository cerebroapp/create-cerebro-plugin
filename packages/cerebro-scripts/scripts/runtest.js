import createJestConfig from './utils/createJestConfig.js';
import spawn from 'cross-spawn'
import paths from '../config/paths.js';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => { throw err });

const argv = process.argv.slice(2);

// Watch unless on CI or in coverage mode
if (!process.env.CI && argv.indexOf('--coverage') < 0) {
  argv.push('--watch');
}

argv.push(
  '--config',
  JSON.stringify(
    createJestConfig(paths.pluginPath)
  )
);

spawn.sync(
  "node --experimental-vm-modules node_modules/jest/bin/jest.js", 
  argv,
  { stdio: 'inherit' }
)