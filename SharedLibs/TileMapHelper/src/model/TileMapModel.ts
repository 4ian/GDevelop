import { PolygonVertices, integer, float } from "./CommonTypes";
import { FlippingHelper } from "./GID";

/**
 * A tile map model.
 *
 * Tile map files are parsed into this model by {@link TiledTileMapLoader} or {@link LDtkTileMapLoader}.
 * This model is used for rending ({@link TileMapRuntimeObjectPixiRenderer})
 * and hitboxes handling ({@link TransformedCollisionTileMap}).
 * This allows to support new file format with only a new parser.
 */
export class EditableTileMap {
  private _backgroundResourceName?: string;
  private _tileSet: Map<integer, TileDefinition>;
  private _layers: Array<AbstractEditableLayer>;
  /**
   * The width of a tile.
   */
  private readonly tileWidth: integer;
  /**
   * The height of a tile.
   */
  private readonly tileHeight: integer;
  /**
   * The number of tile columns in the map.
   */
  private readonly dimX: integer;
  /**
   * The number of tile rows in the map.
   */
  private readonly dimY: integer;

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
    // TODO should the tile set be built internally?
    // It's not meant to change and it avoid to do a copy.
    tileSet: Map<integer, TileDefinition>
  ) {
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.dimX = dimX;
    this.dimY = dimY;
    this._tileSet = tileSet;
    this._layers = [];
  }

  /**
   * @returns The tile map width in pixels.
   */
  getWidth(): integer {
    return this.tileWidth * this.dimX;
  }

  /**
   * @returns The tile map height in pixels.
   */
  getHeight(): integer {
    return this.tileHeight * this.dimY;
  }

  /**
   * @returns The tile width in pixels.
   */
  getTileHeight(): integer {
    return this.tileHeight;
  }

  /**
   * @returns The tile height in pixels.
   */
  getTileWidth(): integer {
    return this.tileWidth;
  }

  /**
   * @returns The number of tile columns in the map.
   */
  getDimensionX(): integer {
    return this.dimX;
  }

  /**
   * @returns The number of tile rows in the map.
   */
  getDimensionY(): integer {
    return this.dimY;
  }

  /**
   * @param tileId The tile identifier
   * @returns The tile definition form the tile set.
   */
  getTileDefinition(tileId: integer): TileDefinition | undefined {
    return this._tileSet.get(tileId);
  }

  /**
   * @returns All the tile definitions form the tile set.
   */
  getTileDefinitions(): Iterable<TileDefinition> {
    return this._tileSet.values();
  }

  /**
   * @param id The identifier of the new layer.
   * @returns The new layer.
   */
  addTileLayer(id: integer): EditableTileMapLayer {
    const layer = new EditableTileMapLayer(this, id);
    this._layers.push(layer);
    return layer;
  }

  /**
   * @param id The identifier of the new layer.
   * @returns The new layer.
   */
  addObjectLayer(id: integer): EditableObjectLayer {
    const layer = new EditableObjectLayer(this, id);
    this._layers.push(layer);
    return layer;
  }

  /**
   * @returns The resource name of the background
   */
  getBackgroundResourceName(): string {
    return this._backgroundResourceName;
  }

  /**
   * @returns All the layers of the tile map.
   */
  getLayers(): Iterable<AbstractEditableLayer> {
    return this._layers;
  }

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
  pointIsInsideTile(x: float, y: float, tag: string): boolean {
    const indexX = Math.floor(x / this.tileWidth);
    const indexY = Math.floor(y / this.tileHeight);
    for (const layer of this._layers) {
      const tileLayer = layer as EditableTileMapLayer;
      if (!tileLayer) {
        continue;
      }
      const tileId = tileLayer.getTileId(indexX, indexY);
      if (tileId === undefined) {
        return false;
      }
      const tileDefinition = this._tileSet.get(tileId)!;
      if (tileDefinition.hasTaggedHitBox(tag)) {
        return true;
      }
    }
    return false;
  }

  /**
   * @param resourceName The name of the resource
   */
  setBackgroundResourceName(resourceName: string): void {
    this._backgroundResourceName = resourceName;
  }
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
  private visible: boolean = true;

  /**
   * @param tileMap The layer tile map.
   * @param id The layer identifier.
   */
  constructor(tileMap: EditableTileMap, id: integer) {
    this.tileMap = tileMap;
    this.id = id;
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
  }

  /**
   * @returns true if the layer is visible.
   */
  isVisible(): boolean {
    return this.visible;
  }
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
  constructor(tileMap: EditableTileMap, id: integer) {
    super(tileMap, id);
    this.objects = [];
  }

  add(object: TileObject): void {
    this.objects.push(object);
  }
}

