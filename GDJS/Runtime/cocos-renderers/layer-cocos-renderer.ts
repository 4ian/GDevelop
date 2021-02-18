/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  export class LayerCocosRenderer {
    _layer: any;
    convertYPosition: any;
    _cocosLayer: any;
    _renderTexture: any;
    _unloaded: any;
    _shaders: any;

    constructor(layer, runtimeSceneRenderer) {
      const CocosLayer = cc.Layer.extend({
        ctor: function () {
          this._super();
          return true;
        },
      });
      this._layer = layer;
      this.convertYPosition = runtimeSceneRenderer.convertYPosition;

      // Read effects from the layer as we can't dynamically add effects
      // in Cocos2d-JS.
      const effects = this._layer.getInitialEffectsData();
      if (effects.length === 0) {
        this._cocosLayer = new CocosLayer();
        runtimeSceneRenderer.getCocosScene().addChild(this._cocosLayer);
      } else {
        const game = runtimeSceneRenderer._runtimeScene.getGame();
        this._renderTexture = new cc.RenderTexture(
          game.getGameResolutionWidth(),
          game.getGameResolutionHeight()
        );
        this._renderTexture.setPosition(
          cc.p(
            game.getGameResolutionWidth() / 2,
            game.getGameResolutionHeight() / 2
          )
        );
        this._renderTexture.retain();
        this._cocosLayer = new CocosLayer();
        this._cocosLayer.retain();
        runtimeSceneRenderer.getCocosScene().addChild(this._renderTexture);
        this._makeShaders();
      }
    }

    onSceneUnloaded() {
      this._unloaded = true;
      if (this._shaders) {
        for (let i = 0; i < this._shaders.length; ++i) {
          this._shaders[i].shader.release();
        }
      }
      if (this._renderTexture) {
      }
    }

    // this._cocosLayer.release(); //TODO
    // this._renderTexture.release(); //TODO
    _makeShaders() {
      if (this._shaders) {
        console.log('Shaders are already made for this layer');
        return;
      } else {
        if (!this._renderTexture) {
          console.log(
            "You can't apply shaders on a layer that is not using a cc.RenderTexture"
          );
          return;
        }
      }
      const effects = this._layer.getInitialEffectsData();
      if (effects.length === 0) {
        return;
      } else {
        if (effects.length > 1) {
          console.log(
            'Only a single effect by Layer is supported for now by Cocos2d-JS renderer'
          );
        }
      }
      const effect = gdjs.CocosTools.getEffect(effects[0].effectType);
      if (!effect) {
        console.log('Shader "' + effects[0].name + '" not found');
        return;
      }
      const theShader = {
        name: effects[0].name,
        shader: effect.makeShader(),
        uniforms: {},
      };
      theShader.shader.retain();
      for (let i = 0; i < effect.uniformNames.length; ++i) {
        const name = effect.uniformNames[i];
        theShader.uniforms[name] = theShader.shader.getUniformLocationForName(
          name
        );
      }
      this._renderTexture.getSprite().setShaderProgram(theShader.shader);
      this._shaders = [theShader];
    }

    render() {
      if (this._unloaded) {
        console.log('Tried to render unloaded layer ' + this._layer._name);
        return;
      }
      if (this._renderTexture) {
        // /!\ Calling beginWithClear with Cocos2d-JS 3.15.1 (and maybe other versions)
        // will raise a "wrong number of argument" error.
        this._renderTexture.clear(0, 0, 0, 0);
        this._renderTexture.begin();
        this._cocosLayer.visit();
        this._renderTexture.end();
      }
    }

    updatePosition(): void {
      const angle = gdjs.toRad(this._layer.getCameraRotation());
      const zoomFactor = this._layer.getCameraZoom();
      this._cocosLayer.setRotation(-this._layer.getCameraRotation());
      this._cocosLayer.setScale(zoomFactor, zoomFactor);
      const cosValue = Math.cos(-angle);
      const sinValue = Math.sin(-angle);
      const centerX =
        (this._layer.getCameraX() - this._layer.getWidth() / 2) * cosValue -
        (this._layer.getCameraY() - this._layer.getHeight() / 2) * sinValue;
      const centerY =
        (this._layer.getCameraX() - this._layer.getWidth() / 2) * sinValue +
        (this._layer.getCameraY() - this._layer.getHeight() / 2) * cosValue;
      this._cocosLayer.setPositionX(-centerX);
      this._cocosLayer.setPositionY(+centerY);
    }

    updateVisibility(visible): void {
      this._cocosLayer.setVisible(visible);
    }

    update(): void {}

    // Unimplemented
    updateClearColor(): void {}

    // Unimplemented
    addRendererObject(child, zOrder) {
      this._cocosLayer.addChild(child, zOrder);
    }

    changeRendererObjectZOrder(child, newZOrder) {
      child.setLocalZOrder(newZOrder);
    }

    removeRendererObject(child) {
      this._cocosLayer.removeChild(child);
    }

    setEffectDoubleParameter(name, parameterName, value): void {
      for (let i = 0; i < this._shaders.length; ++i) {
        if (this._shaders[i].name === name) {
          const theShader = this._shaders[i];
          if (theShader.uniforms.hasOwnProperty(parameterName)) {
            theShader.shader.use();
            gdjs.CocosTools.setUniformLocationWith1f(
              this._renderTexture.getSprite(),
              theShader.shader,
              theShader.uniforms[parameterName],
              parameterName,
              value
            );
          }
        }
      }
    }

    setEffectStringParameter(name, parameterName, value): void {}

    // Unimplemented
    setEffectBooleanParameter(name, parameterName, value): void {}

    // Unimplemented
    hasEffect(name): boolean {
      for (let i = 0; i < this._shaders.length; ++i) {
        if (this._shaders[i].name === name) {
          return true;
        }
      }
      return false;
    }

    enableEffect(name, value): void {}

    // Unimplemented
    addEffect(effectData) {}

    // Unimplemented - adding effects is not supported in Cocos2d-JS.
    // All effects are supposed to be added to the layer at its creation.
    removeEffect(effect) {}

    // Unimplemented
    isEffectEnabled(name): boolean {
      return this.hasEffect(name);
    }

    setLayerIndex(layer, index): void {}
  }

  // Unimplemented
  gdjs.LayerRenderer = gdjs.LayerCocosRenderer;

  //Register the class to let the engine use it.
}
