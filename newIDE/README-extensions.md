# Writing extensions for GDevelop 5

GDevelop editor and games engines are designed so that all objects, behaviors, actions, conditions and expressions
are provided by _extensions_. These extensions are composed of two parts:

- the _declaration_ of the extension, traditionally done in a file called `JsExtension.js`.
- the _implementation_ of the extension for the game engine (also the "Runtime"), containing the functions corresponding to the actions/conditons/expressions and the classes used for the objects or behaviors. The implementation is traditionally in files called `extensionnametools.js`, `objectnameruntimeobject.js` or `objectnameruntimebehavior.js`.

> Note that some GDevelop extensions are declared in C++, in files called `JsExtension.cpp`. If you want to edit them,
> refer to the paragraph about them at the end.

## 1) Installation 💻

To modify extensions, you need to have the development version of GDevelop running. Make sure to have [Git](https://git-scm.com/) and [Node.js](https://nodejs.org) installed. [Yarn](https://yarnpkg.com) is optional.

```bash
git clone https://github.com/4ian/GD.git
cd GD/newIDE/app
npm install #or yarn
```

Refer to the [GDevelop IDE Readme](./README.md) for more information about the installation.

## 2) Development 🤓

- First, run [GDevelop with Electron](https://github.com/4ian/GDevelop/blob/master/newIDE/README.md#development-of-the-standalone-app).

  When GDevelop is started, the developer console should be opened. Search for the message `Loaded x JS extensions.` that indicates the loading of extensions.

- You can now open an extensions contained in the folder _Extensions_ at the root of the repository. For example, you can open [Extensions/FacebookInstantGames](https://github.com/4ian/GDevelop/tree/master/Extensions/FacebookInstantGames). Edit the JsExtension.js file or a runtime file. After any change, you must import them in GDevelop:

  ```bash
  cd scripts
  node import-GDJS-Runtime.js #This copy extensions declaration and runtime into GDevelop.
  ```

- Finally, verify that the changes are applied:

  - If you modified the declaration (`JsExtension.js`), reload GDevelop by pressing Ctrl+R (or Cmd+R on macOS) in the developer console.
  - If you modified a Runtime file, relaunch a preview. Open the developer console if you want to check for any errors.

- You can now iterate and relaunch the script to develop the extension! 🚀

  > ⚠️ Always check the developer console after reloading GDevelop. If there is any error signaled, click on it to see what went wrong. You may have done a syntax error or mis-used an API.

### 2.1) Implement your feature for the game engine 👾

> ℹ️ Implement your extension in file called `extensionnametools.js` (for general functions), `objectnameruntimeobject.js` (for objects) or `behaviornameruntimebehavior.js` (for behaviors). See then the next section for declaring these files and the content of the extension to the IDE.

Check the [GDJS game engine documentation here](http://4ian.github.io/GD-Documentation/GDJS%20Runtime%20Documentation/index.html). It's also a good idea to check the [Runtime folder of GDJS](../GDJS/README.md) to see directly how the game engine is done when needed. Files for the game engine should [mostly be written in JavaScript "ES5 flavor" (i.e: usual, classic good old JavaScript) (click to learn more)](https://github.com/4ian/GDevelop/blob/master/newIDE/docs/Supported-JavaScript-features-and-coding-style.md).

#### How to create functions to be called by events

See examples in [examplejsextensiontools.js](../Extensions/ExampleJsExtension/examplejsextensiontools.js).

Read about [`gdjs.RuntimeScene`](file:///Users/florianrival/Projects/F/GD/docs/GDJS%20Runtime%20Documentation/gdjs.RuntimeScene.html), the class representing a scene being played, as lots of events can need it.

#### How to create a behavior by extending `gdjs.RuntimeBehavior`

See examples in [dummyruntimebehavior.js](../Extensions/ExampleJsExtension/dummyruntimebehavior.js) (or [dummywithshareddataruntimebehavior.js](../Extensions/ExampleJsExtension/dummywithshareddataruntimebehavior.js) for an example with shared data between behaviors).

You'll be interested in the constructor (to initialize things), `onDeActivate` (called when behavior is deactivated), `doStepPreEvents`
and `doStepPostEvents` (to run logic before/after the events at each frame).

Read about [`gdjs.RuntimeBehavior`](file:///Users/florianrival/Projects/F/GD/docs/GDJS%20Runtime%20Documentation/gdjs.RuntimeBehavior.html), the base class inherited by all behaviors, to see everything that is available.

#### How to create an object by extending `gdjs.RuntimeObject`

See example in [dummyruntimeobject.js](../Extensions/ExampleJsExtension/dummyruntimeobject.js) (the object itself) and [dummyruntimeobject-pixi-renderer.js](../Extensions/ExampleJsExtension/dummyruntimeobject-pixi-renderer.js) (the renderer, using PIXI.js).

You'll be interested in the constructor (to initialize things), `update` (called every frame) and the other methods. In the PIXI renderer, check the constructor (where PIXI objects are created). Other methods depend on the renderer.

Read about [`gdjs.RuntimeObject`](file:///Users/florianrival/Projects/F/GD/docs/GDJS%20Runtime%20Documentation/gdjs.RuntimeObject.html), the base class inherited by all objects.

### 2.2) Declare your extension to the IDE 👋

> ℹ️ Declaration must be done in a file called `JsExtension.js`. Your extension must be in Extensions folder, in its own directory.

The API to declare extensions is almost 100% equivalent to the way extensions are declared in C++, so most links will redirect to this documentation.

#### Declare the extension information

Use [`extension.setExtensionInformation`](http://4ian.github.io/GD-Documentation/GDCore%20Documentation/classgd_1_1_platform_extension.html#ac53e5af617a9ed91c280d652899557c3) to declare basic information about your extension.

> 👉 See an example in the [example extension _JsExtension.js_ file](../Extensions/ExampleJsExtension/JsExtension.js).

#### Declare actions, conditions and expressions

Use [`addAction`](http://4ian.github.io/GD-Documentation/GDCore%20Documentation/classgd_1_1_platform_extension.html#a34e95be54f2dfa80b804e8e4830e7d9c), `addCondition`, `addExpression` or `addStrExpression` to declare actions, conditions or expressions.

- Chain calls to [`addParameter`](http://4ian.github.io/GD-Documentation/GDCore%20Documentation/classgd_1_1_instruction_metadata.html#a95486188a843f9ac8cdb1b0700c6c7e5) to declare the parameters of your action/condition/expression.
- Call `getCodeExtraInformation()` and then functions like [`setFunctionName` and `setIncludeFile`](http://4ian.github.io/GD-Documentation/GDCore%20Documentation/classgd_1_1_instruction_metadata_1_1_extra_information.html) to declare the JavaScript function to be called and the file to be included.

> You can call these functions on the `extension` object, or on the objects returned by `extension.addObject` (for objects) or `extension.addBehavior` (for behaviors). See below.

> ⚠️ Always double check that you've not forgotten an argument. Such errors/mismatchs can create silent bugs that could make GDevelop instable or crash while being used.

> 👉 See an example in the [example extension _JsExtension.js_ file](../Extensions/ExampleJsExtension/JsExtension.js).

#### Declare behaviors

Add a behavior using [`addBehavior`](http://4ian.github.io/GD-Documentation/GDCore%20Documentation/classgd_1_1_platform_extension.html#a75992fed9afce730db56af9d4d8177ca). The last two parameters are the `gd.Behavior` and the `gd.BehaviorsSharedData` object representing the behavior and its (optional) shared data

- For the behavior, create a `new gd.BehaviorJsImplementation()` and define `updateProperty` and `getProperties`.
- For the shared data (which are properties shared between all behaviors of the same type), if you don't have the need for it, just pass `new gd.BehaviorsSharedData()`. If you need shared data, create a `new gd.BehaviorSharedDataJsImplementation()` and define `updateProperty` and `getProperties`.

> ⚠️ Like other functions to declare extensions, make sure that you've not forgotten to declare a function and that all arguments are correct.

> 👉 See an example in the [example extension _JsExtension.js_ file](../Extensions/ExampleJsExtension/JsExtension.js).

#### Declare objects

Add an object using [`addObject`](http://4ian.github.io/GD-Documentation/GDCore%20Documentation/classgd_1_1_platform_extension.html#a554baca486909e8741e902133cceeec0). The last parameter is the `gd.Object` representing the object:

- Create a `new gd.ObjectJsImplementation()` and define `updateProperty` and `getProperties` (for the object properties) and `updateInitialInstanceProperty` and `getInitialInstanceProperties` (for the optional properties that are attached to each instance).

> 👉 See an example in the [example extension _JsExtension.js_ file](../Extensions/ExampleJsExtension/JsExtension.js).

> ℹ️ After doing this, you can actually see your object in GDevelop! Read the next sections to see how to add an editor and a renderer for instances on the scene editor.

#### Declare object editor

To add an editor to your object, implement the function `registerEditorConfigurations` in your extension module. For now, only a default editor, displaying the object properties, is supported:

```js
registerEditorConfigurations: function(objectsEditorService) {
  objectsEditorService.registerEditorConfiguration(
    "MyDummyExtension::DummyObject", // Replace by your extension and object type names.
    objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor()
  );
}
```

> 👉 See an example in the [example extension _JsExtension.js_ file](../Extensions/ExampleJsExtension/JsExtension.js).

#### Declare the Pixi.js renderer for the instance of your object in the scene editor

Finally, to have the instances of your object displayed properly on the scene editor, implement the function `registerInstanceRenderers` in your extension module. The function is passed an object called `objectsRenderingService`, containing [RenderedInstance](./app/src/ObjectsRendering/Renderers/RenderedInstance.js), the "base class" for instance renderers, and PIXI, which give you access to [Pixi.js rendering engine](https://github.com/pixijs/pixi.js), used in the editor to render the scene.

> 👉 See an example in the [example extension _JsExtension.js_ file](../Extensions/ExampleJsExtension/JsExtension.js).

#### Declare events

> 👋 Declaring events is not yet exposed to JavaScript extensions. Your help is welcome to expose this feature!

## 3) Starting a new extension from scratch 🚀

If you want to start a new extension:

- Choose a unique and descriptive name. Create a folder with this name in _Extensions_.
- Create a file in it named _JsExtension.js_ and copy the content of the _JsExtension.js_ of another extension.
- Change the extension information (`extension.setExtensionInformation`). The first argument is the extension internal name and should be the same name as your folder for consistency.
- Remove all the actions/conditions/expressions declarations and tests, run `node import-GDJS-Runtime.js` and reload GDevelop to verify that your extension is loaded.
- Create a file called for example _yourextensionnametools.js_ in the same directory.
- Add back the declarations in your extension. Use `setIncludeFile` when declaring your actions/conditions/expressions and set the name of the js file that you've created, prefixed by the path from the root folder. For example:
  ```js
  .setIncludeFile("Extensions/FacebookInstantGames/facebookinstantgamestools.js")
  ```

## 4) How to contribute? 😎

If you have ideas or are creating a new extension, your contribution is welcome!

- To submit your extension, you have first to create a Fork on GitHub (use the Fork button on the top right), then [create a Pull Request](https://help.github.com/articles/creating-a-pull-request-from-a-fork/).

- Check the [the **roadmap** for ideas and features planned](https://trello.com/b/qf0lM7k8/gdevelop-roadmap).

- A few enhancements are also possible to exploit the full potential of extensions:

  - [ ] Add support for events
  - [ ] Document how to add custom icons
  - [ ] Add a button to reload extensions without reloading GDevelop IDE entirely.
  - [ ] Create a "watcher" script that automatically run `node import-GDJS-Runtime` anytime a change is made.

## 4) Note on the development of extensions declared in C++ (`JsExtension.cpp` or `Extension.cpp`)

The majority of extensions are still declared in C++ for being compatible with GDevelop 4.
Check the sources in [Extensions folder](https://github.com/4ian/GDevelop/tree/master/Extensions) and install [GDevelop.js](https://github.com/4ian/GDevelop.js). You'll then be able to make changes in C++ source files and have this reflected in the editor.