/**
 * A tile that is placed with pixel coordinates.
 */
export class TileObject {
  /**
   * The tile identifier in the tile set.
   */
  private tileId: integer;
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
  constructor(x: float, y: float, tileId: integer) {
    this.tileId = tileId;
    this.x = x;
    this.y = y;
  }

  /**
   * @return The tile identifier in the tile set.
   */
  getTileId(): integer {
    return FlippingHelper.getTileId(this.tileId);
  }

  setFlippedHorizontally(flippedHorizontally: boolean): void {
    this.tileId = FlippingHelper.setFlippedHorizontally(
      this.tileId,
      flippedHorizontally
    );
  }

  setFlippedVertically(flippedVertically: boolean): void {
    this.tileId = FlippingHelper.setFlippedVertically(
      this.tileId,
      flippedVertically
    );
  }

  setFlippedDiagonally(flippedDiagonally: boolean): void {
    this.tileId = FlippingHelper.setFlippedDiagonally(
      this.tileId,
      flippedDiagonally
    );
  }

  /**
   * @returns true if the tile is flipped horizontally.
   */
  isFlippedHorizontally(): boolean {
    return FlippingHelper.isFlippedHorizontally(this.tileId);
  }

  /**
   * @returns true if the tile is flipped vertically.
   */
  isFlippedVertically(): boolean {
    return FlippingHelper.isFlippedVertically(this.tileId);
  }

  /**
   * @returns true if the tile is flipped diagonally.
   */
  isFlippedDiagonally(): boolean {
    return FlippingHelper.isFlippedDiagonally(this.tileId);
  }
}

/**
 * A tile map layer with tile organized in grid.
 */
export class EditableTileMapLayer extends AbstractEditableLayer {
  private readonly _tiles: Int32Array[];
  private _alpha: float;

  /**
   * @param tileMap The layer tile map.
   * @param id The layer identifier.
   */
  constructor(tileMap: EditableTileMap, id: integer) {
    super(tileMap, id);
    this._tiles = [];
    this._tiles.length = this.tileMap.getDimensionY();
    for (let index = 0; index < this._tiles.length; index++) {
      this._tiles[index] = new Int32Array(this.tileMap.getDimensionX());
    }
    this._alpha = 1;
  }

  /**
   * The opacity (between 0-1) of the layer
   */
  getAlpha(): float {
    return this._alpha;
  }

  /**
   * @param alpha The opacity between 0-1
   */
  setAlpha(alpha: float) {
    this._alpha = alpha;
  }

  /**
   * @param x The layer column.
   * @param y The layer row.
   * @param tileId The tile.
   */
  setTile(x: integer, y: integer, tileId: integer): void {
    const definition = this.tileMap.getTileDefinition(tileId);
    if (!definition) {
      console.error(`Invalid tile definition index: ${tileId}`);
      return;
    }
    const tilesRow = this._tiles[y];
    if (!tilesRow || x >= tilesRow.length) {
      // Coordinates are out of bounds, don't do anything.
      return;
    }

    // +1 because 0 mean null
    tilesRow[x] = tileId + 1;
  }

