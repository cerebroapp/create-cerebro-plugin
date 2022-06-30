#!/usr/bin/env node

const script = process.argv[2];
const args = process.argv.slice(3);

switch (script) {
  case "build":
  case "start":
  case "clear":
    import(`../scripts/${script}.js`);
    break;
  case "test":
    import(`../scripts/runtest.js`);
    break;
  default:
    console.log('Unknown script "' + script + '".');
    console.log('Perhaps you need to update cerebro-scripts?');
    process.exit(1);  
}