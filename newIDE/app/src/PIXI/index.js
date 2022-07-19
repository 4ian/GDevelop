// The custom PIXI.js bundle for GDevelop

import * as utils from '@pixi/utils';
import '@pixi/canvas-display';
import '@pixi/canvas-sprite-tiling';
import '@pixi/canvas-text';
import '@pixi/canvas-particle-container';
import '@pixi/mixin-cache-as-bitmap';

import { Renderer } from '@pixi/core';
import { BatchRenderer } from '@pixi/core';
import { Extract } from '@pixi/extract';
import { ParticleRenderer } from '@pixi/particle-container';
import { Prepare } from '@pixi/prepare';
import { TilingSpriteRenderer } from '@pixi/sprite-tiling';

import { CanvasRenderer } from '@pixi/canvas-renderer';
import { CanvasExtract } from '@pixi/canvas-extract';
import { CanvasGraphicsRenderer } from '@pixi/canvas-graphics';
import { CanvasMeshRenderer } from '@pixi/canvas-mesh';
import { CanvasPrepare } from '@pixi/canvas-prepare';
import { CanvasSpriteRenderer } from '@pixi/canvas-sprite';

import { AlphaFilter } from '@pixi/filter-alpha';
import { BlurFilter, BlurFilterPass } from '@pixi/filter-blur';
import { ColorMatrixFilter } from '@pixi/filter-color-matrix';
import { DisplacementFilter } from '@pixi/filter-displacement';
import { FXAAFilter } from '@pixi/filter-fxaa';
import { NoiseFilter } from '@pixi/filter-noise';

import { Loader } from '@pixi/loaders';
import { BitmapFontLoader } from '@pixi/text-bitmap';

export * from '@pixi/core';
export * from '@pixi/constants';
export * from '@pixi/math';
export * from '@pixi/settings';
export * from '@pixi/ticker';
export { utils };

export * from '@pixi/canvas-renderer';
export * from '@pixi/display';
export * from '@pixi/prepare';
export * from '@pixi/canvas-prepare';
export * from '@pixi/extract';
export * from '@pixi/canvas-extract';

export * from '@pixi/sprite';
export * from '@pixi/canvas-sprite';
export * from '@pixi/sprite-tiling';
export * from '@pixi/text';
export * from '@pixi/particle-container';
export * from '@pixi/graphics';
export * from '@pixi/canvas-graphics';
export * from '@pixi/mesh';
export * from '@pixi/canvas-mesh';
export * from '@pixi/text-bitmap';
export * as tilemap from '@pixi/tilemap';

export * from '@pixi/loaders';

// Register renderer plugins
Renderer.registerPlugin('batch', BatchRenderer);
Renderer.registerPlugin('extract', Extract);
Renderer.registerPlugin('particle', ParticleRenderer);
Renderer.registerPlugin('prepare', Prepare);
Renderer.registerPlugin('tilingSprite', TilingSpriteRenderer);

// Register CanvasRenderer plugins
CanvasRenderer.registerPlugin('extract', CanvasExtract);
CanvasRenderer.registerPlugin('graphics', CanvasGraphicsRenderer);
CanvasRenderer.registerPlugin('mesh', CanvasMeshRenderer);
CanvasRenderer.registerPlugin('prepare', CanvasPrepare);
CanvasRenderer.registerPlugin('sprite', CanvasSpriteRenderer);

// Register loader plugins
Loader.registerPlugin(BitmapFontLoader);

// Register Filters
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
