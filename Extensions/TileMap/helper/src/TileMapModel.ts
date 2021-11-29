namespace gdjs {
  export namespace TileMap {
    export type PolygonVertices = FloatPoint[];

    export class EditableTileMap {
      private _tileSet: Map<integer, TileDefinition>;
      private _layers: Array<AbstractEditableLayer>;
      private readonly tileWidth: integer;
      private readonly tileHeight: integer;
      private readonly dimX: integer;
      private readonly dimY: integer;

      constructor(
        tileWidth: integer,
        tileHeight: integer,
        dimX: integer,
        dimY: integer,
        tileSet: Map<integer, TileDefinition>
      ) {
        console.log('tile dimension: ' + tileWidth + ' ' + tileHeight);
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.dimX = dimX;
        this.dimY = dimY;
        this._tileSet = tileSet;
        this._layers = [];
      }

      getWidth() {
        return this.tileWidth * this.dimX;
      }

      getHeight() {
        return this.tileHeight * this.dimY;
      }

      getTileHeight() {
        return this.tileWidth;
      }

      getTileWidth() {
        return this.tileHeight;
      }

      getDimensionX() {
        return this.dimX;
      }

      getDimensionY() {
        return this.dimY;
      }

      getTileDefinition(id: integer): TileDefinition | undefined {
        return this._tileSet.get(id);
      }

      getTileDefinitions(): Iterable<TileDefinition> {
        return this._tileSet.values();
      }

      addTileLayer(id: integer): EditableTileMapLayer {
        const layer = new EditableTileMapLayer(this, id);
        this._layers.push(layer);
        return layer;
      }

      addObjectLayer(id: integer): EditableObjectLayer {
        const layer = new EditableObjectLayer(this, id);
        this._layers.push(layer);
        return layer;
      }

      getLayers(): Iterable<AbstractEditableLayer> {
        return this._layers;
      }

      pointIsInsideTile(x: float, y: float, tag: string): boolean {
        const indexX = Math.floor(x / this.tileWidth);
        const indexY = Math.floor(y / this.tileHeight);
        for (const layer of this._layers) {
          const tileLayer = layer as EditableTileMapLayer;
          if (!tileLayer) {
            continue;
          }
          const tileId = tileLayer.get(indexX, indexY);
          if (!tileId) {
            return false;
          }
          const tileDefinition = this._tileSet.get(tileId);
          if (tileDefinition!.getTag() === tag) {
            return true;
          }
        }
        return false;
      }
    }

    abstract class AbstractEditableLayer {
      readonly tileMap: EditableTileMap;
      readonly id: integer;
      private visible: boolean = true;

      constructor(tileMap: EditableTileMap, id: integer) {
        this.tileMap = tileMap;
        this.id = id;
      }

      setVisible(visible: boolean): void {
        this.visible = visible;
      }

      isVisible(): boolean {
        return this.visible;
      }
    }

    export class EditableObjectLayer extends AbstractEditableLayer {
      readonly objects: TileObject[];

      constructor(tileMap: EditableTileMap, id: integer) {
        super(tileMap, id);
        this.objects = [];
      }

      add(object: TileObject) {
        this.objects.push(object);
      }
    }

    export class TileObject {
      private tileId: integer;
      readonly x: float;
      readonly y: float;

      constructor(x: float, y: float, tileId: integer) {
        this.tileId = tileId;
        this.x = x;
        this.y = y;
      }

      getTileId(): integer {
        return FlippingHelper.getTileId(this.tileId);
      }

      setFlippedHorizontally(flippedHorizontally: boolean) {
        this.tileId = FlippingHelper.setFlippedHorizontally(
          this.tileId,
          flippedHorizontally
        );
      }

      setFlippedVertically(flippedVertically: boolean) {
        this.tileId = FlippingHelper.setFlippedVertically(
          this.tileId,
          flippedVertically
        );
      }

      setFlippedDiagonally(flippedDiagonally: boolean) {
        this.tileId = FlippingHelper.setFlippedDiagonally(
          this.tileId,
          flippedDiagonally
        );
      }

      isFlippedHorizontally(): boolean {
        return FlippingHelper.isFlippedHorizontally(this.tileId);
      }

      isFlippedVertically(): boolean {
        return FlippingHelper.isFlippedVertically(this.tileId);
      }

      isFlippedDiagonally(): boolean {
        return FlippingHelper.isFlippedDiagonally(this.tileId);
      }
    }

    class FlippingHelper {
      static readonly flippedHorizontallyFlag = 0x80000000;
      static readonly flippedVerticallyFlag = 0x40000000;
      static readonly flippedDiagonallyFlag = 0x20000000;
      static readonly tileIdMask = ~(
        FlippingHelper.flippedHorizontallyFlag |
        FlippingHelper.flippedVerticallyFlag |
        FlippingHelper.flippedDiagonallyFlag
      );

      static getTileId(tileId: integer): integer {
        return tileId & FlippingHelper.tileIdMask;
      }

      static setFlippedHorizontally(
        tileId: integer,
        flippedHorizontally: boolean
      ): integer {
        tileId &= ~FlippingHelper.flippedHorizontallyFlag;
        if (flippedHorizontally) {
          tileId |= FlippingHelper.flippedHorizontallyFlag;
        }
        return tileId;
      }

      static setFlippedVertically(
        tileId: integer,
        flippedVertically: boolean
      ): integer {
        tileId &= ~FlippingHelper.flippedVerticallyFlag;
        if (flippedVertically) {
          tileId |= FlippingHelper.flippedVerticallyFlag;
        }
        return tileId;
      }

      static setFlippedDiagonally(
        tileId: integer,
        flippedDiagonally: boolean
      ): integer {
        tileId &= ~FlippingHelper.flippedDiagonallyFlag;
        if (flippedDiagonally) {
          tileId |= FlippingHelper.flippedDiagonallyFlag;
        }
        return tileId;
      }

      static isFlippedHorizontally(tileId: integer): boolean {
        return (tileId & FlippingHelper.flippedHorizontallyFlag) !== 0;
      }

      static isFlippedVertically(tileId: integer): boolean {
        return (tileId & FlippingHelper.flippedVerticallyFlag) !== 0;
      }

      static isFlippedDiagonally(tileId: integer): boolean {
        return (tileId & FlippingHelper.flippedDiagonallyFlag) !== 0;
      }
    }

    export class EditableTileMapLayer extends AbstractEditableLayer {
      private readonly _tiles: Array<Int32Array>;

      constructor(tileMap: EditableTileMap, id: integer) {
        super(tileMap, id);
        this._tiles = [];
        this._tiles.length = this.tileMap.getDimensionY();
        for (let index = 0; index < this._tiles.length; index++) {
          this._tiles[index] = new Int32Array(this.tileMap.getDimensionX());
        }
      }

      setTile(x: integer, y: integer, definitionIndex: integer): void {
        const definition = this.tileMap.getTileDefinition(definitionIndex);
        if (!definition) {
          throw new Error(`Invalid tile definition index: ${definitionIndex}`);
        }
        //console.log(x + " " + y + " set: " + definitionIndex);
        // +1 because 0 mean null
        this._tiles[y][x] = definitionIndex + 1;
      }

      removeTile(x: integer, y: integer): void {
        // 0 mean null
        this._tiles[y][x] = 0;
      }

      setFlippedHorizontally(
        x: integer,
        y: integer,
        flippedHorizontally: boolean
      ) {
        const tileId = this._tiles[y][x];
        if (tileId === 0) {
          return;
        }
        this._tiles[y][x] = FlippingHelper.setFlippedHorizontally(
          tileId,
          flippedHorizontally
        );
      }

      setFlippedVertically(x: integer, y: integer, flippedVertically: boolean) {
        const tileId = this._tiles[y][x];
        if (tileId === 0) {
          return;
        }
        this._tiles[y][x] = FlippingHelper.setFlippedVertically(
          tileId,
          flippedVertically
        );
      }

      setFlippedDiagonally(x: integer, y: integer, flippedDiagonally: boolean) {
        const tileId = this._tiles[y][x];
        if (tileId === 0) {
          return;
        }
        this._tiles[y][x] = FlippingHelper.setFlippedDiagonally(
          tileId,
          flippedDiagonally
        );
      }

      isFlippedHorizontally(x: integer, y: integer): boolean {
        return FlippingHelper.isFlippedHorizontally(this._tiles[y][x]);
      }

      isFlippedVertically(x: integer, y: integer): boolean {
        return FlippingHelper.isFlippedVertically(this._tiles[y][x]);
      }

      isFlippedDiagonally(x: integer, y: integer): boolean {
        return FlippingHelper.isFlippedDiagonally(this._tiles[y][x]);
      }

      get(x: integer, y: integer): integer | undefined {
        const row = this._tiles[y];
        if (!row || row[x] === 0) {
          return undefined;
        }
        // -1 because 0 is keep for null.
        const tileId = FlippingHelper.getTileId(row[x] - 1);
        return tileId;
      }

      dimX() {
        return this._tiles.length === 0 ? 0 : this._tiles[0].length;
      }

      dimY() {
        return this._tiles.length;
      }

      getWidth() {
        return this.tileMap.getWidth();
      }

      getHeight() {
        return this.tileMap.getHeight();
      }
    }

    export class TileDefinition {
      private readonly polygons: PolygonVertices[];
      private readonly tag: string;
      private readonly animationLength: integer;

      constructor(
        polygons: PolygonVertices[],
        tag: string,
        animationLength: integer
      ) {
        this.polygons = polygons;
        this.tag = tag;
        this.animationLength = animationLength;
      }

      getTag() {
        return this.tag;
      }

      getPolygons() {
        return this.polygons;
      }

      /* Animated tiles have a limitation:
       * they are only able to use frames arranged horizontally one next
       * to each other on the atlas.
       */
      getAnimationLength(): integer {
        return this.animationLength;
      }
    }
  }
}
