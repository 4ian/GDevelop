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
        const layer = new CollisionTileMapLayer(this);
        this._layers.set(id, layer);
        return layer;
      }

      getLayer(id: integer) {
        return this._layers[id];
      }

      getLayers(): Iterable<CollisionTileMapLayer> {
        return this._layers.values();
      }

      getHitboxes(tag: string,
        xMin: integer,
        yMin: integer,
        xMax: integer,
        yMax: integer): Iterable<gdjs.Polygon> {
        return new MapCollisionMaskIterable(
          this,
          tag,
          xMin,
          yMin,
          xMax,
          yMax
        );
      }

      getAllHitboxes(tag: string): Iterable<gdjs.Polygon> {
        return this.getHitboxes(
          tag,
          0,
          0,
          this.dimX,
          this.dimY
        );
      }
    }

    class MapCollisionMaskIterable implements Iterable<gdjs.Polygon> {
      map: CollisionTileMap;
      tag: string;
      xMin: integer;
      yMin: integer;
      xMax: integer;
      yMax: integer;

      static emptyItr: Iterator<gdjs.Polygon> = {
        next: () => ({ value: undefined, done: true }),
      };

      constructor(
        map: CollisionTileMap,
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
                .getAllHitboxes(this.tag)
                [Symbol.iterator]();
              listNext = listItr.next();
            }
            return listNext;
          },
        };
      }
    }

    export class CollisionTileMapLayer {
      readonly tileMap: CollisionTileMap;
      private _tiles: CollisionTile[][];

      constructor(tileMap: CollisionTileMap) {
        this.tileMap = tileMap;
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
          this._tiles[y][x].setDefinition(definition);
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

      getHitboxes(tag: string,
        xMin: integer,
        yMin: integer,
        xMax: integer,
        yMax: integer): Iterable<gdjs.Polygon> {
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
        return this.getHitboxes(
          tag,
          0,
          0,
          this.dimX(),
          this.dimY()
        );
      }
    }

    class LayerCollisionMaskIterable implements Iterable<gdjs.Polygon> {
      map: CollisionTile[][];
      tag: string;
      xMin: integer;
      yMin: integer;
      xMax: integer;
      yMax: integer;

      static emptyItr: Iterator<gdjs.Polygon> = {
        next: () => ({ value: undefined, done: true }),
      };

      constructor(
        map: CollisionTile[][],
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
              if (tile && tile.definition.tag === this.tag) {
                polygonItr = this.map[y][x].getPolygons()[Symbol.iterator]();
                listNext = polygonItr.next();
              }
            }
            return listNext;
          },
        };
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
      layer: CollisionTileMapLayer;
      x: integer;
      y: integer;
      definition: CollisionTileDefinition;
      flippedHorizontally: boolean;
      flippedVertically: boolean;
      flippedDiagonally: boolean;
      polygons: gdjs.Polygon[];
      polygonsAreUpToDate: boolean;

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
          polygon.vertices.length =
            this.definition.polygons[polygonIndex].vertices.length;
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

      setDefinition(definition: CollisionTileDefinition) {
        this.definition = definition;
        this.polygonsAreUpToDate = false;
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
  }
}
