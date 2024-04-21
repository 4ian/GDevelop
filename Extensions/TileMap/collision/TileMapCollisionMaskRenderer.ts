namespace gdjs {
  export namespace TileMap {
    /**
     * This render is only useful for debugging purposes.
     * @see {@link PixiTileMapHelper.updatePixiCollisionMask}, the render used by the GUI.
     */
    export class TileMapCollisionMaskRenderer {
      _object: gdjs.TileMapCollisionMaskRuntimeObject;
      _graphics: PIXI.Graphics;

      constructor(
        runtimeObject: gdjs.TileMapCollisionMaskRuntimeObject,
        instanceContainer: gdjs.RuntimeInstanceContainer
      ) {
        this._object = runtimeObject;
        this._graphics = new PIXI.Graphics();
        instanceContainer
          .getLayer('')
          .getRenderer()
          .addRendererObject(this._graphics, runtimeObject.getZOrder());
      }

      redrawCollisionMask() {
        this._graphics.clear();
        if (!this._object._debugMode) {
          return;
        }
        this._graphics.lineStyle(
          this._object._outlineSize,
          this._object._outlineColor,
          this._object._outlineOpacity / 255
        );
        for (const polygon of this._object.getHitBoxes()) {
          const vertices = polygon.vertices;
          if (vertices.length === 0) continue;

          this._graphics.beginFill(
            this._object._fillColor,
            this._object._fillOpacity / 255
          );
          this._graphics.moveTo(vertices[0][0], vertices[0][1]);
          for (let index = 1; index < vertices.length; index++) {
            this._graphics.lineTo(vertices[index][0], vertices[index][1]);
          }
          this._graphics.closePath();
          this._graphics.endFill();
        }
      }

      getRendererObject() {
        return this._graphics;
      }
    }
  }
}
