These are the tests for the GDevelop HTML5 game engine.

## Launching tests

Make sure you have [Node.js](https://nodejs.org/) installed. Update dependencies:

    npm install

Then launch tests:

    npm test

## About the tests

### Unit tests

Tests are launched using PhantomJS. You need Firefox installed as PhantomJS launch an instance of Firefox and run tests in it.

Tests are located in **tests** folder for the game engine, or directly in the folder of the tested extensions.

### Games in _games_ folder

Games contained in _games_ folder are mainly here to be launched manually in order to check that a particular feature is working. Read the comments in the events to see what is the expected behavior, or compare with the native platform if you can.
