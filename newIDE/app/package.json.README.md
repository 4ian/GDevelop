# About GDevelop IDE dependencies (package.json)

GDevelop relies on some dependencies that can have special requirements.

## Note on TypeScript

**TypeScript** here is only used to check the types in the `scripts/` files. The IDE uses Flow for static typing. TypeScript is used in the game engine too (see GDJS and Extensions folders).

## Storybook

**Storybook** is depending on webpack and babel.

- It's important to have the same webpack version as the one provided by `react-scripts`, hence why `webpack` is specified in the `devDependencies`.
- `babel-loader` is specified to be the exact version required by `react-scripts` (because `react-scripts` wants the exact version and will complain if forced to use the `babel-loader` of Storybook).
  - **Try removing these extra `devDependencies`** if you upgrade Storybook or Create React App.

## LinguiJS

- `"babel-core": "^7.0.0-bridge.0"` is needed for js-lingui `lingui extract` command (who runs Babel on source files).

## Drag'n'drop handling

**`react-dnd`** is used by `react-mosaic-component` and `react-sortable-tree` (but not `react-sortable-hoc`). Both must be using **the same versions** of `react-dnd` and `react-dnd-html5-backend`. Otherwise, you get blanks/not rendered components.

> You can check if there is only one version of a package by doing `npm ls` or `yarn why`:
>
> - `yarn why react-dnd`
> - `npm ls webpack`

Latest versions of `react-sortable-hoc` seems to be breaking the lists. The exact version in which this occurs was not determined.

## Various fixes

- `react-mosaic-component` is a custom version where `react-dnd` was simply upgraded to version `7.7.0`
- `@lingui/react` is a version where Flow definitions have been fixed.
- `pixi-simple-gesture` is a version where an extra check for `undefined` have been added to `touchStart` in `pan.js`, following traces of errors that have been inspected (though the bug could not be reproduced - but better be safe).
