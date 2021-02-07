namespace gdjs {
  class PanelSpriteRuntimeObjectCocosRenderer {
    _object: any;
    _spritesContainer: any;
    _centerSprite: any;
    _borderSprites: any;
    _centerSpriteShader: any;
    _rightSpriteShader: any;
    _topSpriteShader: any;
    _leftSpriteShader: any;
    _bottomSpriteShader: any;
    _convertYPosition: any;

    constructor(runtimeObject, runtimeScene, textureName, tiled) {
      this._object = runtimeObject;
      const texture = runtimeScene
        .getGame()
        .getImageManager()
        .getTexture(textureName);
      this._spritesContainer = new cc.Node();
      this._centerSprite = new cc.Sprite(texture);
      this._borderSprites = [
        new cc.Sprite(texture),
        //Right
        new cc.Sprite(texture),
        //Top-Right
        new cc.Sprite(texture),
        //Top
        new cc.Sprite(texture),
        //Top-Left
        new cc.Sprite(texture),
        //Left
        new cc.Sprite(texture),
        //Bottom-Left
        new cc.Sprite(texture),
        //Bottom
        new cc.Sprite(texture),
      ];

      //Bottom-Right
      if (tiled) {
        this._centerSpriteShader = this._createTilingShaderAndUniforms();
        this._rightSpriteShader = this._createTilingShaderAndUniforms();
        this._topSpriteShader = this._createTilingShaderAndUniforms();
        this._leftSpriteShader = this._createTilingShaderAndUniforms();
        this._bottomSpriteShader = this._createTilingShaderAndUniforms();
      }
      const renderer = runtimeScene.getLayer('').getRenderer();
      renderer.addRendererObject(
        this._spritesContainer,
        runtimeObject.getZOrder()
      );
      this._convertYPosition = renderer.convertYPosition;
      this.setTexture(textureName, runtimeScene);
      this._spritesContainer.addChild(this._centerSprite, 1);
      this._spritesContainer.setAnchorPoint(0.5, 0.5);
      this._centerSprite.setAnchorPoint(0, 0);
      for (let i = 0; i < this._borderSprites.length; ++i) {
        this._spritesContainer.addChild(
          this._borderSprites[i],
          i % 2 == 0 ? 0 : 1
        );
        this._borderSprites[i].setAnchorPoint(0, 0);
      }
    }

    getRendererObject() {
      return this._spritesContainer;
    }

    _createTilingShaderAndUniforms() {
      const shader = gdjs.CocosTools.makeTilingShader();
      shader.retain();
      return {
        shader: shader,
        pixelSizeUniform: shader.getUniformLocationForName('uPixelSize'),
        frameUniform: shader.getUniformLocationForName('uFrame'),
        transformUniform: shader.getUniformLocationForName('uTransform'),
      };
    }

    onDestroy() {
      if (this._centerSpriteShader && this._centerSpriteShader.shader) {
        this._centerSpriteShader.shader.release();
      }
      if (this._rightSpriteShader && this._rightSpriteShader.shader) {
        this._rightSpriteShader.shader.release();
      }
      if (this._topSpriteShader && this._topSpriteShader.shader) {
        this._topSpriteShader.shader.release();
      }
      if (this._leftSpriteShader && this._leftSpriteShader.shader) {
        this._leftSpriteShader.shader.release();
      }
      if (this._bottomSpriteShader && this._bottomSpriteShader.shader) {
        this._bottomSpriteShader.shader.release();
      }
    }

    ensureUpToDate() {}

    updateAngle(): void {
      this._spritesContainer.setRotation(this._object.angle);
    }

    updatePosition(): void {
      this._spritesContainer.setContentSize(
        this._object._width,
        this._object._height
      );
      this._spritesContainer.setPositionX(
        this._object.x + this._object._width / 2
      );
      this._spritesContainer.setPositionY(
        this._convertYPosition(this._object.y + this._object._height / 2)
      );
    }

    _updateLocalPositions() {
      const obj = this._object;
      this._centerSprite.setPositionX(obj._lBorder);
      this._centerSprite.setPositionY(obj._bBorder);
      this._borderSprites[0].setPositionX(obj._width - obj._rBorder);
      this._borderSprites[0].setPositionY(obj._bBorder);
      this._borderSprites[1].setPositionX(obj._width - obj._rBorder);
      this._borderSprites[1].setPositionY(obj._height - obj._tBorder);
      this._borderSprites[2].setPositionX(obj._lBorder);
      this._borderSprites[2].setPositionY(obj._height - obj._tBorder);
      this._borderSprites[3].setPositionX(0);
      this._borderSprites[3].setPositionY(obj._height - obj._tBorder);
      this._borderSprites[4].setPositionX(0);
      this._borderSprites[4].setPositionY(obj._bBorder);
      this._borderSprites[5].setPositionX(0);
      this._borderSprites[5].setPositionY(0);
      this._borderSprites[6].setPositionX(obj._lBorder);
      this._borderSprites[6].setPositionY(
        //FIXME: 1 pixel is somewhat needed for pixel perfect alignment
        1
      );
      this._borderSprites[7].setPositionX(obj._width - obj._rBorder);
      this._borderSprites[7].setPositionY(0);
    }

    _updateScaleAndShader(sprite, shader, scaleX, scaleY) {
      sprite.setScaleX(scaleX);
      sprite.setScaleY(scaleY);
      if (shader) {
        shader.shader.use();
        gdjs.CocosTools.setUniformLocationWith4f(
          sprite,
          shader.shader,
          shader.transformUniform,
          'uTransform',
          0,
          0,
          1 / scaleX,
          1 / scaleY
        );
      }
    }

    _updateSpritesAndTexturesSize() {
      const obj = this._object;
      this._updateScaleAndShader(
        this._centerSprite,
        this._centerSpriteShader,
        Math.max(obj._width - obj._rBorder - obj._lBorder, 0) /
          this._centerSprite.getContentSize().width,
        Math.max(obj._height - obj._tBorder - obj._bBorder, 0) /
          this._centerSprite.getContentSize().height
      );

      //Top, Bottom, Right, Left borders:
      this._updateScaleAndShader(
        this._borderSprites[0],
        this._rightSpriteShader,
        obj._rBorder / this._borderSprites[0].getContentSize().width,
        Math.max(obj._height - obj._tBorder - obj._bBorder, 0) /
          this._borderSprites[0].getContentSize().height
      );
      this._updateScaleAndShader(
        this._borderSprites[2],
        this._topSpriteShader,
        Math.max(obj._width - obj._rBorder - obj._lBorder, 0) /
          this._borderSprites[2].getContentSize().width,
        obj._tBorder / this._borderSprites[2].getContentSize().height
      );
      this._updateScaleAndShader(
        this._borderSprites[4],
        this._leftSpriteShader,
        obj._lBorder / this._borderSprites[4].getContentSize().width,
        Math.max(obj._height - obj._tBorder - obj._bBorder, 0) /
          this._borderSprites[4].getContentSize().height
      );
      this._updateScaleAndShader(
        this._borderSprites[6],
        this._bottomSpriteShader,
        Math.max(obj._width - obj._rBorder - obj._lBorder, 0) /
          this._borderSprites[6].getContentSize().width,
        obj._bBorder / this._borderSprites[6].getContentSize().height
      );
    }

    setTexture(textureName, runtimeScene): void {
      const obj = this._object;
      const that = this;
      const texture = runtimeScene
        .getGame()
        .getImageManager()
        .getTexture(textureName);

      function makeInsideTexture(rect) {
        //TODO
        if (rect.width < 0) {
          rect.width = 0;
        }
        if (rect.height < 0) {
          rect.height = 0;
        }
        if (rect.x < 0) {
          rect.x = 0;
        }
        if (rect.y < 0) {
          rect.y = 0;
        }
        if (rect.x > texture.pixelsWidth) {
          rect.x = texture.pixelsWidth;
        }
        if (rect.y > texture.pixelsHeight) {
          rect.y = texture.pixelsHeight;
        }
        if (rect.x + rect.width > texture.pixelsWidth) {
          rect.width = texture.pixelsWidth - rect.x;
        }
        if (rect.y + rect.height > texture.pixelsHeight) {
          rect.height = texture.pixelsHeight - rect.y;
        }
        return rect;
      }

      function setSpriteRect(sprite, shader, rect) {
        //TODO
        makeInsideTexture(rect);
        if (!shader) {
          sprite.setTextureRect(rect);
        } else {
          sprite.setShaderProgram(shader.shader);
          shader.shader.use();

          //TODO: test without setting pixelSize
          // gdjs.CocosTools.setUniformLocationWith2f(sprite, shader.shader, shader.pixelSizeUniform,
          //     'uPixelSize',
          //     1.0 / (rect.width),
          //     1.0 / (rect.height)
          // );
          gdjs.CocosTools.setUniformLocationWith4f(
            sprite,
            shader.shader,
            shader.frameUniform,
            'uFrame',
            rect.x / texture.pixelsWidth,
            rect.y / texture.pixelsHeight,
            rect.width / texture.pixelsWidth,
            rect.height / texture.pixelsHeight
          );
          gdjs.CocosTools.setUniformLocationWith4f(
            sprite,
            shader.shader,
            shader.transformUniform,
            'uTransform',
            0,
            0,
            1,
            1
          );
        }
      }
      this._centerSprite.setTexture(texture);
      setSpriteRect(
        this._centerSprite,
        this._centerSpriteShader,
        cc.rect(
          obj._lBorder,
          obj._tBorder,
          texture.pixelsWidth - obj._lBorder - obj._rBorder,
          texture.pixelsHeight - obj._tBorder - obj._bBorder
        )
      );

      //Top, Bottom, Right, Left borders:
      this._borderSprites[0].setTexture(texture);
      setSpriteRect(
        this._borderSprites[0],
        this._rightSpriteShader,
        cc.rect(
          texture.pixelsWidth - obj._rBorder - 1,
          obj._tBorder,
          obj._rBorder + 1,
          texture.pixelsHeight - obj._tBorder - obj._bBorder
        )
      );
      this._borderSprites[2].setTexture(texture);
      setSpriteRect(
        this._borderSprites[2],
        this._topSpriteShader,
        cc.rect(
          obj._lBorder,
          0,
          texture.pixelsWidth - obj._lBorder - obj._rBorder,
          obj._tBorder + 1
        )
      );
      this._borderSprites[4].setTexture(texture);
      setSpriteRect(
        this._borderSprites[4],
        this._leftSpriteShader,
        cc.rect(
          0,
          obj._tBorder,
          obj._lBorder + 1,
          texture.pixelsHeight - obj._tBorder - obj._bBorder
        )
      );
      this._borderSprites[6].setTexture(texture);
      setSpriteRect(
        this._borderSprites[6],
        this._bottomSpriteShader,
        cc.rect(
          obj._lBorder,
          texture.pixelsHeight - obj._bBorder - 1,
          texture.pixelsWidth - obj._lBorder - obj._rBorder,
          obj._bBorder + 1
        )
      );

      //Corners:
      this._borderSprites[1].setTexture(texture);
      this._borderSprites[1].setTextureRect(
        makeInsideTexture(
          cc.rect(
            texture.pixelsWidth - obj._rBorder,
            0,
            obj._rBorder,
            obj._tBorder
          )
        )
      );
      this._borderSprites[3].setTexture(texture);
      this._borderSprites[3].setTextureRect(
        makeInsideTexture(cc.rect(0, 0, obj._lBorder, obj._tBorder))
      );
      this._borderSprites[5].setTexture(texture);
      this._borderSprites[5].setTextureRect(
        makeInsideTexture(
          cc.rect(
            0,
            texture.pixelsHeight - obj._bBorder,
            obj._lBorder,
            obj._bBorder
          )
        )
      );
      this._borderSprites[7].setTexture(texture);
      this._borderSprites[7].setTextureRect(
        makeInsideTexture(
          cc.rect(
            texture.pixelsWidth - obj._rBorder,
            texture.pixelsHeight - obj._bBorder,
            obj._rBorder,
            obj._bBorder
          )
        )
      );
      this._updateSpritesAndTexturesSize();
      this._updateLocalPositions();
      this.updatePosition();
    }

    updateWidth(): void {
      this._updateSpritesAndTexturesSize();
      this._updateLocalPositions();
      this.updatePosition();
    }

    updateHeight(): void {
      this._updateSpritesAndTexturesSize();
      this._updateLocalPositions();
      this.updatePosition();
    }
  }
  // @ts-ignore - Register the class to let the engine use it.
  export const PanelSpriteRuntimeObjectRenderer = PanelSpriteRuntimeObjectCocosRenderer;
}
