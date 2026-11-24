Performance and rendering test for tiled panel sprites.

A tiled panel sprite is made of 5 `PIXI.TilingSprite` and 4 `PIXI.Sprite`, and
PixiJS can't batch tiling sprites: each one is its own draw call that also
flushes the sprite batch. `cacheAsBitmap` flattens the 9 pieces into a single
batchable sprite, which is what makes a scene full of panel sprites usable.
Until then, the cache was disabled for images that are not smoothed, because
PixiJS builds the cached texture with the default scale mode (LINEAR) and would
blur pixel art.

Open `game.json` with GDevelop and preview each scene. Press SPACE to go to the
next one.

- **1 - Tiled pixel art (the bug)**: 220 tiled panel sprites using a non
  smoothed image. This is the scene that used to run at ~11 FPS.
- **2 - Tiled smoothed (reference)**: the same scene with a smoothed image,
  which was always cached and always fast. Scenes 1 and 2 should now perform
  the same.
- **3 - Crispness, opacity, rotation**: at a x4 camera zoom, a plain Sprite next
  to a tiled panel sprite using the same image. The panel sprite must be exactly
  as crisp as the sprite (the cached texture keeps the NEAREST scale mode), the
  50% opacity row must not look twice as transparent as the sprite next to it
  (PixiJS bakes the inherited `worldAlpha` in the cache, see
  https://github.com/pixijs/pixijs/issues/10757), and the rotated one must stay
  sharp.
- **4 - Animated size (regression check)**: 60 tiled panel sprites resized at
  every frame. Objects that change can't be cached, as rebuilding the cache
  costs more than rendering the sprites directly, so this scene is expected to
  stay slow. It is here to check that it doesn't get *slower*.
