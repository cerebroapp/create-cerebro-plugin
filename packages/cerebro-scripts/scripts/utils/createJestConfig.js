'use strict';

import fs from 'fs'
import chalk from 'chalk'
import paths from '../../config/paths.js'

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export default (resolve, rootDir, isEjecting) => {
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
    transform: {},
    testEnvironment: 'node',
    testEnvironmentOptions: {
      url: 'http://localhost'
    },
    transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\](?!cerebro-).+\\.(js|jsx)$']
  };
  if (rootDir) {
    config.rootDir = rootDir;
  }

  const overrides = Object.assign({}, require(paths.appPackageJson).jest);
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