declare namespace PIXI {
  export namespace tilemap {
    /**
     * The renderer plugin for canvas. It isn't registered by default.
     *
     * ```
     * import { CanvasTileRenderer } from '@pixi/tilemap';
     * import { CanvasRenderer } from '@pixi/canvas-core';
     *
     * // You must register this yourself (optional). @pixi/tilemap doesn't do it to
     * // prevent a hard dependency on @pixi/canvas-core.
     * CanvasTileRenderer.registerExtension();
     * ```
     */
    export class CanvasTileRenderer {
      /** The renderer */
      renderer: PIXI.IRenderer;
      /** The global tile animation state */
      tileAnim: number[];
      /** @deprecated */
      dontUseTransform: boolean;
      /** @param renderer */
      constructor(renderer: PIXI.IRenderer);
      static registerExtension(): void;
      static getInstance(renderer: any): CanvasTileRenderer;
    }

    /**
     * A tilemap composite that lazily builds tilesets layered into multiple tilemaps.
     *
     * The composite tileset is the concatenatation of the individual tilesets used in the tilemaps. You can
     * preinitialized it by passing a list of tile textures to the constructor. Otherwise, the composite tilemap
     * is lazily built as you add more tiles with newer tile textures. A new tilemap is created once the last
     * tilemap has reached its limit (as set by {@link CompositeTilemap.texturesPerTilemap texturesPerTilemap}).
     *
     * @example
     * import { Application } from '@pixi/app';
     * import { CompositeTilemap } from '@pixi/tilemap';
     * import { Loader } from '@pixi/loaders';
     *
     * // Setup view & stage.
     * const app = new Application();
     *
     * document.body.appendChild(app.renderer.view);
     * app.stage.interactive = true;
     *
     * // Global reference to the tilemap.
     * let globalTilemap: CompositeTilemap;
     *
     * // Load the tileset spritesheet!
     * Loader.shared.load('atlas.json');
     *
     * // Initialize the tilemap scene when the assets load.
     * Loader.shared.load(function onTilesetLoaded()
     * {
     *      const tilemap = new CompositeTilemap();
     *
     *      // Setup the game level with grass and dungeons!
     *      for (let x = 0; x < 10; x++)
     *      {
     *          for (let y = 0; y < 10; y++)
     *          {
     *              tilemap.tile(
     *                  x % 2 === 0 && (x === y || x + y === 10) ? 'dungeon.png' : 'grass.png',
     *                  x * 100,
     *                  y * 100,
     *              );
     *          }
     *      }
     *
     *      globalTilemap = app.stage.addChild(tilemap);
     * });
     *
     * // Show a bomb at a random location whenever the user clicks!
     * app.stage.on('click', function onClick()
     * {
     *      if (!globalTilemap) return;
     *
     *      const x = Math.floor(Math.random() * 10);
     *      const y = Math.floor(Math.random() * 10);
     *
     *      globalTilemap.tile('bomb.png', x * 100, y * 100);
     * });
     */
    class CompositeTilemap extends PIXI.Container {
      /** The hard limit on the number of tile textures used in each tilemap. */
      readonly texturesPerTilemap: number;
      /**
       * The animation frame vector.
       *
       * Animated tiles have four parameters - `animX`, `animY`, `animCountX`, `animCountY`. The textures
       * of adjacent animation frames are at offset `animX` or `animY` of each other, with `animCountX` per
       * row and `animCountY` per column.
       *
       * The animation frame vector specifies which animation frame texture to use. If the x/y coordinate is
       * larger than the `animCountX` or `animCountY` for a specific tile, the modulus is taken.
       */
      tileAnim: [number, number];
      /** The last modified tilemap. */
      protected lastModifiedTilemap: Tilemap;
      private modificationMarker;
      private shadowColor;
      private _globalMat;
      /**
       * @param tileset - A list of tile base-textures that will be used to eagerly initialized the layered
       *  tilemaps. This is only an performance optimization, and using {@link CompositeTilemap.tile tile}
       *  will work equivalently.
       */
      constructor(tileset?: Array<PIXI.BaseTexture>);
      /**
       * This will preinitialize the tilesets of the layered tilemaps.
       *
       * If used after a tilemap has been created (or a tile added), this will overwrite the tile textures of the
       * existing tilemaps. Passing the tileset to the constructor instead is the best practice.
       *
       * @param tileTextures - The list of tile textures that make up the tileset.
       */
      tileset(tileTextures: Array<PIXI.BaseTexture>): this;
      /** Clears the tilemap composite. */
      clear(): this;
      /** Changes the rotation of the last added tile. */
      tileRotate(rotate: number): this;
      /** Changes `animX`, `animCountX` of the last added tile. */
      tileAnimX(offset: number, count: number): this;
      /** Changes `animY`, `animCountY` of the last added tile. */
      tileAnimY(offset: number, count: number): this;
      /** Changes `tileAnimDivisor` value of the last added tile. */
      tileAnimDivisor(divisor: number): this;
      /**
       * Adds a tile that paints the given tile texture at (x, y).
       *
       * @param tileTexture - The tile texture. You can pass an index into the composite tilemap as well.
       * @param x - The local x-coordinate of the tile's location.
       * @param y - The local y-coordinate of the tile's location.
       * @param options - Additional options to pass to {@link Tilemap.tile}.
       * @param [options.u=texture.frame.x] - The x-coordinate of the texture in its base-texture's space.
       * @param [options.v=texture.frame.y] - The y-coordinate of the texture in its base-texture's space.
       * @param [options.tileWidth=texture.orig.width] - The local width of the tile.
       * @param [options.tileHeight=texture.orig.height] - The local height of the tile.
       * @param [options.animX=0] - For animated tiles, this is the "offset" along the x-axis for adjacent
       *      animation frame textures in the base-texture.
       * @param [options.animY=0] - For animated tiles, this is the "offset" along the y-axis for adjacent
       *      animation frames textures in the base-texture.
       * @param [options.rotate=0]
       * @param [options.animCountX=1024] - For animated tiles, this is the number of animation frame textures
       *      per row.
       * @param [options.animCountY=1024] - For animated tiles, this is the number of animation frame textures
       *      per column.
       * @param [options.animDivisor=1] - For animated tiles, this is the animation duration each frame
       * @param [options.alpha=1] - Tile alpha
       * @return This tilemap, good for chaining.
       */
      tile(
        tileTexture: PIXI.Texture | string | number,
        x: number,
        y: number,
        options?: {
          u?: number;
          v?: number;
          tileWidth?: number;
          tileHeight?: number;
          animX?: number;
          animY?: number;
          rotate?: number;
          animCountX?: number;
          animCountY?: number;
          animDivisor?: number;
          alpha?: number;
        }
      ): this;
      renderCanvas(renderer: any): void;
      render(renderer: PIXI.Renderer): void;
      /* Excluded from this release type: isModified */
      /* Excluded from this release type: clearModify */
      /**
       * @deprecated Since @pixi/tilemap 3.
       * @see CompositeTilemap.tile
       */
      addFrame(
        texture: PIXI.Texture | string | number,
        x: number,
        y: number,
        animX?: number,
        animY?: number,
        animWidth?: number,
        animHeight?: number,
        animDivisor?: number,
        alpha?: number
      ): this;
      /**
       * @deprecated @pixi/tilemap 3
       * @see CompositeTilemap.tile
       */
      addRect(
        textureIndex: number,
        u: number,
        v: number,
        x: number,
        y: number,
        tileWidth: number,
        tileHeight: number,
        animX?: number,
        animY?: number,
        rotate?: number,
        animWidth?: number,
        animHeight?: number
      ): this;
      /**
       * Alias for {@link CompositeTilemap.tileset tileset}.
       *
       * @deprecated Since @pixi/tilemap 3.
       */
      setBitmaps: (tileTextures: Array<PIXI.BaseTexture>) => this;
      /**
       * @deprecated Since @pixi/tilemap 3.
       * @readonly
       * @see CompositeTilemap.texturesPerTilemap
       */
      get texPerChild(): number;
    }
    export { CompositeTilemap as CompositeRectTileLayer };
    export { CompositeTilemap };

