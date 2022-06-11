# How are exporters and "Platforms" working?

> 🤚 Before starting to read this document, it's highly recommended that you read the [architecture overview here](../../Core/GDevelop-Architecture-Overview.md). 👈

When a game is previewed or exported, there are multiple concepts that are being used.

GDevelop is built on **platforms**. A platform is the term used in GDevelop codebase to describe the class that:

- provides the _code generator for events_,
- provides the _generator that export a whole game_ (or a preview), taking a [`gd::Project`](http://docs.gdevelop.io/GDCore%20Documentation/classgd_1_1_project.html) as argument and copying all resources, exporting files, launching the _code generator for events_.
- provides the **game engine**, also called _Runtime_, is also provided by the platform. You can think of it as a set of files that are copied next to the game resource and events.
- stores extensions, which can be considered as small parts of the game engine that can be used and copied into the final game.

For now, there is a _single_ **platform** used in the GDevelop editor, which is called _GDJS_ (GDevelop JavaScript platform). The different exports that you can find in the editor are using the same _generator that export a whole game_ but with different parameters.

## Can I get examples in the source code?

- The _code generator for events_ for GDJS is in [GDJS/Events/CodeGeneration](https://github.com/4ian/GDevelop/tree/master/GDJS/GDJS/Events/CodeGeneration).
- The _generator that exports a whole game_ for GDJS is in [GDJS/IDE](https://github.com/4ian/GDevelop/tree/master/GDJS/GDJS/IDE).
- The _game engine_ for GDJS is in [GDJS/Runtime](https://github.com/4ian/GDevelop/tree/master/GDJS/Runtime).
- The _extensions_ for GDJS are in [Extension](https://github.com/4ian/GDevelop/tree/master/Extensions). Precisely, they are the extensions that are declared using `JsExtension.cpp` or `JsExtension.js` files.

> Confused about why extensions are "declaring" stuff? Read the [overview of the architecture](https://github.com/4ian/GDevelop/blob/master/Core/GDevelop-Architecture-Overview.md).

## What if I want to improve GDevelop so that it exports games to XXX?

It depends on what you are targeting:

- If your target is running in a **recent browser environment**, with JavaScript and WebGL, you might just want to define a [new export in the IDE](https://github.com/4ian/GDevelop/tree/master/newIDE/app/src/Export) and a few different files like an `index.html` or a set of files to export.
- If your target is an **environment running JavaScript**, you might want to use GDJS and define _new renderers_ for the objects. This is what is done for the experimental export to Cocos2d-JS: objects have renderers that are written in JavaScript and rendering objects with the Cocos2d-JS API, instead of Pixi.js
- If your target is **something not running JavaScript**, you might want to re-create a platform (like GDJS). While the **Core** library will help you, you'll still have to re-make a code generator, make a brand new game engine (or adapt the existing one), rewrite extension objects using the new game engine/renderer.

## Am I forced to write these "platforms" to export to something new? I mean, there is C++ code to write 😬

It's highly recommended as the **Core** library is actually making a lot of stuff for you. It contains:

- A code generator that you can specialize to export to the language that you need. This includes:
  - Events code generation
  - Expression code generation
  - Proper handling of objects and behaviors
  - Potential optimizations
- Analyzers that go trough the game:
  - Strip unused parts of the game
  - List the resources
  - Check for dependencies between scenes, external layouts, external events
- Other tools:
  - Class to copy all resources in a folder
- etc...

Remember that exporting the game is one thing, but you might also have to support the same extensions as the existing ones in GDevelop (depending on how much degree of compatibility you're aiming for).
