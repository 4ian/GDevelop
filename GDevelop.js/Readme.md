# GDevelop.js

This is the port of GDevelop core classes to WebAssembly+JavaScript. This allows [GDevelop Core libraries](https://github.com/4ian/GDevelop) to run in a browser or on Node.js.

> 🎮 GDevelop is a full-featured, cross-platform, open-source game development software requiring no programming skills. Download it on [the official website](https://gdevelop.io).

## How to build

> 👋 Usually, if you're working on the GDevelop editor or extensions in JavaScript, you don't need to rebuild GDevelop.js. If you want to make changes in C++ extensions or classes, read this section.

- Prerequisite tools installed:
  - [CMake 3.17+](http://www.cmake.org/) (3.5+ should work on Linux/macOS). On macOS, you can install it via Homebrew (recommended for Apple M1 Architectures).
  - [Node.js](https://nodejs.org/). (We recommend using [nvm](https://github.com/nvm-sh/nvm) to be able to switch between Node versions easily).
  - Python (via [pyenv](https://github.com/pyenv/pyenv) for versions management).

- Install [Emscripten](https://github.com/kripken/emscripten), as explained below or on the [Emscripten installation instructions](http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html):

| Linux/macOS                                  | Windows                                      |
| -------------------------------------------- | -------------------------------------------- |
| `git clone https://github.com/juj/emsdk.git` | `git clone https://github.com/juj/emsdk.git` |
| `cd emsdk`                                   | `cd emsdk`                                   |
| `git pull`                                   | `git pull`                                   |
| `./emsdk install 1.39.6`                     | `emsdk install 1.39.6`                       |
| `./emsdk activate 1.39.6`                    | `emsdk activate 1.39.6`                      |
| `source ./emsdk_env.sh`                      | `emsdk_env.bat`                              |

> ⚠️ If you are on Apple M1, this version of emsdk may not be available for this architecture and you will get an error when installing it, indicating a missing binary. If this is the case, a workaround is to modify the `emsdk.py` line 132 with `machine = 'x86_64'` to ensure a correct binary is downloaded.

- Launch the build from GDevelop.js folder:

```shell
    cd GDevelop.js
    npm install
    npm run build
```

> ⚠️ If the npm install fails, relaunch it in a different terminal using a recent Node.js and npm version (to avoid using the old npm version from Emscripten).

> ℹ️ Output is created in _/path/to/GD/Binaries/embuild/GDevelop.js/_ and also copied to GDevelop 5 IDE (`newIDE` folder).

-> ⏱ The linking (last step) of the build can be made a few seconds faster by specifying `-- --dev`. Be sure to remove it before building a release version, as this disable "link-time optimizations" of the generated WebAssembly module.

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

The npm _build_ task:

- Creates `Binaries/embuild` directory,
- Launches CMake inside to compile GDevelop with _emconfigure_ to use Emscripten toolchain,
- Updates the glue.cpp and glue.js from Bindings.idl using _Emscripten WebIDL Binder_,
- Launches the compilation with `make` (or `ninja` on Windows with CMake 3.17+) (you can also compile using MinGW-32 using `npm run build-with-MinGW`).

See the [CMakeLists.txt](./CMakeLists.txt) for the arguments passed to the Emscripten linker.

## Documentation

- The file [Bindings.idl](https://github.com/4ian/GDevelop/blob/master/GDevelop.js/Bindings/Bindings.idl) describes all the classes available in GDevelop.js.
- Refer to [GDevelop documentation](https://docs.gdevelop.io/GDCore%20Documentation/) for detailed documentation of the original C++ classes.
