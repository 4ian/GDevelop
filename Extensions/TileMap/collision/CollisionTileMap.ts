namespace gdjs {
  export namespace TileMap {
    export class CollisionTileMap {
      private _tileSet: Map<integer, CollisionTileDefinition>;
      private _layers: Map<integer, CollisionTileMapLayer>;
      readonly tileWidth: integer;
      readonly tileHeight: integer;
      readonly dimX: integer;
      readonly dimY: integer;

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
    }

    export class CollisionTileMapLayer {
      readonly tileMap: CollisionTileMap;
      readonly id: integer;
      private _tiles: CollisionTile[][];

      constructor(tileMap: CollisionTileMap, id: integer) {
        this.tileMap = tileMap;
        this.id = id;
        this._tiles = [];
        this._tiles.length = this.tileMap.dimY;
        for (let index = 0; index < this._tiles.length; index++) {
          this._tiles[index] = [];
          this._tiles[index].length = this.tileMap.dimX;
        }
      }

      set(
        x: integer,
        y: integer,
        definitionIndex: integer,
        flippedHorizontally: boolean,
        flippedVertically: boolean,
        flippedDiagonally: boolean
      ) {
        const definition = this.tileMap.getTileDefinition(definitionIndex);
        if (!definition) {
          // The tile has no collision mask.
          return;
        }
        //console.log(x + " " + y + " set: " + definitionIndex);
        if (this._tiles[y][x]) {
          this._tiles[y][x].setDefinition(
            definition,
            flippedHorizontally,
            flippedVertically,
            flippedDiagonally
          );
        } else {
          this._tiles[y][x] = new CollisionTile(
            this,
            x,
            y,
            definition,
            flippedHorizontally,
            flippedVertically,
            flippedDiagonally
          );
        }
      }

      get(x: integer, y: integer): CollisionTile | undefined {
        return this._tiles[y][x];
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
      polygons: Polygon[];
      tag: string;

      constructor(polygons: gdjs.Polygon[], tag: string = '') {
        this.polygons = polygons;
        this.tag = tag;
      }
    }

    class CollisionTile {
      readonly layer: CollisionTileMapLayer;
      readonly x: integer;
      readonly y: integer;
      private definition: CollisionTileDefinition;
      private flippedHorizontally: boolean;
      private flippedVertically: boolean;
      private flippedDiagonally: boolean;
      private polygons: gdjs.Polygon[];
      private polygonsAreUpToDate: boolean;

      constructor(
        tileMap: CollisionTileMapLayer,
        x: integer,
        y: integer,
        definition: CollisionTileDefinition,
        flippedHorizontally: boolean,
        flippedVertically: boolean,
        flippedDiagonally: boolean
      ) {
        this.layer = tileMap;
        this.x = x;
        this.y = y;
        this.definition = definition;
        this.flippedHorizontally = flippedHorizontally;
        this.flippedVertically = flippedVertically;
        this.flippedDiagonally = flippedDiagonally;
        this.polygons = [];
        this.polygons.length = this.definition.polygons.length;
        for (
          let polygonIndex = 0;
          polygonIndex < this.polygons.length;
          polygonIndex++
        ) {
          const polygon = new gdjs.Polygon();
          this.polygons[polygonIndex] = polygon;
          polygon.vertices.length = this.definition.polygons[
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
        this.polygonsAreUpToDate = false;
      }

      setDefinition(
        definition: CollisionTileDefinition,
        flippedHorizontally: boolean,
        flippedVertically: boolean,
        flippedDiagonally: boolean
      ) {
        this.definition = definition;
        this.flippedHorizontally = flippedHorizontally;
        this.flippedVertically = flippedVertically;
        this.flippedDiagonally = flippedDiagonally;
        this.polygonsAreUpToDate = false;
      }

      getTag() {
        return this.definition.tag;
      }

      getPolygons() {
        //console.log("getPolygons");
        if (!this.polygonsAreUpToDate) {
          // TODO transform the polygons
          for (
            let polygonIndex = 0;
            polygonIndex < this.polygons.length;
            polygonIndex++
          ) {
            const defPolygon = this.definition.polygons[polygonIndex];
            const polygon = this.polygons[polygonIndex];

            for (
              let vertexIndex = 0;
              vertexIndex < polygon.vertices.length;
              vertexIndex++
            ) {
              const defVertex = defPolygon.vertices[vertexIndex];
              const vertex = polygon.vertices[vertexIndex];

              //console.log(defVertex[0] + " + " + this.tileMap.tileWidth + " * " + this.x);
              const width = this.layer.tileMap.tileWidth;
              const height = this.layer.tileMap.tileHeight;
              let x = defVertex[0];
              let y = defVertex[1];
              x = this.flippedHorizontally ? width - x : x;
              y = this.flippedVertically ? height - y : y;
              if (this.flippedDiagonally) {
                const swap = x;
                x = y;
                y = swap;
              }
              vertex[0] = x + width * this.x;
              vertex[1] = y + height * this.y;
            }
          }
          //console.log("polygonsAreUpToDate");
          this.polygonsAreUpToDate = true;
        }
        return this.polygons;
      }
    }

    export class TransformedCollisionTileMap {
      private _source: gdjs.TileMap.CollisionTileMap;
      private _layers: Map<integer, TransformedCollisionTileMapLayer>;
      affineTransformation: gdjs.AffineTransformation = new gdjs.AffineTransformation();
      affineTransformationUpToDateCount: integer = 1;

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
        this.affineTransformationUpToDateCount =
          (this.affineTransformationUpToDateCount + 1) %
          Number.MAX_SAFE_INTEGER;
      }

      getWidth() {
        return this._source.getWidth();
      }

      getHeight() {
        return this._source.getHeight();
      }

      getLayer(id: integer) {
        return this._layers[id];
      }

      getLayers(): Iterable<TransformedCollisionTileMapLayer> {
        return this._layers.values();
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
          this._source.dimX,
          this._source.dimY
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
      private _source: gdjs.TileMap.CollisionTileMapLayer;
      private _tiles: TransformedCollisionTile[][];

      constructor(
        tileMap: TransformedCollisionTileMap,
        source: gdjs.TileMap.CollisionTileMapLayer
      ) {
        this.tileMap = tileMap;
        this._source = source;
        this._tiles = [];
        this._tiles.length = this._source.dimY();
        for (let y = 0; y < this._tiles.length; y++) {
          this._tiles[y] = [];
          this._tiles[y].length = this._source.dimX();
          for (let x = 0; x < this._source.dimX(); x++) {
            const sourceTile = this._source.get(x, y);
            if (sourceTile) {
              this._tiles[y][x] = new TransformedCollisionTile(
                this,
                x,
                y,
                sourceTile
              );
            }
          }
        }
      }

      get(x: integer, y: integer): TransformedCollisionTile | undefined {
        const sourceTile = this._source.get(x, y);
        if (!sourceTile) {
          return undefined;
        }
        if (!this._tiles[y][x]) {
          this._tiles[y][x] = new TransformedCollisionTile(
            this,
            x,
            y,
            sourceTile
          );
        }
        return this._tiles[y][x];
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

      getHitboxes(
        tag: string,
        xMin: integer,
        yMin: integer,
        xMax: integer,
        yMax: integer
      ): Iterable<gdjs.Polygon> {
        return new LayerCollisionMaskIterable(
          this._tiles,
          tag,
          xMin,
          yMin,
          xMax,
          yMax
        );
      }

      getAllHitboxes(tag: string): Iterable<gdjs.Polygon> {
        return this.getHitboxes(tag, 0, 0, this.dimX(), this.dimY());
      }
    }

    class LayerCollisionMaskIterable implements Iterable<gdjs.Polygon> {
      map: TransformedCollisionTile[][];
      tag: string;
      xMin: integer;
      yMin: integer;
      xMax: integer;
      yMax: integer;

      static emptyItr: Iterator<gdjs.Polygon> = {
        next: () => ({ value: undefined, done: true }),
      };

      constructor(
        map: TransformedCollisionTile[][],
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
              if (x >= this.xMax) {
                y++;
                x = this.xMin;
              }
              if (y >= this.yMax) {
                // done
                return listNext;
              }
              const tile = this.map[y][x];
              //console.log(x + " " + y + " tile: " + tile);
              if (tile && tile.getTag() === this.tag) {
                polygonItr = this.map[y][x].getPolygons()[Symbol.iterator]();
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
      source: CollisionTile;
      polygons: gdjs.Polygon[];
      private affineTransformationUpToDateCount: integer = 0;

      constructor(
        tileMap: TransformedCollisionTileMapLayer,
        x: integer,
        y: integer,
        source: CollisionTile
      ) {
        this.layer = tileMap;
        this.x = x;
        this.y = y;
        this.source = source;
        this.polygons = [];
        this.polygons.length = this.source.getPolygons().length;
        for (
          let polygonIndex = 0;
          polygonIndex < this.polygons.length;
          polygonIndex++
        ) {
          const polygon = new gdjs.Polygon();
          this.polygons[polygonIndex] = polygon;
          polygon.vertices.length = this.source.getPolygons()[
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

      getTag() {
        return this.source.getTag();
      }

      getPolygons() {
        //console.log("getPolygons");
        if (
          this.affineTransformationUpToDateCount ===
          this.layer.tileMap.affineTransformationUpToDateCount
        ) {
          return this.polygons;
        }
        const affineTransformation = this.layer.tileMap.affineTransformation;
        for (
          let polygonIndex = 0;
          polygonIndex < this.polygons.length;
          polygonIndex++
        ) {
          const defPolygon = this.source.getPolygons()[polygonIndex];
          const polygon = this.polygons[polygonIndex];

          for (
            let vertexIndex = 0;
            vertexIndex < polygon.vertices.length;
            vertexIndex++
          ) {
            const defVertex = defPolygon.vertices[vertexIndex];
            const vertex = polygon.vertices[vertexIndex];

            affineTransformation.transform(defVertex, vertex);
          }
        }
        //console.log("polygonsAreUpToDate");
        this.affineTransformationUpToDateCount = this.layer.tileMap.affineTransformationUpToDateCount;
        return this.polygons;
      }
    }
  }
}
