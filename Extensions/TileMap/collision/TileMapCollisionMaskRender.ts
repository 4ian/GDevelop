namespace gdjs {
  import PIXI = GlobalPIXIModule.PIXI;

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

    redrawCollisionMask() {
      this._graphics.clear();
      this._graphics.lineStyle(
        this._object._outlineSize,
        this._object._outlineColor,
        this._object._outlineOpacity / 255
      );
      for (const polygon of this._object._collisionTileMap.getAllHitboxes(
        this._object._typeFilter
      )) {
        //console.log("polygon: " + polygon);
        const vertices = polygon.vertices;
        if (vertices.length === 0) continue;

        this._graphics.beginFill(
          this._object._fillColor,
          this._object._fillOpacity / 255
        );
        this._graphics.moveTo(vertices[0][0], vertices[0][1]);
        console.log("");
        console.log("moveTo: " + vertices[0][0] + " " + vertices[0][1]);
        for (let index = 1; index < vertices.length; index++) {
          this._graphics.lineTo(vertices[index][0], vertices[index][1]);
          console.log("lineTo: " + vertices[index][0] + " " + vertices[index][1]);
        }
        this._graphics.closePath();
        this._graphics.endFill();
      }
    }

    getRendererObject() {
      return this._graphics;
    }

    updatePosition(): void {
      this._graphics.position.x = this._object.x;
      this._graphics.position.y = this._object.y;
    }

    setWidth(width): void {
      this._graphics.width = width / this._graphics.scale.x;
      this._graphics.pivot.x = width / 2;
      this.updatePosition();
    }

    setHeight(height): void {
      this._graphics.height = height / this._graphics.scale.y;
      this._graphics.pivot.y = height / 2;
      this.updatePosition();
    }

    getWidth(): float {
      return 240;//this._graphics.width;
    }

    getHeight(): float {
      return 240;//this._graphics.height;
    }
  }
}
