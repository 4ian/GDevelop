namespace gdjs {
  export namespace TileMap {
    export class EditableTileMap {
      private _tileSet: Map<integer, CollisionTileDefinition>;
      private _layers: Array<EditableTileMapLayer | EditableObjectLayer>;
      private readonly tileWidth: integer;
      private readonly tileHeight: integer;
      private readonly dimX: integer;
      private readonly dimY: integer;

      constructor(
        tileWidth: integer,
        tileHeight: integer,
        dimX: integer,
        dimY: integer,
        tileSet: Map<integer, CollisionTileDefinition>
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

      getTileDefinition(id: integer): CollisionTileDefinition | undefined {
        return this._tileSet.get(id);
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

      getLayers(): Iterable<EditableTileMapLayer | EditableObjectLayer> {
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

    export class EditableObjectLayer {
      readonly tileMap: EditableTileMap;
      readonly id: integer;
      readonly objects: TileObject[];

      constructor(tileMap: EditableTileMap, id: integer) {
        this.tileMap = tileMap;
        this.id = id;
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
        return this.tileId & EditableTileMapLayer.tileIdMask;
      }

      setFlippedHorizontally(flippedHorizontally: boolean) {
        let tileId = this.tileId;
        tileId &= ~EditableTileMapLayer.flippedHorizontallyFlag;
        if (flippedHorizontally) {
          tileId |= EditableTileMapLayer.flippedHorizontallyFlag;
        }
        this.tileId = tileId;
      }

      setFlippedVertically(flippedVertically: boolean) {
        let tileId = this.tileId;
        tileId &= ~EditableTileMapLayer.flippedVerticallyFlag;
        if (flippedVertically) {
          tileId |= EditableTileMapLayer.flippedVerticallyFlag;
        }
        this.tileId = tileId;
      }

      setFlippedDiagonally(flippedDiagonally: boolean) {
        let tileId = this.tileId;
        tileId &= ~EditableTileMapLayer.flippedDiagonallyFlag;
        if (flippedDiagonally) {
          tileId |= EditableTileMapLayer.flippedDiagonallyFlag;
        }
        this.tileId = tileId;
      }

      isFlippedHorizontally(): boolean {
        return (
          (this.tileId & EditableTileMapLayer.flippedHorizontallyFlag) !== 0
        );
      }

      isFlippedVertically(): boolean {
        return (this.tileId & EditableTileMapLayer.flippedVerticallyFlag) !== 0;
      }

      isFlippedDiagonally(): boolean {
        return (this.tileId & EditableTileMapLayer.flippedDiagonallyFlag) !== 0;
      }
    }

    export class EditableTileMapLayer {
      // TODO factorize flags handling?
      static readonly flippedHorizontallyFlag = 0x80000000;
      static readonly flippedVerticallyFlag = 0x40000000;
      static readonly flippedDiagonallyFlag = 0x20000000;
      static readonly tileIdMask = ~(
        EditableTileMapLayer.flippedHorizontallyFlag |
        EditableTileMapLayer.flippedVerticallyFlag |
        EditableTileMapLayer.flippedDiagonallyFlag
      );

      readonly tileMap: EditableTileMap;
      readonly id: integer;
      private readonly _tiles: Array<Int32Array>;

      constructor(tileMap: EditableTileMap, id: integer) {
        this.tileMap = tileMap;
        this.id = id;
        this._tiles = [];
        this._tiles.length = this.tileMap.getDimensionY();
        for (let index = 0; index < this._tiles.length; index++) {
          this._tiles[index] = new Int32Array(this.tileMap.getDimensionX());
        }
      }

      setTile(x: integer, y: integer, definitionIndex: integer) {
        const definition = this.tileMap.getTileDefinition(definitionIndex);
        if (!definition) {
          // The tile has no collision mask.
          return;
        }
        //console.log(x + " " + y + " set: " + definitionIndex);
        // +1 because 0 mean null
        this._tiles[y][x] = definitionIndex + 1;
      }

      setFlippedHorizontally(
        x: integer,
        y: integer,
        flippedHorizontally: boolean
      ) {
        let tileId = this._tiles[y][x];
        tileId &= ~EditableTileMapLayer.flippedHorizontallyFlag;
        if (flippedHorizontally) {
          tileId |= EditableTileMapLayer.flippedHorizontallyFlag;
        }
        this._tiles[y][x] = tileId;
      }

      setFlippedVertically(x: integer, y: integer, flippedVertically: boolean) {
        let tileId = this._tiles[y][x];
        tileId &= ~EditableTileMapLayer.flippedVerticallyFlag;
        if (flippedVertically) {
          tileId |= EditableTileMapLayer.flippedVerticallyFlag;
        }
        this._tiles[y][x] = tileId;
      }

      setFlippedDiagonally(x: integer, y: integer, flippedDiagonally: boolean) {
        let tileId = this._tiles[y][x];
        tileId &= ~EditableTileMapLayer.flippedDiagonallyFlag;
        if (flippedDiagonally) {
          tileId |= EditableTileMapLayer.flippedDiagonallyFlag;
        }
        this._tiles[y][x] = tileId;
      }

      isFlippedHorizontally(x: integer, y: integer): boolean {
        return (
          (this._tiles[y][x] & EditableTileMapLayer.flippedHorizontallyFlag) !==
          0
        );
      }

      isFlippedVertically(x: integer, y: integer): boolean {
        return (
          (this._tiles[y][x] & EditableTileMapLayer.flippedVerticallyFlag) !== 0
        );
      }

      isFlippedDiagonally(x: integer, y: integer): boolean {
        return (
          (this._tiles[y][x] & EditableTileMapLayer.flippedDiagonallyFlag) !== 0
        );
      }

      get(x: integer, y: integer): integer | undefined {
        const row = this._tiles[y];
        if (!row || row[x] === 0) {
          return undefined;
        }
        // -1 because 0 is keep for null.
        return (row[x] - 1) & EditableTileMapLayer.tileIdMask;
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

    export class CollisionTileDefinition {
      private readonly polygons: Polygon[];
      private readonly tag: string;

      constructor(polygons: gdjs.Polygon[], tag: string = '') {
        this.polygons = polygons;
        this.tag = tag;
      }

      getTag() {
        return this.tag;
      }

      getPolygons() {
        return this.polygons;
      }
    }
  }
}
