This project is a runner for [Yarn](https://yarnspinner.dev/) dialogues, attempting compliance with the 2.0 language specification.

API improvements and additional features are present in [YarnBound](https://github.com/mnbroatch/yarn-bound), which uses this package under the hood.

# Known Deviations from Yarn 2.0 spec

- Reading from a .yarn file is left to the user; dialogues should be supplied to bondage.js as a text string or array of node objects.
- Some minutia about what unicode characters define a string has not been considered.

There are features in the Yarn docs that are not present in the [Yarn language spec](https://github.com/YarnSpinnerTool/YarnSpinner/blob/9275277f50a6acbe8438b29596acc8527cf5581a/Documentation/Yarn-Spec.md). Known examples are:
  - `Character: some text` annotation
  - `[b]Markup[/b]`

These exist in [YarnBound](https://github.com/mnbroatch/yarn-bound) but not here.


# Usage

Install with `npm i -S bondage` or grab `bondage.js` from the `/dist/` folder.

For information on how to write Yarn, visit the [official documentation](https://docs.yarnspinner.dev/).

The examples below illustrate how `bondage.js` in particular works:


### Basic Dialogue

```javascript
import bondage from 'bondage';
// or node: 
// const bondage = require('bondage')
// or in a script tag:
// <script src="path-to-file/bondage.min.js"></script>
 
// bondage.js strips empty lines, but make sure lines have
// no leading whitespace (besides indentation)!
const dialogue = ` 
# someFiletag
title: StartingNode
someTag: someTag
---
This is a line of text.#someHashtag
This is another line of text.
===
`

const runner = new bondage.Runner()
runner.load(dialogue)
const generator = runner.run('StartingNode')
let node = generator.next().value
console.log('node', node)
```

When we log out `node` above, we will see this object structure:

```javascript
{
  "text": "This is a line of text.",
  "hashtags": ['someHashtag'],
  "metadata": {
    "title": "StartingNode",
    "someTag": "someTag",
    "filetags": [
      "someFiletag"
    ]
  }
}
```

Notice that hashtags at the end of a line go in a `hashtags` array.

to continue, we call

```javascript
node = generator.next().value
```

again, and if we log the new node, we see:

```javascript
{
  "text": "This is another line of text.",
  "hashtags": [],
  "metadata": {
    "title": "StartingNode",
    "someTag": "someTag",
    "filetags": [
      "someFiletag"
    ]
  }
}
```

If we had jumped, we would see the new node's title and header tags under the `metadata` property (along with the same fileTags).


### Options

Given this dialogue:

```
# someFiletag
title: StartingNode
someTag: someTag
---
What color do you like?
-> Red
  You picked Red!
-> Blue
  You picked Blue!
===
```

We can start the dialogue runner like above.

```javascript
const runner = new bondage.Runner()
runner.load(dialogue)
const generator = runner.run('StartingNode')
let node = generator.next().value
```

which will give us a text result like the last example. However, the next node we get from calling `generator.next().value` will be:

```javascript
{
  "options": [
    {
      "text": "Red",
      "isAvailable": true,
      "hashtags": []
    },
    {
      "text": "Blue",
      "isAvailable": true,
      "hashtags": []
    }
  ],
  "metadata": {
    "title": "StartingNode",
    "someTag": "someTag",
    "filetags": [
      "someFiletag"
    ]
  }
}
```

In order to continue the dialogue, you will need to call

```javascript
node.select(0);
node = generator.next().value
```

in order to move to the line with text, "You picked Red!"

But how will your view layer know whether you're looking at a text result or an options result? Use `instanceof`:

`node instanceof bondage.TextResult`

`node instanceof bondage.OptionsResult`

`node instanceof bondage.CommandResult`

Speaking of CommandResult...


# Commands

The third and last result type you need to know about is CommandResult. Given this dialogue:

```
# someFiletag
title: StartingNode
someTag: someTag
---
Sending a command...
<<someCommand with spaces>>
===
```

You will see a "Sending a command..." TextResult, but the next node will look like this:


```javascript
{
  "name": "someCommand with spaces",
  "hashtags": [],
  "metadata": {
    "title": "StartingNode",
    "someTag": "someTag",
    "filetags": [
      "someFiletag"
    ]
  }
}
```

Your program can do what it wants with that, then call `generator.next().value` to get the next node, as usual.


### Custom Variable Storage

Bondage keeps track of variables internally. Optionally, you can supply your own variableStorage. variableStorage is an object with get() and set() methods defined.

```javascript
const customStorage = new Map()
customStorage.set('hello', 1)

const runner = new bondage.Runner()
runner.setVariableStorage(customStorage)
runner.load(dialogue)
```

**Call setVariableStorage BEFORE loading a dialogue with `runner.load`. This is because `declare` commands will resolve when the dialogue loads (as opposed to when `runner.run()` is called)** 

Above, we set an initial value for the `hello` variable, so if a line of dialogue contains `{$hello}`, it will show the number `1`, no need to call `<<set $hello = 1>>`.

Simple dialogues can probably just use the built-in storage.


### Functions

You can also register functions to be used in your dialogue.

```javascript
runner.registerFunction('sayHello', () => 'hello')
```

If a line of dialogue contains `{sayHello()}`, it will show `hello`.


### Object Input Format

In addition to the regular yarn format as a string, bondage also accepts a javascript object. This is an intermediary format exported by some utilities. The text format is nicer to work with, so it should be preferred. For reference,

```
#someFiletag
#someOtherFiletag
title: SomeNode
tags: hello
arbitraryKey: arbitraryValue
---
This is a line of text
<<jump SomeOtherNode>>
===

title: SomeOtherNode
---
This is another line of text.
===
```

is equivalent to:

```javascript
[
  {
    "title": "SomeNode",
    "tags": "hello",
    "arbitraryKey": "arbitraryValue",
    "body": "This is a line of text\n<<jump SomeOtherNode>>\n",
    "filetags": [
      "someFiletag",
      "someOtherFiletag"
    ]
  },
  {
    "title": "SomeOtherNode",
    "body": "This is another line of text.\n",
    "filetags": [
      "someFiletag",
      "someOtherFiletag"
    ]
  }
]
```


# Other included versions

A minified version exists at `bondage/dist/bondage.min.js`.

If you want to transpile for yourself, use `import bondage from 'bondage/src/index'` and make sure it's being included by your build system.

If you need compatibility with internet explorer, you can transpile for yourself or use `bondage/dist/bondage.ie.js`.


# Development

The parser is compiled ahead of time, so after making changes to the grammar you will need to run `node src/parser/make-parser`. This is done automatically during `npm run build`.

