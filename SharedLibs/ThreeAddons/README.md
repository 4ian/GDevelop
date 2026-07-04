This package builds the Three.js related files used by the game engine
([Runtime](../../GDJS/Runtime/pixi-renderers/)), as classic scripts exposing
globals - as expected by the engine scripts, which are not ES modules:

- `three.js`: the whole [Three.js](https://github.com/mrdoob/three.js) library,
  exposing the global `THREE` namespace. Three.js stopped providing such a
  build after r160 (it's now published as ES modules only), so it's built here
  from the `three` npm package.
- `ThreeAddons.js`: a bundle of the Three.js "addons" used by GDevelop
  (loaders, controls, post-processing...), exposing the global `THREE_ADDONS`
  namespace. Its sources under `src/examples` are copied from the Three.js
  repository (`examples/jsm`), which is licensed under MIT.

## How to build and update the files used by the game engine

```bash
npm install
npm run build
```

This regenerates `GDJS/Runtime/pixi-renderers/three.js` directly, and
`dist/ThreeAddons.js` - to be copied manually to
`GDJS/Runtime/pixi-renderers/ThreeAddons.js` if the addons changed.

## How to upgrade Three.js

- Bump the `three` version in `package.json` (also update `@types/three` in
  `GDJS/package.json` and `three` in `newIDE/app/package.json` to keep the
  editor and the typings in sync).
- Update the sources copied in `src/examples` from the Three.js repository.
- Run `npm run build` and copy the files as explained above.
- Adapt the game engine code to any Three.js API change, and run the GDJS
  tests (`GDJS/tests`).
