This folder contains sources to embed Jsfx editor (https://github.com/loov/jsfx/) so that it can
be used directly from GDevelop to create sound effects.

Jsfx sources are copied by `import-jsfx-editor.js` script. They are raw, unchanged sources
of the Jsfx editor. Sources will be stored in `loov-jsfx` folder.
See `jsfx-main.js` for the code running the editor.
See `ModalWindow.js` and `LocalJsfxBridge.js` files for the bridge that open the Window and pass data from GDevelop to Jsfx.
