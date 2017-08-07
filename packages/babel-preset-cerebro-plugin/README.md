# babel-preset-cerebro-plugin

This package includes the Babel preset used by [Create Cerebro Plugin](https://github.com/KELiON/create-cerebro-plugin).<br>

## Usage in Create Cerebro Plugin

The easiest way to use this configuration is with [Create Cerebro Plugin](https://github.com/KELiON/create-cerebro-plugin), which includes it by default. **You don’t need to install it separately in Create Cerebro Plugin projects.**

## Usage Outside of Create React App

If you want to use this Babel preset in a project not built with Create Cerebro Plugin, you can install it with following steps.

First, [install Babel](https://babeljs.io/docs/setup/).

Then create a file named `.babelrc` with following contents in the root folder of your project:

  ```js
  {
    "presets": ["cerebro-plugin"]
  }
  ```