    export const Constant: {
      /** The default number of textures per tilemap in a tilemap composite. */
      TEXTURES_PER_TILEMAP: number;
      /**
       * The width/height of each texture tile in a {@link TEXTILE_DIMEN}. This is 1024px by default.
       *
       * This should fit all tile base-textures; otherwise, {@link TextileResource} may fail to correctly
       * upload the textures togther in a tiled fashion.
       */
      TEXTILE_DIMEN: number;
      /**
       * The number of texture tiles per {@link TextileResource}.
       *
       * Texture tiling is disabled by default, and so this is set to `1` by default. If it is set to a
       * higher value, textures will be uploaded together in a tiled fashion.
       *
       * Since {@link TextileResource} is a dual-column format, this should be even for packing
       * efficiency. The optimal value is usually 4.
       */
      TEXTILE_UNITS: number;
      /** The scaling mode of the combined texture tiling. */
      TEXTILE_SCALE_MODE: PIXI.SCALE_MODES;
      /** This will enable 32-bit index buffers. It's useful when you have more than 16K tiles. */
      use32bitIndex: boolean;
      /** Flags whether textiles should be cleared when each tile is uploaded. */
      DO_CLEAR: boolean;
      maxTextures: number;
      boundSize: number;
      boundCountPerBuffer: number;
    };

