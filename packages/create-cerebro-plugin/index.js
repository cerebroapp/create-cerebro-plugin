#!/usr/bin/env node

const validateProjectName = require('validate-npm-package-name');
const path = require('path');
const fs = require('fs-extra');
const dns = require('dns');
const chalk = require('chalk');
const commander = require('commander');
const packageJson = require('./package.json')
const spawn = require('cross-spawn');
const semver = require('semver');
let pluginName

const program = new commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments('<project-directory>')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .action(name => {
    pluginName = name;
  })
  .on('--help', () => {
    console.log(`    Only ${chalk.green('<project-directory>')} is required.`);
    console.log();
    console.log();
    console.log(
      `    If you have any problems, do not hesitate to file an issue:`
    );
    console.log(
      `      ${chalk.cyan('https://github.com/KELiON/create-cerebro-plugin/issues/new')}`
    );
    console.log();
  })
  .parse(process.argv);

if (typeof pluginName === 'undefined') {
  console.error('Please specify the plugin directory:');
  console.log(
    `  ${chalk.cyan(program.name())} ${chalk.green('<plugin-directory>')}`
  );
  console.log();
  console.log('For example:');
  console.log(`  ${chalk.cyan(program.name())} ${chalk.green('cerebro-spy')}`);
  console.log();
  console.log(
    `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
  );
  process.exit(1);
}

function printValidationResults(results) {
  if (typeof results !== 'undefined') {
    results.forEach(error => {
      console.error(chalk.red(`  *  ${error}`));
    });
  }
}

createPlugin(pluginName);

function createPlugin(name) {
  const root = path.resolve(name);
  const pluginName = path.basename(root);

  checkAppName(pluginName);
  fs.ensureDirSync(name);
  if (!isSafeToCreateProjectIn(root)) {
    console.log(
      `The directory ${chalk.green(name)} contains files that could conflict.`
    );
    console.log('Try using a new directory name.');
    process.exit(1);
  }

  console.log(`Creating a new Cerebro plugin in ${chalk.green(root)}.`);
  console.log();

  const packageJson = {
    name: pluginName,
    version: '0.1.0'
  };
  fs.writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  const originalDirectory = process.cwd();
  process.chdir(root);

  run(root, pluginName, originalDirectory);
}

function checkAppName(pluginName) {
  const validationResult = validateProjectName(pluginName);
  if (!validationResult.validForNewPackages) {
    console.error(
      `Could not create a project called ${chalk.red(`"${pluginName}"`)} because of npm naming restrictions:`
    );
    printValidationResults(validationResult.errors);
    printValidationResults(validationResult.warnings);
    process.exit(1);
  }

  const dependencies = ['cerebro-ui', 'cerebro-tools'];
  const devDependencies = ['cerebro-scripts'];
  const allDependencies = dependencies.concat(devDependencies).sort();
  if (allDependencies.indexOf(pluginName) >= 0) {
    console.error(
      chalk.red(
        `We cannot create a project called ${chalk.green(pluginName)} because a dependency with the same name exists.\n` +
          `Due to the way npm works, the following names are not allowed:\n\n`
      ) +
        chalk.cyan(allDependencies.map(depName => `  ${depName}`).join('\n')) +
        chalk.red('\n\nPlease choose a different project name.')
    );
    process.exit(1);
  }
}

function isSafeToCreateProjectIn(root) {
  const validFiles = [
    '.DS_Store',
    'Thumbs.db',
    '.git',
    '.gitignore',
    '.idea',
    'README.md',
    'LICENSE',
    'web.iml',
    '.hg',
    '.hgignore',
    '.hgcheck',
  ];
  return fs.readdirSync(root).every(file => validFiles.indexOf(file) >= 0);
}

function install(dependencies, isOnline) {
  return new Promise((resolve, reject) => {
    let command;
    let args;
    command = 'yarnpkg';
    args = ['add', '--exact'];
    if (!isOnline) {
      args.push('--offline');
    }
    [].push.apply(args, dependencies);

    if (!isOnline) {
      console.log(chalk.yellow('You appear to be offline.'));
      console.log(chalk.yellow('Falling back to the local Yarn cache.'));
      console.log();
    }

    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', code => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(' ')}`,
        });
        return;
      }
      resolve();
    });
  });
}

