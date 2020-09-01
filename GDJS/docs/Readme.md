# GDJS Documentation

📚 Read the documentation online: **[GDJS Runtime (game engine) documentation](http://4ian.github.io/GD-Documentation/GDJS%20Runtime%20Documentation/index.html)** or [GDJS Platform documentation for the IDE](http://4ian.github.io/GD-Documentation/GDJS%20Documentation/index.html).

## How to generate the documentation

- To generate the GDJS Runtime (game engine) documentation:

  ```bash
  cd <GDevelop repository>/GDJS
  npm run generate-doc
  ```

  Output will be in `<GDevelop repository>/docs/GDJS Documentation`.

- To generate the GDJS Platform documentation for the IDE, install [Doxygen](www.doxygen.org). Then:

  ```bash
  cd <GDevelop repository>/GDJS/docs
  doxygen
  ```

  Output will be in `<GDevelop repository>/docs/GDJS Runtime Documentation`.
