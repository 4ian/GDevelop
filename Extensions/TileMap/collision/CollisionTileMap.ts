namespace gdjs {
  export namespace TileMap {
    export class CollisionTileMap {
      private _tileSet: Map<integer, CollisionTileDefinition>;
      private _map: CollisionTile[][];
      readonly tileWidth: integer;
      readonly tileHeight: integer;

      constructor(
        tileWidth: integer,
        tileHeight: integer,
        dimX: integer,
        dimY: integer,
        tileSet: Map<integer, CollisionTileDefinition>
      ) {
        console.log("tile dimension: " + tileWidth + " " + tileHeight);
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this._tileSet = tileSet;
        this._map = [];
        this._map.length = dimY;
        for (let index = 0; index < this._map.length; index++) {
          this._map[index] = [];
          this._map[index].length = dimX;
        }
      }

      set(x: integer, y: integer, definitionIndex: integer, flippedHorizontally: boolean, flippedVertically: boolean, flippedDiagonally: boolean) {
        const definition = this._tileSet.get(definitionIndex);
        if (!definition) {
          // The tile has no collision mask.
          return;
        }
        //console.log(x + " " + y + " set: " + definitionIndex);
        if (this._map[y][x]) {
          this._map[y][x].setDefinition(definition);
        } else {
          this._map[y][x] = new CollisionTile(this, x, y, definition, flippedHorizontally, flippedVertically, flippedDiagonally);
        }
      }

      get(x: integer, y: integer): CollisionTile | undefined {
        return this._map[y][x];
      }

      dimX() {
        return this._map.length === 0 ? 0 : this._map[0].length;
      }

      dimY() {
        return this._map.length;
      }

      getWidth() {
        return this.tileWidth * this.dimX();
      }

      getHeight() {
        return this.tileHeight * this.dimY();
      }

      getAllHitboxes(tag: string) {
        return new CollisionMaskIterable(
          this._map,
          tag,
          0,
          0,
          this.dimX(),
          this.dimY()
        );
      }
    }

    class CollisionMaskIterable implements Iterable<gdjs.Polygon> {
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
        let polygonItr: Iterator<gdjs.Polygon> = CollisionMaskIterable.emptyItr;

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
      tileMap: CollisionTileMap;
      x: integer;
      y: integer;
      definition: CollisionTileDefinition;
      flippedHorizontally: boolean;
      flippedVertically: boolean;
      flippedDiagonally: boolean;
      polygons: gdjs.Polygon[];
      polygonsAreUpToDate: boolean;

      constructor(
        tileMap: CollisionTileMap,
        x: integer,
        y: integer,
        definition: CollisionTileDefinition,
        flippedHorizontally: boolean, flippedVertically: boolean, flippedDiagonally: boolean
      ) {
        this.tileMap = tileMap;
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
              const width = this.tileMap.tileWidth;
              const height = this.tileMap.tileHeight;
              let x = defVertex[0];
              let y = defVertex[1];
              x = this.flippedHorizontally ? width - x : x;
              y = this.flippedVertically ? height - y : y;
              if (this.flippedDiagonally) {
                const swap = x;
                x = y;
                y = swap;
              }
              vertex[0] = x + this.tileMap.tileWidth * this.x;
              vertex[1] = y + this.tileMap.tileHeight * this.y;
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
