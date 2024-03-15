This folder contains sources to embed the Piskel editor (https://www.piskelapp.com/) so that it can
be used directly from GDevelop to edit images.

GD uses an updated version of piskel from <https://github.com/blurymind/piskel/tree/piskel-plus>
It contains a number of advanced color manipulation features and improvements to aid artists.
commit number: a300d17eb88d2b9d1fa2bbe3a810ad1bb76f1f81

Piskel sources are downloaded by `import-zipped-editor.js` script. They are raw, unchanged sources
of the Piskel editor build. Sources will be stored in the `piskel-editor` folder.
See `piskel-main.js` for the code running the editor.
See `LocalExternalEditorWindow.js`, `LocalResourceExternalEditors.js` and `BrowserResourceExternalEditors.js` files for the bridge that opens the Window and passes data from GDevelop to Piskel.
