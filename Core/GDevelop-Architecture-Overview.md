# GDevelop Architecture Overview

GDevelop is architectured around a `Core` library, the game engine (`GDJS`) and extensions (`Extensions` folder). The editor (`newIDE` folder) is using all of these libraries. This is a recap table of the main folders:

| Directory     | ℹ️ Description                                                                                        |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| `Core`        | GDevelop core library, containing common tools to implement the IDE and work with GDevelop games.     |
| `GDJS`        | The game engine, written in TypeScript, using PixiJS (WebGL), powering all GDevelop games.            |
| `GDevelop.js` | Bindings of `Core`, `GDJS` and `Extensions` to JavaScript (with WebAssembly), used by the IDE. |
| `newIDE`      | The game editor, written in JavaScript with React, Electron and PixiJS.                               |
| `Extensions`  | Extensions for the game engine, providing objects, behaviors, events and new features.                |

The rest of this page is an introduction to the main concepts of GDevelop architecture.

## Some vocabulary: "Runtime" and "IDE"

**IDE** stands for "Integrated Development Environment". A synonym for it is also simply "editor". In GDevelop, the software itself, that is used to create games and running as an app or a web-app, is called the "GDevelop Editor" or the "GDevelop IDE"

> The term "IDE" is also used in some folders. When you browse `Core` or `GDJS` subfolders, some folders are called `IDE`. They contain classes and tools that are **only useful for the editor** (they are not per se mandatory to describe the structure of a game).

**Runtime** is a word used to describe classes, tools and source files being used during a game. This could also be called "in-game" or a "game engine".

> When you browse `GDJS` subfolder, you can find a folder called `Runtime`. It's the **game engine** of GDevelop.

Extensions do have the same distinction between the "**IDE**" part and the "**Runtime**" part. For example, most extensions have:

