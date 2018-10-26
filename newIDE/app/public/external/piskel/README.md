This folder contains sources to embed Piskel editor (https://www.piskelapp.com/) so that it can
be used directly from GDevelop to edit images.

Piskel sources are downloaded by `import-piskel-editor.js` script. They are raw, unchanged sources
of the Piskel editor. Sources will be stored in `piskel-editor` folder.
See `piskel-main.js` for the code running the editor.
See `ModalWindow.js` and `LocalPiskelBridge.js` files for the bridge that open the Window and pass data from GDevelop to Piskel.
