These are the tests for the GDevelop JavaScript game engine.

## Launching tests

Make sure you have [Node.js](https://nodejs.org/) installed. Update dependencies:

```
cd GDJS/tests
npm install
```

Then launch tests:

```
npm test
```

## About the tests

### Unit tests

Tests are launched using Chrome. You need Chrome installed to run them. You can change the browser by modifying the package.json "test" command and install the appropriate karma package.

Tests are located in **tests** folder for the game engine, or directly in the folder of the tested extensions. 

### Games in *games* folder

Games contained in *games* folder are mainly here to be launched manually in order to check that a particular feature is working. Read the comments in the events to see what is the expected behavior, or compare with the native platform if you can.
