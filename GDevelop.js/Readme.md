# GDevelop.js

This is a port of some parts of **GDevelop** to Javascript using **[Emscripten]**.

GDevelop is a full featured, cross-platform, open-source game creator software requiring no programming skills. Download it on [the official website](https://gdevelop-app.com).

## How to build

- Make sure you have [CMake 3.5+](http://www.cmake.org/)

- On Windows, install MinGW (only `mingw32-base-bin` is required).

- Install [Emscripten](https://github.com/kripken/emscripten), as explained on the [Emscripten installation instructions](http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html):

```shell
git clone https://github.com/juj/emsdk.git
cd emsdk
./emsdk update
./emsdk install sdk-1.37.37-64bit
./emsdk activate sdk-1.37.37-64bit
source ./emsdk_env.sh
```

(on Windows run `emsdk` instead of `./emsdk`, and `emsdk_env.bat` instead of `source ./emsdk_env.sh`. For up-to-date information, check again [Emscripten installation instructions](http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html)).

- Make sure you have Node.js installed and grunt:

```shell
    npm install -g grunt-cli
```

- Launch the build from GDevelop.js folder:

```shell
    cd GDevelop.js
    npm install
    npm run build
```

Output is created in _/path/to/GD/Binaries/Output/libGD.js/_.

- You can then launch GDevelop 5 that will use your build of Gdevelop.js:

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
- patch SFML `Config.hpp` file to make Emscripten recognized as a linux target,
- launch CMake inside to compile GDevelop with _Emscripten toolchain file_,
- update the glue.cpp and glue.js from Bindings.idl using _Emscripten WebIDL Binder_,
- launch the compilation with _make_ and wrap the generated `libGD.js.raw` into the final `libGD.js` file.

It also create a compressed `libGD.js.gz` file which is handy for distributing the library pre-compressed to web browsers.

## Documentation

- The file [Bindings.idl](https://github.com/4ian/GDevelop.js/blob/master/Bindings/Bindings.idl) describes all the classes available in GDevelop.js.
- Refer to [GDevelop documentation](http://4ian.github.io/GD-Documentation/GDCore%20Documentation/) for detailed documentation of the original C++ classes.

[emscripten]: https://github.com/kripken/emscripten
