# bondage.js [![Build Status](https://travis-ci.org/jhayley/bondage.js.svg?branch=master)](https://travis-ci.org/jhayley/bondage.js)

[Yarn](https://github.com/InfiniteAmmoInc/Yarn) parser for Javascript, in the same vein as [YarnSpinner](https://github.com/thesecretlab/YarnSpinner).

# Usage

#### As a Web Tool

To run through your yarn files in your browser, go to <http://hayley.zone/bondage.js>, paste your yarn data in the field, then hit "compile".

#### As a Command Line Tool
Installation: `npm install -g bondage`

Now you can use the `bondage` command to run through Yarn files from the command line. You can load one or multiple files at a time. If you load multiple files and a two nodes are encountered with the same name, the node will be overwritten.

**Examples**

* Running a single file from the default start node (named "Start"): `bondage run yarnfile.json`
* Running a single file from the specified node name: `bondage run -s StartNode yarnfile.json`
* Running multiple files from the specified node name: `bondage run -s StartNode yarnfile1.json yarnfile2.json ...`
* See the compiled ast: `bondage compile --ast yarnfile.json`
* See the tokenized input: `bondage compile --tokens yarnfile.json`

#### As a Library

**Web**

Include [dist/bondage.min.js](https://github.com/jhayley/bondage.js/blob/master/dist/bondage.min.js) somewhere in your html, and the `bondage` variable will be added to the global scope. You can then access everything in the example below (such as `bondage.Runner`) through that variable.

**Node**

Installation: `npm install bondage`

```javascript
const fs = require('fs');
const bondage = require('bondage');

const runner = new bondage.Runner();
const yarnData = JSON.parse(fs.readFileSync('yarnFile.json'));

runner.load(yarnData);

// Loop over the dialogue from the node titled 'Start'
for (const result of runner.run('Start')) {
  // Do something else with the result
  if (result instanceof bondage.TextResult) {
    console.log(result.text);
  } else if (result instanceof bondage.OptionsResult) {
    // This works for both links between nodes and shortcut options
    console.log(result.options);

    // Select based on the option's index in the array (if you don't select an option, the dialog will continue past them)
    result.select(1);
  } else if (result instanceof bondage.CommandResult) {
     // If the text was inside <<here>>, it will get returned as a CommandResult string, which you can use in any way you want
    console.log(result.text);
  }
}

// Advance the dialogue manually from the node titled 'Start'
const d = runner.run('Start')
let result = d.next().value;
let nextResult = d.next().value;
// And so on
```

For usage of the yarn format itself, please see the [YarnSpinner Documentation](https://github.com/thesecretlab/YarnSpinner/tree/master/Documentation), everything there should carry here too (if something does not match up, please open an issue).
