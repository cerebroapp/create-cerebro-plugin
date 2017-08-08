'use strict';

const fs = require('fs');
const chalk = require('chalk');
const paths = require('../../config/paths');

module.exports = (resolve, rootDir, isEjecting) => {
  // Use this instead of `paths.testsSetup` to avoid putting
  // an absolute filename into configuration after ejecting.
  const setupTestsFile = fs.existsSync(paths.testsSetup)
    ? '<rootDir>/src/setupTests.js'
    : undefined;

  // TODO: I don't know if it's safe or not to just use / as path separator
  // in Jest configs. We need help from somebody with Windows to determine this.
  const config = {
    collectCoverageFrom: ['src/**/*.{js,jsx}'],
    setupTestFrameworkScriptFile: setupTestsFile,
    testMatch: [
      '<rootDir>/src/**/__tests__/**/*.js?(x)',
      '<rootDir>/src/**/?(*.)(spec|test).js?(x)',
    ],
    testEnvironment: 'node',
    testURL: 'http://localhost',
    transform: {
      '^.+\\.(js|jsx)$': resolve('config/jest/babelTransform.js'),
      '^.+\\.css$': resolve('config/jest/cssTransform.js'),
      '^(?!.*\\.(js|jsx|css|json)$)': resolve('config/jest/fileTransform.js'),
    },
    transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\](?!cerebro-).+\\.(js|jsx)$']
  };
  if (rootDir) {
    config.rootDir = rootDir;
  }
  const overrides = Object.assign({}, require(paths.appPackageJson).jest);
  const supportedKeys = [
    'collectCoverageFrom',
    'coverageReporters',
    'coverageThreshold',
    'snapshotSerializers',
  ];
  if (overrides) {
    Object.keys(overrides).forEach(key => {
      if (overrides.hasOwnProperty(key)) {
        config[key] = overrides[key];
        delete overrides[key];
      }
    });
  }
  return config;
};