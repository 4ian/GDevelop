This folder contains sources to embed the Piskel editor (https://www.piskelapp.com/) so that it can
be used directly from GDevelop to edit images.

GD uses an updated version of piskel from <https://github.com/GDevelopApp/piskel> on `master` branch.
It contains a number of advanced color manipulation features and improvements to aid artists.

Piskel sources are downloaded by `import-zipped-editor.js` script. They are raw, unchanged sources
of the Piskel editor build. Sources will be stored in the `piskel-editor` folder.
See `piskel-main.js` for the code running the editor.
See `LocalExternalEditorWindow.js`, `LocalResourceExternalEditors.js` and `BrowserResourceExternalEditors.js` files for the bridge that opens the Window and passes data from GDevelop to Piskel.
