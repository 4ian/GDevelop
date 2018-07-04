# GDJS Documentation

📚 Read the documentation online: **[GDJS Runtime (game engine) documentation](http://4ian.github.io/GD-Documentation/GDJS%20Runtime%20Documentation/index.html)** or [GDJS Platform documentation for the IDE](http://4ian.github.io/GD-Documentation/GDJS%20Documentation/index.html).

## How to generate the documentation

- Install [Doxygen](www.doxygen.org) and [JSDoc](http://usejsdoc.org/).

- To generate the GDJS Runtime (game engine) documentation:

  ```bash
  cd GDJS
  jsdoc -c docs/jsdoc.conf.json -t docs/jaguarjs-jsdoc docs/DocMainPage.md
  ```

  Output will be in `docs/GDJS Documentation` in the GDevelop repository root.

- To generate the GDJS Platform documentation for the IDE:

  ```bash
  cd GDJS/docs
  doxygen
  ```

  Output will be in `docs/GDJS Runtime Documentation` in the GDevelop repository root.
