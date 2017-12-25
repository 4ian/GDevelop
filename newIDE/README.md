# GDevelop IDE

This is a new, revamped editor for GDevelop. It is based on [React](https://facebook.github.io/react/), [Material-UI](http://www.material-ui.com), [Pixi.js](https://github.com/pixijs/pixi.js) and [Electron](https://electron.atom.io/).
It uses GDevelop [core C++ classes compiled to Javascript](https://github.com/4ian/GDevelop.js) to work with GDevelop games.

![GDevelop editor](https://raw.githubusercontent.com/4ian/GD/master/newIDE/gd-ide-screenshot.png "GDevelop editor")

## Installation

Make sure to have [Git](https://git-scm.com/) and [Node.js](https://nodejs.org) installed. [Yarn](https://yarnpkg.com) is optional.

```bash
git clone https://github.com/4ian/GD.git
cd GD/newIDE/app
yarn #or npm install
```

## Development

```bash
yarn start #or npm start
```

This will open the app in your web browser.

Images resources, GDJS Runtime, extensions will be copied in resources, and [libGD.js](https://github.com/4ian/GDevelop.js) will be downloaded automatically.

### Development of the standalone app

You can run the app with Electron. **Make sure that you've run `yarn start` in `app` folder before** (see above).

```bash
cd newIDE/electron-app
yarn #or npm install

#For macOS:
./node_modules/electron/dist/Electron.app/Contents/MacOS/Electron app

#For Windows:
node node_modules\electron\cli.js app

#For Linux:
./node_modules/electron/dist/electron app
```

### Development of UI components

You can run a [storybook](https://github.com/storybooks/storybook) that is used as a playground for rapid UI component development and testing:

```bash
cd newIDE/app
yarn storybook #or npm run storybook
```

### Tests

Unit tests can be launched with this command:

```bash
cd newIDE/app
yarn test #or npm run test
```

### Theming

It's possible to create new themes for the UI. See [this file](https://github.com/4ian/GD/blob/master/newIDE/app/src/UI/Theme/index.js) to declare a new theme. You can take a look at the [default theme](https://github.com/4ian/GD/blob/master/newIDE/app/src/UI/Theme/DefaultTheme/index.js), including the [styling of the Events Sheets](https://github.com/4ian/GD/blob/master/newIDE/app/src/UI/Theme/DefaultTheme/EventsSheet.css).

## Building and deploying the standalone app

### Desktop version

Update version number which is read in `newIDE/electron-app/app/package.json`.

```bash
cd newIDE/electron-app
yarn build #or npm run build
```

This will build and package the Electron app for Windows, macOS and Linux (according to your OS).
The output are stored inside `newIDE/electron-app/dist` and copied to `Binaries/Output/Release_XXX`.

### Webapp version

```bash
cd newIDE/web-app
yarn deploy #or npm run deploy
```

## Current status and how to contribute

This new editor is still in development and is missing some features:

- [ ] Support for translations (See an [example of a component that can be translated](https://github.com/4ian/GD/blob/master/newIDE/app/src/MainFrame/Toolbar.js#L44))
- [ ] [Collision mask editor](https://trello.com/c/2Kzwj61r/47-collision-masks-editors-for-sprite-objects-in-the-new-ide)
- [ ] Support for native games
- [ ] More [documentation](http://wiki.compilgames.net/doku.php/gdevelop5/start) about how to package for iOS/Android with Cordova/PhoneGap Build or Cocos2d-JS.
- [ ] Search in events
- [ ] More [examples](https://github.com/4ian/GD/blob/master/newIDE/app/src/ProjectCreation/BrowserExamples.js)
- [ ] More [tutorials](http://wiki.compilgames.net/doku.php/gdevelop5/start)
- [ ] Add more [keyboard shortcuts](https://github.com/4ian/GD/blob/master/newIDE/app/src/UI/KeyboardShortcuts/index.js)
- [ ] Make drawers movable/draggable like the properties panel and the objects editor

You can contribute by picking anything here or anything that you think is missing or could be improved in GD5! If you don't know how to start, it's a good idea to play a bit with the editor and see if there is something that is unavailable and that you can add or fix.

## Additional help

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app). Check out their documentation for common tasks or help about using it.
