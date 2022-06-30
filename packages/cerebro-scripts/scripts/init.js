'use strict';
// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import { createRequire } from 'module';
import paths from '../config/paths';
const require = createRequire(import.meta.url);

export default async function(appPath, appName, originalDirectory) {
  const ownPackageName = require(path.join(
    paths.ownPath,
    'package.json'
  )).name;
  const ownPath = paths.ownPath;
  const appPackage = require(path.join(appPath, 'package.json'));

  // Copy over some of the devDependencies
  appPackage.dependencies = appPackage.dependencies || {};
  appPackage.devDependencies = appPackage.devDependencies || {};

  appPackage.main = 'dist/index.js';

  appPackage.keywords = ["cerebro", "cerebro-plugin"]

  // Setup the script rules
  appPackage.scripts = {
    start: 'cerebro-scripts start',
    build: 'cerebro-scripts build',
    test: 'cerebro-scripts test',
    clear: "cerebro-scripts clear",
    prepublish: "yarn clear && yarn build"
  };

  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2)
  );

  // Copy the files for the user
  const templatePath = path.join(ownPath, 'template');
  if (fs.existsSync(templatePath)) {
    fs.copySync(templatePath, appPath);
  } else {
    console.error(
      `Could not locate supplied template: ${chalk.green(templatePath)}`
    );
    return;
  }

  // Rename gitignore and npmignore files to .npmignore and .gitignore
  // See: https://github.com/npm/npm/issues/1862    
  ['npmignore', 'gitignore'].forEach(ignoreFile => {
    fs.move(
      path.join(appPath, ignoreFile),
      path.join(appPath, `.${ignoreFile}`),
      [],
      err => {
        if (err) {
          // Append if there's already a `.gitignore` or `.npmignore` file there    
          if (err.code === 'EEXIST') {
            const data = fs.readFileSync(path.join(appPath, ignoreFile));
            fs.appendFileSync(path.join(appPath, `.${ignoreFile}`), data);
            fs.unlinkSync(path.join(appPath, ignoreFile));
          } else {
            throw err;
          }
        }
      }
    );
  })

  // Display the most elegant way to cd.
  // This needs to handle an undefined originalDirectory for
  // backward compatibility with old global-cli's.
  let cdpath;
  if (originalDirectory && path.join(originalDirectory, appName) === appPath) {
    cdpath = appName;
  } else {
    cdpath = appPath;
  }

  console.log();
  console.log(`Success! Created plugin structure for ${appName} at ${appPath}`);
  console.log('Inside that directory, you can run several commands:');
  console.log();
  console.log(chalk.cyan(`  yarn start`));
  console.log('    Starts the development process of plugin.');
  console.log();
  console.log(
    chalk.cyan(`  yarn build`)
  );
  console.log('    Build your plugin before publishing it');
  console.log();
  console.log(chalk.cyan(`  yarn test`));
  console.log('    Starts the test runner.');
  console.log();
  console.log('We suggest that you begin by typing:');
  console.log();
  console.log(chalk.cyan('  cd'), cdpath);
  console.log(`  ${chalk.cyan(`yarn start`)}`);
  console.log();
  console.log('Happy hacking!');
}