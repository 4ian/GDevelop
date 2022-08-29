// Auto-generated types, see GDJS/scripts/lib/build-esm-library-types.js to modify those.
declare module 'TileMapHelper/src/model/CommonTypes' {
  export type integer = number;
  export type float = number;
  export type FloatPoint = [float, float];
  export type PolygonVertices = FloatPoint[];
}

declare module 'TileMapHelper/src/tiled/TiledFormat' {
  import { float, integer } from 'TileMapHelper/src/model/CommonTypes';
  /**
   * Tiled JSON format (https://www.mapeditor.org/).
   */
  export type TiledMap = {
    /** Hex-formatted color (#RRGGBB or #AARRGGBB) (optional) */
    backgroundcolor?: string;
    /** The compression level to use for tile layer data (defaults to -1, which means to use the algorithm default) */
    compressionlevel: integer;
    /** Number of tile rows */
    height: integer;
    /** Length of the side of a hex tile in pixels (hexagonal maps only) */
    hexsidelength?: integer;
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
    properties?: Array<TiledProperty>;
    /** `right-down` (the default), `right-up`, `left-down` or `left-up` (currently only supported for orthogonal maps) */
    renderorder: string;
    /** `x` or `y` (staggered / hexagonal maps only) */
    staggeraxis?: string;
    /** `odd` or `even` (staggered / hexagonal maps only) */
    staggerindex?: string;
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
  export type TiledLayer = {
    /** Array of {@link TiledChunk} (optional). `tilelayer` only. */
    chunks?: Array<TiledChunk>;
    /** `zlib`, `gzip`, `zstd` (since Tiled 1.3) or empty (default). `tilelayer` only. */
    compression?: string;
    /** Array of `unsigned`, `integer` (GIDs) or base64-encoded data. `tilelayer` only.*/
    data?: Array<integer> | string;
    /** `topdown` (default) or `index`. `objectgroup` only. */
    draworder?: string;
    /** `csv` (default) or `base64`. `tilelayer` only. */
    encoding?: string;
    /** Row count. Same as map height for fixed-size maps. */
    height?: integer;
    /** Incremental ID - unique across all layers */
    id?: integer;
    /** Image used by this layer. `imagelayer` only. */
    image?: string;
    /** Array of {@link TiledLayer}. `group` only. */
    layers?: Array<TiledLayer>;
    /** Name assigned to this layer */
    name: string;
    /** Array of {@link TiledObject}. `objectgroup` only. */
    objects?: Array<TiledObject>;
    /** Horizontal layer offset in pixels (default: 0) */
    offsetx?: float;
    /** Vertical layer offset in pixels (default: 0) */
    offsety?: float;
    /** Value between 0 and 1 */
    opacity: float;
    /** Horizontal {@link parallax factor} for this layer (default: 1). (since Tiled 1.5) */
    parallaxx?: float;
    /** Vertical {@link parallax factor} for this layer (default: 1). (since Tiled 1.5) */
    parallaxy?: float;
    /** Array of {@link TiledProperty} */
    properties?: Array<TiledProperty>;
    /** X coordinate where layer content starts (for infinite maps) */
    startx?: integer;
    /** Y coordinate where layer content starts (for infinite maps) */
    starty?: integer;
    /** Hex-formatted {@link tint color} (#RRGGBB or #AARRGGBB) that is multiplied with any graphics drawn by this layer or any child layers (optional). */
    tintcolor?: string;
    /** Hex-formatted color (#RRGGBB) (optional). `imagelayer` only. */
    transparentcolor?: string;
    /** `tilelayer`, `objectgroup`, `imagelayer` or `group` */
    type: string;
    /** Whether layer is shown or hidden in editor */
    visible: boolean;
    /** Column count. Same as map width for fixed-size maps. */
    width?: integer;
    /** Horizontal layer offset in tiles. Always 0. */
    x: integer;
    /** Vertical layer offset in tiles. Always 0. */
    y: integer;
  };
  export type TiledChunk = {
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
  export type TiledObject = {
    /** The class of the object (renamed from type since 1.9, optional) */
    class?: string;
    /** Used to mark an object as an ellipse */
    ellipse?: boolean;
    /** Global tile ID, only if object represents a tile */
    gid?: integer;
    /** Height in pixels. */
    height: float;
    /** Incremental ID, unique across all objects */
    id: integer;
    /** String assigned to name field in editor */
    name: string;
    /** Used to mark an object as a point */
    point?: boolean;
    /** Array of {@link TiledPoint}, in case the object is a polygon */
    polygon?: Array<TiledPoint>;
    /** Array of {@link TiledPoint}, in case the object is a polyline */
    polyline?: Array<TiledPoint>;
    /** Array of {@link TiledProperty} */
    properties?: Array<TiledProperty>;
    /** Angle in degrees clockwise */
    rotation: float;
    /** Reference to a template file, in case object is a {@link template instance} */
    template?: string;
    /** Only used for text objects */
    text?: Text;
    /** Whether object is shown in editor. */
    visible: boolean;
    /** Width in pixels. */
    width: float;
    /** X coordinate in pixels */
    x: float;
    /** Y coordinate in pixels */
    y: float;
  };
  export type TiledText = {
    /** Whether to use a bold font (default: `false`) */
    bold: boolean;
    /** Hex-formatted color (#RRGGBB or #AARRGGBB) (default: `#000000`) */
    color: string;
    /** Font family (default: `sans-serif`) */
    fontfamily: string;
    /** Horizontal alignment (`center`, `right`, `justify` or `left` (default)) */
    halign: string;
    /** Whether to use an italic font (default: `false`) */
    italic: boolean;
    /** Whether to use kerning when placing characters (default: `true`) */
    kerning: boolean;
    /** Pixel size of font (default: 16) */
    pixelsize: integer;
    /** Whether to strike out the text (default: `false`) */
    strikeout: boolean;
    /** Text */
    text: string;
    /** Whether to underline the text (default: `false`) */
    underline: boolean;
    /** Vertical alignment (`center`, `bottom` or `top` (default)) */
    valign: string;
    /** Whether the text is wrapped within the object bounds (default: `false`) */
    wrap: boolean;
  };
  export type TiledTileset = {
    /** Hex-formatted color (#RRGGBB or #AARRGGBB) (optional) */
    backgroundcolor?: string;
    /** The number of tile columns in the tileset */
    columns: integer;
    /** GID corresponding to the first tile in the set */
    firstgid?: integer;
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
    objectalignment?: string;
    /** Array of {@link TiledProperty} */
    properties?: Array<TiledProperty>;
    /** The external file that contains this tilesets data */
    source?: string;
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
    wangsets?: Array<TiledWangSet>;
  };
  export type TiledGrid = {
    /** Cell height of tile grid */
    height: integer;
    /** `orthogonal` (default) or `isometric` */
    orientation: string;
    /** Cell width of tile grid */
    width: integer;
  };
  export type TileOffset = {
    /** Horizontal offset in pixels */
    x: integer;
    /** Vertical offset in pixels (positive is down) */
    y: integer;
  };
  export type TiledTransformations = {
    /** Tiles can be flipped horizontally */
    hflip: boolean;
    /** Tiles can be flipped vertically */
    vflip: boolean;
    /** Tiles can be rotated in 90-degree increments */
    rotate: boolean;
    /** Whether untransformed tiles remain preferred, otherwise transformed tiles are used to produce more variations */
    preferuntransformed: boolean;
  };
  export type TiledTileDefinition = {
    /** Array of {@link TiledTiles} */
    animation?: Array<TiledTileDefinition>;
    /** The class of the tile (renamed from type since 1.9, optional) */
    class?: string;
    /** Local ID of the tile */
    id: integer;
    /** Image representing this tile (optional) */
    image?: string;
    /** Height of the tile image in pixels */
    imageheight?: integer;
    /** Width of the tile image in pixels */
    imagewidth?: integer;
    /** Layer with type Tiled`objectgroup`, when collision shapes are specified (optional) */
    objectgroup?: TiledLayer;
    /** Percentage chance this tile is chosen when competing with others in the editor (optional) */
    probability?: float;
    /** Array of {@link TiledProperty} */
    properties?: Array<TiledProperty>;
    /** Index of terrain for each corner of tile (optional) */
    terrain?: Array<integer>;
  };
  export type TiledFrame = {
    /** Frame duration in milliseconds */
    duration: integer;
    /** Local tile ID representing this frame */
    tileid: integer;
  };
  export type TiledTerrain = {
    /** Name of terrain */
    name: string;
    /** Array of {@link TiledProperty} */
    properties: Array<TiledProperty>;
    /** Local ID of tile representing terrain */
    tile: integer;
  };
  export type TiledWangSet = {
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
  export type TiledWangColor = {
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
  export type TiledWangTile = {
    /** Local ID of tile */
    tileid: integer;
    /** Array of Wang color indexes (`uchar[8]`) */
    wangid: Array<integer>;
  };
  export type TiledObjectTemplate = {
    /** `template` */
    type: string;
    /** External tileset used by the template (optional) */
    tileset?: TiledTileset;
    /** The object instantiated by this template */
    object: Object;
  };
  export type TiledProperty = {
    /** Name of the property */
    name: string;
    /** type of the property (`string` (default), `integer`, `float`, `boolean`, `color` or `file` (since 0.16, with `color` and `file` added in 0.17)) */
    type: string;
    /** Value of the property */
    value: string | number;
  };
  export type TiledPoint = {
    /** X coordinate in pixels */
    x: float;
    /** Y coordinate in pixels */
    y: float;
  };
}

declare module 'TileMapHelper/src/model/TileMapModel' {
  import {
    PolygonVertices,
    integer,
    float,
  } from 'TileMapHelper/src/model/CommonTypes';
  /**
   * A tile map model.
   *
   * Tile map files are parsed into this model by {@link TiledTileMapLoader}.
   * This model is used for rending ({@link TileMapRuntimeObjectPixiRenderer})
   * and hitboxes handling ({@link TransformedCollisionTileMap}).
   * This allows to support new file format with only a new parser.
   */
  export class EditableTileMap {
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
    getWidth(): integer;
    /**
     * @returns The tile map height in pixels.
     */
    getHeight(): integer;
    /**
     * @returns The tile width in pixels.
     */
    getTileHeight(): integer;
    /**
     * @returns The tile height in pixels.
     */
    getTileWidth(): integer;
    /**
     * @returns The number of tile columns in the map.
     */
    getDimensionX(): integer;
    /**
     * @returns The number of tile rows in the map.
     */
    getDimensionY(): integer;
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
    setVisible(visible: boolean): void;
    /**
     * @returns true if the layer is visible.
     */
    isVisible(): boolean;
  }
  /**
   * A layer where tiles are placed with pixel coordinates.
   */
  export class EditableObjectLayer extends AbstractEditableLayer {
    readonly objects: TileObject[];
    /**
     * @param tileMap  The layer tile map.
     * @param id The layer identifier.
     */
    constructor(tileMap: EditableTileMap, id: integer);
    add(object: TileObject): void;
  }
  /**
   * A tile that is placed with pixel coordinates.
   */
  export class TileObject {
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
    setFlippedHorizontally(flippedHorizontally: boolean): void;
    setFlippedVertically(flippedVertically: boolean): void;
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
  export class EditableTileMapLayer extends AbstractEditableLayer {
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
     * @param flippedHorizontally true if the tile is flipped horizontally.
     */
    setFlippedHorizontally(
      x: integer,
      y: integer,
      flippedHorizontally: boolean
    ): void;
    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param flippedVertically true if the tile is flipped vertically.
     */
    setFlippedVertically(
      x: integer,
      y: integer,
      flippedVertically: boolean
    ): void;
    /**
     * @param x The layer column.
     * @param y The layer row.
     * @param flippedDiagonally true if the tile is flipped diagonally.
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
    getDimensionX(): integer;
    /**
     * The number of tile rows in the layer.
     */
    getDimensionY(): integer;
    /**
     * @returns The layer width in pixels.
     */
    getWidth(): integer;
    /**
     * @returns The layer height in pixels.
     */
    getHeight(): integer;
  }
  /**
   * A tile definition from the tile set.
   */
  export class TileDefinition {
    /**
     * There will probably be at most 4 tags on a tile.
     * An array lookup should take less time than using a Map.
     */
    private readonly taggedHitBoxes;
    private readonly animationLength;
    /**
     * @param animationLength The number of frame in the tile animation.
     */
    constructor(animationLength: integer);
    /**
     * Add a polygon for the collision layer
     * @param tag The tag to allow collision layer filtering.
     * @param polygon The polygon to use for collisions.
     */
    add(tag: string, polygon: PolygonVertices): void;
    /**
     * This property is used by {@link TransformedCollisionTileMap}
     * to make collision classes.
     * @param tag  The tag to allow collision layer filtering.
     * @returns true if this tile contains any polygon with the given tag.
     */
    hasTag(tag: string): boolean;
    /**
     * The hitboxes positioning is done by {@link TransformedCollisionTileMap}.
     * @param tag  The tag to allow collision layer filtering.
     * @returns The hit boxes for this tile.
     */
    getHitBoxes(tag: string): PolygonVertices[] | undefined;
    /**
     * Animated tiles have a limitation:
     * they are only able to use frames arranged horizontally one next
     * to each other on the atlas.
     * @returns The number of frame in the tile animation.
     */
    getAnimationLength(): integer;
  }
  export {};
}

declare module 'TileMapHelper/src/render/ResourceCache' {
  /**
   * A cache of resources identified by a string.
   *
   * It ensures that a resource is never load twice.
   */
  export class ResourceCache<T> {
    private _cachedValues;
    /**
     * Several calls can happen before the resource is loaded.
     * This allows to stack them.
     */
    private _callbacks;
    constructor();
    /**
     * Return a resource through a call back.
     * @param key the resource identifier.
     * @param load load the resource in case of cache default.
     * Note that the load callback is used by `getOrLoad` and not by the caller.
     * @param callback called when the resource is ready.
     */
    getOrLoad(
      key: string,
      load: (callback: (value: T | null) => void) => void,
      callback: (value: T | null) => void
    ): void;
  }
}

declare module 'TileMapHelper/src/tiled/TiledLoaderHelper' {
  import { integer } from 'TileMapHelper/src/model/CommonTypes';
  import { TiledLayer } from 'TileMapHelper/src/tiled/TiledFormat';
  /**
   * Decodes a layer data, which can sometimes be store as a compressed base64 string
   * by Tiled.
   * See https://doc.mapeditor.org/en/stable/reference/tmx-map-format/#data.
   * @param layer The layer data from a Tiled JSON.
   * @returns The decoded layer data.
   */
  export const decodeBase64LayerData: (layer: TiledLayer) => number[];
  export type TiledGID = {
    id: integer;
    flippedHorizontally: boolean;
    flippedVertically: boolean;
    flippedDiagonally: boolean;
  };
  /**
   * Extract information about the rotation of a tile from the tile id.
   * @param globalTileUid The Tiled tile global uniq identifier.
   * @returns The tile identifier and orientation.
   */
  export const extractTileUidFlippedStates: (
    globalTileUid: integer
  ) => TiledGID;
  /**
   * Tiled use 0 as null, we do too but it's black boxed.
   * This is why the id needs to be decremented.
   * @return the tile identifier used in {@link TilMapModel}.
   */
  export const getTileIdFromTiledGUI: (
    tiledGUI: number | undefined
  ) => number | undefined;
}

declare module 'TileMapHelper/src/tiled/TiledTileMapLoader' {
  import { EditableTileMap } from 'TileMapHelper/src/model/TileMapModel';
  import { TiledMap } from 'TileMapHelper/src/tiled/TiledFormat';
  /**
   * It creates a {@link EditableTileMap} from a Tiled JSON.
   */
  export class TiledTileMapLoader {
    static load(tiledMap: TiledMap): EditableTileMap | null;
  }
}

declare module 'TileMapHelper/src/render/TileTextureCache' {
  import { integer } from 'TileMapHelper/src/model/CommonTypes';
  import type { Texture } from 'GDJS/Runtime/pixi-renderers/pixi';
  /**
   * A cache to access the tile images.
   *
   * It's created by {@link PixiTileMapHelper.parseAtlas}
   * and used by {@link PixiTileMapHelper.updatePixiTileMap}.
   */
  export class TileTextureCache {
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
      texture: Texture
    ): void;
    /**
     * Return the texture to use for the tile with the specified uid, which can contains
     * information about rotation in bits 32, 31 and 30
     * (see https://doc.mapeditor.org/en/stable/reference/tmx-map-format/).
     *
     * @param tileId The tile identifier
     * @param flippedHorizontally true if the tile is flipped horizontally.
     * @param flippedVertically true if the tile is flipped vertically.
     * @param flippedDiagonally true if the tile is flipped diagonally.
     * @returns The texture for the given tile identifier and orientation.
     */
    findTileTexture(
      tileId: integer,
      flippedHorizontally: boolean,
      flippedVertically: boolean,
      flippedDiagonally: boolean
    ): Texture | undefined;
    /**
     * @return the Tiled tile global uniq identifier.
     */
    private _getGlobalId;
  }
}

declare module 'TileMapHelper/src/render/TileMapPixiHelper' {
  import { integer, float } from 'TileMapHelper/src/model/CommonTypes';
  import { TiledMap } from 'TileMapHelper/src/tiled/TiledFormat';
  import { EditableTileMap } from 'TileMapHelper/src/model/TileMapModel';
  import { TileTextureCache } from 'TileMapHelper/src/render/TileTextureCache';
  import type {
    Resource,
    BaseTexture,
    Graphics,
  } from 'GDJS/Runtime/pixi-renderers/pixi';
  export class PixiTileMapHelper {
    /**
     * Split an atlas image into Pixi textures.
     *
     * @param tiledMap A tile map exported from Tiled.
     * @param atlasTexture The texture containing the whole tile set.
     * @param getTexture A getter to load a texture. Used if atlasTexture is not specified.
     * @returns A textures cache.
     */
    static parseAtlas(
      tiledMap: TiledMap,
      atlasTexture: BaseTexture<Resource> | null,
      getTexture: (textureName: string) => BaseTexture<Resource>
    ): TileTextureCache | null;
    /**
     * Re-renders the tile map whenever its rendering settings have been changed
     *
     * @param pixiTileMap the tile map renderer
     * @param tileMap the tile map model
     * @param textureCache the tile set textures
     * @param displayMode What to display:
     * - only a single layer (`index`)
     * - only visible layers (`visible`)
     * - everything (`all`).
     * @param layerIndex If `displayMode` is set to `index`, the layer index to be
     * displayed.
     */
    static updatePixiTileMap(
      untypedPixiTileMap: any,
      tileMap: EditableTileMap,
      textureCache: TileTextureCache,
      displayMode: 'index' | 'visible' | 'all',
      layerIndex: number
    ): void;
    /**
     * Re-renders the collision mask
     */
    static updatePixiCollisionMask(
      pixiGraphics: Graphics,
      tileMap: EditableTileMap,
      typeFilter: string,
      outlineSize: integer,
      outlineColor: integer,
      outlineOpacity: float,
      fillColor: integer,
      fillOpacity: float
    ): void;
  }
}

declare module 'TileMapHelper/src/render/TileMapManager' {
  import { TiledMap } from 'TileMapHelper/src/tiled/TiledFormat';
  import { EditableTileMap } from 'TileMapHelper/src/model/TileMapModel';
  import { TileTextureCache } from 'TileMapHelper/src/render/TileTextureCache';
  import type { Resource, BaseTexture } from 'GDJS/Runtime/pixi-renderers/pixi';
  /**
   * A holder to share tile maps across the 2 extension objects.
   *
   * Every instance with the same files path in properties will
   * share the same {@link EditableTileMap} and {@link TileTextureCache}.
   *
   * @see {@link TileMapRuntimeManager}
   */
  export class TileMapManager {
    private _tileMapCache;
    private _textureCacheCaches;
    constructor();
    /**
     * @param instanceHolder Where to set the manager instance.
     * @returns The shared manager.
     */
    static getManager(instanceHolder: Object): TileMapManager;
    /**
     * @param loadTiledMap The method that loads the Tiled JSON file in memory.
     * @param tileMapJsonResourceName The resource name of the tile map.
     * @param tileSetJsonResourceName The resource name of the tile set.
     * @param callback A function called when the tile map is parsed.
     */
    getOrLoadTileMap(
      loadTiledMap: (
        tileMapJsonResourceName: string,
        tileSetJsonResourceName: string,
        callback: (tiledMap: TiledMap | null) => void
      ) => void,
      tileMapJsonResourceName: string,
      tileSetJsonResourceName: string,
      callback: (tileMap: EditableTileMap | null) => void
    ): void;
    /**
     * @param loadTiledMap The method that loads the Tiled JSON file in memory.
     * @param getTexture The method that loads the atlas image file in memory.
     * @param atlasImageResourceName The resource name of the atlas image.
     * @param tileMapJsonResourceName The resource name of the tile map.
     * @param tileSetJsonResourceName The resource name of the tile set.
     * @param callback A function called when the tiles textures are split.
     */
    getOrLoadTextureCache(
      loadTiledMap: (
        tileMapJsonResourceName: string,
        tileSetJsonResourceName: string,
        callback: (tiledMap: TiledMap | null) => void
      ) => void,
      getTexture: (textureName: string) => BaseTexture<Resource>,
      atlasImageResourceName: string,
      tileMapJsonResourceName: string,
      tileSetJsonResourceName: string,
      callback: (textureCache: TileTextureCache | null) => void
    ): void;
  }
}