  /**
   * @param x The layer column.
   * @param y The layer row.
   */
  removeTile(x: integer, y: integer): void {
    const tilesRow = this._tiles[y];
    if (!tilesRow || x >= tilesRow.length) {
      // Coordinates are out of bounds, don't do anything.
      return;
    }

    // 0 mean null
    tilesRow[x] = 0;
  }

  /**
   * @param x The layer column.
   * @param y The layer row.
   * @param flippedHorizontally true if the tile is flipped horizontally.
   */
  setFlippedHorizontally(
    x: integer,
    y: integer,
    flippedHorizontally: boolean
  ): void {
    const tilesRow = this._tiles[y];
    if (!tilesRow || x >= tilesRow.length) {
      // Coordinates are out of bounds, don't do anything.
      return;
    }

    const tileId = tilesRow[x];
    if (tileId === 0) {
      return;
    }
    tilesRow[x] = FlippingHelper.setFlippedHorizontally(
      tileId,
      flippedHorizontally
    );
  }

  /**
   * @param x The layer column.
   * @param y The layer row.
   * @param flippedVertically true if the tile is flipped vertically.
   */
  setFlippedVertically(
    x: integer,
    y: integer,
    flippedVertically: boolean
  ): void {
    const tilesRow = this._tiles[y];
    if (!tilesRow || x >= tilesRow.length) {
      // Coordinates are out of bounds, don't do anything.
      return;
    }

    const tileId = tilesRow[x];
    if (tileId === 0) {
      return;
    }
    tilesRow[x] = FlippingHelper.setFlippedVertically(
      tileId,
      flippedVertically
    );
  }

  /**
   * @param x The layer column.
   * @param y The layer row.
   * @param flippedDiagonally true if the tile is flipped diagonally.
   */
  setFlippedDiagonally(
    x: integer,
    y: integer,
    flippedDiagonally: boolean
  ): void {
    const tilesRow = this._tiles[y];
    if (!tilesRow || x >= tilesRow.length) {
      // Coordinates are out of bounds, don't do anything.
      return;
    }

    const tileId = tilesRow[x];
    if (tileId === 0) {
      return;
    }
    tilesRow[x] = FlippingHelper.setFlippedDiagonally(
      tileId,
      flippedDiagonally
    );
  }

  /**
   * @param x The layer column.
   * @param y The layer row.
   * @returns true if the tile is flipped horizontally.
   */
  isFlippedHorizontally(x: integer, y: integer): boolean {
    const tilesRow = this._tiles[y];
    if (!tilesRow || x >= tilesRow.length) {
      // Coordinates are out of bounds, don't do anything.
      return false;
    }

    return FlippingHelper.isFlippedHorizontally(tilesRow[x]);
  }

  /**
   * @param x The layer column.
   * @param y The layer row.
   * @returns true if the tile is flipped vertically.
   */
  isFlippedVertically(x: integer, y: integer): boolean {
    const tilesRow = this._tiles[y];
    if (!tilesRow || x >= tilesRow.length) {
      // Coordinates are out of bounds, don't do anything.
      return false;
    }

    return FlippingHelper.isFlippedVertically(tilesRow[x]);
  }

  /**
   * @param x The layer column.
   * @param y The layer row.
   * @returns true if the tile is flipped diagonally.
   */
  isFlippedDiagonally(x: integer, y: integer): boolean {
    const tilesRow = this._tiles[y];
    if (!tilesRow || x >= tilesRow.length) {
      // Coordinates are out of bounds, don't do anything.
      return false;
    }

    return FlippingHelper.isFlippedDiagonally(tilesRow[x]);
  }

  /**
   * @param x The layer column.
   * @param y The layer row.
   * @returns The tile's GID (id + flipping bits).
   */
  getTileGID(x: integer, y: integer): integer | undefined {
    const tilesRow = this._tiles[y];
    if (!tilesRow || x >= tilesRow.length || tilesRow[x] === 0) {
      return undefined;
    }
    // -1 because 0 is keep for null.
    return tilesRow[x] - 1;
  }

