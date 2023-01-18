/// <reference path="../helper/TileMapHelper.d.ts" />
namespace gdjs {
  export namespace TileMap {
    /**
     * A tile map transformed with an affine transformation.
     *
     * @see {@link getHitboxesAround} It gives a fast access to hitboxes for collision handling.
     */
    export class TransformedCollisionTileMap {
      /**
       * The model that describes the tile map.
       */
      private _source: TileMapHelper.EditableTileMap;
      tag: string;
      private _layers: Map<integer, TransformedCollisionTileMapLayer>;
      // TODO Tiled allows to offset the layers
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
      constructor(source: TileMapHelper.EditableTileMap, tag: string) {
        this._source = source;
        this.tag = tag;
        this._layers = new Map<integer, TransformedCollisionTileMapLayer>();
        for (const sourceLayer of source.getLayers()) {
          // TODO A visitor could be used to avoid a cast.
          if (!(sourceLayer instanceof TileMapHelper.EditableTileMapLayer)) {
            // TODO Collision mask for object layers is not handled.
            continue;
          }
          const tileLayer = sourceLayer as TileMapHelper.EditableTileMapLayer;
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
       * @param transformation the transformation from the time map coordinate
       * (in pixels) to the scene coordinate (in pixels).
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

      /**
       * @param tileId The tile identifier
       * @returns The tile definition form the tile set.
       */
      getTileDefinition(tileId: integer) {
        return this._source.getTileDefinition(tileId);
      }

      /**
       * @param layerId The layer identifier.
       * @returns the layer
       */
      getLayer(layerId: integer): TransformedCollisionTileMapLayer | undefined {
        return this._layers.get(layerId);
      }

      /**
       * @returns All the layers of the tile map.
       */
      getLayers(): Iterable<TransformedCollisionTileMapLayer> {
        return this._layers.values();
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

      /**
       * @param tag The tile tag.
       * @param left The left border of the area in the scene.
       * @param top The top border of the area in the scene.
       * @param right The right border of the area in the scene.
       * @param bottom The left border of the area in the scene.
       * @returns At least all the hitboxes from the given area
       * where tiles have the right tag.
       *
       * @see {@link gdjs.RuntimeObject.getHitboxesAround}
       */
      getHitboxesAround(
        tag: string,
        left: float,
        top: float,
        right: float,
        bottom: float
      ): Iterable<gdjs.Polygon> {
        // Return the hitboxes from the tiles that overlap
        // the AABB of the area in the tile map basis.
        // Some of these tiles are not event in the given area
        // but this is a good trade of between the number of
        // useless returned hitboxes and the time to find them.

        // Transform the vertices of the area
        // from the scene basis to the tile map basis.
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

        // Calculate the AABB of the area in the tile map basis.
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

        return this.getHitboxes(tag, xMin, yMin, xMax, yMax);
      }

      /**
       * @param tag The tile tag.
       * @param xMin The fist column to include.
       * @param yMin The fist row to include.
       * @param xMax The last column to include.
       * @param yMax The last row to include.
       * @returns All the hitboxes from the tiles overlapping
       * the given area where tiles have the right tag.
       */
      getHitboxes(
        tag: string,
        xMin: integer,
        yMin: integer,
        xMax: integer,
        yMax: integer
      ): Iterable<gdjs.Polygon> {
        return new MapCollisionMaskIterable(this, tag, xMin, yMin, xMax, yMax);
      }

      /**
       * @param tag The tile tag.
       * @returns All the hitboxes from the tiles having the right tag.
       */
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

    /**
     * Iterable over the tile hitboxes of a given area and tag.
     */
    class MapCollisionMaskIterable implements Iterable<gdjs.Polygon> {
      map: TransformedCollisionTileMap;
      tag: string;
      xMin: integer;
      yMin: integer;
      xMax: integer;
      yMax: integer;

      /**
       * Avoid to allocate an empty iterator each time
       * the iterable is initialized.
       */
      static emptyItr: Iterator<gdjs.Polygon> = {
        next: () => ({ value: undefined, done: true }),
      };

      /**
       * @param map The tile map.
       * @param tag The tile tag.
       * @param xMin The fist column to include.
       * @param yMin The fist row to include.
       * @param xMax The last column to include.
       * @param yMax The last row to include.
       */
      constructor(
        map: TransformedCollisionTileMap,
        tag: string,
        xMin: integer,
        yMin: integer,
        xMax: integer,
        yMax: integer
      ) {
        this.map = map;
        this.tag = tag;
        this.xMin = xMin;
        this.yMin = yMin;
        this.xMax = xMax;
        this.yMax = yMax;
      }

      [Symbol.iterator]() {
        // Flatten the iterable of each layers into one.
        let layerItr = this.map.getLayers()[Symbol.iterator]();
        let listItr: Iterator<gdjs.Polygon> = MapCollisionMaskIterable.emptyItr;

        return {
          next: () => {
            let listNext = listItr.next();
            while (listNext.done) {
              const layerNext = layerItr.next();
              if (layerNext.done) {
                return listNext;
              }
              listItr = layerNext.value
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

    /**
     * A tile map layer transformed with an affine transformation.
     */
    export class TransformedCollisionTileMapLayer {
      /**
       * The time map that contains this layer.
       */
      readonly tileMap: TransformedCollisionTileMap;
      /**
       * The model that describes the tile map.
       */
      readonly _source: TileMapHelper.EditableTileMapLayer;
      private readonly _tiles: TransformedCollisionTile[][];

      /**
       * @param tileMap The time map that contains this layer.
       * @param source The model that describes the tile map.
       */
      constructor(
        tileMap: TransformedCollisionTileMap,
        source: TileMapHelper.EditableTileMapLayer
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

      /**
       * @param x The layer column.
       * @param y The layer row.
       * @return The tile from the tile set.
       */
      get(x: integer, y: integer): TransformedCollisionTile | undefined {
        const row = this._tiles[y];
        return row ? row[x] : undefined;
      }

      /**
       * The number of tile columns in the layer.
       */
      getDimensionX() {
        return this._tiles.length === 0 ? 0 : this._tiles[0].length;
      }

      /**
       * The number of tile rows in the layer.
       */
      getDimensionY() {
        return this._tiles.length;
      }

      /**
       * @returns The layer width in pixels.
       */
      getWidth() {
        return this._source.getWidth();
      }

      /**
       * @returns The layer height in pixels.
       */
      getHeight() {
        return this._source.getHeight();
      }

      /**
       * @param x The layer column.
       * @param y The layer row.
       * @returns true if the tile is flipped diagonally.
       */
      isFlippedDiagonally(x: integer, y: integer) {
        return this._source.isFlippedDiagonally(x, y);
      }

      /**
       * @param x The layer column.
       * @param y The layer row.
       * @returns true if the tile is flipped vertically.
       */
      isFlippedVertically(x: integer, y: integer) {
        return this._source.isFlippedVertically(x, y);
      }

      /**
       * @param x The layer column.
       * @param y The layer row.
       * @returns true if the tile is flipped horizontally.
       */
      isFlippedHorizontally(x: integer, y: integer) {
        return this._source.isFlippedHorizontally(x, y);
      }
      /**
       * @param tag The tile tag.
       * @param xMin The fist column to include.
       * @param yMin The fist row to include.
       * @param xMax The last column to include.
       * @param yMax The last row to include.
       * @returns All the hitboxes from the tiles overlapping
       * the given area where tiles have the right tag.
       */
      getHitboxes(
        tag: string,
        xMin: integer,
        yMin: integer,
        xMax: integer,
        yMax: integer
      ): Iterable<gdjs.Polygon> {
        return new LayerCollisionMaskIterable(
          this,
          tag,
          xMin,
          yMin,
          xMax,
          yMax
        );
      }

      /**
       * @param tag The tile tag.
       * @returns All the hitboxes from the tiles having the right tag.
       */
      getAllHitboxes(tag: string): Iterable<gdjs.Polygon> {
        return this.getHitboxes(
          tag,
          0,
          0,
          this.getDimensionX() - 1,
          this.getDimensionY() - 1
        );
      }
    }

    /**
     * Iterable over the tile hitboxes of a given area and tag.
     */
    class LayerCollisionMaskIterable implements Iterable<gdjs.Polygon> {
      layer: TransformedCollisionTileMapLayer;
      tag: string;
      xMin: integer;
      yMin: integer;
      xMax: integer;
      yMax: integer;

      /**
       * Avoid to allocate an empty iterator each time
       * the iterable is initialized.
       */
      static emptyItr: Iterator<gdjs.Polygon> = {
        next: () => ({ value: undefined, done: true }),
      };

      /**
       * @param map The tile map.
       * @param tag The tile tag.
       * @param xMin The fist column to include.
       * @param yMin The fist row to include.
       * @param xMax The last column to include.
       * @param yMax The last row to include.
       */
      constructor(
        layer: TransformedCollisionTileMapLayer,
        tag: string,
        xMin: integer,
        yMin: integer,
        xMax: integer,
        yMax: integer
      ) {
        this.layer = layer;
        this.tag = tag;
        this.xMin = xMin;
        this.yMin = yMin;
        this.xMax = xMax;
        this.yMax = yMax;
      }

      [Symbol.iterator]() {
        // Flatten the iterable of each tile into one.

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
              if (!tile) {
                continue;
              }
              const definition = tile.getDefinition();
              if (!definition) {
                continue;
              }
              if (definition.hasTaggedHitBox(this.tag)) {
                polygonItr = tile.getHitboxes()[Symbol.iterator]();
                listNext = polygonItr.next();
              }
            }
            return listNext;
          },
        };
      }
    }

    /**
     * A tile transformed with an affine transformation.
     */
    class TransformedCollisionTile {
      /**
       * The layer that contains this tile.
       */
      readonly layer: TransformedCollisionTileMapLayer;
      /**
       * The column index in the layer.
       */
      readonly x: integer;
      /**
       * The row index in the layer.
       */
      readonly y: integer;
      private readonly hitBoxes: gdjs.Polygon[];
      private affineTransformationUpToDateCount: integer = 0;

      /**
       * An reusable AffineTransformation to avoid allocations.
       */
      private static readonly workingTransformation: gdjs.AffineTransformation = new gdjs.AffineTransformation();

      /**
       *
       * @param layer The layer that contains this tile.
       * @param x The column index in the layer.
       * @param y The row index in the layer.
       */
      constructor(
        layer: TransformedCollisionTileMapLayer,
        x: integer,
        y: integer
      ) {
        this.layer = layer;
        this.x = x;
        this.y = y;
        const definition = this.getDefinition();
        this.hitBoxes = [];
        if (definition) {
          const tag = this.layer.tileMap.tag;
          const definitionHitboxes = definition.getHitBoxes(tag);
          if (definitionHitboxes) {
            this.hitBoxes.length = definitionHitboxes.length;
            for (
              let polygonIndex = 0;
              polygonIndex < this.hitBoxes.length;
              polygonIndex++
            ) {
              const polygon = new gdjs.Polygon();
              this.hitBoxes[polygonIndex] = polygon;
              polygon.vertices.length = definitionHitboxes[polygonIndex].length;
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
      }

      /**
       * @returns The tile definition from the tile set.
       */
      getDefinition(): TileMapHelper.TileDefinition {
        return this.layer.tileMap.getTileDefinition(
          this.layer._source.getTileId(this.x, this.y)!
        )!;
      }

      private _isHitboxesUpToDate() {
        return (
          this.affineTransformationUpToDateCount ===
          this.layer.tileMap._transformationUpToDateCount
        );
      }

      private _setHitboxesUpToDate() {
        this.affineTransformationUpToDateCount = this.layer.tileMap._transformationUpToDateCount;
      }

      /**
       * @returns The hitboxes of this tile in the scene basis.
       */
      getHitboxes(): Polygon[] {
        if (this._isHitboxesUpToDate()) {
          return this.hitBoxes;
        }

        const definition = this.getDefinition();
        if (!definition) {
          this._setHitboxesUpToDate();
          // It should already be []
          this.hitBoxes.length = 0;
          return this.hitBoxes;
        }
        const tag = this.layer.tileMap.tag;
        const definitionHitboxes = definition.getHitBoxes(tag);
        if (!definitionHitboxes) {
          this._setHitboxesUpToDate();
          // It should already be []
          this.hitBoxes.length = 0;
          return this.hitBoxes;
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
          tileTransformation.flipX(width / 2);
          tileTransformation.rotateAround(Math.PI / 2, width / 2, height / 2);
        }
        tileTransformation.preConcatenate(layerTransformation);

        // The tile map can't change at runtime so the existing arrays can be
        // reused safely.
        for (
          let polygonIndex = 0;
          polygonIndex < this.hitBoxes.length;
          polygonIndex++
        ) {
          const defPolygon = definitionHitboxes[polygonIndex];
          const polygon = this.hitBoxes[polygonIndex];

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
        this._setHitboxesUpToDate();
        return this.hitBoxes;
      }
    }
  }
}