-   A file called [`JsExtension.js`(https://github.com/4ian/GDevelop/blob/master/Extensions/ExampleJsExtension/JsExtension.js)], which contains the _declaration_ of the extension for the **IDE**
-   One or more files implementing the feature for the game, in other words for **Runtime**. This can be a [Runtime Object](https://github.com/4ian/GDevelop/blob/master/Extensions/ExampleJsExtension/dummyruntimeobject.ts) or a [Runtime Behavior](https://github.com/4ian/GDevelop/blob/master/Extensions/ExampleJsExtension/dummyruntimebehavior.ts), [functions called by actions or conditions](https://github.com/4ian/GDevelop/blob/master/Extensions/ExampleJsExtension/examplejsextensiontools.ts) or by the game engine.

### "Runtime" and "IDE" difference using an example: the `gd::Variable` class

In GDevelop, developers can associate and manipulate variables in their games. To represent them, we have two things:

-   The **editor** `gd::Variable` that is part of the structure of the game, so living in [GDCore in Variable.h](https://docs.gdevelop.io/GDCore%20Documentation/classgd_1_1_variable.html). This is what is shown in the editor, saved on disk in the project file.
-   The **game engine** variable, called `gdjs.Variable` in GDJS. [Documentation is in the GDJS **game engine**](https://docs.gdevelop.io/GDJS%20Runtime%20Documentation/classes/gdjs.Variable.html). This JavaScript class is what is used during a game.

The editor `gd::Variable` **knows nothing** about the game engine class `gdjs.Variable`. And the `gdjs.Variable` class in the game engine knows almost nothing from `gd::Variable` (apart from how it's written in JSON, to be able to load a game default variables).

> Note that the name `gdjs.Variable` is maybe a _bad decision_: it should have been called a `gdjs.RuntimeVariable`, like `gdjs.RuntimeObject` and like most other classes of the game engine.

## What's inside "Core" (`GDCore` folder)?

GDevelop "Core" is basically containing everything that is used to **describe and manipulate the structure of a game** (called a `Project` internally). This includes events, scenes, objects, behaviors, events, etc... All of these are implemented using C++ classes, in [this folder named `Project`](https://github.com/4ian/GDevelop/tree/master/Core/GDCore/Project).

GDevelop "Core" also contains **tools** to manipulate these `Project`. In particular, `Core/GDCore/IDE` folder is containing C++ classes allowing to do operations on the structure of a game. For example, [WholeProjectRefactorer](https://github.com/4ian/GDevelop/blob/master/Core/GDCore/IDE/WholeProjectRefactorer.cpp) is a very powerful tool, used to rename all objects in a game, update events after an object is deleted, and more generally do Project-wide refactoring. The directory contains other "tool" functions to manipulate the [resources of projects](https://github.com/4ian/GDevelop/tree/master/Core/GDCore/IDE/Project) or do a [search in events](https://github.com/4ian/GDevelop/tree/master/Core/GDCore/IDE/Events).

## What's inside GDJS? Why do I see some C++ file there?

While `GDJS/Runtime` folder is the game engine that is executed inside a game, `GDJS/GDJS` is the "IDE" part, which are the C++ classes describing to the editor various things like:

-   How [do you do an export](https://github.com/4ian/GDevelop/tree/master/GDJS/GDJS/IDE),
-   What are [the default extensions](https://github.com/4ian/GDevelop/tree/master/GDJS/GDJS/Extensions/Builtin),
-   How do you [generate JS code from events](https://github.com/4ian/GDevelop/tree/master/GDJS/GDJS/Events/CodeGeneration),

The game engine is in GDJS/Runtime and is all written in TypeScript.

## What about events?

An "**event**" is by default something that [is mostly empty](https://docs.gdevelop.io/GDCore%20Documentation/classgd_1_1_base_event.html). In a more traditional programming language, an event can be seen as a scope or block (example: `{ some code here }` in a C style language like JavaScript, Java or C++).

[Default events are defined](https://github.com/4ian/GDevelop/tree/master/Core/GDCore/Events/Builtin) in GDevelop Core.
In particular, there is StandardEvent, which has conditions and actions. Conditions and actions are both a list of [`gd::Instruction`](https://docs.gdevelop.io/GDCore%20Documentation/classgd_1_1_instruction.html). A `gd::Instruction` is either a condition or an action (it depends only on the context where they are used).

A `gd::Instruction` is "just" a type (the name of the action or condition), and some parameters. You can think of it as a function in a programming language (`add(2, 3)` is calling a function called "add" with parameters "2" and "3"). Conditions have the special thing that they are functions returning true or false (and potentially being used to do a filter on the objects being picked for next conditions and actions).

### Why can't I see any "RuntimeEvent" or events during the game?

They do not exist anymore! ✨

Events are translated (we also say "transpiled" or "generated") into "real" code in a programming language. This process is called "Code Generation", and is [done here for the TypeScript game engine](https://github.com/4ian/GDevelop/tree/master/GDJS/GDJS/Events/CodeGeneration).

### Can I extract Events classes and a code generator to make a development environment based on GDevelop events?

You're welcome to do so! Please get in touch :)

## I can see more than one Extensions folder, why?

The idea of the GDevelop editor and game engine is to have a lean game engine, supporting almost nothing. Then, one can add "mods", "plugins", "modules" for GDevelop. We chose to call them "**Extensions**" in GDevelop.

-   `GDevelop/Core/GDCore/Extensions` is the **declaration** of default (we say "builtin") extensions, that are available for any game and are "mandatory". They are called Extensions but they could be named "Extensions that will always be in your game". In programming languages, this is called a "[Standard Library](https://en.wikipedia.org/wiki/Standard_library)" (but don't get too distracted by this naming).
-   `GDevelop/GDJS/GDJS/Extensions/` is reusing these **declarations** and **adding** their own declarations. Mainly, they are setting the name of the functions to be called (either in TypeScript or in C++) for each action, condition or expression.
-   `GDevelop/Extensions/` is the folder for the "mods"/"plugins" for GDevelop - the ones that are not mandatory. They are not part of GDCore - they work on their own.

> In theory, all extensions could be moved to `GDevelop/Extensions/`. In practice, it's more pragmatic to have a set of "built-in" extensions with basic features.

## What's GDevelop.js? Do we care about this?

Everything in GDevelop.js is meant to create a "bridge" allowing us to run and use C++ from JavaScript for the **IDE** so that [we can write an editor entirely in JavaScript](https://github.com/4ian/GDevelop/tree/master/newIDE) and have it working in a web browser.

-   We're using Emscripten which is compiling C++, but instead of writing a "native binary", it's writing a file that works in a browser (basically, JavaScript!).

-   The most useful file is [Bindings.idl](https://github.com/4ian/GDevelop/blob/master/GDevelop.js/Bindings/Bindings.idl) that is describing everything in C++ that must be exposed to JavaScript (in the editor, not in-game. Remember that during the game, we're at **Runtime**, so all of this does not exist anymore)

-   The rest of the files are mostly bridges doing "weird stuff" to translate from JS to C++ or vice versa. It requires a bit of knowledge about how the ["bridge", made by Emscripten, called WebIDL](https://emscripten.org/docs/porting/connecting_cpp_and_javascript/WebIDL-Binder.html) is working.

    You don't need to work with these unless you want to expose something that is written in C++ to the editor, and writing the interface in Bindings.idl is not sufficient.

90% of the time, you can just read or write about a class in [Bindings.idl](https://github.com/4ian/GDevelop/blob/master/GDevelop.js/Bindings/Bindings.idl). If you work in C++ classes, you may have some time to add a header file in Wrapper.cpp, and your C++ class is "automagically" compiled and available in JavaScript after writing the corresponding interface in Bindings.idl.

### I want all the gory details about GDevelop.js 🧐

All the required C++ files are imported into this huge list: <https://github.com/4ian/GDevelop/blob/master/GDevelop.js/Bindings/Wrapper.cpp#L1-L79>. C++ compilation is done with a "build system" called CMake, which is using [this file](https://github.com/4ian/GDevelop/blob/master/GDevelop.js/CMakeLists.txt#L82-L101) to see what to compile.

> In an ideal world, there would be something to do this automatically, so the GDevelop.js folder would not even exist 😉
> If you're interested and want to know more about GDevelop.js bridging between C++ and JavaScript, look at [this talk from GDevelop original author](https://www.youtube.com/watch?v=6La7jSCnYyk).

## Misc questions

### What's the deal with C++? Why so much of it?

GDevelop was originally written in C++. It's a scary language at first but is portable across almost any existing machine in this universe, can be pretty good, safe and readable with the latest C++ features.

### What's the deal with JavaScript/TypeScript? Why so much of it?

JavaScript, with the latest language proposals, is a very capable language, fast to write and safe with typing:

-   Performance is getting pretty good with recent browsers JIT features.
-   Frontend frameworks like React, used for GDevelop IDE, allow for very fast and modular interface development.
-   The web is an incredible and unmatched target when it comes to cross-platform (and cross-form factor) apps.

More generally, the web is a great target for games with the rise of WebGL and WebAssembly - though GDevelop should stay modular to adapt to newer platforms for the exported games in the future.