  /**
   * @param x The layer column.
   * @param y The layer row.
   * @returns The tile's id.
   */
  getTileId(x: integer, y: integer): integer | undefined {
    const tilesRow = this._tiles[y];
    if (!tilesRow || x >= tilesRow.length || tilesRow[x] === 0) {
      return undefined;
    }
    // -1 because 0 is keep for null.
    const tileId = FlippingHelper.getTileId(tilesRow[x] - 1);
    return tileId;
  }

  /**
   * The number of tile columns in the layer.
   */
  getDimensionX(): integer {
    return this._tiles.length === 0 ? 0 : this._tiles[0].length;
  }

  /**
   * The number of tile rows in the layer.
   */
  getDimensionY(): integer {
    return this._tiles.length;
  }

  /**
   * @returns The layer width in pixels.
   */
  getWidth(): integer {
    return this.tileMap.getWidth();
  }

  /**
   * @returns The layer height in pixels.
   */
  getHeight(): integer {
    return this.tileMap.getHeight();
  }
}

/**
 * A tile definition from the tile set.
 */
export class TileDefinition {
  /**
   * There will probably be at most 4 tags on a tile.
   * An array lookup should take less time than using a Map.
   */
  private readonly taggedHitBoxes: {
    tag: string;
    polygons: PolygonVertices[];
  }[];
  private readonly animationLength: integer;

  /**
   * A tile can be a composition of several tiles.
   */
  private stackedTiles: integer[];
  private stackTileId?: integer;

  /**
   * @param animationLength The number of frame in the tile animation.
   */
  constructor(animationLength?: integer) {
    this.taggedHitBoxes = [];
    this.animationLength = animationLength ?? 0;
    this.stackedTiles = [];
  }

  /**
   * Add a polygon for the collision layer
   * @param tag The tag to allow collision layer filtering.
   * @param polygon The polygon to use for collisions.
   */
  addHitBox(tag: string, polygon: PolygonVertices): void {
    let taggedHitBox = this.taggedHitBoxes.find((hitbox) => hitbox.tag === tag);
    if (!taggedHitBox) {
      taggedHitBox = { tag, polygons: [] };
      this.taggedHitBoxes.push(taggedHitBox);
    }
    taggedHitBox.polygons.push(polygon);
  }

  /**
   * This property is used by {@link TransformedCollisionTileMap}
   * to make collision classes.
   * @param tag  The tag to allow collision layer filtering.
   * @returns true if this tile contains any polygon with the given tag.
   */
  hasTaggedHitBox(tag: string): boolean {
    return this.taggedHitBoxes.some((hitbox) => hitbox.tag === tag);
  }

  /**
   * The hitboxes positioning is done by {@link TransformedCollisionTileMap}.
   * @param tag  The tag to allow collision layer filtering.
   * @returns The hit boxes for this tile.
   */
  getHitBoxes(tag: string): PolygonVertices[] | undefined {
    const taggedHitBox = this.taggedHitBoxes.find(
      (hitbox) => hitbox.tag === tag
    );
    return taggedHitBox && taggedHitBox.polygons;
  }

  /**
   * Animated tiles have a limitation:
   * they are only able to use frames arranged horizontally one next
   * to each other on the atlas.
   * @returns The number of frame in the tile animation.
   */
  getAnimationLength(): integer {
    return this.animationLength;
  }

  /**
   * @returns The tile representing the stack of tiles.
   */
  getStackTileId(): integer {
    return this.stackTileId!;
  }

  /**
   * @returns All the tiles composed in the stack.
   */
  getStackedTiles(): integer[] {
    return this.stackedTiles;
  }

  /**
   * @returns `true` if the defintion is a stack of tiles.
   */
  hasStackedTiles(): boolean {
    return this.stackedTiles.length > 0;
  }

  /**
   * @param stackTileId The `tileId` representing the stack.
   * @param tiles All the tiles of stack.
   */
  setStackedTiles(stackTileId: integer, ...tiles: integer[]): void {
    this.stackedTiles = tiles;
    this.stackTileId = stackTileId;
  }
}
