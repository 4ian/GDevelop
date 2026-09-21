# NavMesh pathfinding extension

To update the library:
- Clone this fork https://github.com/D8H/recast-navigation-js
- Check out `main`
- Get the wasm build with npm
- Copy the wasm build into `recast-navigation-js/packages/recast-navigation-wasm/build`
- Run `yarn build`
- Check out `umd-build`
- Run `yarn build`
- Copy `recast-navigation-js/packages/recast-navigation/recast-navigation-generators.js` and the wasm build into this folder
