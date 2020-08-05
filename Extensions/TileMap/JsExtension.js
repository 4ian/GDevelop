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
          'render',
          new gd.PropertyDescriptor(objectContent.render)
            .setType('choice')
            .addExtraInfo('visible')
            .addExtraInfo('all')
            .addExtraInfo('index')
            .setLabel(_('Render'))
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
          render: 'visible',
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
          'JsPlatform/Extensions/skeletonicon.png',
          objectTileMap
        )
        .setIncludeFile('Extensions/TileMap/tilemapruntimeobject.js')
        .addIncludeFile(
          'Extensions/TileMap/tilemapruntimeobject-pixi-renderer.js'
        )
        .addIncludeFile('Extensions/TileMap/pixi-tilemap.js');
  
      object
        .addCondition(
          'IsTiledFile',
          _('Tiled file'),
          _('Compare the value of the tiled file.'),
          '',
          'JsPlatform/Extensions/skeletonicon.png',
          'JsPlatform/Extensions/skeletonicon.png'
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
          'JsPlatform/Extensions/skeletonicon.png',
          'JsPlatform/Extensions/skeletonicon.png'
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
          'JsPlatform/Extensions/skeletonicon.png',
          'JsPlatform/Extensions/skeletonicon.png'
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
          'JsPlatform/Extensions/skeletonicon.png',
          'JsPlatform/Extensions/skeletonicon.png'
        )
        .addParameter('object', 'TileMap', 'TileMap', false)
        .addParameter('image', _('Tilemap atlas image'), '', false)
        .getCodeExtraInformation()
        .setFunctionName('setTilemapAtlasImage')
        .setGetter('getTilemapAtlasImage');
  
      object
        .addCondition(
          'IsRender',
          _('Render'),
          _('Compare the value of the render.'),
          _('The render of _PARAM0_ is _PARAM1_'),
          '',
          'JsPlatform/Extensions/skeletonicon.png',
          'JsPlatform/Extensions/skeletonicon.png'
        )
        .addParameter('object', 'TileMap', 'TileMap', false)
        .useStandardRelationalOperatorParameters('stringWithSelector')
        .getCodeExtraInformation()
        .setFunctionName('getRender');
  
      object
        .addAction(
          'SetRender',
          _('Render'),
          _('Set Render'),
          _('Set the render of _PARAM0_ to _PARAM1_'),
          '',
          'JsPlatform/Extensions/skeletonicon.png',
          'JsPlatform/Extensions/skeletonicon.png'
        )
        .addParameter('object', 'TileMap', 'TileMap', false)
        .addParameter(
          'stringWithSelector',
          _('Render'),
          '[ "visible", "all", "index",]',
          false
        )
        .getCodeExtraInformation()
        .setFunctionName('setRender')
        .setGetter('getRender');
  
      object
        .addCondition(
          'IsLayerIndex',
          _('Layer index'),
          _('Compare the value of the layer index.'),
          '',
          'JsPlatform/Extensions/skeletonicon.png',
          'JsPlatform/Extensions/skeletonicon.png'
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
          _('Do _PARAM1__PARAM2_ to the layer index of _PARAM0_'),
          '',
          'JsPlatform/Extensions/skeletonicon.png',
          'JsPlatform/Extensions/skeletonicon.png'
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
          'JsPlatform/Extensions/skeletonicon.png'
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
          'JsPlatform/Extensions/skeletonicon.png',
          'JsPlatform/Extensions/skeletonicon.png'
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
          'JsPlatform/Extensions/skeletonicon.png',
          'JsPlatform/Extensions/skeletonicon.png'
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
  
      const ImportedExtLib = objectsRenderingService.requireModule(
        __dirname,
        'pixi-tilemap'
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
  
        this._pixiObject = new PIXI.tilemap.CompositeRectTileLayer(0);
        this._tileSet = null;
        //this._pixiObject.anchor.x = 0.5;
        //this._pixiObject.anchor.y = 0.5;
        this._pixiContainer.addChild(this._pixiObject);
        // this._pixiContainer.addChild(this._tileSet);
        console.log(
          project,
          layout,
          instance,
          associatedObject,
          pixiContainer,
          pixiResourcesLoader
        );
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
        return 'JsPlatform/Extensions/skeletonicon.png';
      };
      /**
       * This is called to update the Tilemap
       */
      RenderedTileMapInstance.prototype.updateTileMap = function () {
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
        const render = this._associatedObject
          .getProperties(this.project)
          .get('render')
          .getValue();
  
        this._pixiResourcesLoader.getPIXITileSet(
          this._project,
          tilemapAtlasImage,
          tiledFile,
          (tileset) => {
            console.log('LOADED', tileset);
            if (tileset && this._pixiObject) {
              this._pixiResourcesLoader.updatePIXITileMap(
                tileset,
                this._pixiObject,
                render,
                layerIndex
              );
            }
          }
        );
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
  
        const render = this._associatedObject
          .getProperties(this.project)
          .get('render')
          .getValue();
        if (this._pixiObject.render !== render) this._pixiObject.render = render;
  
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
  
        this._pixiObject.x = this._instance.getX() + this._pixiObject.width / 2;
        this._pixiObject.y = this._instance.getY() + this._pixiObject.height / 2;
        this._pixiObject.rotation = RenderedInstance.toRad(
          this._instance.getAngle()
        );
  
        if (this._instance.hasCustomSize()) {
          this._pixiObject.width = this._instance.getCustomWidth();
          this._pixiObject.height = this._instance.getCustomHeight();
        }
      };
  
      /**
       * Return the width of the instance, when it's not resized.
       */
      RenderedTileMapInstance.prototype.getDefaultWidth = function() {
        return this._pixiObject.width;
      };
  
      /**
       * Return the height of the instance, when it's not resized.
       */
      RenderedTileMapInstance.prototype.getDefaultHeight = function() {
        return this._pixiObject.height;
      };
  
      objectsRenderingService.registerInstanceRenderer(
        'TileMap::TileMap',
        RenderedTileMapInstance
      );
    },
  };
  