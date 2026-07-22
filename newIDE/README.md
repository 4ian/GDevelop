# GDevelop IDE

This is the GDevelop 5 editor. It is based on [React](https://facebook.github.io/react/), [Material-UI](http://www.material-ui.com), [Pixi.js](https://github.com/pixijs/pixi.js), [Three.js](https://github.com/mrdoob/three.js) and [Electron](https://electron.atom.io/) for the desktop app.
It uses GDevelop [core C++ classes compiled to Javascript](https://github.com/4ian/GDevelop.js) to work with GDevelop games.

![GDevelop editor](https://raw.githubusercontent.com/4ian/GDevelop/master/newIDE/GDevelop%20screenshot.png "GDevelop editor")

## 1) Installation 💻

Make sure to have [Git](https://git-scm.com/) and [Node.js](https://nodejs.org) installed. [Yarn](https://yarnpkg.com) is optional.

```bash
git clone https://github.com/4ian/GDevelop.git
cd GDevelop/newIDE/app
npm install # or yarn
```

## 2) Development 🤓

```bash
npm start # or yarn start
```

This will open the app in your web browser.

Images resources, GDJS Runtime, extensions will be copied in resources, and [libGD.js](https://github.com/4ian/GDevelop/tree/master/GDevelop.js) will be downloaded automatically. If you wish, you can
[build libGD.js by yourself](https://github.com/4ian/GDevelop/tree/master/GDevelop.js) (useful if you modified GDevelop native code like extensions).

> Note for Linux: If you get an error message that looks like this:
> `Error: watch GD/newIDE/app/some/file ENOSPC` then follow the instructions [here](https://stackoverflow.com/questions/22475849/node-js-error-enospc) to fix.

### Development of the standalone app

You can run the standalone app with Electron. **Make sure that you've launched `npm start` (or `yarn start`) in the `app` folder before** (see above) and **keep it running** (in development, the app is served from a local server, even for the standalone app).

```bash
cd newIDE/app && npm start # Be sure to have this running in another terminal, before the rest!

# In a new terminal:
cd newIDE/electron-app
npm install # or yarn
npm run start # or yarn start
```

### Quick Install and Run

There is a script file that automates cloning this repository, building the IDE and running it:

-   For Windows: You can download the batch script [here](https://raw.githubusercontent.com/4ian/GDevelop/master/scripts/gitCloneAndBuildGD.bat) and save it to where you want GDevelop to be cloned, then simply run it.

### Development of UI components

You can run a [Storybook](https://github.com/storybooks/storybook) that is used as a playground for rapid UI component development and testing:

```bash
cd newIDE/app
npm run storybook # or yarn storybook
```

> ℹ️ When creating a Pull Request/pushing a commit, a CI will build the Storybook for you and host it temporarily to allow to test components directly from your browser. Navigate to `http://gdevelop-storybook.s3-website-us-east-1.amazonaws.com/YOUR_BRANCH/latest/index.html` to see it.

Find [here the Storybook of the latest version on master](http://gdevelop-storybook.s3-website-us-east-1.amazonaws.com/master/latest/index.html).

### Tests

Unit tests, type checking and auto-formatting of the code can be launched with these commands:

```bash
cd newIDE/app
npm run test # or yarn test
npm run flow # or yarn flow
npm run format # or yarn format
```

### Theming

It's pretty easy to create new themes. Check the [README about themes](./README-themes.md)

### Development of the game engine or extensions

- If you want to create/modify _extensions_, check the [README about extensions](./README-extensions.md) for step-by-step explanations to get started in 5 minutes.
- The _game engine core_ ([GDJS](https://github.com/4ian/GDevelop/tree/master/GDJS)) is in [GDJS/Runtime folder](https://github.com/4ian/GDevelop/tree/master/GDJS/Runtime).

If you modify any file while the editor is running, a watcher will _automatically rebuild_ the engine (look at the console to be sure).
You can then _launch a preview_ in GDevelop.

### Recommended tools for development

Any text editor is fine, but it's a good idea to have one with _Prettier_ (code formatting), _ESLint_ (code linting) and _Flow_ (type checking) integration. [Modern JavaScript is used for the editor](https://github.com/4ian/GDevelop/blob/master/newIDE/docs/Supported-JavaScript-features-and-coding-style.md).

👉 You can use [Visual Studio Code](https://code.visualstudio.com) with these extensions: [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode), [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Flow Language Support](https://github.com/flowtype/flow-for-vscode).

### Testing and developing with the cloud storage providers (Google Drive, Dropbox, OneDrive, etc...)

Cloud storage providers are set up with development keys when you're running GDevelop in development mode. For these, to work, you must execute the web-app not from the traditional `http://localhost:3000` origin, but from `http://gdevelop-app-local.com:3000`:

-   Set up a [redirection in your hosts file](https://www.howtogeek.com/howto/27350/beginner-geek-how-to-edit-your-hosts-file/), that should look like: `127.0.0.1 gdevelop-app-local.com`.
-   Launch the web app from `http://gdevelop-app-local.com:3000`.

> This is only necessary if you want to have cloud storage providers working in development. If not done, GDevelop will simply display an error while trying to use them.

## (Optional) Building a portable bundle for CI / headless usage 🤖

Build a self-contained zip (no installer, no code-signing) that can be
extracted on a CI runner and used to execute CLI commands:

```bash
cd newIDE/electron-app
npm install

# Linux / macOS
GD_PORTABLE_BUILD=true npm run build -- --publish never

# Windows (PowerShell)
$Env:GD_PORTABLE_BUILD='true'; npm run build -- --publish never
```

The resulting zip contains the full editor. After extracting, run commands like:

```bash
# Windows
GDevelop.exe --disable-update-check --run-command EXPORT_HTML5_EXTERNAL path\to\game.json

# Linux (install required libs: sudo apt install -y libnss3 libasound2t64)
./gdevelop --no-sandbox --disable-update-check \
  --run-command EXPORT_HTML5_EXTERNAL /path/to/game.json
```

`IMPORT_EXTENSION_AND_SAVE` imports one or more extension files into the project and saves it. Pass
each extension path with a repeated `--cmd-args` flag:

```bash
# Windows
GDevelop.exe --disable-update-check --run-command IMPORT_EXTENSION_AND_SAVE path\to\game.json ^
  --cmd-args path\to\FirstExtension.json --cmd-args path\to\SecondExtension.json

# Linux
./gdevelop --no-sandbox --disable-update-check \
  --run-command IMPORT_EXTENSION_AND_SAVE /path/to/game.json \
  --cmd-args /path/to/FirstExtension.json --cmd-args /path/to/SecondExtension.json
```

`--run-command` also accepts any editor command palette command name (see
`newIDE/app/src/CommandPalette/CommandsList.js`), for example `SAVE_PROJECT`.
These launch the real editor command — the same code path as choosing it from
the palette — as "fire-and-forget": the CLI dispatches it and exits without
waiting for it to finish or reporting its result, so they suit headless
automation rather than commands whose exit code you need to check.

```bash
# Linux — re-save the project through the editor's own save code path.
./gdevelop --no-sandbox --disable-update-check \
  --run-command SAVE_PROJECT /path/to/game.json
```

Extra flags: `--keep-open` (don't quit after command), `--dev-tools` (open DevTools).

If the same project is already open in a running editor, the command runs in that
window (fire-and-forget; the CLI exits without waiting or reporting the real result).
Otherwise the command runs headless with a real exit code (including CI).

### Making the CLI available on PATH

When GDevelop is installed with the Windows NSIS installer, the install
directory is added to the current user's `PATH` automatically. Open a new
terminal after installing, then run `GDevelop --run-command ...`.

For other builds (macOS `.dmg`, Linux AppImage/`.deb`), run the command
palette command **"Install GDevelop CLI in PATH"** from the running app:
on Windows it appends the install directory to the user `PATH`; on
macOS/Linux it creates a `gdevelop` symlink in `/usr/local/bin`.

## (Optional) Building and deploying the standalone app 📦

> 🖐 This section is only for maintainers that want to deploy the "official app" on the GDevelop website. If you're working on contributions for GDevelop, you won't need it. You can download ["Nightly Builds" of GDevelop here too](./docs/Nightly-Builds-and-continuous-deployment.md).

### Desktop version

First, update the version number in `newIDE/electron-app/app/package.json` and merge the change to master.

Then, wait for the CIs (CircleCI & AppVeyor) to build the artifacts needed for the release (MacOS+Linux and Windows respectively).

Once finished, you can download them (use `newIDE/app/scripts/download-all-build-artifacts.js` script) and upload them to the new Github release!

> Note: You can also build manually a desktop version locally by running `npm run build` in `newIDE/electron-app`.

### Webapp version

```bash
cd newIDE/web-app
yarn deploy # or npm run deploy
```

> Note: this will also upload the game engine (GDJS) and extension sources, needed by the IDE and purge the CloudFlare cache.

### (Optional) Updating translations

Extract translations from the editor, as well as GDevelop Core and extensions:

```bash
cd newIDE/app
yarn extract-all-translations # or npm run extract-all-translations
```

This will create `ide-messages.pot` (in `newIDE/app/src/locales/en`) and `gdcore-gdcpp-gdjs-extensions-messages.pot` (in `scripts`). Upload both of them to [the GDevelop Crowdin project](https://crowdin.com/project/gdevelop).

To update translations, build and download the translations from Crowdin. Extract everything in `newIDE/app/src/locales`. And run:

```bash
yarn compile-translations # or npm run compile-translations
```

## 3) How to contribute? 😎

The editor, the game engine and extensions are always in development. Your contribution is welcome!

-   Check [the **roadmap** for ideas and features planned](https://trello.com/b/qf0lM7k8/gdevelop-roadmap).

    You can contribute by picking anything here or anything that you think is missing or could be improved in GD5! If you don't know how to start, it's a good idea to play a bit with the editor and see if there is something that is unavailable and that you can add or fix.

-   Follow the [Development](https://github.com/4ian/GDevelop/tree/master/newIDE#development) section of the README to set up GDevelop and start modifying either **the editor** or **[the game engine/extensions](https://github.com/4ian/GDevelop/tree/master/newIDE#development-of-the-game-engine-or-extensions)**.

-   To submit your changes, you have to first create a Fork on GitHub (use the Fork button on the top right), then [create a Pull Request](https://help.github.com/articles/creating-a-pull-request-from-a-fork/).

-   Finally, make sure that the tests pass (refer to this README and the [game engine README](https://github.com/4ian/GDevelop/tree/master/GDJS) for learning how to run tests).
