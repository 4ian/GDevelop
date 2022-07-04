namespace gdjs {
  export namespace TileMap {
    import PIXI = GlobalPIXIModule.PIXI;

    /**
     * This render is only useful for debugging purposes.
     * @see {@link PixiTileMapHelper.updatePixiCollisionMask}, the render used by the GUI.
     */
    export class TileMapCollisionMaskRender {
      _object: gdjs.TileMapCollisionMaskRuntimeObject;
      _graphics: PIXI.Graphics;

      constructor(
        runtimeObject: gdjs.TileMapCollisionMaskRuntimeObject,
        runtimeScene: gdjs.RuntimeScene
      ) {
        this._object = runtimeObject;
        this._graphics = new PIXI.Graphics();
        runtimeScene
          .getLayer('')
          .getRenderer()
          .addRendererObject(this._graphics, runtimeObject.getZOrder());
      }

      // TODO It should only invalidate the view and redraw when asked.
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
          //console.log("polygon: " + polygon);
          const vertices = polygon.vertices;
          if (vertices.length === 0) continue;

          this._graphics.beginFill(
            this._object._fillColor,
            this._object._fillOpacity / 255
          );
          this._graphics.moveTo(vertices[0][0], vertices[0][1]);
          //console.log("");
          //console.log("moveTo: " + vertices[0][0] + " " + vertices[0][1]);
          for (let index = 1; index < vertices.length; index++) {
            this._graphics.lineTo(vertices[index][0], vertices[index][1]);
            //console.log("lineTo: " + vertices[index][0] + " " + vertices[index][1]);
          }
          this._graphics.closePath();
          this._graphics.endFill();
        }

        // console.log(
        //   'getLocalBounds: ' +
        //     this._graphics.getLocalBounds().width +
        //     ' ' +
        //     this._graphics.getLocalBounds().height
        // );
      }

      getRendererObject() {
        return this._graphics;
      }

      setWidth(width: float): void {
        const tileMap = this._object._collisionTileMap;
        this._graphics.scale.x = width / tileMap.getWidth();
        this._graphics.pivot.x = width / 2;
      }

      setHeight(height: float): void {
        const tileMap = this._object._collisionTileMap;
        this._graphics.scale.y = height / tileMap.getHeight();
        this._graphics.pivot.y = height / 2;
      }

      getWidth(): float {
        const tileMap = this._object._collisionTileMap;
        return tileMap.getWidth() * this._graphics.scale.x;
      }

      getHeight(): float {
        const tileMap = this._object._collisionTileMap;
        return tileMap.getHeight() * this._graphics.scale.y;
      }

      getScaleX(): float {
        return this._graphics.scale.x;
      }

      getScaleY(): float {
        return this._graphics.scale.y;
      }
    }
  }
}
