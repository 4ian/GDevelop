![GDevelop logo](media/GDevelop%20banner.png "GDevelop logo")

# GDevelop JavaScript game engine reference

This is the documentation for the TypeScript/JavaScript game engine used in GDevelop.

GDevelop is an **open-source**, cross-platform **game creator** designed *to be used by everyone*. Download it at [gdevelop.io](https://gdevelop.io) to start making games.

## Using JavaScript in your GDevelop game

When you're developing a game with GDevelop, the game is powered by this game engine and events of the game are using it.

If you want to use JavaScript in your game, insert a [JavaScript event](https://wiki.gdevelop.io/gdevelop5/events/js-code).

![GDevelop JavaScript events](media/GDevelop%20JavaScript%20events.png "GDevelop JavaScript events")

Then, you'll be interested in using these classes:

* {@link gdjs.RuntimeScene} for interacting with the scene.
* {@link gdjs.RuntimeObject} is the base class for object instances living on the scene.
* {@link gdjs.RuntimeBehavior} is the base class for behaviors attached to objects.
* {@link gdjs.Variable}s are stored inside the game, scene and objects in {@link gdjs.VariablesContainer}.

## Development of the TypeScript game engine (advanced)

If you want to work on the engine directly, follow the [guide about development of the game engine](https://github.com/4ian/GD/blob/master/newIDE/README.md#development-of-the-game-engine) to get started. Refer to this documentation to know more about the engine.
