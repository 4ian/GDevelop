// The custom PIXI.js bundle for GDevelop
// Unused functionality like the interactions plugins is removed for performance reasons.
// Add an export for any new additional PIXI feature you might need, and regenerate the types.

// Core modules
export * from '@pixi/core';
export * from '@pixi/constants';
export * from '@pixi/math';
export * from '@pixi/settings';
import * as utils from '@pixi/utils';
export { utils };

// Core plugins
export * from '@pixi/canvas-renderer';

export * from '@pixi/display';
import '@pixi/canvas-display';

export * from '@pixi/prepare';
export * from '@pixi/canvas-prepare';

export * from '@pixi/extract';
export * from '@pixi/canvas-extract';

// Base objects
export * from '@pixi/sprite';
export * from '@pixi/canvas-sprite';

export * from '@pixi/sprite-tiling';
import '@pixi/canvas-sprite-tiling';

export * from '@pixi/text';
import '@pixi/canvas-text';

export * from '@pixi/particle-container';
import '@pixi/canvas-particle-container';

export * from '@pixi/graphics';
export * from '@pixi/canvas-graphics';
//import '@pixi/graphics-extras';

export * from '@pixi/mesh';
export * from '@pixi/canvas-mesh';

export * from '@pixi/text-bitmap';

// Extras
export * from '@pixi/loaders';
import '@pixi/mixin-cache-as-bitmap';

// Register renderer plugins
import { Renderer } from '@pixi/core';
import { BatchRenderer } from '@pixi/core';
Renderer.registerPlugin('batch', BatchRenderer);
import { Extract } from '@pixi/extract';
Renderer.registerPlugin('extract', Extract);
import { ParticleRenderer } from '@pixi/particle-container';
Renderer.registerPlugin('particle', ParticleRenderer);
import { Prepare } from '@pixi/prepare';
Renderer.registerPlugin('prepare', Prepare);
import { TilingSpriteRenderer } from '@pixi/sprite-tiling';
Renderer.registerPlugin('tilingSprite', TilingSpriteRenderer);

// Register CanvasRenderer plugins
import { CanvasRenderer } from '@pixi/canvas-renderer';
import { CanvasExtract } from '@pixi/canvas-extract';
CanvasRenderer.registerPlugin('extract', CanvasExtract);
import { CanvasGraphicsRenderer } from '@pixi/canvas-graphics';
CanvasRenderer.registerPlugin('graphics', CanvasGraphicsRenderer);
import { CanvasMeshRenderer } from '@pixi/canvas-mesh';
CanvasRenderer.registerPlugin('mesh', CanvasMeshRenderer);
import { CanvasPrepare } from '@pixi/canvas-prepare';
CanvasRenderer.registerPlugin('prepare', CanvasPrepare);
import { CanvasSpriteRenderer } from '@pixi/canvas-sprite';
CanvasRenderer.registerPlugin('sprite', CanvasSpriteRenderer);

// Register loader plugins
import { Loader } from '@pixi/loaders';
import { BitmapFontLoader } from '@pixi/text-bitmap';
Loader.registerPlugin(BitmapFontLoader);

// Register Filters
import { AlphaFilter } from '@pixi/filter-alpha';
import { BlurFilter, BlurFilterPass } from '@pixi/filter-blur';
import { ColorMatrixFilter } from '@pixi/filter-color-matrix';
import { DisplacementFilter } from '@pixi/filter-displacement';
import { FXAAFilter } from '@pixi/filter-fxaa';
import { NoiseFilter } from '@pixi/filter-noise';

// A namespace is needed for the type definitions to merge, but exporting a namespcae makes typescript think this is a namespaced file instead of a module.
// Replace the defintions automatically in the build script.
/** TYPES_REPLACE */
var filters = {
  AlphaFilter,
  BlurFilter,
  BlurFilterPass,
  ColorMatrixFilter,
  DisplacementFilter,
  FXAAFilter,
  NoiseFilter,
};
export { filters };
/** WITH
export namespace filters {
  export {
    AlphaFilter,
    BlurFilter,
    BlurFilterPass,
    ColorMatrixFilter,
    DisplacementFilter,
    FXAAFilter,
    NoiseFilter,
  };
}
*/
