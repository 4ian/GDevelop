import { float, integer } from '../../model/CommonTypes';
/**
 * Tiled JSON format (https://github.com/mapeditor/tiled/blob/master/docs/reference/json-map-format.rst).
 */
export type TiledTileMap = {
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
  /** The class of the object (was saved as class in 1.9, optional) */
  type?: string;
  /** The class of the object (used only in 1.9, optional) */
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
  /** The class of the object (was saved as class in 1.9, optional) */
  type?: string;
  /** The class of the object (used only in 1.9, optional) */
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
//# sourceMappingURL=TiledFormat.d.ts.map
