# About GDevelop IDE dependencies (package.json)

GDevelop relies a some dependencies that can have special requirements:

* **Storybook** is depending on webpack and babel.
  * It's important to have the same webpack version as the one provided by create-react-app, hence why `webpack` is specified in the `devDependencies`.
  * `@babel/core`, `babel-core` are also specified to avoid incompatibilities after upgrading to Storybook 4.
  * **Try removing these extra `devDependencies`** if you upgrade Storybook.

* **`react-dnd`** is used by `react-mosaic-component` and `react-sortable-tree` (but not `react-sortable-hoc`). It is important that both are using **the same versions** of `react-dnd` and `react-dnd-html5-backend`. Otherwise, you get blanks/not rendered components.

> You can check if there is only one version of a package by doing `npm ls` or `yarn why`:
> * `yarn why react-dnd`
> * `npm ls webpack`

* Latest versions of `react-sortable-hoc` seems to be breaking the lists. The exact version in which this occurs was not determined.

A few fixes have been applied:

* `react-mosaic-component` is a custom version where `react-dnd` was simply upgraded to version `7.7.0`
* `@lingui/react` is a version where Flow definitions have been fixed.
* `pixi-simple-gesture` is a version where an extra check for `undefined` have been added to `touchStart` in `pan.js`, following traces of errors that have been inspected (though the bug could not be reproduced - but better be safe).
