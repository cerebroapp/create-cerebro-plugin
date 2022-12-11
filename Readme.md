# Create Cerebro Plugin

Fastest way to create Cerebro plugins.


## Quick Overview
Before start make sure you have installed yarn package manager. Follow [installation instructions](https://yarnpkg.com/lang/en/docs/install/) if you don't.


```
yarn create cerebro-plugin my-plugin
cd ./my-plugin
yarn start
```

# Plugins

A Cerebro plugin is just a javascript module. All you need is to write a function, that takes one object and call a function from arguments with your results.

You can create your plugin using [create-cerebro-plugin](https://github.com/cerebroapp/create-cerebro-plugin) so you can focus on code of your plugin, not on tools and configuration around it.
### Prerequisites

* [Node.js](https://nodejs.org/en/) (>= 16)
* [yarn](https://classic.yarnpkg.com/en/)

### Install and manage custom plugins

Sometimes you need to manually install a plugin (maybe you have published it to npm but you dind't added the keywords to the package.json so it is not available in Cerebro).
If you want to test this plugin, you can install it manually:

1. Open a terminal in the [configuration directory](/docs/cerebro-developers.md#config-file-path) of Cerebro
2. Go to the plugins directory

    ```bash
    cd ./plugins
    ```

3. Install the plugin

    ```bash
    npm install --save name-of-plugin
    ```

4. Restart Cerebro


# Plugin structure

This is a minimum source code of your plugin:

```js
export const fn = (scope) => console.log(scope.term)
```

> You can open the developer tools by pressing `ctrl+shift+i`(for the main window) and `ctrl+shift+b`(for the background). Developer mode should be enabled from the settings

This plugin will write to console all changes in your search field of Cerebro app. So, `fn` key is a heart of your plugin: this function receives `scope` object and you can send results back to Cerebro. Scope object is:

* `term` – `String`, entered by Cerebro user;
* `display` – `Function(result: Object | Array<object>)`, display your result
* `update` – `Function(id: String, result: Object)`, update your previously displayed result. This action updates only passed fields, so if you displayed result `{id: 1, title: 'Result'}` and call `update(1, {subtitle: 'Subtitle'})`, you will have merged result: `{id: 1, title: 'Result', subtitle: 'Subtitle'}`;
* `hide` – `Function(id: String)`, hide result from results list by id. You can use it to remove temporar results, like "loading..." placeholder;
* `actions` – object with main actions, provided for cerebro plugins:
  * `open` – `Function(path: String)`, open external URL in browser or open local file;
  * `reveal` – `Function(path: String)`, reveal file in finder;
  * `copyToClipboard` – `Function(text: String)`, copy text to clipboard;
  * `replaceTerm` – `Function(text: String)`, replace text in main Cerebro input;
  * `hideWindow` – `Function()`, hide main Cerebro window.
* `settings` - `Object`, contains user provided values of all specified settings keys;

Let's show something in results list:

```js
export const fn = (scope) => {
  scope.display({
    title: 'It works!',
    subtitle: `You entered ${scope.term}`
  })
}
```

`scope.display` accepts one result object or array of result objects. Result object is:

## Basic fields

### `title`

Type: `String`

Title of your result;

### `subtitle`

Type: `String`

Subtitle of your result;

### `icon`

Type: `String`

Icon, that is shown near your result. It can be absolute URL to external image, absolute path to local image or base64-encoded [data-uri](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs).

For local icons you can use path to some `.app` file, i.e. `/Applications/Calculator.app` will render default icon for Calculator application.

## Advanced fields

### `id`

Type: `String`
Use this field when you need to update your result dynamically. Check `id` [example](./examples.md#using-id)

### `term`

Type: `String`

Autocomplete for your result. So, user can update search term using <kbd>tab</kbd> button;

### `clipboard`

Type: `String`

Text, that will be copied to clipboard using <kbd>cmd+c</kbd>, when your result is focused;

### `getPreview`

Type: `Function`

Arguments: no

Function that returns preview for your result. Preview can be an html string or React component;

### `onSelect`

Type: `Function`.
Arguments: `event: Event`

Action, that should be executed when user selects your result. I.e, to open provided url in default browser:

```js
onSelect: (event) => actions.open(`http://www.cerebroapp.com`),
```

If you don't want to close main window after your action, you should call `event.preventDefault()` in your action.

### `onKeyDown`

Type: `Function`

Arguments: `event: Event`

Handle keyboard events when your result is focused, so you can do custom actions, i.e. reveal file in finder by <kbd>cmd+r</kbd> (or <kbd>ctrl+r</kbd> on windows and linux):

```js
onKeyDown: (event) => {
  if ((event.metaKey || event.ctrlKey) && event.keyCode === 82) {
    actions.reveal(path);
    event.preventDefault();
  }
}
```

You can also prevent default action by `event.preventDefault()`.

## Advanced plugin fields

Along with `fn`, your module could have more keys:

### `keyword`

Type: `String`

This field is used for autocomplete. You can prefix your plugin usage by this keyword. Checkout emoji [example](./examples.md#using-keyword-and-name)

### `name`

Type: `String`

This field is also used for autocomplete and shown as title in results list. Checkout emoji [example](./examples.md#using-keyword-and-name)

### `initialize`

Type: `Function`
Arguments: no

Use this function, when you need to prepare some data for your plugin on start. If you need to do some long-running processes, check `initializeAsync`

Check `initialize` [example](./examples.md#using-initialize)

### `initializeAsync`

Type: `Function`

Arguments: `callback: Function(message: Object)` – callback to send data back to main process.

Use this function when you need to execute some long-running initializer process. I.e. in contacts plugin we are fetching all contacts using osx-specific libraries using `nodobjc` module.

This function will be executed in another process and you can receive results using `onMessage` function.

Check `initializeAsync` and `onMessage` [example](./examples.md#using-initializeasync-and-onmessage)

### `onMessage`

Type: `Function`
Arguments: `message: Object` – object that you sent from `initializeAsync`

Use this function to receive data back from your `initializeAsync` function.

Check `initializeAsync` and `onMessage` [example](./examples.md#using-initializeasync-and-onmessage)

### `settings`

Type: `Object`

This object is used to specify settings that a plugin user can change. Each setting should include a `description` and a `type`. Other keys include:

* `label` - `String`, object key for the setting. also used to access it;
* `description` -  `String`, description of the setting;
* `type` - `String`, used to decide element for rendering a setting:
  * `string`
  * `number`
  * `bool`
  * `option`
* `defaultValue` - `Any`, default value for the setting;
* `options` - `Array`, all possible options that can be selected by the user. applicable only for `option`;
* `multi` - `Bool`, allows user to select more than one option for `option` settings. applicable only for `option`;
* `createable` - `Bool`, allows user created options. applicable only for `option`;

Check `settings` [example](./examples.md#using-settings)

Take a look at [React Select](https://github.com/JedWatson/react-select) for more details on how the `option` type works.

## Available `env` variables

The following variables are available in the `process.env` object:

* `CEREBRO_VERSION` – Version of Cerebro
* `CEREBRO_DATA_PATH` – Path to Cerebro data directory


## Styles for your plugin preview

Currently if you want to reuse main app styles, you can use CSS variables from main themes (light, dark)

> It is better to reuse css variables so custom themes can affect not only main app styles, but your plugin too.

Example (reuse main border styles):

```css
.item {
  border-bottom: var(--main-border);
}
```

### Reusable components

- [@cerebroapp/cerebro-ui](https://github.com/cerebroapp/cerebro-ui)


## Share

When your plugin is ready, you can share it with all Cerebro users so they can find and install it using `plugins` command in Cerebro.

All you need is to publish your module to npm. Just run from your plugin folder:

```bash
npm publish ./
```

If you have any problems check out [publishing packages](https://docs.npmjs.com/getting-started/publishing-npm-packages) in npm documentation

### Checklist

1. Update your repository `Readme.md`, add screenshot or gif;
1. Push your plugin to open github repository – this repository is used by cerebro, at least to show `Readme.md` of your plugin;
1. Make sure that you have changed package.json metadata: module name, description, author and link to github repository;
1. Add `cerebro-plugin` keyword to package.json keywords section. Otherwise your plugin won't be shown in Cerebro;

# Examples

You always can check out source code of existing plugins, like:

* [cerebro-math](https://github.com/cerebroapp/cerebro-math)
* [cerebro-google](https://github.com/cerebroapp/cerebro-google)
* [cerebro-emoj](https://github.com/cerebroapp/cerebro-emoj)
* [cerebro-gif](https://github.com/cerebroapp/cerebro-gif)
* [cerebro-kill](https://github.com/cerebroapp/cerebro-kill)
* [cerebro-ip](https://github.com/cerebroapp/cerebro-ip)

## Using `id`

```js
export const fn = ({display}) => {
  display({
    id: 'my-id',
    title: 'Loading'
  })
  fetchResult().then((result) => {
    display({
      id: 'my-id',
      title: `Fetched result: ${result}`
    })
  });
}
```

## Using `icon`

```js
import icon from '[path-to-icon]/icon.png';

const plugin = ({display}) => {
  display({
    icon,
    title: 'Title',
    subtitle: 'Subtitle'
  });
}

export default {
  fn: plugin,
}
```

## Using `keyword` and `name`

```js
const plugin = (scope) => {
  const match = scope.term.match(/^emoj\s(.+)/);
  if (match) {
    searchEmojis(match[1]).then(results => {
      scope.display(results)
    })
  };
}

export default {
  name: 'Search emojis...',
  fn: plugin,
  keyword: 'emoj'
}

```

## Using `initialize`

```js
// Some data needed for your plugin
let data;

// Fetch some data only on app initialization
const initialize = () => {
  fetchYourData().then(result => {
    data = result
  });
}

const plugin = (scope) => {
  const results = search(data, scope.term);
  scope.display(results);
}

export default {
  initialize: initialize,
  fn: plugin
}
```

## Using `initializeAsync` and `onMessage`

```js
let data;

// Run some long-running initialization process in background
const initialize = (cb) => {
  fetchYourData().then(cb);
  // and re-fetch this information once in 1h
  setInterval(() => {
    initialize(cb);
  }, 60 * 3600);
}

const onMessage = (results) => {
  data = results;
}

const plugin = (scope) => {
  const results = search(data, scope.term);
  scope.display(results);
}

export default {
  initializeAsync: initialize,
  onMessage: onMessage,
  fn: plugin
}
```

## Using `cerebro-tools`

```js
import { memoize, search } from 'cerebro-tools';
import preprocessJson from './preprocessJson';

// Memoize your fetched data from external API
const fetchData = memoize(() => {
  return fetch('http://api/url')
    .then(response => response.json())
    .then(preprocessJson)
});

const plugin = ({term, display}) => {
  fetchData().then(data => {
    const results = search(data, term, (el) => el.name);
    display(term);
  })
}

export default {
  fn: plugin
};
```

## using `settings`

```js
const plugin = ({ display, settings }) => {
  const icon = require('[path-to-icon]/icon.png');

  display({
    icon: settings.icon ? icon : '',
    title: `${settings.username}, you have been around for ${settings.age}`,
    subtitle: `Favorite languages: ${settings.languages.join(',')}`,
  })
}

export default {
  fn: plugin,
  settings: {
    username: { type: 'string' },
    age: { type: 'number', defaultValue: 42 },
    icon: { type: 'bool' },
    languages: {
      type: 'option',
      description: 'Your favorite programming languages'
      options: [
        { label: 'JavaScript', value: 'js' },
        { label: 'Haskell', value: 'hsk' },
        { label: 'Rust', value: 'rs' }
      ],
      multi: true,
      createable: true,
    }
  }
}

```
