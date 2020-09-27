/**
 * This is a declaration of an extension for GDevelop 5.
 *
 * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change
 * to this extension file or to any other *.js file that you reference inside.
 *
 * The file must be named "JsExtension.js", otherwise GDevelop won't load it.
 * ⚠️ If you make a change and the extension is not loaded, open the developer console
 * and search for any errors.
 *
 * More information on https://github.com/4ian/GDevelop/blob/master/newIDE/README-extensions.md
 */

module.exports = {
  createExtension: function(_, gd) {
    const extension = new gd.PlatformExtension();
    extension
      .setExtensionInformation(
        'TileMap',
        _('TileMap Object'),
        _('Displays a tiled file tilemap.'),
        'Todor Imreorov',
        'Open source (MIT License)'
      )
      .setExtensionHelpPath('/objects/tile_map');

    var objectTileMap = new gd.ObjectJsImplementation();
    objectTileMap.updateProperty = function(
      objectContent,
      propertyName,
      newValue
    ) {
      if (propertyName in objectContent) {
        if (typeof objectContent[propertyName] === 'boolean')
          objectContent[propertyName] = newValue === '1';
        else objectContent[propertyName] = newValue;
        return true;
      }

      return false;
    };
    objectTileMap.getProperties = function(objectContent) {
      var objectProperties = new gd.MapStringPropertyDescriptor();

      objectProperties.set(
        'tiledFile',
        new gd.PropertyDescriptor(objectContent.tiledFile)
          .setType('resource')
          .addExtraInfo('json')
          .setLabel(_('Tiled file'))
      );
      objectProperties.set(
        'tilemapAtlasImage',
        new gd.PropertyDescriptor(objectContent.tilemapAtlasImage)
          .setType('resource')
          .addExtraInfo('image')
          .setLabel(_('Tilemap atlas image'))
      );
      objectProperties.set(
        'displayMode',
        new gd.PropertyDescriptor(objectContent.displayMode)
          .setType('choice')
          .addExtraInfo('visible')
          .addExtraInfo('all')
          .addExtraInfo('index')
          .setLabel(_('Display mode'))
      );
      objectProperties.set(
        'layerIndex',
        new gd.PropertyDescriptor(objectContent.layerIndex.toString())
          .setType('number')
          .setLabel(_('Layer index'))
      );
      objectProperties.set(
        'visible',
        new gd.PropertyDescriptor(objectContent.visible ? 'true' : 'false')
          .setType('boolean')
          .setLabel(_('Visible'))
      );

      return objectProperties;
    };
    objectTileMap.setRawJSONContent(
      JSON.stringify({
        tiledFile: '',
        tilemapAtlasImage: '',
        displayMode: 'visible',
        layerIndex: 0,
        visible: true,
      })
    );

    objectTileMap.updateInitialInstanceProperty = function(
      objectContent,
      instance,
      propertyName,
      newValue,
      project,
      layout
    ) {
      return false;
    };
    objectTileMap.getInitialInstanceProperties = function(
      content,
      instance,
      project,
      layout
    ) {
      var instanceProperties = new gd.MapStringPropertyDescriptor();
      return instanceProperties;
    };

    const object = extension
      .addObject(
        'TileMap',
        _('TileMap'),
        _('Displays a tiled file tilemap'),
        'JsPlatform/Extensions/tile_map32.png',
        objectTileMap
      )
      .setIncludeFile('Extensions/TileMap/tilemapruntimeobject.js')
      .addIncludeFile(
        'Extensions/TileMap/tilemapruntimeobject-pixi-renderer.js'
      )
      .addIncludeFile(
        'Extensions/TileMap/pixi-tilemap/dist/pixi-tilemap.umd.js'
      );

    object
      .addCondition(
        'IsTiledFile',
        _('Tiled file'),
        _('Compare the value of the tiled file.'),
        '',
        'JsPlatform/Extensions/tile_map24.png',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .getCodeExtraInformation()
      .setFunctionName('getTiledFile');

    object
      .addAction(
        'SetTiledFile',
        _('Tiled file'),
        _('Set Tiled file'),
        _('Set the tiled file of _PARAM0_ to _PARAM1_'),
        '',
        'JsPlatform/Extensions/tile_map24.png',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .addParameter('jsonResource', _('Tiled file'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setTiledFile')
      .setGetter('getTiledFile');

    object
      .addCondition(
        'IsTilemapAtlasImage',
        _('Tilemap atlas image'),
        _('Compare the value of the tilemap atlas image.'),
        '',
        'JsPlatform/Extensions/tile_map24.png',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .getCodeExtraInformation()
      .setFunctionName('getTilemapAtlasImage');

    object
      .addAction(
        'SetTilemapAtlasImage',
        _('Tilemap atlas image'),
        _('Set Tilemap atlas image'),
        _('Set the tilemap atlas image of _PARAM0_ to _PARAM1_'),
        '',
        'JsPlatform/Extensions/tile_map24.png',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .addParameter('image', _('Tilemap atlas image'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setTilemapAtlasImage')
      .setGetter('getTilemapAtlasImage');

    object
      .addCondition(
        'IsDisplayMode',
        _('Display mode'),
        _('Compare the value of the display mode.'),
        _('The display mode of _PARAM0_ is _PARAM1_'),
        '',
        'JsPlatform/Extensions/tile_map24.png',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .useStandardRelationalOperatorParameters('stringWithSelector')
      .getCodeExtraInformation()
      .setFunctionName('getDisplayMode');

    object
      .addAction(
        'SetDisplayMode',
        _('Display mode'),
        _('Set Display mode'),
        _('Set display mode of _PARAM0_ to _PARAM1_'),
        '',
        'JsPlatform/Extensions/tile_map24.png',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .addParameter(
        'stringWithSelector',
        _('Display mode'),
        '["visible", "all", "index"]',
        false
      )
      .getCodeExtraInformation()
      .setFunctionName('setDisplayMode')
      .setGetter('getDisplayMode');

    object
      .addCondition(
        'IsLayerIndex',
        _('Layer index'),
        _('Compare the value of the layer index.'),
        _('the layer index'),
        '',
        'JsPlatform/Extensions/tile_map24.png',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .useStandardRelationalOperatorParameters('number')
      .getCodeExtraInformation()
      .setFunctionName('getLayerIndex');

    object
      .addAction(
        'SetLayerIndex',
        _('Layer index'),
        _('Set Layer index'),
        _('the layer index'),
        '',
        'JsPlatform/Extensions/tile_map24.png',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .useStandardOperatorParameters('expression')
      .getCodeExtraInformation()
      .setFunctionName('setLayerIndex')
      .setGetter('getLayerIndex');

    object
      .addExpression(
        'GetLayerIndex',
        _('Get the Layer index'),
        _('Get the Layer index'),
        '',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .getCodeExtraInformation()
      .setFunctionName('getLayerIndex');

    object
      .addCondition(
        'IsVisible',
        _('Visible'),
        _('Compare the value of the visible.'),
        _('Visible is enabled'),
        '',
        'JsPlatform/Extensions/tile_map24.png',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .getCodeExtraInformation()
      .setFunctionName('getVisible');

    object
      .addAction(
        'SetVisible',
        _('Visible'),
        _('Set Visible'),
        _('Activate visible for _PARAM0_: _PARAM1_'),
        '',
        'JsPlatform/Extensions/tile_map24.png',
        'JsPlatform/Extensions/tile_map32.png'
      )
      .addParameter('object', 'TileMap', 'TileMap', false)
      .addParameter('boolean', _('Visible'), '', false)
      .getCodeExtraInformation()
      .setFunctionName('setVisible')
      .setGetter('getVisible');

    return extension;
  },

  /**
   * You can optionally add sanity tests that will check the basic working
   * of your extension behaviors/objects by instanciating behaviors/objects
   * and setting the property to a given value.
   *
   * If you don't have any tests, you can simply return an empty array like this:
   * `runExtensionSanityTests: function(gd, extension) { return []; }`
   *
   * But it is recommended to create tests for the behaviors/objects properties you created
   * to avoid mistakes.
   */
  runExtensionSanityTests: function(gd, extension) {
    return [];
  },
  /**
   * Register editors for objects.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerEditorConfigurations: function(objectsEditorService) {
    objectsEditorService.registerEditorConfiguration(
      'TileMap::TileMap',
      objectsEditorService.getDefaultObjectJsImplementationPropertiesEditor({
        helpPagePath: '/objects/tile_map_object',
      })
    );
  },
  /**
   * Register renderers for instance of objects on the scene editor.
   *
   * ℹ️ Run `node import-GDJS-Runtime.js` (in newIDE/app/scripts) if you make any change.
   */
  registerInstanceRenderers: function(objectsRenderingService) {
    const RenderedInstance = objectsRenderingService.RenderedInstance;
    const PIXI = objectsRenderingService.PIXI;

    const Tilemap = objectsRenderingService.requireModule(
      __dirname,
      'pixi-tilemap/dist/pixi-tilemap.umd'
    );

    /**
     * Renderer for instances of TileMap inside the IDE.
     *
     * @extends RenderedTileMapInstance
     * @class RenderedTileMapInstance
     * @constructor
     */
    function RenderedTileMapInstance(
      project,
      layout,
      instance,
      associatedObject,
      pixiContainer,
      pixiResourcesLoader
    ) {
      RenderedInstance.call(
        this,
        project,
        layout,
        instance,
        associatedObject,
        pixiContainer,
        pixiResourcesLoader
      );

      console.log(PIXI.tilemap);
      this._pixiObject = new Tilemap.CompositeRectTileLayer(0);
      this._tileSet = null;
      console.log(this._pixiObject);
      this._pixiContainer.addChild(this._pixiObject);
      this.update();
      this.updateTileMap();
    }
    RenderedTileMapInstance.prototype = Object.create(
      RenderedInstance.prototype
    );

    /**
     * Return the path to the thumbnail of the specified object.
     */
    RenderedTileMapInstance.getThumbnail = function(
      project,
      resourcesLoader,
      object
    ) {
      return 'JsPlatform/Extensions/tile_map32.png';
    };
    /**
     * This is called to update the TileMap
     */
    RenderedTileMapInstance.prototype.updateTileMap = function() {
      // Get the tileset resource to use
      const tilemapAtlasImage = this._associatedObject
        .getProperties(this.project)
        .get('tilemapAtlasImage')
        .getValue();
      const tiledFile = this._associatedObject
        .getProperties(this.project)
        .get('tiledFile')
        .getValue();
      const layerIndex = parseInt(
        this._associatedObject
          .getProperties(this.project)
          .get('layerIndex')
          .getValue(),
        0
      );
      const displayMode = this._associatedObject
        .getProperties(this.project)
        .get('displayMode')
        .getValue();

      const isVisible = this._associatedObject
        .getProperties(this.project)
        .get('visible')
        .getValue() === "true";
      this._pixiObject.visible = isVisible;
      if (isVisible) {
        this._pixiObject.visible = isVisible;
        this.getPIXITileSet(
          tilemapAtlasImage,
          tiledFile,
          (tileset) => {
            console.log('LOADED', tileset);
            if (tileset && this._pixiObject) {
              this.updatePIXITileMap(
                tileset,
                displayMode,
                layerIndex
              );
              
              console.log("result",this._pixiObject)
            }
          }
        );
      } else {
        // We can not only hide the tilemap, but also clear it when its not visible. Should we do that?
        this._pixiObject.clear();
      }
      
    };
    /**
     * This is called to update the PIXI object on the scene editor
     */
    RenderedTileMapInstance.prototype.update = function() {
      const tiledFile = this._associatedObject
        .getProperties(this.project)
        .get('tiledFile')
        .getValue();
      if (this._pixiObject.tiledFile !== tiledFile)
        this._pixiObject.tiledFile = tiledFile;

      const tilemapAtlasImage = this._associatedObject
        .getProperties(this.project)
        .get('tilemapAtlasImage')
        .getValue();
      if (this._pixiObject.tilemapAtlasImage !== tilemapAtlasImage)
        this._pixiObject.tilemapAtlasImage = tilemapAtlasImage;

      const displayMode = this._associatedObject
        .getProperties(this.project)
        .get('displayMode')
        .getValue();
      if (this._pixiObject.displayMode !== displayMode)
        this._pixiObject.displayMode = displayMode;

      const layerIndex = this._associatedObject
        .getProperties(this.project)
        .get('layerIndex')
        .getValue();
      if (this._pixiObject.layerIndex !== layerIndex)
        this._pixiObject.layerIndex = layerIndex;

      const visible = this._associatedObject
        .getProperties(this.project)
        .get('visible')
        .getValue();
      if (visible !== this._pixiObject._visible) {
        this._pixiObject._visible = visible === 'true';
        this._pixiObject.dirty = true;
      }

      if (this._instance.hasCustomSize()) {
        this._pixiObject.width = this._instance.getCustomWidth();
        this._pixiObject.height = this._instance.getCustomHeight();
      } else {
        this._pixiObject.scale.x = 1;
        this._pixiObject.scale.y = 1;
      }

      // Place the center of rotation in the center of the object. Because pivot position in Pixi
      // is in the **local coordinates of the object**, we need to find back the original width
      // and height of the object before scaling (then divide by 2 to find the center)
      const originalWidth = this._pixiObject.width / this._pixiObject.scale.x;
      const originalHeight = this._pixiObject.height / this._pixiObject.scale.y;
      this._pixiObject.pivot.x = originalWidth / 2;
      this._pixiObject.pivot.y = originalHeight / 2;

      // Modifying the pivot position also has an impact on the transform. The instance (X,Y) position
      // of this object refers to the top-left point, but now in Pixi, as we changed the pivot, the Pixi
      // object (X,Y) position refers to the center. So we add an offset to convert from top-left to center.
      this._pixiObject.x = this._instance.getX() + this._pixiObject.width / 2;
      this._pixiObject.y = this._instance.getY() + this._pixiObject.height / 2;

      // Rotation works as intended because we put the pivot in the center
      this._pixiObject.rotation = RenderedInstance.toRad(
        this._instance.getAngle()
      );
    };

    /**
     * Return the width of the instance, when it's not resized.
     */
    RenderedTileMapInstance.prototype.getDefaultWidth = function() {
      return this._pixiObject.width / this._pixiObject.scale.x;
    };

    /**
     * Return the height of the instance, when it's not resized.
     */
    RenderedTileMapInstance.prototype.getDefaultHeight = function() {
      return this._pixiObject.height / this._pixiObject.scale.y;
    };

    /**
     * Tileset/Tilemap related data.
     */
    RenderedTileMapInstance.prototype.loadedTileSets = {};

    /**
     * Creates a Tileset resource from a tiledData json file exported from https://www.mapeditor.org/.
     * Later on this can potentially be refactored to support other data structures (LED editor for example) https://github.com/deepnight/led
     */
    RenderedTileMapInstance.prototype.createTileSetResource = function(
      tiledData,
      tex,
      requestedTileSetId,
      onLoad
    ) {
      // Todo implement tileset index and use it instead of 0
      const { tilewidth, tilecount, tileheight, tiles } = tiledData.tilesets[0];
      console.log('NEW TILESET data::', tilewidth, tilecount, tileheight, tiles);
      const textureCache = new Array(tilecount).fill(0).map((_, frame) => {
        const cols = Math.floor(tex.width / tilewidth);
        const x = ((frame - 1) % cols) * tilewidth;
        const y = Math.floor((frame - 1) / cols) * tileheight;
        const rect = new PIXI.Rectangle(x, y, tilewidth, tileheight);
        const texture = new PIXI.Texture(tex, rect);
        texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        texture.cacheAsBitmap = true;
  
        return texture;
      });
      const newTileset = {
        width: tex.width,
        height: tex.height,
        tilewidth,
        tileheight,
        texture: tex,
        textureCache,
        layers: tiledData.layers,
        tiles,
        tilecount,
      };
      onLoad(newTileset);
      this.loadedTileSets[requestedTileSetId] = newTileset;
    }

     /**
     * Re-renders the tilemap whenever its rendering settings have been changed
     */
    RenderedTileMapInstance.prototype.updatePIXITileMap = function(
      tileSet,
      render,
      layerIndex
    ) {
      const tileMap = this._pixiObject;
      if (!tileMap || !tileSet) return;
  
      tileSet.layers.forEach(function(layer, index) {
        if (render === 'index' && layerIndex !== index) return;
        else if (render === 'visible' && !layer.visible) return;
  
        // todo filter groups
        if (layer.type === 'objectgroup') {
          layer.objects.forEach(function(object) {
            const { gid, x, y, visible } = object;
            if (render === 'visible' && !visible) return;
            if (tileSet.textureCache[gid]) {
              tileMap.addFrame(
                tileSet.textureCache[gid],
                x,
                y - tileSet.tileheight
              );
            }
          });
        } else if (layer.type === 'tilelayer') {
          let ind = 0;
          for (let i = 0; i < layer.height; i++) {
            for (let j = 0; j < layer.width; j++) {
              const xPos = tileSet.tilewidth * j;
              const yPos = tileSet.tileheight * i;
  
              const tileUid = layer.data[ind];
  
              if (tileUid !== 0) {
                const tileData = tileSet.tiles.find(
                  function(tile) { return tile.id === tileUid - 1}
                );
  
                // Animated tiles have a limitation with only being able to use frames arranged one to each other on the image resource
                if (tileData && tileData.animation) {
                  tileMap
                    .addFrame(tileSet.textureCache[tileUid], xPos, yPos)
                    .tileAnimX(tileSet.tilewidth, tileData.animation.length);
                } else {
                  // Non animated props dont require tileAnimX or Y
                  tileMap.addFrame(tileSet.textureCache[tileUid], xPos, yPos);
                }
              }
  
              ind += 1;
            }
          }
        }
      });
    }

  // If a Tileset changes (json or image), a tilemap using it needs to re-render
  // The tileset needs to be rebuilt for use
  // But we need to have the capacity to instance a tilemap, so more than one tilemaps with different tileset layers
  // We need to cache the tileset somewhere, the tilemap instance will have to re-render it
  // Tileset changes => rerender it => tilemaps using it rerender too (keeping their layer visibility option)
  // tileset id == jsonResourceName + imageResourcename
  RenderedTileMapInstance.prototype.getPIXITileSet = function(
    imageResourceName,
    jsonResourceName,
    onLoad
  ) {
    const texture = this._pixiResourcesLoader.getPIXITexture(this._project, imageResourceName);
    const requestedTileSetId = `${jsonResourceName}@${imageResourceName}`;

    // If the tileset is already in the cache, just load it
    if (this.loadedTileSets[requestedTileSetId]) {
      onLoad(this.loadedTileSets[requestedTileSetId]);
      return;
    }
    // Otherwise proceed to creating it as an object that can easily be consumed by a tilemap
    this._pixiResourcesLoader.ResourcesLoader.getResourceJsonData(this._project, jsonResourceName).then(
      tiledData => {
        console.log(tiledData,texture);
        this.createTileSetResource(
          tiledData,
          texture,
          requestedTileSetId,
          onLoad
        );
      }
    );
  }
    objectsRenderingService.registerInstanceRenderer(
      'TileMap::TileMap',
      RenderedTileMapInstance
    );
  },
};
