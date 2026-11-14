# GDevelop games on ThreeRT (prototype)

[ThreeRT](https://github.com/4ian/ThreeRT) is a real-time path tracer behind a three.js-style API: games run their
JavaScript inside the engine (QuickJS) and build a scene with `@threert/scene`, which ThreeRT traces on the GPU.
This folder runs GDJS, the GDevelop game engine, on it. A game exported for HTML5 by GDevelop becomes a ThreeRT game:
GDJS, the game's code and its extensions run unchanged inside ThreeRT, and the 3D layers of the game are traced.

Verified with the starters `starting-expanded-3d-car-racing`, `starting-expanded-3d-grand-theft-auto` and
`starting-expanded-first-person-shooter-enemies` of GDevelop-examples: they load, run (physics, input, cameras,
NavMesh, raycasts, sounds, HUD texts) and render in `threert-render` (Linux, software Vulkan).

## Usage

You need a GDevelop HTML5 export of the game, and a clone of ThreeRT with its dependencies (`npm install`), for
`@threert/scene`, `@threert/gameplay` and esbuild.

```bash
node GDJS/ThreeRT/scripts/build.js --export path/to/html5-export --threert path/to/ThreeRT --out path/to/output
```

Or export the project first with the GDevelop command line (a GDevelop executable, like the one of the portable
Linux build; `xvfb-run` is used if there is no display):

```bash
node GDJS/ThreeRT/scripts/build.js --project path/to/game.json --gdevelop path/to/gdevelop --threert path/to/ThreeRT --out path/to/output
```

The output folder is both a ThreeRT package and a ThreeRT project:

| File | What |
| --- | --- |
| `game.js` | The game as one script: GDJS, the game, the adapter and the ThreeRT runtime |
| `assets/` | The files of the game read by the engine (images, 3D models, sounds) |
| `threert.json` | The manifest of the package (`format`, `id`, `name`, `version`, `hash`, `entry`, `assets`) |
| `game.ts` | The game as a ThreeRT project, for `threert dev`, `threert check`, `threert shot`... It imports `@threert/scene` and `@threert/gameplay` and evaluates `gdjs-game.js` |

Run it:

```bash
threert-render play path/to/output/game.js --assets path/to/output        # a window
threert-render render path/to/output/game.js --assets path/to/output -o shot.png --spp 64   # a still (after setup)
cd path/to/output && threert dev                                          # the ThreeRT app's dev loop
```

Options of `build.js`: `--profile` logs the time spent by frame (and GDJS's profiler after the warm-up),
`--pointer look|free` chooses how the mouse is read (by default `look`, a captured pointer, for games using the
MousePointerLock extension), `--jolt <file>` gives the JavaScript build of Jolt to use, `--name` the package id.

## How it works

ThreeRT's JavaScript engine has no DOM, no WebGL, no timers, no I/O and no WebAssembly. GDJS is kept as it is, with
stand-ins around it, applied from outside its files (`src/`):

- **The bundle** (`scripts/build.js`): the scripts of the export's `index.html`, in order, concatenated as scripts
  after the adapter. three.js (as GDJS ships it) is loaded, then replaced; PixiJS is kept (its scene graph works
  without a renderer); Howler, FontFaceObserver and the three.js add-ons are replaced.
- **What the game knows of its files** (`manifest.ts`): the build reads the files of the game and embeds what GDJS
  would read from them: the size and average colour of images, the bounds, animations and triangles of 3D models,
  the text of JSON files. Files are copied to `assets/`, where ThreeRT loads textures and models by path.
- **The browser** (`browser.ts`): `window`, `document`, a canvas whose 2D context measures text, images loaded from
  the manifest, `fetch`, timers run by frames, storage in memory.
- **THREE** (`three.ts`): the classes of `@threert/scene`, which follow three.js, completed with what GDJS uses:
  methods of three.js's math classes grafted on them, Euler angles in any order, cameras with projection matrices,
  textures made from images, layer scenes as groups, animation mixers driving `GLTFModel` animations, stand-ins for
  what is not drawn (lines, sprites, render targets, post-processing).
- **GDJS** (`gdjs-patches.ts`): the game renderer has no canvas and runs the game loop from ThreeRT's frame script;
  3D models are `GLTFModel`s of their file (their triangles, from the manifest, serve physics mesh shapes, Terrain3D
  scattering and raycasts); the loading screen draws nothing; raycasts use a BVH (`raycast-bvh.ts`) and objects' own
  `raycast` methods.
- **The traced scene** (`view.ts`): the 3D layers' scenes in one ThreeRT scene, turned from GDevelop's Z up to Y up,
  seen from the first 3D layer's camera. Other 3D layers (a first person weapon) are placed in front of that camera
  as they are in front of theirs, scaled down so that they don't go through walls. Skyboxes become sky gradients
  (from the average colours of their faces).
- **Materials with injected GLSL** (`shader-materials.ts`): Terrain3D's ground is drawn by a WGSL material function
  blending its four texture layers by the painted weights; its grass (placed by a vertex shader) is not drawn.
- **Physics and WebAssembly** (`wasm.ts`): Jolt is the JavaScript build from npm of the same version as the export's
  WebAssembly one (found by comparing the `.wasm` files). Other WebAssembly libraries imported by GDJS (Recast for
  NavMesh pathfinding) are converted to JavaScript at build time by binaryen's `wasm2js`, and a `WebAssembly`
  stand-in instantiates them.
- **Input, HUD and sound** (`input.ts`, `hud.ts`, `audio.ts`): ThreeRT's input (keys, mouse buttons, pointer,
  look) feeds GDJS's input manager and pointer-lock movements; texts of 2D layers become HUD texts (and a crosshair
  sprite a HUD crosshair); sounds are played by ThreeRT's `audio`.
- **Time budgets**: ThreeRT gives setup 120 s and a frame 50 ms. The first scene is loaded and stepped in setup
  until steps are fast (physics bodies, terrains, navigation meshes are made then), and the first frames, which bind
  every object to the engine, run no game step.

## Limitations

- 2D layers are not drawn: only their texts (as HUD texts) and a centred crosshair. 2D games don't show.
- GLSL shaders (custom materials, particles, post-processing effects) don't run: their meshes are not drawn, except
  Terrain3D's ground.
- Game logic runs in an interpreter: heavy games can overrun the 50 ms frame budget, and an interrupted frame can
  leave the game in a bad state. Measured on a 4 core Linux VM rendering with a software GPU (llvmpipe, competing with
  the script for the CPU): the three starters take 15 to 30 ms a frame for the script, with rare overruns (raycasts
  of extensions, scene syncs). Build with `--profile` to see where the time goes.
- Sounds are not positioned, and their volume and rate are applied when they start.
- Only the first 3D layer's camera is used, with the others placed relative to it.

## ThreeRT changes

`threert-patches/` has changes to ThreeRT made for this prototype (apply with `git am` in a ThreeRT clone). They are
optional: the adapter runs on ThreeRT as it is.

- `0001-SceneBinding-track-ambient-lights-...`: the scene binding walked the whole scene graph at every sync to find
  ambient lights (several milliseconds a frame in QuickJS for the hundreds of objects of a GDevelop scene).
