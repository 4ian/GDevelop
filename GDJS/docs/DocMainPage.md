# GDevelop JavaScript game engine reference

This is the documentation for the JavaScript game engine used in GDevelop.

GDevelop is an **open-source**, cross-platform **game creator** designed *to be used by everyone*. Download it on [gdevelop-app.com](https://gdevelop-app.com/) if you don't have it yet!

## Using JavaScript in your GDevelop game

When you're developing a game with GDevelop, the game is powered by this game engine
and events of the game are using it.

If you want to use JavaScript in your game, insert a [JavaScript event](http://wiki.compilgames.net/doku.php/gdevelop5/events/js-code). Then, you'll be interested in using these classes:

* {@link RuntimeScene} for interacting with the scene.
* {@link RuntimeObject} is the base class for object instances living on the scene.
* {@link RuntimeBehavior} is the base class for behaviors attached to objects.
* {@link Variable}s are stored inside the game, scene and objects in {@link VariablesContainer}.

## Development of the game engine (advanced)

If you want to work on the engine directly, follow the [guide about development of the game engine](https://github.com/4ian/GD/blob/master/newIDE/README.md#development-of-the-game-engine) to get started. Refer to this documentation to know more about the engine.
