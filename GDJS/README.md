# GDevelop JavaScript Platform (HTML5 game engine)

GDevelop JavaScript Platform (GDJS) is the game engine for making
_HTML5/Javascript_ based games with GDevelop.

> 📚 **Game developer, searching for the documentation?** Go to the **[GDJS Runtime (game engine) documentation](https://docs.gdevelop.io/GDJS%20Documentation)**.

## 1) Installation 💻

To do changes in the game engine or create extensions, [install the development version (click here to learn more)](https://github.com/4ian/GDevelop/tree/master/newIDE).

## 2) Development 🤓

GDJS is composed of two parts:

- the JavaScript game engine (_Runtime_ folder), called _GDJS Runtime_.
- the C++ part exposing GDJS to GDevelop IDE (_GDJS_ folder), including the Exporter and classes doing transpilation from events to JavaScript, called _GDJS Platform_.

### GDJS Runtime (game engine)

The game engine is in the _Runtime_ folder. If you want to work on the engine directly, follow the [GDevelop 5 README about the development of the game engine](https://github.com/4ian/GDevelop/blob/master/newIDE/README.md#development-of-the-game-engine).

- To use the game engine, you can look into the **[GDJS Runtime (game engine) documentation](https://docs.gdevelop.io/GDJS%20Runtime%20Documentation)**.

- To run tests for the game engine, go to `GDJS/tests`, run `npm install` and `npm test`. More information in the [README for the tests](https://github.com/4ian/GDevelop/tree/master/GDJS/tests).

- To launch type checking with TypeScript, run `npm install` and `npm run check-types` in `GDJS` folder.

### GDJS Platform (exporters, code generation...)

Check the [GDJS Platform](https://docs.gdevelop.io/GDJS%20Documentation/index.html) documentation or the [full GDevelop developers documentation](https://docs.gdevelop.io/).

## 3) How to contribute 😎

Any contribution is welcome! Whether you want to submit a bug report, a feature request
or any pull request to add a feature, do not hesitate to get in touch.

- Check [the **roadmap** for ideas and features planned](https://trello.com/b/qf0lM7k8/gdevelop-roadmap).

- Follow the [Development](https://github.com/4ian/GDevelop/tree/master/newIDE#development) section of the README to set up GDevelop and start modifying either **the editor** or **[the game engine/extensions](https://github.com/4ian/GDevelop/tree/master/newIDE#development-of-the-game-engine-or-extensions)**.

- To submit your changes, you have first to create a Fork on GitHub (use the Fork button on the top right), then [create a Pull Request](https://help.github.com/articles/creating-a-pull-request-from-a-fork/).

## License

GDJS is distributed under the MIT license: see [LICENSE.md](LICENSE.md) for
more information.
