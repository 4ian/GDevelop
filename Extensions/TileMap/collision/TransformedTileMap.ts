namespace gdjs {
  export namespace TileMap {
    /**
     * A tile map transformed with an affine transformation.
     *
     * @see {@link getHitBoxesAround} It gives a fast access to hitboxes for collision handling.
     */
    export class TransformedCollisionTileMap {
      /**
       * The model that describes the tile map.
       */
      private _source: gdjs.TileMap.EditableTileMap;
      private _layers: Map<integer, TransformedCollisionTileMapLayer>;
      // TODO Tiled allow to offset the layers
      /**
       * The transformation from the time map coordinate (in pixels)
       * to the scene coordinate (in pixels).
       */
      private _transformation: gdjs.AffineTransformation = new gdjs.AffineTransformation();
      /**
       * The transformation from the scene coordinate (in pixels)
       * to the time map coordinate (in pixels).
       */
      private _inverseTransformation: gdjs.AffineTransformation = new gdjs.AffineTransformation();
      /**
       * This allows tiles to know if their hitboxes must be updated.
       * @see {@link TransformedCollisionTile.affineTransformationUpToDateCount}
       */
      _transformationUpToDateCount: integer = 1;
      /**
       * An reusable Point to avoid allocations.
       */
      private static readonly workingPoint: FloatPoint = [0, 0];

      /**
       * @param source The model that describes the tile map.
       */
      constructor(source: gdjs.TileMap.EditableTileMap) {
        this._source = source;
        this._layers = new Map<integer, TransformedCollisionTileMapLayer>();
        for (const sourceLayer of source.getLayers()) {
          const tileLayer = sourceLayer as EditableTileMapLayer;
          if (!tileLayer) {
            continue;
          }
          this._layers.set(
            tileLayer.id,
            new TransformedCollisionTileMapLayer(this, tileLayer)
          );
        }
      }

      /**
       * @returns The transformation from the time map coordinate (in pixels)
       * to the scene coordinate (in pixels).
       */
      getTransformation(): gdjs.AffineTransformation {
        return this._transformation;
      }

      /**
       * @param transformation
       */
      setTransformation(transformation: gdjs.AffineTransformation) {
        this._transformation = transformation;

        const inverseTransformation = this._inverseTransformation;
        inverseTransformation.copyFrom(transformation);
        inverseTransformation.invert();

        this._invalidate();
      }

      private _invalidate() {
        this._transformationUpToDateCount =
          (this._transformationUpToDateCount + 1) % Number.MAX_SAFE_INTEGER;
      }

      /**
       * @returns The tile map width in pixels.
       */
      getWidth() {
        return this._source.getWidth();
      }

      /**
       * @returns The tile map height in pixels.
       */
      getHeight() {
        return this._source.getHeight();
      }

      /**
       * @returns The tile width in pixels.
       */
      getTileHeight() {
        return this._source.getTileHeight();
      }

      /**
       * @returns The tile height in pixels.
       */
      getTileWidth() {
        return this._source.getTileWidth();
      }

      /**
       * @returns The number of tile columns in the map.
       */
      getDimensionX() {
        return this._source.getDimensionX();
      }

      /**
       * @returns The number of tile rows in the map.
       */
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
        const workingPoint: FloatPoint =
          TransformedCollisionTileMap.workingPoint;
        workingPoint[0] = x;
        workingPoint[1] = y;
        this._inverseTransformation.transform(workingPoint, workingPoint);
        return this._source.pointIsInsideTile(
          workingPoint[0],
          workingPoint[1],
          tag
        );
      }

      getHitBoxesAround(
        tag: string,
        left: float,
        top: float,
        right: float,
        bottom: float
      ): Iterable<gdjs.Polygon> {
        const inverseTransformation = this._inverseTransformation;
        const workingPoint: FloatPoint =
          TransformedCollisionTileMap.workingPoint;

        workingPoint[0] = left;
        workingPoint[1] = top;
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
      readonly _source: gdjs.TileMap.EditableTileMapLayer;
      private readonly _tiles: TransformedCollisionTile[][];

      constructor(
        tileMap: TransformedCollisionTileMap,
        source: gdjs.TileMap.EditableTileMapLayer
      ) {
        this.tileMap = tileMap;
        this._source = source;
        this._tiles = [];
        const dimX = this._source.getDimensionX();
        const dimY = this._source.getDimensionY();
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
      private static readonly workingTransformation: gdjs.AffineTransformation = new gdjs.AffineTransformation();

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
        // TODO only for the right tag?
        if (definition) {
          this.polygons.length = definition.getHiBoxes().length;
          for (
            let polygonIndex = 0;
            polygonIndex < this.polygons.length;
            polygonIndex++
          ) {
            const polygon = new gdjs.Polygon();
            this.polygons[polygonIndex] = polygon;
            polygon.vertices.length = definition.getHiBoxes()[
              polygonIndex
            ].length;
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

      getDefinition(): TileDefinition | undefined {
        return this.layer.tileMap.getTileDefinition(
          this.layer._source.get(this.x, this.y)!
        );
      }

      getPolygons(): Polygon[] {
        //console.log("getPolygons");
        if (
          this.affineTransformationUpToDateCount ===
          this.layer.tileMap._transformationUpToDateCount
        ) {
          return this.polygons;
        }

        const definition = this.getDefinition();
        if (!definition) {
          // It should be []
          return this.polygons;
        }

        const layerTransformation = this.layer.tileMap.getTransformation();
        const width = this.layer.tileMap.getTileWidth();
        const height = this.layer.tileMap.getTileHeight();

        const tileTransformation =
          TransformedCollisionTile.workingTransformation;
        tileTransformation.setToTranslation(width * this.x, height * this.y);
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

        // TODO To handle tile map modification, update lengths.
        for (
          let polygonIndex = 0;
          polygonIndex < this.polygons.length;
          polygonIndex++
        ) {
          const defPolygon = definition.getHiBoxes()[polygonIndex];
          const polygon = this.polygons[polygonIndex];

          for (
            let vertexIndex = 0;
            vertexIndex < polygon.vertices.length;
            vertexIndex++
          ) {
            const defVertex = defPolygon[vertexIndex];
            const vertex = polygon.vertices[vertexIndex];

            tileTransformation.transform(defVertex, vertex);
          }
        }
        //console.log("polygonsAreUpToDate");
        this.affineTransformationUpToDateCount = this.layer.tileMap._transformationUpToDateCount;
        return this.polygons;
      }
    }
  }
}
