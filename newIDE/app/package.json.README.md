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

**`react-dnd` v14** is used for all drag-and-drop in the app (events, effects, objects, mosaic panels…). `react-mosaic-component` v5.3.0 also depends on `react-dnd` internally; npm `overrides` in `package.json` ensure a single copy of `react-dnd`, `react-dnd-touch-backend`, and `dnd-core` is resolved to avoid blank/not-rendered components.

Only **`react-dnd-touch-backend`** is used (with `enableMouseEvents: true`), which handles both mouse and touch input. `react-dnd-html5-backend` and `react-dnd-multi-backend` were removed because the HTML5 backend does not work with the iframe used by the embedded game preview.

The codebase uses the legacy **Decorators/HOC API** (`DragSource`, `DropTarget`, `DragLayer`) — not the Hooks API (`useDrag`, `useDrop`, …). v14 supports both, so migration to hooks can be done incrementally if desired. v14.0.3+ also includes a specific fix for drop operations in iframes & child windows.

> You can check if there is only one version of a package by doing `npm ls`:
>
> - `npm ls react-dnd`
> - `npm ls dnd-core`

Latest versions of `react-sortable-hoc` seems to be breaking the lists. The exact version in which this occurs was not determined.

## Various fixes

- `react-mosaic-component` is the official npm package (v5.3.0). Earlier versions used a custom fork to pin `react-dnd` 7.x; this is no longer needed.
- `@lingui/react` is a version where Flow definitions have been fixed.
- `pixi-simple-gesture` is a version where an extra check for `undefined` has been added to `touchStart` in `pan.js`, following traces of errors that have been inspected (though the bug could not be reproduced - but better be safe).
