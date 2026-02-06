This folder contains sources to embed Jfxr editor (https://github.com/ttencate/jfxr) so that it can
be used directly from GDevelop to edit sound effects.

Jfxr sources are downloaded by `import-zipped-editor.js` script. They are raw, unchanged sources
of the Jfxr editor build. Sources will be stored in `jfxr-editor` folder.
See `jfxr-main.js` for the code running the editor.
See `LocalExternalEditorWindow.js`, `LocalResourceExternalEditors.js` and `BrowserResourceExternalEditors.js` files for the bridge that opens the Window and passes data from GDevelop to Jfxr.
