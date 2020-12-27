namespace gdjs {
  class TiledSpriteRuntimeObjectCocosRenderer {
    _object: any;
    _cachedWidth: float = 32;
    _cachedHeight: float = 32;
    _sprite: any;
    _shader: any;
    _pixelSizeUniform: any;
    _frameUniform: any;
    _transformUniform: any;
    _convertYPosition: any;
    _cachedTextureWidth: float = 0;
    _cachedTextureHeight: float = 0;

    constructor(runtimeObject, runtimeScene, textureName) {
      this._object = runtimeObject;
      this._sprite = new cc.Sprite(
        runtimeScene.getGame().getImageManager().getInvalidTexture()
      );
      this._shader = gdjs.CocosTools.makeTilingShader();
      if (this._shader) {
        this._shader.retain();
        this._pixelSizeUniform = this._shader.getUniformLocationForName(
          'uPixelSize'
        );
        this._frameUniform = this._shader.getUniformLocationForName('uFrame');
        this._transformUniform = this._shader.getUniformLocationForName(
          'uTransform'
        );
      }
      const renderer = runtimeScene.getLayer('').getRenderer();
      renderer.addRendererObject(this._sprite, runtimeObject.getZOrder());
      this._convertYPosition = renderer.convertYPosition;
      this.setTexture(textureName, runtimeScene);
      this.updateAngle();
    }

    onDestroy() {
      if (this._shader) {
        this._shader.release();
      }
    }

    getRendererObject() {
      return this._sprite;
    }

    updatePosition(): void {
      this._sprite.setPositionX(this._object.x + this._cachedWidth / 2);
      this._sprite.setPositionY(
        this._convertYPosition(this._object.y + this._cachedHeight / 2)
      );
    }

    _updateTextureRect() {
      this._sprite.setScaleX(this._cachedWidth / this._cachedTextureWidth);
      this._sprite.setScaleY(this._cachedHeight / this._cachedTextureHeight);
      if (this._shader) {
        this._shader.use();
        gdjs.CocosTools.setUniformLocationWith4f(
          this._sprite,
          this._shader,
          this._transformUniform,
          'uTransform',
          -(this._object._xOffset % this._cachedTextureWidth) /
            this._cachedWidth,
          -(this._object._yOffset % this._cachedTextureHeight) /
            this._cachedHeight,
          this._cachedTextureWidth / this._cachedWidth,
          this._cachedTextureHeight / this._cachedHeight
        );
      }
    }

    setTexture(textureName, runtimeScene): void {
      const imageManager = runtimeScene.getGame().getImageManager();
      const texture = imageManager.getTexture(textureName);
      const spriteFrame = cc.SpriteFrame.createWithTexture(
        texture,
        cc.rect(0, 0, texture.pixelsWidth, texture.pixelsHeight)
      );
      this._cachedTextureWidth = texture.pixelsWidth;
      this._cachedTextureHeight = texture.pixelsHeight;
      this._sprite.setSpriteFrame(spriteFrame);
      if (this._shader) {
        this._sprite.setShaderProgram(this._shader);
        this._shader.use();
        gdjs.CocosTools.setUniformLocationWith2f(
          this._sprite,
          this._shader,
          this._pixelSizeUniform,
          'uPixelSize',
          1.0 / this._cachedTextureWidth,
          1.0 / this._cachedTextureHeight
        );
        gdjs.CocosTools.setUniformLocationWith4f(
          this._sprite,
          this._shader,
          this._frameUniform,
          'uFrame',
          0,
          0,
          1,
          1
        );
        gdjs.CocosTools.setUniformLocationWith4f(
          this._sprite,
          this._shader,
          this._transformUniform,
          'uTransform',
          0,
          0,
          1,
          1
        );
      }
      this.updatePosition();
      this._updateTextureRect();
    }

    updateAngle(): void {
      this._sprite.setRotation(this._object.angle);
    }

    getWidth(): float {
      return this._cachedWidth;
    }

    getHeight(): float {
      return this._cachedHeight;
    }

    setWidth(width): void {
      this._cachedWidth = width;
      this._updateTextureRect();
      this.updatePosition();
    }

    setHeight(height): void {
      this._cachedHeight = height;
      this._updateTextureRect();
      this.updatePosition();
    }

    updateXOffset(): void {
      this._updateTextureRect();
    }

    updateYOffset(): void {
      this._updateTextureRect();
    }
  }

  // @ts-ignore - Register the class to let the engine use it.
  export const TiledSpriteRuntimeObjectRenderer = TiledSpriteRuntimeObjectCocosRenderer;
}
