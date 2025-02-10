declare namespace PIXI {
  export namespace tilemap {
    /**
     * A tilemap composite that lazily builds tilesets layered into multiple tilemaps.
     *
     * The composite tileset is the concatenation of the individual tilesets used in the tilemaps. You can
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
    export class CompositeTilemap extends PIXI.Container {
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
      /**
       * @param tileset - A list of tile base-textures that will be used to eagerly initialized the layered
       *  tilemaps. This is only an performance optimization, and using {@link CompositeTilemap.tile tile}
       *  will work equivalently.
       */
      constructor(tileset?: Array<PIXI.TextureSource>);
      /**
       * This will preinitialize the tilesets of the layered tilemaps.
       *
       * If used after a tilemap has been created (or a tile added), this will overwrite the tile textures of the
       * existing tilemaps. Passing the tileset to the constructor instead is the best practice.
       *
       * @param tileTextures - The list of tile textures that make up the tileset.
       */
      tileset(tileTextures: Array<PIXI.TextureSource>): this;
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
      /**
       * @internal
       * @ignore
       */
      isModified(anim: boolean): boolean;
      /**
       * @internal
       * @ignore
       */
      clearModify(): void;
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
      setBitmaps: (tileTextures: Array<PIXI.TextureSource>) => this;
      /**
       * @deprecated Since @pixi/tilemap 3.
       * @readonly
       * @see CompositeTilemap.texturesPerTilemap
       */
      get texPerChild(): number;
    }

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
      /** The scaling mode of the combined texture tiling. */
      TEXTILE_SCALE_MODE: PIXI.SCALE_MODE;
      /** This will enable 32-bit index buffers. It's useful when you have more than 16K tiles. */
      use32bitIndex: boolean;
    };
    export const Constant: {
      /** The default number of textures per tilemap in a tilemap composite. */
      TEXTURES_PER_TILEMAP: number;
      /** The scaling mode of the combined texture tiling. */
      TEXTILE_SCALE_MODE: PIXI.SCALE_MODE;
      /** This will enable 32-bit index buffers. It's useful when you have more than 16K tiles. */
      use32bitIndex: boolean;
    };

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
    export class Tilemap extends PIXI.Container {
      /**
       * Currently doesnt work.
       */
      shadowColor: Float32Array;
      state: PIXI.State;
      is_valid: boolean;
      readonly renderPipeId = 'tilemap';
      readonly canBundle = true;
      _instruction: TilemapInstruction;
      /**
       * @internal
       * @ignore
       */
      checkValid(): boolean;
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
      rects_count: number;
      /** @ignore */
      compositeParent: boolean;
      /**
       * The list of base-textures being used in the tilemap.
       *
       * This should not be shuffled after tiles have been added into this tilemap. Usually, only tile textures
       * should be added after tiles have been added into the map.
       */
      protected tileset: TileTextureArray;
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
      constructor(tileset: PIXI.TextureSource | Array<PIXI.TextureSource>);
      /**
       * @returns The tileset of this tilemap.
       */
      getTileset(): TileTextureArray;
      /**
       * Define the tileset used by the tilemap.
       *
       * @param textureOrArray - The list of textures to use in the tilemap. If a base-texture (not array) is passed, it will
       *  be wrapped into an array. This should not contain any duplicates.
       */
      setTileset(
        textureOrArray?:
          | TileTextureArray
          | PIXI.TextureSource
          | Array<PIXI.TextureSource>
      ): this;
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
        tileTexture: number | string | PIXI.Texture | PIXI.TextureSource,
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
      private vbId;
      vb: TilemapGeometry;
      private vbBuffer;
      private vbArray;
      private vbInts;
      private destroyVb;
      updateBuffer(plugin: TilemapPipe): void;
      /**
       * @internal
       * @ignore
       */
      isModified(anim: boolean): boolean;
      /**
       * This will pull forward the modification marker.
       *
       * @internal
       * @ignore
       */
      clearModify(): void;
      addBounds(bounds: PIXI.Bounds): void;
      get bounds(): PIXI.Bounds;
      /** @override */
      destroy(options?: PIXI.DestroyOptions): void;
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

    export class TilemapGeometry extends PIXI.Geometry {
      static vertSize: number;
      static vertPerQuad: number;
      static stride: number;
      lastTimeAccess: number;
      vertSize: number;
      vertPerQuad: number;
      stride: number;
      constructor(indexBuffer: PIXI.Buffer);
      buf: PIXI.Buffer;
    }

    export abstract class TilemapAdaptor {
      abstract init(): void;
      abstract execute(meshPipe: TilemapPipe, mesh: Tilemap): void;
      abstract destroy(): void;
      pipe_uniforms: PIXI.UniformGroup<{
        u_proj_trans: {
          value: PIXI.Matrix;
          type: 'mat3x3<f32>';
        };
        u_anim_frame: {
          value: Float32Array;
          type: 'vec2<f32>';
        };
      }>;
    }

    export interface TilemapInstruction extends PIXI.Instruction {
      renderPipeId: 'tilemap';
      tilemap: Tilemap;
    }
    /**
     * Rendering helper pipeline for tilemaps. This plugin is registered automatically.
     */
    export class TilemapPipe
      implements
        PIXI.RenderPipe<Tilemap>,
        PIXI.InstructionPipe<TilemapInstruction>
    {
      static extension: {
        readonly type: readonly [
          PIXI.ExtensionType.WebGLPipes,
          PIXI.ExtensionType.WebGPUPipes,
        ];
        readonly name: 'tilemap';
      };
      /** The managing renderer */
      readonly renderer: PIXI.Renderer;
      /** The tile animation frame */
      tileAnim: number[];
      private ibLen;
      /** The index buffer for the tilemaps to share. */
      private indexBuffer;
      /** The shader used to render tilemaps. */
      private shader;
      private adaptor;
      constructor(renderer: PIXI.Renderer, adaptor: TilemapAdaptor);
      start(): void;
      /**
       * @internal
       * @ignore
       */
      createVb(): TilemapGeometry;
      /** @return The {@link TilemapGeometry} shader that this rendering pipeline is using. */
      getShader(): TilemapGeometry;
      destroy(): void;
      checkIndexBuffer(size: number): void;
      destroyRenderable(_renderable: Tilemap): void;
      addRenderable(
        tilemap: Tilemap,
        instructionSet: PIXI.InstructionSet | undefined
      ): void;
      updateRenderable(
        tilemap: Tilemap,
        _instructionSet?: PIXI.InstructionSet | undefined
      ): void;
      validateRenderable(renderable: Tilemap): boolean;
      execute({ tilemap }: TilemapInstruction): void;
    }

    export class GlTilemapAdaptor extends TilemapAdaptor {
      static extension: {
        readonly type: readonly [PIXI.ExtensionType.WebGLPipesAdaptor];
        readonly name: 'tilemap';
      };
      _shader: PIXI.Shader;
      max_textures: number;
      destroy(): void;
      execute(pipe: TilemapPipe, tilemap: Tilemap): void;
      init(): void;
    }

    export class GpuTilemapAdaptor extends TilemapAdaptor {
      static extension: {
        readonly type: readonly [PIXI.ExtensionType.WebGPUPipesAdaptor];
        readonly name: 'tilemap';
      };
      _shader: PIXI.Shader;
      max_textures: number;
      bind_group: PIXI.BindGroup;
      destroy(): void;
      execute(pipe: TilemapPipe, tilemap: Tilemap): void;
      init(): void;
    }

    export class TileTextureArray {
      max_textures: number;
      constructor(max_textures: number);
      arr: PIXI.TextureSource[];
      count: number;
      dirty: boolean;
      dirty_gpu: boolean;
      bind_group: PIXI.BindGroup;
      bind_group_resources: any;
      tex_sizes: Float32Array;
      null_color: Float32Array;
      tex_buf: PIXI.Buffer;
      get length(): number;
      push(tex: PIXI.TextureSource): void;
      at(ind: number): PIXI.TextureSource<any>;
      update(): void;
      markDirty(): void;
      getBindGroup(): PIXI.BindGroup;
      static generate_gpu_textures(max_textures: number): string;
      static generate_gl_textures(max_textures: number): string;
      static gl_gen_resources(max_textures: number): any;
    }
  }
}
