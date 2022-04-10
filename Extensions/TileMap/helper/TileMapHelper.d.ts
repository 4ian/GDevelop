declare namespace TileMapHelper {
  import PIXI = GlobalPIXIModule.PIXI;

  type integer = number;
  type float = number;
  type FloatPoint = [float, float];
  type PolygonVertices = FloatPoint[];

  /**
   * Tiled JSON format.
   */
  type TiledMap = {
    /** Hex-formatted color (#RRGGBB or #AARRGGBB) (optional) */
    backgroundcolor?: string;
    /** The compression level to use for tile layer data (defaults to -1, which means to use the algorithm default) */
    compressionlevel: integer;
    /** Number of tile rows */
    height: integer;
    /** Length of the side of a hex tile in pixels (hexagonal maps only) */
    hexsidelength: integer;
    /** Whether the map has infinite dimensions */
    infinite: boolean;
    /** Array of {@link TiledLayer} */
    layers: Array<TiledLayer>;
    /** Auto-increments for each layer */
    nextlayerid: integer;
    /** Auto-increments for each placed object */
    nextobjectid: integer;
    /** `orthogonal`, `isometric`, `staggered` or `hexagonal` */
    orientation: string;
    /** Array of {@link TiledProperty} */
    properties: Array<TiledProperty>;
    /** `right-down` (the default), `right-up`, `left-down` or `left-up` (currently only supported for orthogonal maps) */
    renderorder: string;
    /** `x` or `y` (staggered / hexagonal maps only) */
    staggeraxis: string;
    /** `odd` or `even` (staggered / hexagonal maps only) */
    staggerindex: string;
    /** The Tiled version used to save the file */
    tiledversion: string;
    /** Map grid height */
    tileheight: integer;
    /** Array of {@link TiledTileset} */
    tilesets: Array<TiledTileset>;
    /** Map grid width */
    tilewidth: integer;
    /** `map` (since 1.0) */
    type: string;
    /** The JSON format version (previously a number, saved as string since 1.6) */
    version: string;
    /** Number of tile columns */
    width: integer;
  };
  type TiledLayer = {
    /** Array of {@link TiledChunk} (optional). `tilelayer` only. */
    chunks?: Array<TiledChunk>;
    /** `zlib`, `gzip`, `zstd` (since Tiled 1.3) or empty (default). `tilelayer` only. */
    compression: string;
    /** Array of `unsigned`, `integer` (GIDs) or base64-encoded data. `tilelayer` only.*/
    data: Array<integer> | string;
    /** `topdown` (default) or `index`. `objectgroup` only. */
    draworder: string;
    /** `csv` (default) or `base64`. `tilelayer` only. */
    encoding: string;
    /** Row count. Same as map height for fixed-size maps. */
    height: integer;
    /** Incremental ID - unique across all layers */
    id: integer;
    /** Image used by this layer. `imagelayer` only. */
    image: string;
    /** Array of {@link TiledLayer}. `group` only. */
    layers: Array<TiledLayer>;
    /** Name assigned to this layer */
    name: string;
    /** Array of {@link TiledObject}. `objectgroup` only. */
    objects: Array<TiledObject>;
    /** Horizontal layer offset in pixels (default: 0) */
    offsetx: float;
    /** Vertical layer offset in pixels (default: 0) */
    offsety: float;
    /** Value between 0 and 1 */
    opacity: float;
    /** Horizontal {@link parallax factor} for this layer (default: 1). (since Tiled 1.5) */
    parallaxx: float;
    /** Vertical {@link parallax factor} for this layer (default: 1). (since Tiled 1.5) */
    parallaxy: float;
    /** Array of {@link TiledProperty} */
    properties: Array<TiledProperty>;
    /** X coordinate where layer content starts (for infinite maps) */
    startx: integer;
    /** Y coordinate where layer content starts (for infinite maps) */
    starty: integer;
    /** Hex-formatted {@link tint color} (#RRGGBB or #AARRGGBB) that is multiplied with any graphics drawn by this layer or any child layers (optional). */
    tintcolor?: string;
    /** Hex-formatted color (#RRGGBB) (optional). `imagelayer` only. */
    transparentcolor?: string;
    /** `tilelayer`, `objectgroup`, `imagelayer` or `group` */
    type: string;
    /** Whether layer is shown or hidden in editor */
    visible: boolean;
    /** Column count. Same as map width for fixed-size maps. */
    width: integer;
    /** Horizontal layer offset in tiles. Always 0. */
    x: integer;
    /** Vertical layer offset in tiles. Always 0. */
    y: integer;
  };
  type TiledChunk = {
    /** Array of `unsigned` `integer` (GIDs) or base64-encoded data */
    data: Array<integer> | string;
    /** Height in tiles */
    height: integer;
    /** Width in tiles */
    width: integer;
    /** X coordinate in tiles */
    x: integer;
    /** Y coordinate in tiles */
    y: integer;
  };
  type TiledObject = {
    /** Used to mark an object as an ellipse */
    ellipse: boolean;
    /** Global tile ID, only if object represents a tile */
    gid: integer;
    /** Height in pixels. */
    height: float;
    /** Incremental ID, unique across all objects */
    id: integer;
    /** String assigned to name field in editor */
    name: string;
    /** Used to mark an object as a point */
    point: boolean;
    /** Array of {@link TiledPoint}, in case the object is a polygon */
    polygon: Array<TiledPoint>;
    /** Array of {@link TiledPoint}, in case the object is a polyline */
    polyline: Array<TiledPoint>;
    /** Array of {@link TiledProperty} */
    properties: Array<TiledProperty>;
    /** Angle in degrees clockwise */
    rotation: float;
    /** Reference to a template file, in case object is a {@link template instance} */
    template: string;
    /** Only used for text objects */
    text: Text;
    /** String assigned to type Tiledfield in editor */
    type: string;
    /** Whether object is shown in editor. */
    visible: boolean;
    /** Width in pixels. */
    width: float;
    /** X coordinate in pixels */
    x: float;
    /** Y coordinate in pixels */
    y: float;
  };
  type TiledTileset = {
    /** Hex-formatted color (#RRGGBB or #AARRGGBB) (optional) */
    backgroundcolor?: string;
    /** The number of tile columns in the tileset */
    columns: integer;
    /** GID corresponding to the first tile in the set */
    firstgid: integer;
    /** (optional) */
    grid?: TiledGrid;
    /** Image used for tiles in this set */
    image: string;
    /** Height of source image in pixels */
    imageheight: integer;
    /** Width of source image in pixels */
    imagewidth: integer;
    /** Buffer between image edge and first tile (pixels) */
    margin: integer;
    /** Name given to this tileset */
    name: string;
    /** Alignment to use for tile objects (`unspecified` (default), `topleft`, `top`, `topright`, `left`, `center`, `right`, `bottomleft`, `bottom` or `bottomright`) (since 1.4) */
    objectalignment: string;
    /** Array of {@link TiledProperty} */
    properties: Array<TiledProperty>;
    /** The external file that contains this tilesets data */
    source: string;
    /** Spacing between adjacent tiles in image (pixels) */
    spacing: integer;
    /** Array of {@link TiledTerrain} (optional) */
    terrains?: Array<TiledTerrain>;
    /** The number of tiles in this tileset */
    tilecount: integer;
    /** The Tiled version used to save the file */
    tiledversion: string;
    /** Maximum height of tiles in this set */
    tileheight: integer;
    /** (optional) */
    tileoffset?: TileOffset;
    /** Array of {@link TiledTileDefinition} (optional) */
    tiles?: Array<TiledTileDefinition>;
    /** Maximum width of tiles in this set */
    tilewidth: integer;
    /** Allowed transformations (optional) */
    transformations?: TiledTransformations;
    /** Hex-formatted color (#RRGGBB) (optional) */
    transparentcolor?: string;
    /** `tileset` (for tileset files, since 1.0) */
    type: string;
    /** The JSON format version (previously a number, saved as string since 1.6) */
    version: string;
    /** Array of {@link TiledWangSet} (since 1.1.5) */
    wangsets: Array<TiledWangSet>;
  };
  type TiledGrid = {
    /** Cell height of tile grid */
    height: integer;
    /** `orthogonal` (default) or `isometric` */
    orientation: string;
    /** Cell width of tile grid */
    width: integer;
  };
  type TileOffset = {
    /** Horizontal offset in pixels */
    x: integer;
    /** Vertical offset in pixels (positive is down) */
    y: integer;
  };
  type TiledTransformations = {
    /** Tiles can be flipped horizontally */
    hflip: boolean;
    /** Tiles can be flipped vertically */
    vflip: boolean;
    /** Tiles can be rotated in 90-degree increments */
    rotate: boolean;
    /** Whether untransformed tiles remain preferred, otherwise transformed tiles are used to produce more variations */
    preferuntransformed: boolean;
  };
  type TiledTileDefinition = {
    /** Array of {@link TiledTiles} */
    animation: Array<TiledTileDefinition>;
    /** Local ID of the tile */
    id: integer;
    /** Image representing this tile (optional) */
    image?: string;
    /** Height of the tile image in pixels */
    imageheight: integer;
    /** Width of the tile image in pixels */
    imagewidth: integer;
    /** Layer with type Tiled`objectgroup`, when collision shapes are specified (optional) */
    objectgroup?: TiledLayer;
    /** Percentage chance this tile is chosen when competing with others in the editor (optional) */
    probability?: float;
    /** Array of {@link TiledProperty} */
    properties: Array<TiledProperty>;
    /** Index of terrain for each corner of tile (optional) */
    terrain?: Array<integer>;
    /** The type of the tile (optional) */
    type?: string;
  };
  type TiledTerrain = {
    /** Name of terrain */
    name: string;
    /** Array of {@link TiledProperty} */
    properties: Array<TiledProperty>;
    /** Local ID of tile representing terrain */
    tile: integer;
  };
  type TiledWangSet = {
    /** Array of {@link TiledWangColor} */
    colors: Array<TiledWangColor>;
    /** Name of the Wang set */
    name: string;
    /** Array of {@link TiledProperty} */
    properties: Array<TiledProperty>;
    /** Local ID of tile representing the Wang set */
    tile: integer;
    /** Array of {@link TiledWangTile} */
    wangtiles: Array<TiledWangTile>;
  };
  type TiledWangColor = {
    /** Hex-formatted color (#RRGGBB or #AARRGGBB) */
    color: string;
    /** Name of the Wang color */
    name: string;
    /** Probability used when randomizing */
    probability: float;
    /** Array of {@link TiledProperty} */
    properties: Array<TiledProperty>;
    /** Local ID of tile representing the Wang color */
    tile: integer;
  };
  type TiledWangTile = {
    /** Local ID of tile */
    tileid: integer;
    /** Array of Wang color indexes (`uchar[8]`) */
    wangid: Array<integer>;
  };
  type TiledProperty = {
    /** Name of the property */
    name: string;
    /** type of the property (`string` (default), `integer`, `float`, `boolean`, `color` or `file` (since 0.16, with `color` and `file` added in 0.17)) */
    type: string;
    /** Value of the property */
    value: string | number;
  };
  type TiledPoint = {
    /** X coordinate in pixels */
    x: float;
    /** Y coordinate in pixels */
    y: float;
  };

  /**
   * A tile map model.
   *
   * Tile map files are parsed into this model by {@link TiledTileMapLoader}.
   * This model is used for rending ({@link TileMapRuntimeObjectPixiRenderer})
   * and hitboxes handling ({@link TransformedCollisionTileMap}).
   * This allows to support new file format with only a new parser.
   */
  class EditableTileMap {
    private _tileSet;
    private _layers;
    /**
     * The width of a tile.
     */
    private readonly tileWidth;
    /**
     * The height of a tile.
     */
    private readonly tileHeight;
    /**
     * The number of tile columns in the map.
     */
    private readonly dimX;
    /**
     * The number of tile rows in the map.
     */
    private readonly dimY;
    /**
     * @param tileWidth The width of a tile.
     * @param tileHeight The height of a tile.
     * @param dimX The number of tile columns in the map.
     * @param dimY The number of tile rows in the map.
     * @param tileSet The tile set.
     */
    constructor(
      tileWidth: integer,
      tileHeight: integer,
      dimX: integer,
      dimY: integer,
      tileSet: Map<integer, TileDefinition>
    );
    /**
     * @returns The tile map width in pixels.
     */
    getWidth(): number;
    /**
     * @returns The tile map height in pixels.
     */
    getHeight(): number;
    /**
     * @returns The tile width in pixels.
     */
    getTileHeight(): number;
    /**
     * @returns The tile height in pixels.
     */
    getTileWidth(): number;
    /**
     * @returns The number of tile columns in the map.
     */
    getDimensionX(): number;
    /**
     * @returns The number of tile rows in the map.
     */
    getDimensionY(): number;
    /**
     * @param tileId The tile identifier
     * @returns The tile definition form the tile set.
     */
    getTileDefinition(tileId: integer): TileDefinition | undefined;
    /**
     * @returns All the tile definitions form the tile set.
     */
    getTileDefinitions(): Iterable<TileDefinition>;
    /**
     * @param id The identifier of the new layer.
     * @returns The new layer.
     */
    addTileLayer(id: integer): EditableTileMapLayer;
    /**
     * @param id The identifier of the new layer.
     * @returns The new layer.
     */
    addObjectLayer(id: integer): EditableObjectLayer;
    /**
     * @returns All the layers of the tile map.
     */
    getLayers(): Iterable<AbstractEditableLayer>;
    /**
     * Check if a point is inside a tile with a given tag.
     *
     * It doesn't use the tile hitboxes.
     * It only check the point is inside the tile square.
     *
     * @param x The X coordinate of the point to check.
     * @param y The Y coordinate of the point to check.
     * @param tag The tile tag
     * @returns true when the point is inside a tile with a given tag.
     */
    pointIsInsideTile(x: float, y: float, tag: string): boolean;
  }
  /**
   * A tile map layer.
   */
  abstract class AbstractEditableLayer {
    /**
     * The layer tile map.
     */
    readonly tileMap: EditableTileMap;
    /**
     * The layer identifier.
     */
    readonly id: integer;
    private visible;
    /**
     * @param tileMap The layer tile map.
     * @param id The layer identifier.
     */
    constructor(tileMap: EditableTileMap, id: integer);
    /**
     * @param visible
     */
    setVisible(visible: boolean): void;
    /**
     * @returns true if the layer is visible.
     */
    isVisible(): boolean;
  }
  /**
   * A layer where tiles are placed with pixel coordinates.
   */
  class EditableObjectLayer extends AbstractEditableLayer {
    readonly objects: TileObject[];
    /**
     * @param tileMap  The layer tile map.
     * @param id The layer identifier.
     */
    constructor(tileMap: EditableTileMap, id: integer);
    /**
     * @param object
     */
    add(object: TileObject): void;
  }
  /**
   * A tile that is placed with pixel coordinates.
   */
  class TileObject {
    /**
     * The tile identifier in the tile set.
     */
    private tileId;
    /**
     * The coordinate of the tile left side.
     */
    readonly x: float;
    /**
     * The coordinate of the tile top side.
     */
    readonly y: float;
    /**
     * @param x The coordinate of the tile left side.
     * @param y The coordinate of the tile top side.
     * @param tileId The tile identifier in the tile set.
     */
    constructor(x: float, y: float, tileId: integer);
    /**
     * @return The tile identifier in the tile set.
     */
    getTileId(): integer;
    /**
     * @param flippedHorizontally
     */
    setFlippedHorizontally(flippedHorizontally: boolean): void;
    /**
     * @param flippedVertically
     */
    setFlippedVertically(flippedVertically: boolean): void;
    /**
     * @param flippedDiagonally
     */
    setFlippedDiagonally(flippedDiagonally: boolean): void;
    /**
     * @returns true if the tile is flipped horizontally.
     */
    isFlippedHorizontally(): boolean;
    /**
     * @returns true if the tile is flipped vertically.
     */
    isFlippedVertically(): boolean;
    /**
     * @returns true if the tile is flipped diagonally.
     */
    isFlippedDiagonally(): boolean;
  }
  /**
   * A tile map layer with tile organized in grid.
   */
  class EditableTileMapLayer extends AbstractEditableLayer {
    private readonly _tiles;
    /**
     * @param tileMap The layer tile map.
     * @param id The layer identifier.
     */
    constructor(tileMap: EditableTileMap, id: integer);
    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param tileId The tile identifier in the tile set.
     */
    setTile(x: integer, y: integer, tileId: integer): void;
    /**
     * @param x The layer column.
     * @param y The layer row.
     */
    removeTile(x: integer, y: integer): void;
    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param flippedHorizontally
     */
    setFlippedHorizontally(
      x: integer,
      y: integer,
      flippedHorizontally: boolean
    ): void;
    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param flippedVertically
     */
    setFlippedVertically(
      x: integer,
      y: integer,
      flippedVertically: boolean
    ): void;
    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param flippedDiagonally
     */
    setFlippedDiagonally(
      x: integer,
      y: integer,
      flippedDiagonally: boolean
    ): void;
    /**
     * @param x The layer column.
     * @param y The layer row.
     * @returns true if the tile is flipped horizontally.
     */
    isFlippedHorizontally(x: integer, y: integer): boolean;
    /**
     * @param x The layer column.
     * @param y The layer row.
     * @returns true if the tile is flipped vertically.
     */
    isFlippedVertically(x: integer, y: integer): boolean;
    /**
     * @param x The layer column.
     * @param y The layer row.
     * @returns true if the tile is flipped diagonally.
     */
    isFlippedDiagonally(x: integer, y: integer): boolean;
    /**
     * @param x The layer column.
     * @param y The layer row.
     * @returns The tile identifier from the tile set.
     */
    get(x: integer, y: integer): integer | undefined;
    /**
     * The number of tile columns in the layer.
     */
    getDimensionX(): number;
    /**
     * The number of tile rows in the layer.
     */
    getDimensionY(): number;
    /**
     * @returns The layer width in pixels.
     */
    getWidth(): number;
    /**
     * @returns The layer height in pixels.
     */
    getHeight(): number;
  }
  /**
   * A tile definition from the tile set.
   */
  class TileDefinition {
    private readonly hitBoxes;
    private readonly tag;
    private readonly animationLength;
    /**
     * @param hitBoxes The hit boxes for this tile.
     * @param tag The tag of this tile.
     * @param animationLength The number of frame in the tile animation.
     */
    constructor(
      hitBoxes: PolygonVertices[],
      tag: string,
      animationLength: integer
    );
    /**
     * This property is used by {@link TransformedCollisionTileMap}
     * to make collision classes.
     * @returns The tag that is used to filter tiles.
     */
    getTag(): string;
    /**
     * The hitboxes positioning is done by {@link TransformedCollisionTileMap}.
     * @returns The hit boxes for this tile.
     */
    getHiBoxes(): PolygonVertices[];
    /**
     * Animated tiles have a limitation:
     * they are only able to use frames arranged horizontally one next
     * to each other on the atlas.
     * @returns The number of frame in the tile animation.
     */
    getAnimationLength(): integer;
  }

  /**
   * A cache to access the tile images.
   *
   * It's created by {@link PixiTileMapHelper.parseAtlas}
   * and used by {@link PixiTileMapHelper.updatePixiTileMap}.
   */
  class TileTextureCache {
    private static readonly flippedHorizontallyFlag;
    private static readonly flippedVerticallyFlag;
    private static readonly flippedDiagonallyFlag;
    private readonly _textures;
    constructor();
    setTexture(
      tileId: integer,
      flippedHorizontally: boolean,
      flippedVertically: boolean,
      flippedDiagonally: boolean,
      texture: PIXI.Texture
    ): void;
    /**
     * Return the texture to use for the tile with the specified uid, which can contains
     * information about rotation in bits 32, 31 and 30
     * (see https://doc.mapeditor.org/en/stable/reference/tmx-map-format/).
     *
     * @param tileId The tile identifier
     * @param flippedHorizontally
     * @param flippedVertically
     * @param flippedDiagonally
     * @returns The texture for the given tile identifier and orientation.
     */
    findTileTexture(
      tileId: integer,
      flippedHorizontally: boolean,
      flippedVertically: boolean,
      flippedDiagonally: boolean
    ): PIXI.Texture | undefined;
    private _getGlobalId;
  }

  /**
   * An holder to share tile maps across the 2 extension objects.
   *
   * Every instance with the same files path in properties will
   * share the same {@link EditableTileMap} and {@link TileTextureCache}.
   *
   * @see {@link TileMapRuntimeManager}
   */
  class TileMapManager {
    private _tileMapCache;
    private _textureCacheCaches;
    /**
     *
     */
    constructor();
    /**
     * @param instanceHolder Where to set the manager instance.
     * @returns The shared manager.
     */
    static getManager(instanceHolder: Object): any;
    /**
     * @param loadTiledMap The method that loads the Tiled JSON file in memory.
     * @param tilemapJsonFile
     * @param tilesetJsonFile
     * @param pako The zlib library.
     * @param callback
     */
    getOrLoadTileMap(
      loadTiledMap: (
        tilemapJsonFile: string,
        tilesetJsonFile: string,
        callback: (tiledMap: TiledMap | null) => void
      ) => void,
      tilemapJsonFile: string,
      tilesetJsonFile: string,
      pako: any,
      callback: (tileMap: EditableTileMap | null) => void
    ): void;
    /**
     * @param loadTiledMap The method that loads the Tiled JSON file in memory.
     * @param getTexture The method that loads the atlas image file in memory.
     * @param atlasImageResourceName
     * @param tilemapJsonFile
     * @param tilesetJsonFile
     * @param callback
     */
    getOrLoadTextureCache(
      loadTiledMap: (
        tilemapJsonFile: string,
        tilesetJsonFile: string,
        callback: (tiledMap: TiledMap | null) => void
      ) => void,
      getTexture: (textureName: string) => PIXI.BaseTexture<PIXI.Resource>,
      atlasImageResourceName: string,
      tilemapJsonFile: string,
      tilesetJsonFile: string,
      callback: (textureCache: TileTextureCache | null) => void
    ): void;
  }

  class PixiTileMapHelper {
    /**
     * Parse a Tiled map JSON file,
     * exported from Tiled (https://www.mapeditor.org/)
     * into a generic tile map data (`GenericPixiTileMapData`).
     *
     * @param tiledData A JS object representing a map exported from Tiled.
     * @param atlasTexture
     * @param getTexture A getter to load a texture. Used if atlasTexture is not specified.
     * @returns A textures cache.
     */
    static parseAtlas(
      tiledData: TiledMap,
      atlasTexture: PIXI.BaseTexture<PIXI.Resource> | null,
      getTexture: (textureName: string) => PIXI.BaseTexture<PIXI.Resource>
    ): TileTextureCache | null;
    /**
     * Re-renders the tilemap whenever its rendering settings have been changed
     *
     * @param pixiTileMap
     * @param tileMap
     * @param textureCache
     * @param displayMode What to display: only a single layer (`index`), only visible layers (`visible`) or everyhing (`all`).
     * @param layerIndex If `displayMode` is set to `index`, the layer index to be displayed.
     */
    static updatePixiTileMap(
      pixiTileMap: any,
      tileMap: EditableTileMap,
      textureCache: TileTextureCache,
      displayMode: 'index' | 'visible' | 'all',
      layerIndex: number
    ): void;
    /**
     * Re-renders the collision mask
     *
     * @param pixiTileMap
     * @param tileMap
     * @param textureCache
     * @param displayMode What to display: only a single layer (`index`), only visible layers (`visible`) or everyhing (`all`).
     * @param layerIndex If `displayMode` is set to `index`, the layer index to be displayed.
     */
    static updatePixiCollisionMask(
      pixiGraphics: PIXI.Graphics,
      tileMap: EditableTileMap,
      displayMode: 'index' | 'visible' | 'all',
      layerIndex: integer,
      typeFilter: string,
      outlineSize: integer,
      outlineColor: integer,
      outlineOpacity: float,
      fillColor: integer,
      fillOpacity: float
    ): void;
  }

  export {
    EditableTileMap,
    EditableTileMapLayer,
    FloatPoint,
    PixiTileMapHelper,
    PolygonVertices,
    TileDefinition,
    TileMapManager,
    TileTextureCache,
    TiledMap,
    TiledTileset,
    float,
    integer,
  };
}
