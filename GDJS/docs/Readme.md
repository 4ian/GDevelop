# GDJS Documentation

📚 Read the documentation online: **[GDJS Runtime (game engine) documentation](https://docs.gdevelop.io/GDJS%20Runtime%20Documentation/index.html)** or [GDJS Platform documentation for the IDE](https://docs.gdevelop.io/GDJS%20Documentation/index.html).

## How to generate the documentation

- To generate the GDJS Runtime (game engine) documentation:

  ```bash
  cd <GDevelop repository>/GDJS
  npm install
  npm run generate-doc
  ```

  Output will be in `<GDevelop repository>/docs/GDJS Documentation`.

- To generate the GDJS Platform documentation for the IDE, install [Doxygen](https://www.doxygen.nl/index.html). Then:

  ```bash
  cd <GDevelop repository>/GDJS/docs
  doxygen
  ```

  Output will be in `<GDevelop repository>/docs/GDJS Runtime Documentation`.
