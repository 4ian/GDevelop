# GDevelop IDE

This is a new, revamped editor for GDevelop. It is based on [React](https://facebook.github.io/react/), [Material-UI](http://www.material-ui.com), [Pixi.js](https://github.com/pixijs/pixi.js) and [Electron](https://electron.atom.io/).
It uses GDevelop [core C++ classes compiled to Javascript](github.com/4ian/GDevelop.js) to manipulate game projects.

## Installation

Make sure to have [Node.js](https://nodejs.org) and [yarn](https://yarnpkg.com) installed.

```bash
cd newIDE/app
yarn install
```

You have to compile a version of GDevelop to Javascript in `Binaries/Output/libGD.js/Release/libGD.js`. This is not yet integrated into GDevelop build process, see [Gdevelop.js](https://github.com/4ian/GDevelop.js).

## Development

```bash
yarn start
```

This will open the app in your web browser.

### Development of the standalone app

You can run the app with Electron

```bash
#For macOS:
../electron-app/node_modules/electron/dist/Electron.app/Contents/MacOS/Electron ../electron-app/app

#For Windows and Linux: TODO
```

### Development of UI components

You can run a [storybook](https://github.com/storybooks/storybook) that is used as a playground for rapid UI component development and testing:

```bash
yarn run storybook
```

## Building the standalone app

```bash
cd newIDE/electron-app
yarn build
```

This will build and package the Electron app for Windows, macOS and Linux (according to your OS).
The output are stored inside `newIDE/electron-app/dist` and copied to `Binaries/Output/Release_XXX`.

## Additional help

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app). Check out their documentation for common tasks or help about using it.