    /* Excluded from this release type: fillSamplers */

    /* Excluded from this release type: generateFragmentSrc */

    export const pixi_tilemap: {
      CanvasTileRenderer: typeof CanvasTileRenderer;
      CompositeRectTileLayer: typeof CompositeTilemap;
      CompositeTilemap: typeof CompositeTilemap;
      Constant: {
        TEXTURES_PER_TILEMAP: number;
        TEXTILE_DIMEN: number;
        TEXTILE_UNITS: number;
        TEXTILE_SCALE_MODE: PIXI.SCALE_MODES;
        use32bitIndex: boolean;
        DO_CLEAR: boolean;
        maxTextures: number;
        boundSize: number;
        boundCountPerBuffer: number;
      };
      TextileResource: typeof TextileResource;
      MultiTextureResource: typeof TextileResource;
      RectTileLayer: typeof Tilemap;
      Tilemap: typeof Tilemap;
      TilemapShader: typeof TilemapShader;
      TilemapGeometry: typeof TilemapGeometry;
      RectTileShader: typeof TilemapShader;
      RectTileGeom: typeof TilemapGeometry;
      TileRenderer: typeof TileRenderer;
    };

    export const POINT_STRUCT_SIZE: number;

    /**
     * These are additional @pixi/tilemap options.
     *
     * This settings should not be changed after the renderer has initialized; otherwise, the behavior
     * is undefined.
     */
    export const settings: {
      /** The default number of textures per tilemap in a tilemap composite. */
      TEXTURES_PER_TILEMAP: number;
      /**
       * The width/height of each texture tile in a {@link TEXTILE_DIMEN}. This is 1024px by default.
       *
       * This should fit all tile base-textures; otherwise, {@link TextileResource} may fail to correctly
       * upload the textures togther in a tiled fashion.
       */
      TEXTILE_DIMEN: number;
      /**
       * The number of texture tiles per {@link TextileResource}.
       *
       * Texture tiling is disabled by default, and so this is set to `1` by default. If it is set to a
       * higher value, textures will be uploaded together in a tiled fashion.
       *
       * Since {@link TextileResource} is a dual-column format, this should be even for packing
       * efficiency. The optimal value is usually 4.
       */
      TEXTILE_UNITS: number;
      /** The scaling mode of the combined texture tiling. */
      TEXTILE_SCALE_MODE: PIXI.SCALE_MODES;
      /** This will enable 32-bit index buffers. It's useful when you have more than 16K tiles. */
      use32bitIndex: boolean;
      /** Flags whether textiles should be cleared when each tile is uploaded. */
      DO_CLEAR: boolean;
      maxTextures: number;
      boundSize: number;
      boundCountPerBuffer: number;
    };

    export interface TextileOptions {
      TEXTILE_DIMEN: number;
      TEXTILE_UNITS: number;
      DO_CLEAR?: boolean;
    }

    /**
     * This texture tiling resource can be used to upload multiple base-textures together.
     *
     * This resource combines multiple base-textures into a "textile". They're laid out in
     * a dual column format, placed in row-order order. The size of each tile is predefined,
     * and defaults to {@link settings.TEXTILE_DIMEN}. This means that each input base-texture
     * must is smaller than that along both its width and height.
     *
     * @see settings.TEXTILE_UNITS
     */
    export class TextileResource extends PIXI.Resource {
      /** The base-texture that contains all the texture tiles. */
      baseTexture: PIXI.BaseTexture;
      private readonly doClear;
      private readonly tileDimen;
      private readonly tiles;
      private _clearBuffer;
      /**
       * @param options - This will default to the "settings" exported by @pixi/tilemap.
       * @param options.TEXTILE_DIMEN - The dimensions of each tile.
       * @param options.TEXTILE_UNITS - The number of texture tiles.
       */
      constructor(options?: TextileOptions);
      /**
       * Sets the texture to be uploaded for the given tile.
       *
       * @param index - The index of the tile being set.
       * @param texture - The texture with the base-texture to upload.
       */
      tile(index: number, texture: PIXI.BaseTexture): void;
      /** @override */
      bind(baseTexture: PIXI.BaseTexture): void;
      /** @override */
      upload(
        renderer: PIXI.Renderer,
        texture: PIXI.BaseTexture,
        glTexture: PIXI.GLTexture
      ): boolean;
    }

