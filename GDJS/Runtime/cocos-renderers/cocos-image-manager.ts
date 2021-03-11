/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * CocosImageManager loads and stores textures that can be used by the Cocos2D-JS renderers.
   */
  export class CocosImageManager {
    _resources: any = {};

    /**
     * @param resources The resources data of the game.
     */
    constructor(resources: ResourceData[]) {
      const that = this;
      resources.forEach(function (res) {
        if (res.file && res.kind === 'image') {
          that._resources[res.name] = res;
        }
      });
    }

    /**
     * Update the resources data of the game. Useful for hot-reloading, should not be used otherwise.
     *
     * @param resources The resources data of the game.
     */
    setResources(resources: ResourceData[]): void {
      this._resources = resources;
    }

    /**
     * Return the texture associated to the specified name.
     * Returns a placeholder texture if not found.
     * @param name The name of the resource to get.
     */
    getTexture(imageName) {
      let texture;
      if (this._resources.hasOwnProperty(imageName)) {
        texture = cc.textureCache.addImage(
          'res/' + this._resources[imageName].file
        );
        if (!this._resources[imageName].smoothed) {
          texture.setAliasTexParameters();
        }
      } else {
        texture = cc.textureCache.addImage('res/' + this.getInvalidTexture());
      }
      return texture;
    }

    /**
     * Return a texture which can be used as a placeholder when no
     * suitable texture can be found.
     * TODO: The path to the file is hardcoded and can create crash if not existing,
     * especially when compiled to a native game on iOS/Android/macOS.
     */
    getInvalidTexture() {
      // TODO: use a valid texture from memory and ensure that each usage of _textureLoaded
      // is updated to compare the texture with invalid texture.
      return 'res/HelloWorld.png';
    }

    isPowerOf2(texture): boolean {
      if (texture.pixelsWidth !== texture.pixelsHeight) {
        return false;
      }
      const n = texture.pixelsWidth;
      return (n & (n - 1)) == 0;
    }

    loadTextures(onProgress, onComplete) {
      const that = this;
      const files = Object.keys(this._resources).map(function (name) {
        return 'res/' + that._resources[name].file;
      });
      cc.LoaderScene.preload(files, function () {
        onComplete(files.length);
      });
    }
  }
  gdjs.ImageManager = gdjs.CocosImageManager;

  //Register the class to let the engine use it.
}
