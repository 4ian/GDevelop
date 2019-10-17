# GDevelop.js

This is the port of GDevelop core classes to JavaScript. This allow [GDevelop Core libraries](https://github.com/4ian/GDevelop) to run in a browser or on Node.js.

> 🎮 GDevelop is a full featured, cross-platform, open-source game development software requiring no programming skills. Download it on [the official website](https://gdevelop-app.com).

## How to build

> 👋 Usually if you're working on GDevelop editor or extensions in JavaScript, you don't need rebuilding GDevelop.js. If you want to make changes in C++ extensions or classes, read this section.

- Make sure you have [CMake 3.5+](http://www.cmake.org/) and [Node.js](nodejs.org/) installed.

- On Windows, install [MinGW](https://osdn.net/projects/mingw/releases/) (only `mingw32-base-bin` package is required).

- Install [Emscripten](https://github.com/kripken/emscripten), as explained on the [Emscripten installation instructions](http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html):

| Linux/macOS | Windows |
|-------------|---------|
| `git clone https://github.com/juj/emsdk.git` | `git clone https://github.com/juj/emsdk.git` |
| `cd emsdk`   | `cd emsdk`|
| `./emsdk update` | `emsdk update` |
| `./emsdk install sdk-1.37.37-64bit` | `emsdk install sdk-1.37.37-64bit` |
| `./emsdk activate sdk-1.37.37-64bit` | `emsdk activate sdk-1.37.37-64bit` |
| `source ./emsdk_env.sh` | `emsdk_env.bat` |

> For up-to-date information, check again [Emscripten installation instructions](http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html).

- Launch the build from GDevelop.js folder:

```shell
    cd GDevelop.js
    npm install
    npm run build
```

Output is created in _/path/to/GD/Binaries/Output/libGD.js/_.

- You can then launch GDevelop 5 that will use your build of GDevelop.js:

```shell
    cd ..
    cd newIDE/app
    npm install
    npm start
```

More information in [GDevelop 5 readme](https://github.com/4ian/GD/blob/master/newIDE/README.md).

### Tests

```
npm test
```

### About the internal steps of compilation

The grunt _build_ task:

- create `Binaries/embuild` directory,
- launch CMake inside to compile GDevelop with _Emscripten toolchain file_,
- update the glue.cpp and glue.js from Bindings.idl using _Emscripten WebIDL Binder_,
- launch the compilation with _make_ and wrap the generated `libGD.js.raw` into the final `libGD.js` file.

It also create a compressed `libGD.js.gz` file which is handy for distributing the library pre-compressed to web browsers.

## Documentation

- The file [Bindings.idl](https://github.com/4ian/GDevelop/blob/master/GDevelop.js/Bindings/Bindings.idl) describes all the classes available in GDevelop.js.
- Refer to [GDevelop documentation](http://4ian.github.io/GD-Documentation/GDCore%20Documentation/) for detailed documentation of the original C++ classes.