    /**
     * A rectangular tilemap implementation that renders a predefined set of tile textures.
     *
     * The {@link Tilemap.tileset tileset} of a tilemap defines the list of base-textures that can be painted in the
     * tilemap. A texture is identified using its base-texture's index into the this list, i.e. changing the base-texture
     * at a given index in the tileset modifies the paint of all tiles pointing to that index.
     *
     * The size of the tileset is limited by the texture units supported by the client device. The minimum supported
     * value is 8, as defined by the WebGL 1 specification. `gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS`) can be used
     * to extract this limit. {@link CompositeTilemap} can be used to get around this limit by layering multiple tilemap
     * instances.
     *
     * @example
     * import { Tilemap } from '@pixi/tilemap';
     * import { Loader } from '@pixi/loaders';
     *
     * // Add the spritesheet into your loader!
     * Loader.shared.add('atlas', 'assets/atlas.json');
     *
     * // Make the tilemap once the tileset assets are available.
     * Loader.shared.load(function onTilesetLoaded()
     * {
     *      // The base-texture is shared between all the tile textures.
     *      const tilemap = new Tilemap([Texture.from('grass.png').baseTexture])
     *          .tile('grass.png', 0, 0)
     *          .tile('grass.png', 100, 100)
     *          .tile('brick_wall.png', 0, 100);
     * });
     */
    class Tilemap extends PIXI.Container {
      shadowColor: Float32Array;
      _globalMat: PIXI.Matrix;
      /**
       * The tile animation frame.
       *
       * @see CompositeTilemap.tileAnim
       */
      tileAnim: [number, number];
      /**
       * This is the last uploaded size of the tilemap geometry.
       * @ignore
       */
      modificationMarker: number;
      /** @ignore */
      offsetX: number;
      /** @ignore */
      offsetY: number;
      /** @ignore */
      compositeParent: boolean;
      /**
       * The list of base-textures being used in the tilemap.
       *
       * This should not be shuffled after tiles have been added into this tilemap. Usually, only tile textures
       * should be added after tiles have been added into the map.
       */
      protected tileset: Array<PIXI.BaseTexture>;
      /**
       * The local bounds of the tilemap itself. This does not include DisplayObject children.
       */
      protected readonly tilemapBounds: PIXI.Bounds;
      /** Flags whether any animated tile was added. */
      protected hasAnimatedTile: boolean;
      /** The interleaved geometry of the tilemap. */
      private pointsBuf;
      /**
       * @param tileset - The tileset to use for the tilemap. This can be reset later with {@link Tilemap.setTileset}. The
       *      base-textures in this array must not be duplicated.
       */
      constructor(tileset: PIXI.BaseTexture | Array<PIXI.BaseTexture>);
      /**
       * @returns The tileset of this tilemap.
       */
      getTileset(): Array<PIXI.BaseTexture>;
      /**
       * Define the tileset used by the tilemap.
       *
       * @param tileset - The list of textures to use in the tilemap. If a base-texture (not array) is passed, it will
       *  be wrapped into an array. This should not contain any duplicates.
       */
      setTileset(tileset?: PIXI.BaseTexture | Array<PIXI.BaseTexture>): this;
      /**  Clears all the tiles added into this tilemap. */
      clear(): this;
      /**
       * Adds a tile that paints the given texture at (x, y).
       *
       * @param tileTexture - The tiling texture to render.
       * @param x - The local x-coordinate of the tile's position.
       * @param y - The local y-coordinate of the tile's position.
       * @param options - Additional tile options.
       * @param [options.u=texture.frame.x] - The x-coordinate of the texture in its base-texture's space.
       * @param [options.v=texture.frame.y] - The y-coordinate of the texture in its base-texture's space.
       * @param [options.tileWidth=texture.orig.width] - The local width of the tile.
       * @param [options.tileHeight=texture.orig.height] - The local height of the tile.
       * @param [options.animX=0] - For animated tiles, this is the "offset" along the x-axis for adjacent
       *      animation frame textures in the base-texture.
       * @param [options.animY=0] - For animated tiles, this is the "offset" along the y-axis for adjacent
       *      animation frames textures in the base-texture.
       * @param [options.rotate=0]
       * @param [options.animCountX=1024] - For animated tiles, this is the number of animation frame textures
       *      per row.
       * @param [options.animCountY=1024] - For animated tiles, this is the number of animation frame textures
       *      per column.
       * @param [options.animDivisor=1] - For animated tiles, this is the animation duration of each frame
       * @param [options.alpha=1] - Tile alpha
       * @return This tilemap, good for chaining.
       */
      tile(
        tileTexture: number | string | PIXI.Texture | PIXI.BaseTexture,
        x: number,
        y: number,
        options?: {
          u?: number;
          v?: number;
          tileWidth?: number;
          tileHeight?: number;
          animX?: number;
          animY?: number;
          rotate?: number;
          animCountX?: number;
          animCountY?: number;
          animDivisor?: number;
          alpha?: number;
        }
      ): this;
      /** Changes the rotation of the last tile. */
      tileRotate(rotate: number): void;
      /** Changes the `animX`, `animCountX` of the last tile. */
      tileAnimX(offset: number, count: number): void;
      /** Changes the `animY`, `animCountY` of the last tile. */
      tileAnimY(offset: number, count: number): void;
      /** Changes the `animDivisor` value of the last tile. */
      tileAnimDivisor(divisor: number): void;
      tileAlpha(alpha: number): void;
      renderCanvas: (renderer: any) => void;
      renderCanvasCore(renderer: any): void;
      private vbId;
      private vb;
      private vbBuffer;
      private vbArray;
      private vbInts;
      private destroyVb;
      render(renderer: PIXI.Renderer): void;
      renderWebGLCore(renderer: PIXI.Renderer, plugin: TileRenderer): void;
      /* Excluded from this release type: isModified */
      /* Excluded from this release type: clearModify */
      /** @override */
      protected _calculateBounds(): void;
      /** @override */
      getLocalBounds(rect?: PIXI.Rectangle): PIXI.Rectangle;
      /** @override */
      destroy(options?: PIXI.IDestroyOptions): void;
      /**
       * Deprecated signature for {@link Tilemap.tile tile}.
       *
       * @deprecated Since @pixi/tilemap 3.
       */
      addFrame(
        texture: PIXI.Texture | string | number,
        x: number,
        y: number,
        animX: number,
        animY: number
      ): boolean;
      /**
       * Deprecated signature for {@link Tilemap.tile tile}.
       *
       * @deprecated Since @pixi/tilemap 3.
       */
      addRect(
        textureIndex: number,
        u: number,
        v: number,
        x: number,
        y: number,
        tileWidth: number,
        tileHeight: number,
        animX?: number,
        animY?: number,
        rotate?: number,
        animCountX?: number,
        animCountY?: number,
        animDivisor?: number,
        alpha?: number
      ): this;
    }
    export { Tilemap as RectTileLayer };
    export { Tilemap };

