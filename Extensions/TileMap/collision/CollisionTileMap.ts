namespace gdjs {
  export namespace TileMap {
    export class CollisionTileMap {
      private _tileSet: Map<integer, CollisionTileDefinition>;
      private _layers: Map<integer, CollisionTileMapLayer>;
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
        this._layers = new Map<integer, CollisionTileMapLayer>();
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

      getTileDefinition(id: integer) {
        return this._tileSet.get(id);
      }

      addLayer(id: integer) {
        const layer = new CollisionTileMapLayer(this, id);
        this._layers.set(id, layer);
        return layer;
      }

      getLayer(id: integer) {
        return this._layers[id];
      }

      getLayers(): Iterable<CollisionTileMapLayer> {
        return this._layers.values();
      }

      pointIsInsideTile(x: float, y: float, tag: string): boolean {
        const indexX = Math.floor(x / this.tileWidth);
        const indexY = Math.floor(y / this.tileHeight);
        for (const layer of this._layers.values()) {
          const tileId = layer.get(indexX, indexY);
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

    export class CollisionTileMapLayer {
      private static readonly flippedHorizontallyFlag = 0x80000000;
      private static readonly flippedVerticallyFlag = 0x40000000;
      private static readonly flippedDiagonallyFlag = 0x20000000;
      private static readonly tileIdMask = ~(
        CollisionTileMapLayer.flippedHorizontallyFlag |
        CollisionTileMapLayer.flippedVerticallyFlag |
        CollisionTileMapLayer.flippedDiagonallyFlag
      );

      readonly tileMap: CollisionTileMap;
      readonly id: integer;
      private _tiles: Array<Int32Array>;

      constructor(tileMap: CollisionTileMap, id: integer) {
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
        tileId &= ~CollisionTileMapLayer.flippedHorizontallyFlag;
        if (flippedHorizontally) {
          tileId |= CollisionTileMapLayer.flippedHorizontallyFlag;
        }
        this._tiles[y][x] = tileId;
      }

      setFlippedVertically(x: integer, y: integer, flippedVertically: boolean) {
        let tileId = this._tiles[y][x];
        tileId &= ~CollisionTileMapLayer.flippedVerticallyFlag;
        if (flippedVertically) {
          tileId |= CollisionTileMapLayer.flippedVerticallyFlag;
        }
        this._tiles[y][x] = tileId;
      }

      setFlippedDiagonally(x: integer, y: integer, flippedDiagonally: boolean) {
        let tileId = this._tiles[y][x];
        tileId &= ~CollisionTileMapLayer.flippedDiagonallyFlag;
        if (flippedDiagonally) {
          tileId |= CollisionTileMapLayer.flippedDiagonallyFlag;
        }
        this._tiles[y][x] = tileId;
      }

      isFlippedHorizontally(x: integer, y: integer): boolean {
        return (
          (this._tiles[y][x] &
            CollisionTileMapLayer.flippedHorizontallyFlag) !==
          0
        );
      }

      isFlippedVertically(x: integer, y: integer): boolean {
        return (
          (this._tiles[y][x] & CollisionTileMapLayer.flippedVerticallyFlag) !==
          0
        );
      }

      isFlippedDiagonally(x: integer, y: integer): boolean {
        return (
          (this._tiles[y][x] & CollisionTileMapLayer.flippedDiagonallyFlag) !==
          0
        );
      }

      get(x: integer, y: integer): integer | undefined {
        const row = this._tiles[y];
        // -1 because 0 mean null
        return row
          ? (row[x] - 1) & CollisionTileMapLayer.tileIdMask
          : undefined;
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

    export class TransformedCollisionTileMap {
      private _source: gdjs.TileMap.CollisionTileMap;
      private _layers: Map<integer, TransformedCollisionTileMapLayer>;
      // TODO Tiled allow to offset the layers
      transformation: gdjs.AffineTransformation = new gdjs.AffineTransformation();
      inverseTransformation: gdjs.AffineTransformation = new gdjs.AffineTransformation();
      transformationUpToDateCount: integer = 1;

      constructor(source: gdjs.TileMap.CollisionTileMap) {
        this._source = source;
        this._layers = new Map<integer, TransformedCollisionTileMapLayer>();
        for (const sourceLayer of source.getLayers()) {
          this._layers.set(
            sourceLayer.id,
            new TransformedCollisionTileMapLayer(this, sourceLayer)
          );
        }
      }

      invalidate() {
        this.transformationUpToDateCount =
          (this.transformationUpToDateCount + 1) % Number.MAX_SAFE_INTEGER;
      }

      getWidth() {
        return this._source.getWidth();
      }

      getHeight() {
        return this._source.getHeight();
      }

      getTileHeight() {
        return this._source.getTileHeight();
      }

      getTileWidth() {
        return this._source.getTileWidth();
      }

      getDimensionX() {
        return this._source.getDimensionX();
      }

      getDimensionY() {
        return this._source.getDimensionY();
      }

      getTileDefinition(id: integer) {
        return this._source.getTileDefinition(id);
      }

      getLayer(id: integer): TransformedCollisionTileMapLayer | undefined {
        return this._layers.get(id);
      }

      getLayers(): Iterable<TransformedCollisionTileMapLayer> {
        return this._layers.values();
      }

      pointIsInsideTile(x: float, y: float, tag: string): boolean {
        // TODO avoid array allocation
        const workingPoint: FloatPoint = [x, y];
        this.inverseTransformation.transform(workingPoint, workingPoint);
        return this._source.pointIsInsideTile(
          workingPoint[0],
          workingPoint[1],
          tag
        );
      }

      // test: number = 300;

      getHitBoxesAround(
        tag: string,
        left: float,
        top: float,
        right: float,
        bottom: float
      ): Iterable<gdjs.Polygon> {
        const inverseTransformation = this.inverseTransformation;
        // TODO avoid array allocation
        const workingPoint: FloatPoint = [left, top];
        inverseTransformation.transform(workingPoint, workingPoint);
        const topLeftX = workingPoint[0];
        const topLeftY = workingPoint[1];

        workingPoint[0] = right;
        workingPoint[1] = top;
        inverseTransformation.transform(workingPoint, workingPoint);
        const topRightX = workingPoint[0];
        const topRightY = workingPoint[1];

        workingPoint[0] = right;
        workingPoint[1] = bottom;
        inverseTransformation.transform(workingPoint, workingPoint);
        const bottomRightX = workingPoint[0];
        const bottomRightY = workingPoint[1];

        workingPoint[0] = left;
        workingPoint[1] = bottom;
        inverseTransformation.transform(workingPoint, workingPoint);
        const bottomLeftX = workingPoint[0];
        const bottomLeftY = workingPoint[1];

        const xMin = Math.max(
          0,
          Math.floor(
            Math.min(topLeftX, topRightX, bottomRightX, bottomLeftX) /
              this._source.getTileWidth()
          )
        );
        const xMax = Math.min(
          this.getDimensionX() - 1,
          Math.floor(
            Math.max(topLeftX, topRightX, bottomRightX, bottomLeftX) /
              this._source.getTileWidth()
          )
        );
        const yMin = Math.max(
          0,
          Math.floor(
            Math.min(topLeftY, topRightY, bottomRightY, bottomLeftY) /
              this._source.getTileHeight()
          )
        );
        const yMax = Math.min(
          this.getDimensionY() - 1,
          Math.floor(
            Math.max(topLeftY, topRightY, bottomRightY, bottomLeftY) /
              this._source.getTileHeight()
          )
        );

        // this.test++;
        // if (this.test > 300) {
        // // console.log("dim: " + this.dimX() + " " + this.dimY());
        // // console.log("transformation: " + this.transformation);
        // // console.log("inverse: " + this.inverseTransformation);
        // // console.log("zone: " + left + " " + top + " " + right + " " + bottom);
        // // console.log("getHitboxes: " + xMin + " " + yMin + " " + xMax + " " + yMax);
        // const arr = Array.from(this.getHitboxes(tag, xMin, yMin, xMax, yMax));
        // console.log(tag + " hitboxes length: " + arr.length);
        // this.test = 0;
        // }

        return this.getHitboxes(tag, xMin, yMin, xMax, yMax);
      }

      getHitboxes(
        tag: string,
        xMin: integer,
        yMin: integer,
        xMax: integer,
        yMax: integer
      ): Iterable<gdjs.Polygon> {
        return new MapCollisionMaskIterable(this, tag, xMin, yMin, xMax, yMax);
      }

      getAllHitboxes(tag: string): Iterable<gdjs.Polygon> {
        return this.getHitboxes(
          tag,
          0,
          0,
          this._source.getDimensionX() - 1,
          this._source.getDimensionY() - 1
        );
      }
    }

    class MapCollisionMaskIterable implements Iterable<gdjs.Polygon> {
      map: TransformedCollisionTileMap;
      tag: string;
      xMin: integer;
      yMin: integer;
      xMax: integer;
      yMax: integer;

      static emptyItr: Iterator<gdjs.Polygon> = {
        next: () => ({ value: undefined, done: true }),
      };

      constructor(
        map: TransformedCollisionTileMap,
        tag: string,
        xMin: integer,
        yMin: integer,
        xMax: integer,
        yMax: integer
      ) {
        //console.log("CollisionMaskIterable: " + xMax + " " + yMax);
        this.map = map;
        this.tag = tag;
        this.xMin = xMin;
        this.yMin = yMin;
        this.xMax = xMax;
        this.yMax = yMax;
      }

      [Symbol.iterator]() {
        let mapItr = this.map.getLayers()[Symbol.iterator]();
        let listItr: Iterator<gdjs.Polygon> = MapCollisionMaskIterable.emptyItr;

        return {
          next: () => {
            let listNext = listItr.next();
            while (listNext.done) {
              const mapNext = mapItr.next();
              if (mapNext.done) {
                return listNext;
              }
              listItr = mapNext.value
                .getHitboxes(
                  this.tag,
                  this.xMin,
                  this.yMin,
                  this.xMax,
                  this.yMax
                )
                [Symbol.iterator]();
              listNext = listItr.next();
            }
            return listNext;
          },
        };
      }
    }

    export class TransformedCollisionTileMapLayer {
      readonly tileMap: TransformedCollisionTileMap;
      readonly _source: gdjs.TileMap.CollisionTileMapLayer;
      private readonly _tiles: TransformedCollisionTile[][];

      constructor(
        tileMap: TransformedCollisionTileMap,
        source: gdjs.TileMap.CollisionTileMapLayer
      ) {
        this.tileMap = tileMap;
        this._source = source;
        this._tiles = [];
        const dimX = this._source.dimX();
        const dimY = this._source.dimY();
        this._tiles.length = dimY;
        for (let y = 0; y < dimY; y++) {
          this._tiles[y] = [];
          this._tiles[y].length = dimX;
          for (let x = 0; x < dimX; x++) {
            this._tiles[y][x] = new TransformedCollisionTile(this, x, y);
          }
        }
      }

      get(x: integer, y: integer): TransformedCollisionTile | undefined {
        const row = this._tiles[y];
        return row ? row[x] : undefined;
      }

      dimX() {
        return this._tiles.length === 0 ? 0 : this._tiles[0].length;
      }

      dimY() {
        return this._tiles.length;
      }

      getWidth() {
        return this._source.getWidth();
      }

      getHeight() {
        return this._source.getHeight();
      }

      isFlippedDiagonally(x: integer, y: integer) {
        return this._source.isFlippedDiagonally(x, y);
      }

      isFlippedVertically(x: integer, y: integer) {
        return this._source.isFlippedVertically(x, y);
      }

      isFlippedHorizontally(x: integer, y: integer) {
        return this._source.isFlippedHorizontally(x, y);
      }

      getHitboxes(
        tag: string,
        xMin: integer,
        yMin: integer,
        xMax: integer,
        yMax: integer
      ): Iterable<gdjs.Polygon> {
        //console.log("getHitboxes layer: " + this._source.id);
        return new LayerCollisionMaskIterable(
          this,
          tag,
          xMin,
          yMin,
          xMax,
          yMax
        );
      }

      getAllHitboxes(tag: string): Iterable<gdjs.Polygon> {
        return this.getHitboxes(tag, 0, 0, this.dimX() - 1, this.dimY() - 1);
      }
    }

    class LayerCollisionMaskIterable implements Iterable<gdjs.Polygon> {
      layer: TransformedCollisionTileMapLayer;
      tag: string;
      xMin: integer;
      yMin: integer;
      xMax: integer;
      yMax: integer;

      static emptyItr: Iterator<gdjs.Polygon> = {
        next: () => ({ value: undefined, done: true }),
      };

      constructor(
        layer: TransformedCollisionTileMapLayer,
        tag: string,
        xMin: integer,
        yMin: integer,
        xMax: integer,
        yMax: integer
      ) {
        //console.log("CollisionMaskIterable: " + xMax + " " + yMax);
        this.layer = layer;
        this.tag = tag;
        this.xMin = xMin;
        this.yMin = yMin;
        this.xMax = xMax;
        this.yMax = yMax;
      }

      [Symbol.iterator]() {
        // xMin and yMin next increment
        let x = this.xMax;
        let y = this.yMin - 1;
        let polygonItr: Iterator<gdjs.Polygon> =
          LayerCollisionMaskIterable.emptyItr;

        return {
          next: () => {
            let listNext = polygonItr.next();
            while (listNext.done) {
              x++;
              if (x > this.xMax) {
                y++;
                x = this.xMin;
              }
              if (y > this.yMax) {
                // done
                return listNext;
              }
              const tile = this.layer.get(x, y);
              const definition = tile?.getDefinition();
              //console.log("Check: " + x + " " + y + " tile: " + (tile ? tile.getTag(): tile));
              if (definition && definition.getTag() === this.tag) {
                polygonItr = tile!.getPolygons()[Symbol.iterator]();
                listNext = polygonItr.next();
              }
            }
            return listNext;
          },
        };
      }
    }

    class TransformedCollisionTile {
      layer: TransformedCollisionTileMapLayer;
      x: integer;
      y: integer;
      polygons: gdjs.Polygon[];
      private affineTransformationUpToDateCount: integer = 0;

      constructor(
        tileMap: TransformedCollisionTileMapLayer,
        x: integer,
        y: integer
      ) {
        this.layer = tileMap;
        this.x = x;
        this.y = y;
        const definition = this.getDefinition();
        this.polygons = [];
        // TODO only for the write tag?
        if (definition) {
          this.polygons.length = definition.getPolygons().length;
          for (
            let polygonIndex = 0;
            polygonIndex < this.polygons.length;
            polygonIndex++
          ) {
            const polygon = new gdjs.Polygon();
            this.polygons[polygonIndex] = polygon;
            polygon.vertices.length = definition.getPolygons()[
              polygonIndex
            ].vertices.length;
            for (
              let vertexIndex = 0;
              vertexIndex < polygon.vertices.length;
              vertexIndex++
            ) {
              polygon.vertices[vertexIndex] = [0, 0];
            }
          }
        }
      }

      getDefinition(): CollisionTileDefinition | undefined {
        return this.layer.tileMap.getTileDefinition(
          this.layer._source.get(this.x, this.y)!
        );
      }

      getPolygons(): Polygon[] {
        //console.log("getPolygons");
        if (
          this.affineTransformationUpToDateCount ===
          this.layer.tileMap.transformationUpToDateCount
        ) {
          return this.polygons;
        }

        const definition = this.getDefinition();
        if (!definition) {
          // It should be []
          return this.polygons;
        }

        const layerTransformation = this.layer.tileMap.transformation;
        const width = this.layer.tileMap.getTileWidth();
        const height = this.layer.tileMap.getTileHeight();
        // TODO avoid allocations
        const tileTransformation = new gdjs.AffineTransformation();
        tileTransformation.translate(width * this.x, height * this.y);
        if (this.layer.isFlippedHorizontally(this.x, this.y)) {
          tileTransformation.flipX(width / 2);
        }
        if (this.layer.isFlippedVertically(this.x, this.y)) {
          tileTransformation.flipY(height / 2);
        }
        if (this.layer.isFlippedDiagonally(this.x, this.y)) {
          tileTransformation.flipDiagonally();
        }
        tileTransformation.preConcatenate(layerTransformation);

        // const width = this.layer.tileMap.tileWidth;
        // const height = this.layer.tileMap.tileHeight;
        // let x = defVertex[0];
        // let y = defVertex[1];
        // x = this.flippedHorizontally ? width - x : x;
        // y = this.flippedVertically ? height - y : y;
        // if (this.flippedDiagonally) {
        //   const swap = x;
        //   x = y;
        //   y = swap;
        // }
        // vertex[0] = x + width * this.x;
        // vertex[1] = y + height * this.y;

        // TODO update lengths
        for (
          let polygonIndex = 0;
          polygonIndex < this.polygons.length;
          polygonIndex++
        ) {
          const defPolygon = definition.getPolygons()[polygonIndex];
          const polygon = this.polygons[polygonIndex];

          for (
            let vertexIndex = 0;
            vertexIndex < polygon.vertices.length;
            vertexIndex++
          ) {
            const defVertex = defPolygon.vertices[vertexIndex];
            const vertex = polygon.vertices[vertexIndex];

            tileTransformation.transform(defVertex, vertex);
          }
        }
        //console.log("polygonsAreUpToDate");
        this.affineTransformationUpToDateCount = this.layer.tileMap.transformationUpToDateCount;
        return this.polygons;
      }
    }
  }
}
