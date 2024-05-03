# Writing extensions for GDevelop 5

GDevelop editor and games engines are designed so that all objects, behaviors, effects, actions, conditions and expressions
are provided by _extensions_. These extensions are composed of two parts:

-   the _declaration_ of the extension, traditionally done in a file called `JsExtension.js`.
-   the _implementation_ of the extension for the game engine (also called the "Runtime"), written in [TypeScript](https://www.typescriptlang.org/), containing the functions corresponding to the actions/conditions/expressions and the classes used for the objects or behaviors. The implementation is traditionally in files called `extensionnametools.ts`, `objectnameruntimeobject.ts` or `objectnameruntimebehavior.ts`.

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

-   First, run [GDevelop with Electron](https://github.com/4ian/GDevelop/blob/master/newIDE/README.md#development-of-the-standalone-app).

    When GDevelop is started, the developer console should be opened. Search for the message `Loaded x JS extensions.` that indicates the loading of extensions.

-   You can now open an extension contained in the folder _Extensions_ at the root of the repository. For example, you can open [Extensions/FacebookInstantGames](https://github.com/4ian/GDevelop/tree/master/Extensions/FacebookInstantGames). Edit the JsExtension.js file or a runtime file. Any changes will be automatically imported into the editor.

    > Verify that changes are imported in the console: you should see a message starting with `GDJS Runtime update`.
    > If you deactivated the automatic import in the preferences or want to import manually your changes, run the `import-GDJS-Runtime.js` script:
    >
    > ```bash
    > cd scripts
    > node import-GDJS-Runtime.js # This copy extensions declaration and runtime into GDevelop.
    > ```

-   Finally, verify that the changes are applied:

    -   If you modified the declaration (`JsExtension.js`), reload GDevelop by pressing Ctrl+R (or Cmd+R on macOS) in the developer console.
    -   If you modified a Runtime file, relaunch a preview. Open the developer console if you want to check for any errors.

-   You can now iterate and relaunch the script to develop the extension! 🚀

    > ⚠️ Always check the developer console after reloading GDevelop. If there is any error signaled, click on it to see what went wrong. You may have done a syntax error or misused an API.

### 2.1) Implement your feature for the game engine 👾

> ℹ️ Implement your extension in a file called `extensionnametools.ts` (for general functions), `objectnameruntimeobject.ts` (for objects) or `behaviornameruntimebehavior.ts` (for behaviors). See then the next section for declaring these files and the content of the extension to the IDE.

Check the [GDJS game engine documentation here](https://docs.gdevelop.io/GDJS%20Runtime%20Documentation/index.html). It's also a good idea to check the [Runtime folder of GDJS](../GDJS/README.md) to see directly how the game engine is done when needed. Files for the game engine should [almost all be written in TypeScript, with a few precautions to ensure good performance (click to learn more)](https://github.com/4ian/GDevelop/blob/master/newIDE/docs/Supported-JavaScript-features-and-coding-style.md).

#### How to create functions to be called by events

See examples in [examplejsextensiontools.ts](../Extensions/ExampleJsExtension/examplejsextensiontools.ts).

Read about [`gdjs.RuntimeScene`](https://docs.gdevelop.io/GDJS%20Runtime%20Documentation/classes/gdjs.RuntimeScene.html), the class representing a scene being played, as lots of events can need it.

##### How to create an asynchronous function

You can make an asynchronous action by making your function return an instance of an AsyncTask (don't forget to also declare your function as async!). You can make an `AsyncTask` yourself by extending the `gdjs.AsyncTask` abstract base class, or, if you are using JavaScript async functions/promises, by instantiating a new `gdjs.PromiseTask` with your promise as argument.

#### How to create a behavior by extending `gdjs.RuntimeBehavior`

See examples in [dummyruntimebehavior.ts](../Extensions/ExampleJsExtension/dummyruntimebehavior.ts) (or [dummywithshareddataruntimebehavior.ts](../Extensions/ExampleJsExtension/dummywithshareddataruntimebehavior.ts) for an example with shared data between behaviors).

You'll be interested in the constructor (to initialize things), `onDeActivate` (called when behavior is deactivated), `doStepPreEvents`
and `doStepPostEvents` (to run logic before/after the events at each frame).

Read about [`gdjs.RuntimeBehavior`](https://docs.gdevelop.io/GDJS%20Runtime%20Documentation/classes/gdjs.RuntimeBehavior.html), the base class inherited by all behaviors, to see everything that is available.

#### How to create an object by extending `gdjs.RuntimeObject`

See example in [dummyruntimeobject.ts](../Extensions/ExampleJsExtension/dummyruntimeobject.ts) (the object itself) and [dummyruntimeobject-pixi-renderer.ts](../Extensions/ExampleJsExtension/dummyruntimeobject-pixi-renderer.ts) (the renderer, using PixiJS).

You'll be interested in the constructor (to initialize things), `update` (called every frame) and the other methods. In the PIXI renderer, check the constructor (where PixiJS objects are created). Other methods depend on the renderer.

Read about [`gdjs.RuntimeObject`](https://docs.gdevelop.io/GDJS%20Runtime%20Documentation/classes/gdjs.RuntimeObject.html), the base class inherited by all objects.

#### How to create an effect ("shader", PixiJS "filter")

See lots of examples in [Effects](../Extensions/Effects/) (the extension containing lots of effects) and [light-night-pixi-filter.ts](../Extensions/Effects/light-night-pixi-filter.ts) (an example of a custom filter for PixiJS).

You'll have to store the code for your PixiJS filter in the file, and then call `gdjs.PixiFiltersTools.registerFilterCreator` to tell the game engine how to create and update the filter. Don't forget to then **declare** the effect (see next section).

### 2.2) Declare your extension to the IDE 👋

> ℹ️ Declaration must be done in a file called `JsExtension.js`. Your extension must be in the Extensions folder, in its own directory.

The API to declare extensions is almost 100% equivalent to the way extensions are declared in C++, so most links will redirect to this documentation.

#### Declare the extension information

Use [`extension.setExtensionInformation`](https://docs.gdevelop.io/GDCore%20Documentation/classgd_1_1_platform_extension.html#ac53e5af617a9ed91c280d652899557c3) to declare basic information about your extension.

> 👉 See an example in the [example extension _JsExtension.js_ file](../Extensions/ExampleJsExtension/JsExtension.js).

#### Declare actions, conditions and expressions

Use [`addAction`](https://docs.gdevelop.io/GDCore%20Documentation/classgd_1_1_platform_extension.html#a34e95be54f2dfa80b804e8e4830e7d9c), `addCondition`, `addExpression` or `addStrExpression` to declare actions, conditions or expressions.

-   Chain calls to [`addParameter`](https://docs.gdevelop.io/GDCore%20Documentation/classgd_1_1_instruction_metadata.html#a95486188a843f9ac8cdb1b0700c6c7e5) to declare the parameters of your action/condition/expression.
-   Call `getCodeExtraInformation()` and then functions like [`setFunctionName` and `setIncludeFile`](https://docs.gdevelop.io/GDCore%20Documentation/classgd_1_1_instruction_metadata_1_1_extra_information.html) to declare the JavaScript function to be called and the file to be included.
    -   If your function is asynchronous, call `setAsyncFunctionName` instead to tell GDevelop to wait for the returned `Task` to resolve before executing subsequent actions and subevents.
    -   If you want to be able to toggle the awaiting on and off, make one implementation of the function that returns a `Task` and one that doesn't, and use both `setFunctionName` and `setAsyncFunctionName` respectively to declare both to GDevelop, making the action optionally async.
    -   If you just want to return a promise to be awaited, you do not need to create your own task. Simply return `new gdjs.PromiseTask(yourPromise)`.
    -   Note that, as of now, _only actions can be asynchronous_. Giving other functions an async function name will not have any effect.

> You can call these functions on the `extension` object, or on the objects returned by `extension.addObject` (for objects) or `extension.addBehavior` (for behaviors). See below.

> ⚠️ Always double-check that you've not forgotten an argument. Such errors/mismatches can create silent bugs that could make GDevelop unstable or crash while being used.

> 👉 See an example in the [example extension _JsExtension.js_ file](../Extensions/ExampleJsExtension/JsExtension.js).

#### Declare behaviors

Add a behavior using [`addBehavior`](https://docs.gdevelop.io/GDCore%20Documentation/classgd_1_1_platform_extension.html#a75992fed9afce730db56af9d4d8177ca). The last two parameters are the `gd.Behavior` and the `gd.BehaviorsSharedData` object representing the behavior and its (optional) shared data

-   For the behavior, create a `new gd.BehaviorJsImplementation()` and define `initializeContent`, `updateProperty` and `getProperties`.
-   For the shared data (which are properties shared between all behaviors of the same type), if you don't need it, just pass the `new gd.BehaviorsSharedData()`. If you need shared data, create a `new gd.BehaviorSharedDataJsImplementation()` and define `initializeContent`, `updateProperty` and `getProperties`.

> ⚠️ Like other functions to declare extensions, make sure that you've not forgotten to declare a function and that all arguments are correct.

> 👉 See an example in the [example extension _JsExtension.js_ file](../Extensions/ExampleJsExtension/JsExtension.js). Learn more about [properties here](docs/Properties-schema-and-PropertiesEditor-explanations.md).

#### Declare objects

Add an object using [`addObject`](https://docs.gdevelop.io/GDCore%20Documentation/classgd_1_1_platform_extension.html#a554baca486909e8741e902133cceeec0). The last parameter is the `gd.Object` representing the object:

-   Create a `new gd.ObjectJsImplementation()` and define `updateProperty` and `getProperties` (for the object properties) and `updateInitialInstanceProperty` and `getInitialInstanceProperties` (for the optional properties that are attached to each instance).

> 👉 See an example in the [example extension _JsExtension.js_ file](../Extensions/ExampleJsExtension/JsExtension.js). Learn more about [properties here](docs/Properties-schema-and-PropertiesEditor-explanations.md).

> ℹ️ After doing this, you can actually see your object in GDevelop! Read the next sections to see how to add an editor and a renderer for instances on the scene editor.

#### Declare a property

A property is a global configuration value for your extension. An example would be the App ID for AdMob.

To declare one, just use `registerProperty`:

```js
// From ExampleJsExtension/JsExtension.js:
extension
    .registerProperty("DummyPropertyString")
    .setLabel(_("Dummy Property Name"))
    .setDescription(_("Type in anything :)"))
    .setType("string");
```

Once declared, you can access the property from JavaScript in the game engine using `getExtensionProperty` method of `gdjs.RuntimeGame`. Pass the extension name and the property name. This would get the AdMobAppId property of the AdMob extension for example:

```js
const appId = runtimeGame.getExtensionProperty("AdMob", "AdMobAppId");
```

If the property doesn't exist it will return null.
⚠️ Be careful, it can be non existing if the user never entered a value for that property before!

#### Declare a dependency on an external package

You can declare a dependency on an npm package or cordova plugin with `addDependency`. Example:

```js
// From ExampleJsExtension/JsExtension.js:
extension
    .addDependency()
    .setName("Thirteen Checker")
    .setDependencyType("npm")
    .setExportName("is-thirteen")
    .setVersion("2.0.0");
```

On cordova you can add plugin variables as extra properties:

```js
extension
    .addDependency()
    .setName("Some Cordova Extension")
    .setDependencyType("cordova")
    .setExportName("cordova-some-plugin")
    .setVersion("1.0.0")
    .setExtraSetting(
        "VARIABLE_NAME",
        new gd.PropertyDescriptor().setValue("42")
    );
```

You can also use an extension property to determine the value of the plugin variable:

```js
// From AdMob/JsExtension.js:
extension
    .registerProperty("AdMobAppId") // Remember Property Name
    .setLabel("AdMob App ID")
    .setDescription("ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY")
    .setType("string");

extension
    .addDependency()
    .setName("AdMob Cordova Extension")
    .setDependencyType("cordova")
    .setExportName("cordova-plugin-admob-free")
    .setVersion("~0.21.0")
    .setExtraSetting(
        "ADMOB_APP_ID",
        new gd.PropertyDescriptor()
            .setType("ExtensionProperty") // Tell the exporter this is an extension property...
            .setValue("AdMobAppId") // ... and what property it is (name of the property).
    );
```

#### Declare an object editor

To add an editor to your object, implement the function `registerEditorConfigurations` in your extension module. For now, only a default editor, displaying the object properties, is supported:

```js
registerEditorConfigurations: function(objectsEditorService /*: ObjectsEditorService */) {
  objectsEditorService.registerEditorConfiguration(
    "MyDummyExtension::DummyObject", // Replace by your extension and object type names.
    objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor({
      helpPagePath : "/extensions/extend-gdevelop" // The link to the help page for your object, in GDevelop wiki.
    })
  );
}
```

> 👉 See an example in the [example extension _JsExtension.js_ file](../Extensions/ExampleJsExtension/JsExtension.js).

#### Declare the PixiJS renderer for the instance of your object in the scene editor

Finally, to have the instances of your object displayed properly on the scene editor, implement the function `registerInstanceRenderers` in your extension module. The function is passed an object called `objectsRenderingService`, containing [RenderedInstance](./app/src/ObjectsRendering/Renderers/RenderedInstance.js), the "base class" for instance renderers, and PixiJS, which give you access to [PixiJS rendering engine](https://github.com/pixijs/pixi.js), used in the editor to render the scene.

> 👉 See an example in the [example extension _JsExtension.js_ file](../Extensions/ExampleJsExtension/JsExtension.js).

#### Declare effects

Add an effect using [`addEffect`](https://docs.gdevelop.io/GDCore%20Documentation/classgd_1_1_platform_extension.html) in your _JsExtension.js_ file.

> 👉 See an example in the [Effects extension _JsExtension.js_ file](../Extensions/Effects/JsExtension.js). Learn more about [properties here](docs/Properties-schema-and-PropertiesEditor-explanations.md).

> ℹ️ Don't forget to use `addIncludeFile` to set the file containing your effect implementation in JavaScript.

#### Declare events

> 👋 Declaring events is not yet exposed to JavaScript extensions. Your help is welcome to expose this feature!

## 3) Starting a new extension from scratch 🚀

If you want to start a new extension:

-   Choose a unique and descriptive name. Create a folder with this name in _Extensions_.
-   Create a file in it named _JsExtension.js_ and copy the content of the _JsExtension.js_ of another extension.
-   Change the extension information (`extension.setExtensionInformation`). The first argument is the extension internal name and should be the same name as your folder for consistency.
-   Remove all the actions/conditions/expressions declarations and tests, run `node import-GDJS-Runtime.js` and reload GDevelop to verify that your extension is loaded.
-   Create a file called for example _yourextensionnametools.js_ in the same directory.
-   Add back the declarations in your extension. Use `setIncludeFile` when declaring your actions/conditions/expressions and set the name of the ts file that you've created **but with a js extension**, prefixed by the path from the root folder. For example:

    ```js
    .setIncludeFile("Extensions/FacebookInstantGames/facebookinstantgamestools.ts")
    ```

## 4) How to contribute? 😎

If you have ideas or are creating a new extension, your contribution is welcome!

-   To submit your extension, you have first to create a Fork on GitHub (use the Fork button on the top right), then [create a Pull Request](https://help.github.com/articles/creating-a-pull-request-from-a-fork/).

-   Check [the **roadmap** for ideas and features planned](https://trello.com/b/qf0lM7k8/gdevelop-roadmap).

-   A few enhancements are also possible to exploit the full potential of extensions:

    -   [ ] Add support for events
    -   [ ] Document how to add custom icons
    -   [ ] Add a button to reload extensions without reloading GDevelop IDE entirely.

## 4) Note on the development of extensions declared in C++ (`JsExtension.cpp` or `Extension.cpp`)

Some extensions are still declared in C++ for being compatible with GDevelop 4.
Check the sources in the [Extensions folder](https://github.com/4ian/GDevelop/tree/master/Extensions) and install [GDevelop.js](https://github.com/4ian/GDevelop.js). You'll then be able to make changes in C++ source files and have this reflected in the editor.
