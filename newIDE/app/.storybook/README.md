This folder contains some Storybook configuration.

> ℹ️ Check the **general [README](../../README.md)** to know how to launch Storybook for GDevelop.
> This documentation is information about some specific Storybook configuration/work-arounds.

- `.babelrc` is needed as `src/locales` folder contains huge .js file, that would cause babel to hang/freeze/crash. We redefine `.babelrc` for Storybook, so that it's the same Preset as create-react-app but ignoring `src/locales`.
  - If at some point you're upgrading create-react-app, lingui-js or Storybook, check if it's still required to have this .babelrc
  - Also check if it's still needed to have babel packages (`babel-core`, etc...) in package.json (they should be provided by create-react-app, but are asked by lingui-js).
- `preview-head.html` inject into Storybook the same HTML script imports as the app: libGD.js.
