This folder contains sources to embed Yarn editor (https://github.com/YarnSpinnerTool/YarnEditor) so that it can
be used directly from GDevelop to edit/create Dialogue Trees.

Yarn sources are downloaded by `import-zipped-editor.js` script. They are raw, unchanged sources
of the Yarn editor build. Sources will be stored in the `yarn-editor` folder.
See `yarn-main.js` for the code running the editor.
See `LocalExternalEditorWindow.js`, `LocalResourceExternalEditors.js` and `BrowserResourceExternalEditors.js` files for the bridge that opens the Window and passes data from GDevelop to Yarn.