    export class TilemapGeometry extends PIXI.Geometry {
      vertSize: number;
      vertPerQuad: number;
      stride: number;
      lastTimeAccess: number;
      constructor();
      buf: any;
    }

    export class TilemapShader extends PIXI.Shader {
      maxTextures: number;
      constructor(maxTextures: number);
    }

    /**
     * Rendering helper pipeline for tilemaps. This plugin is registered automatically.
     */
    export class TileRenderer extends PIXI.ObjectRenderer {
      /** The managing renderer */
      readonly renderer: PIXI.Renderer;
      /** The tile animation frame */
      tileAnim: number[];
      private ibLen;
      /** The index buffer for the tilemaps to share. */
      private indexBuffer;
      /** The shader used to render tilemaps. */
      private shader;
      /**
       * {@link TextileResource} instances used to upload textures batched in tiled groups. This is
       * used only if {@link settings.TEXTURES_PER_TILEMAP} is greater than 1.
       */
      private textiles;
      /** @param renderer - The managing renderer */
      constructor(renderer: PIXI.Renderer);
      /**
       * Binds the tile textures to the renderer, and updates the tilemap shader's `uSamplerSize` uniform.
       *
       * If {@link settings.TEXTILE_UNITS}
       *
       * @param renderer - The renderer to which the textures are to be bound.
       * @param textures - The tile textures being bound.
       */
      bindTileTextures(
        renderer: PIXI.Renderer,
        textures: Array<PIXI.BaseTexture>
      ): void;
      start(): void;
      /* Excluded from this release type: createVb */
      /** @return The {@link TilemapShader} shader that this rendering pipeline is using. */
      getShader(): TilemapShader;
      destroy(): void;
      checkIndexBuffer(size: number, _vb?: TilemapGeometry): void;
      /** Makes textile resources and initializes {@link TileRenderer.textiles}. */
      private makeTextiles;
    }
  }
}