function run(root, appName, originalDirectory) {
  const allDependencies = ['cerebro-ui', 'cerebro-tools', 'cerebro-scripts'];

  console.log('Installing packages. This might take a couple minutes.');
  const packageName = 'cerebro-scripts'
  checkIfOnline().then(isOnline => {
      console.log(
        `Installing ${chalk.cyan('cerebro-ui')}, ${chalk.cyan('cerebro-tools')}, and ${chalk.cyan('cerebro-scripts')}...`
      );
      console.log();

      return install(allDependencies, isOnline);
    })
    .then(() => {
      // Since cerebro-scripts has been installed with --save
      // we need to move it into devDependencies and rewrite package.json
      // also ensure cerebro dependencies have caret version range
      fixDependencies(packageName);

      const scriptsPath = path.resolve(
        process.cwd(),
        'node_modules',
        packageName,
        'scripts',
        'init.js'
      );
      const init = require(scriptsPath);
      init(root, appName, originalDirectory);
    })
    .catch(reason => {
      console.log();
      console.log('Aborting installation.');
      if (reason.command) {
        console.log(`  ${chalk.cyan(reason.command)} has failed.`);
      } else {
        console.log(chalk.red('Unexpected error. Please report it as a bug:'));
        console.log(reason);
      }
      console.log();

      // On 'exit' we will delete these files from target directory.
      const knownGeneratedFiles = [
        'package.json',
        'npm-debug.log',
        'yarn-error.log',
        'yarn-debug.log',
        'node_modules',
      ];
      const currentFiles = fs.readdirSync(path.join(root));
      currentFiles.forEach(file => {
        knownGeneratedFiles.forEach(fileToMatch => {
          // This will catch `(npm-debug|yarn-error|yarn-debug).log*` files
          // and the rest of knownGeneratedFiles.
          if (
            (fileToMatch.match(/.log/g) && file.indexOf(fileToMatch) === 0) ||
            file === fileToMatch
          ) {
            console.log(`Deleting generated file... ${chalk.cyan(file)}`);
            fs.removeSync(path.join(root, file));
          }
        });
      });
      const remainingFiles = fs.readdirSync(path.join(root));
      if (!remainingFiles.length) {
        // Delete target folder if empty
        console.log(
          `Deleting ${chalk.cyan(`${appName} /`)} from ${chalk.cyan(path.resolve(root, '..'))}`
        );
        process.chdir(path.resolve(root, '..'));
        fs.removeSync(path.join(root));
      }
      console.log('Done.');
      process.exit(1);
    });
}

function fixDependencies(packageName) {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = require(packagePath);

  if (typeof packageJson.dependencies === 'undefined') {
    console.error(chalk.red('Missing dependencies in package.json'));
    process.exit(1);
  }

  const packageVersion = packageJson.dependencies[packageName];

  if (typeof packageVersion === 'undefined') {
    console.error(chalk.red(`Unable to find ${packageName} in package.json`));
    process.exit(1);
  }

  packageJson.devDependencies = packageJson.devDependencies || {};
  packageJson.devDependencies[packageName] = packageVersion;
  delete packageJson.dependencies[packageName];

  makeCaretRange(packageJson.dependencies, 'cerebro-ui');
  makeCaretRange(packageJson.dependencies, 'cerebro-tools');

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
}


function checkIfOnline() {
  return new Promise(resolve => {
    dns.lookup('registry.yarnpkg.com', err => {
      resolve(err === null);
    });
  });
}

function makeCaretRange(dependencies, name) {
  const version = dependencies[name];

  if (typeof version === 'undefined') {
    console.error(chalk.red(`Missing ${name} dependency in package.json`));
    process.exit(1);
  }

  let patchedVersion = `^${version}`;

  if (!semver.validRange(patchedVersion)) {
    console.error(
      `Unable to patch ${name} dependency version because version ${chalk.red(version)} will become invalid ${chalk.red(patchedVersion)}`
    );
    patchedVersion = version;
  }

  dependencies[name] = patchedVersion;
}