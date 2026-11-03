# NavMesh pathfinding extension

To update the library:
- Clone this fork https://github.com/D8H/recast-navigation-js
- Check out `main`
- Get the wasm build with npm
- Copy the wasm build into `recast-navigation-js/packages/recast-navigation-wasm/build`
- Run `yarn build`
- Check out `umd-build`
- Run `yarn build`
- Copy `recast-navigation-js/packages/recast-navigation/recast-navigation-generators.js` into this folder as `A_recast-navigation-generators.js` (include files are loaded sorted by name: it must be loaded before the behaviors), and the wasm build

`recast-navigation.wasm.js` and `recast-navigation.wasm.wasm` are the build of `@recast-navigation/wasm` (the version used by `GDJS/package.json`), unchanged.

## How navigation meshes are built

Navigation meshes are tiled (see `NavMeshTileBuilder.ts`): each tile is built from the triangles of the obstacles touching it, with the low level functions of Recast (`RecastNav.RawModule`, the WebAssembly module, which the vendored `RecastNav` doesn't expose otherwise).

- The triangles of each obstacle are kept until the obstacle changes (see `NavMeshObstacleGeometry.ts`), so that terrains are not converted again when something else moves.
- When an obstacle moves by more than half a cell, only the tiles around its old and new positions are built again, at most 10 times per second. The crowd is kept: agents keep their paths.
- The first build of a large level is spread over several frames, starting from the tiles around characters. The tiles needed by `moveTo` are built right away.

The tile cache of Recast (`TileCache`, with box and cylinder obstacles) is not used: its tiles have no detail meshes, so characters would not follow the height of terrains (the height was wrong by 9 pixels on average, 32 pixels at most, on a test terrain with 5 pixel cells, against 4 pixels on average with detail meshes).
